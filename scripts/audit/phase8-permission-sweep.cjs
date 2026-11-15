// Phase 8 QA: calls every /api/v1 route declared in server/api/routes twice.
//   1. Without a token: anything other than 401 is listed as OPEN, for review against the public list.
//   2. As a newly registered student: every administrator route must answer 403.
// The route list comes from the source (method + mounted path); ":params" are filled with "p8probe".
// Usage: BASE=http://localhost:3100 node scripts/audit/phase8-permission-sweep.cjs
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://localhost:3100';
const root = path.join(__dirname, '../../server/api');
const router = fs.readFileSync(path.join(root, 'router.ts'), 'utf8');

const imports = {};
for (const m of router.matchAll(/import\s+(?:\{\s*(\w+)\s*\}|(\w+))\s+from\s+'\.\/routes\/(\w+)'/g)) imports[m[1] || m[2]] = m[3];
const mounts = {};
for (const m of router.matchAll(/apiV1Router\.use\('([^']*)',\s*(?:\w+,\s*)*(\w+)\)/g)) (mounts[m[2]] = mounts[m[2]] || []).push(m[1]);

const routes = [];
for (const [v, file] of Object.entries(imports)) {
  const src = fs.readFileSync(path.join(root, 'routes', `${file}.ts`), 'utf8');
  for (const m of src.matchAll(/\.(get|post|put|patch|delete)\(\s*'([^']+)'([^\n]*)/g)) {
    const pre = (mounts[v] || [])[0];
    if (pre === undefined) continue;
    const full = `/api/v1${pre.replace(/\/$/, '')}${m[2]}`.replace(/\/\//g, '/');
    const admin = file === 'admin' || /requireRole\('SUPER_ADMIN'\)/.test(m[3]);
    routes.push({ method: m[1].toUpperCase(), path: full, file, admin });
  }
}

// Routes that are meant to answer without a token (sign-in, sign-up, health, public catalogues).
const PUBLIC = [
  /^\/api\/v1\/auth\//,
  /^\/api\/v1\/health/,
  /^\/api\/v1\/public\//,
  /^\/api\/v1\/showcase\/public/,
  /^\/api\/v1\/portfolio\/public/,
  /^\/api\/v1\/github\/callback$/, // OAuth return address
  /^\/api\/v1\/certificates\/verify\//, // anyone can check a certificate id
];
// Shared catalogues that hold no student data: readable without signing in.
const SHARED_READS = [
  /^GET \/api\/v1\/courses(\/|$)/, /^GET \/api\/v1\/lessons\//,
  /^GET \/api\/v1\/coding\/(languages|problems)/, /^(GET|POST) \/api\/v1\/dsa\/(topics|algorithms|problems|daily-challenge)/,
  /^GET \/api\/v1\/community\/(topics|questions|discussions|resources|projects)/,
  /^GET \/api\/v1\/(sql-lab\/challenges|system-design\/problems|integrations\/providers|external-profiles\/platforms)$/,
  /^POST \/api\/v1\/(sql-lab\/preview-sql|external-profiles\/validate-url)$/, // text in, text out; runs nothing
  /^GET \/api\/v1\/mock-interviews\/(types|roles|questions)/, /^GET \/api\/v1\/languages\//, /^GET \/api\/v1\/jobs-discovery\//,
];

async function call(r, token, retried = false) {
  const url = BASE + r.path.replace(/:[A-Za-z_]+/g, 'p8probe');
  try {
    const res = await fetch(url, {
      method: r.method,
      redirect: 'manual',
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: r.method === 'GET' || r.method === 'DELETE' ? undefined : '{}',
    });
    // The AI limiter runs before sign-in checks; wait for its window and ask again once.
    if (res.status === 429 && !retried) {
      await new Promise((ok) => setTimeout(ok, (Number(res.headers.get('retry-after')) || 60) * 1000 + 500));
      return call(r, token, true);
    }
    return res.status;
  } catch {
    return 'ERR';
  }
}

(async () => {
  const reg = await fetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ full_name: 'Perm Sweep', email: `p8.perm.${Date.now()}@example.test`, password: 'Str0ng!Passw0rd#2026' }),
  }).then((x) => x.json());
  const token = reg.data?.token;

  const open = [];
  const publicOk = [];
  for (const r of routes) {
    const s = await call(r);
    if (s === 401) continue;
    (PUBLIC.some((p) => p.test(r.path)) || SHARED_READS.some((p) => p.test(`${r.method} ${r.path}`)) ? publicOk : open).push(`${s} ${r.method} ${r.path} (${r.file})`);
  }
  const adminLeaks = [];
  const adminRoutes = routes.filter((r) => r.admin);
  for (const r of adminRoutes) {
    const s = await call(r, token);
    if (s !== 403) adminLeaks.push(`${s} ${r.method} ${r.path} (${r.file})`);
  }

  console.log(`${routes.length} routes. Signed out: ${routes.length - open.length - publicOk.length} refused with 401, ${publicOk.length} public by design (sign-in, health, shared catalogues), ${open.length} open for review.`);
  for (const l of open) console.log(`OPEN ${l}`);
  console.log(`Administrator routes called as a student: ${adminRoutes.length}, not refused with 403: ${adminLeaks.length}`);
  for (const l of adminLeaks) console.log(`ADMIN ${l}`);
  if (process.env.SHOW_PUBLIC) for (const l of publicOk) console.log(`PUBLIC ${l}`);
})();
