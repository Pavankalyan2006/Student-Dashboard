import { beforeAll, afterAll, vi } from "vitest";

// GitHub is not reachable from the test environment, and the service no longer invents a profile
// or repositories when it cannot reach GitHub. These tests therefore run against a mocked GitHub
// REST API with synthetic accounts, so every code path below handles real API-shaped data.
const realFetch = globalThis.fetch;
export function mockGitHubApi(url: string): unknown {
  const u = new URL(url);
  const path = u.pathname;
  const mkUser = (login: string) => ({
    id: 9000001,
    login,
    name: `Synthetic ${login}`,
    avatar_url: `https://avatars.example.test/${login}.png`,
    bio: "Synthetic test account",
    public_repos: 2,
    following: 0,
    html_url: `https://github.com/${login}`,
  });
  const mkRepos = (login: string) => [
    {
      id: 7100001,
      name: "synthetic-typescript-app",
      full_name: `${login}/synthetic-typescript-app`,
      owner: { login },
      description: "Synthetic TypeScript repository",
      private: false,
      default_branch: "main",
      language: "TypeScript",
      stargazers_count: 3,
      forks_count: 1,
      open_issues_count: 0,
      html_url: `https://github.com/${login}/synthetic-typescript-app`,
      clone_url: `https://github.com/${login}/synthetic-typescript-app.git`,
      topics: ["typescript"],
      license: { name: "MIT" },
      fork: false,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-10-01T00:00:00Z",
    },
    {
      id: 7100002,
      name: "synthetic-python-lab",
      full_name: `${login}/synthetic-python-lab`,
      owner: { login },
      description: "Synthetic private Python repository",
      private: true,
      default_branch: "main",
      language: "Python",
      stargazers_count: 0,
      forks_count: 0,
      open_issues_count: 1,
      html_url: `https://github.com/${login}/synthetic-python-lab`,
      clone_url: `https://github.com/${login}/synthetic-python-lab.git`,
      topics: ["python"],
      license: null,
      fork: false,
      created_at: "2026-02-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
    },
  ];
  let m: RegExpMatchArray | null;
  if (path === "/user") return mkUser("master-dev");
  if (path === "/user/repos") return mkRepos("master-dev");
  if ((m = path.match(/^\/users\/([^/]+)\/repos$/)))
    return mkRepos(decodeURIComponent(m[1]));
  if ((m = path.match(/^\/users\/([^/]+)$/)))
    return mkUser(decodeURIComponent(m[1]));
  if (/^\/repos\/[^/]+\/[^/]+\/commits$/.test(path)) {
    return [
      {
        sha: "a1b2c3d4e5f6a7b8c9d0",
        html_url: "https://github.com/x/y/commit/a1b2c3d",
        author: { login: "master-dev" },
        commit: {
          message: "Add API routes and tests",
          author: {
            name: "Synthetic Dev",
            email: "dev@example.test",
            date: "2026-10-01T10:00:00Z",
          },
        },
      },
      {
        sha: "b2c3d4e5f6a7b8c9d0e1",
        html_url: "https://github.com/x/y/commit/b2c3d4e",
        author: { login: "master-dev" },
        commit: {
          message: "Initial commit",
          author: {
            name: "Synthetic Dev",
            email: "dev@example.test",
            date: "2026-09-01T10:00:00Z",
          },
        },
      },
    ];
  }
  if (/^\/repos\/[^/]+\/[^/]+\/git\/trees\//.test(path)) {
    return {
      tree: [
        { path: "package.json", type: "blob", size: 900, sha: "s1" },
        { path: "src", type: "tree", sha: "s2" },
        { path: "src/App.tsx", type: "blob", size: 2400, sha: "s3" },
        {
          path: "src/components/Header.tsx",
          type: "blob",
          size: 800,
          sha: "s4",
        },
        { path: "server/index.ts", type: "blob", size: 1500, sha: "s5" },
        { path: "server/routes/api.ts", type: "blob", size: 1300, sha: "s6" },
        { path: "server/db/schema.sql", type: "blob", size: 700, sha: "s7" },
        { path: "tests/api.test.ts", type: "blob", size: 600, sha: "s8" },
        { path: "README.md", type: "blob", size: 500, sha: "s9" },
      ],
    };
  }
  return null;
}

/** Installs the mocked GitHub API for the calling test file. */
export function useMockGitHubApi(): void {
  beforeAll(() => {
    vi.stubGlobal("fetch", async (input: any, init?: any) => {
      const url = typeof input === "string" ? input : input.url;
      if (url.startsWith("https://api.github.com")) {
        const body = mockGitHubApi(url);
        return new Response(JSON.stringify(body ?? { message: "Not Found" }), {
          status: body ? 200 : 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      return realFetch(input, init);
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });
}
