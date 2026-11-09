// A small, self-contained simulation of a Git repository used by the Git practice lab.
//
// Nothing here touches the host: there is no shell, no child process and no file system access.
// Commands are parsed and applied to a plain JSON state object, which is what gets stored per student.
// The simulation covers the everyday model (working directory, index, commits, branches, HEAD,
// merge with conflicts, rebase, cherry-pick, stash, tags, reset, revert and one simulated remote).
// It is a teaching model, not a full Git implementation; unsupported options are refused with a message.
import crypto from 'crypto';

export type Tree = Record<string, string>;

export interface SimCommit {
  id: string;
  message: string;
  parents: string[];
  tree: Tree;
  seq: number;
}

export interface SimRepo {
  initialized: boolean;
  workdir: Tree;
  index: Tree;
  commits: Record<string, SimCommit>;
  branches: Record<string, string | null>;
  head: { type: 'branch'; name: string } | { type: 'detached'; commit: string };
  tags: Record<string, string>;
  stash: { message: string; workdir: Tree; index: Tree; base: string | null }[];
  remote: { name: string; url: string; branches: Record<string, string> } | null;
  remoteCommits?: Record<string, SimCommit>;
  merge: { theirs: string; conflicts: string[]; message: string } | null;
  seq: number;
  history: string[];
}

export interface CommandResult {
  ok: boolean;
  output: string;
}

export const LIMITS = { commandLength: 500, fileSize: 10_000, files: 50, commits: 300, history: 400 };

export function emptyRepo(): SimRepo {
  return { initialized: false, workdir: {}, index: {}, commits: {}, branches: {}, head: { type: 'branch', name: 'main' }, tags: {}, stash: [], remote: null, merge: null, seq: 0, history: [] };
}

export function cloneRepo(r: SimRepo): SimRepo {
  return JSON.parse(JSON.stringify(r));
}

class GitError extends Error {}
function fail(msg: string): never {
  throw new GitError(msg);
}

// ---------------------------------------------------------------------------
// Tokenizer: splits on spaces, honours single/double quotes, and keeps > and >> as tokens.
// ---------------------------------------------------------------------------
export function tokenize(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote: string | null = null;
  let had = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = null;
      else cur += c;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      had = true;
      continue;
    }
    if (c === '>') {
      if (had || cur) out.push(cur);
      cur = '';
      had = false;
      if (line[i + 1] === '>') {
        out.push('>>');
        i++;
      } else out.push('>');
      continue;
    }
    if (/\s/.test(c)) {
      if (had || cur) out.push(cur);
      cur = '';
      had = false;
      continue;
    }
    cur += c;
  }
  if (quote) fail('Unclosed quote in command.');
  if (had || cur) out.push(cur);
  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const headCommit = (r: SimRepo): string | null => (r.head.type === 'branch' ? r.branches[r.head.name] ?? null : r.head.commit);
const headTree = (r: SimRepo): Tree => {
  const c = headCommit(r);
  return c ? { ...r.commits[c].tree } : {};
};
const short = (id: string) => id.slice(0, 7);
const sameTree = (a: Tree, b: Tree) => {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => b[k] === a[k]);
};
const validName = (n: string) => /^[A-Za-z0-9._/-]{1,60}$/.test(n) && !n.startsWith('-') && !n.includes('..') && !n.endsWith('/');
const validPath = (p: string) => /^[A-Za-z0-9._/-]{1,80}$/.test(p) && !p.startsWith('/') && !p.split('/').includes('..') && !p.startsWith('.git');

function requireRepo(r: SimRepo) {
  if (!r.initialized) fail('fatal: not a git repository (run "git init" first)');
}

function makeCommit(r: SimRepo, message: string, parents: string[], tree: Tree): string {
  if (Object.keys(r.commits).length >= LIMITS.commits) fail('This practice repository has reached its commit limit. Reset the exercise to start again.');
  r.seq += 1;
  const id = crypto.createHash('sha1').update(JSON.stringify({ message, parents, tree, seq: r.seq })).digest('hex');
  r.commits[id] = { id, message, parents, tree: { ...tree }, seq: r.seq };
  return id;
}

function advanceHead(r: SimRepo, id: string) {
  if (r.head.type === 'branch') r.branches[r.head.name] = id;
  else r.head = { type: 'detached', commit: id };
}

export function ancestors(r: SimRepo, id: string | null): Set<string> {
  const seen = new Set<string>();
  const stack = id ? [id] : [];
  while (stack.length) {
    const c = stack.pop()!;
    if (seen.has(c) || !r.commits[c]) continue;
    seen.add(c);
    stack.push(...r.commits[c].parents);
  }
  return seen;
}

export function mergeBase(r: SimRepo, a: string, b: string): string | null {
  const anc = ancestors(r, a);
  // Breadth-first from b so the nearest common ancestor is found first.
  const queue = [b];
  const seen = new Set<string>();
  while (queue.length) {
    const c = queue.shift()!;
    if (seen.has(c)) continue;
    seen.add(c);
    if (anc.has(c)) return c;
    queue.push(...(r.commits[c]?.parents || []));
  }
  return null;
}

/** Resolves HEAD, HEAD~n, HEAD^, branch, tag, origin/branch or a commit id prefix (4+ chars). */
export function resolveRef(r: SimRepo, ref: string): string {
  const m = ref.match(/^(.+?)((?:~\d*|\^)*)$/);
  const baseRef = m ? m[1] : ref;
  const suffix = m ? m[2] : '';
  let id: string | null = null;
  if (baseRef === 'HEAD') id = headCommit(r);
  else if (baseRef in r.branches) id = r.branches[baseRef];
  else if (baseRef in r.tags) id = r.tags[baseRef];
  else if (r.remote && baseRef.startsWith(r.remote.name + '/') && r.remote.branches[baseRef.slice(r.remote.name.length + 1)])
    id = r.remote.branches[baseRef.slice(r.remote.name.length + 1)];
  else if (/^[0-9a-f]{4,40}$/.test(baseRef)) {
    const hits = Object.keys(r.commits).filter((c) => c.startsWith(baseRef));
    if (hits.length > 1) fail(`error: short commit id ${baseRef} is ambiguous`);
    id = hits[0] || null;
  }
  if (!id) fail(`fatal: '${ref}' does not name a commit, branch or tag in this repository`);
  for (const part of suffix.match(/~\d*|\^/g) || []) {
    const n = part === '^' ? 1 : Number(part.slice(1) || 1);
    for (let i = 0; i < n; i++) {
      const p: string | undefined = r.commits[id!].parents[0];
      if (!p) fail(`fatal: '${ref}' goes past the first commit`);
      id = p!;
    }
  }
  return id!;
}

interface Status {
  staged: { path: string; change: 'added' | 'modified' | 'deleted' }[];
  unstaged: { path: string; change: 'modified' | 'deleted' }[];
  untracked: string[];
  conflicted: string[];
}

export function getStatus(r: SimRepo): Status {
  const head = headTree(r);
  const staged: Status['staged'] = [];
  const unstaged: Status['unstaged'] = [];
  const untracked: string[] = [];
  const conflicted = r.merge ? r.merge.conflicts.filter((p) => !(p in r.index) || r.index[p] !== r.workdir[p] || hasMarkers(r.workdir[p])) : [];
  const paths = new Set([...Object.keys(head), ...Object.keys(r.index), ...Object.keys(r.workdir)]);
  for (const p of [...paths].sort()) {
    if (conflicted.includes(p)) continue;
    const inHead = p in head;
    const inIndex = p in r.index;
    const inWork = p in r.workdir;
    if (inIndex && !inHead) staged.push({ path: p, change: 'added' });
    else if (!inIndex && inHead) staged.push({ path: p, change: 'deleted' });
    else if (inIndex && inHead && r.index[p] !== head[p]) staged.push({ path: p, change: 'modified' });
    if (inWork && !inIndex && !inHead) untracked.push(p);
    else if (inIndex && !inWork) unstaged.push({ path: p, change: 'deleted' });
    else if (inIndex && inWork && r.index[p] !== r.workdir[p]) unstaged.push({ path: p, change: 'modified' });
  }
  return { staged, unstaged, untracked, conflicted };
}

export const hasMarkers = (s?: string) => !!s && /^(<<<<<<<|=======|>>>>>>>)/m.test(s);

export function isClean(r: SimRepo): boolean {
  const s = getStatus(r);
  return !s.staged.length && !s.unstaged.length && !s.untracked.length && !s.conflicted.length && !r.merge;
}

function requireClean(r: SimRepo, what: string, allowUntracked = true) {
  const s = getStatus(r);
  if (s.staged.length || s.unstaged.length || s.conflicted.length || (!allowUntracked && s.untracked.length)) {
    fail(`error: your local changes would be overwritten by ${what}.\nCommit them or save them with "git stash" first.`);
  }
}

function checkoutTree(r: SimRepo, tree: Tree) {
  // Keep untracked files, replace tracked ones.
  const untracked = getStatus(r).untracked;
  const keep: Tree = {};
  for (const p of untracked) if (!(p in tree)) keep[p] = r.workdir[p];
  r.workdir = { ...tree, ...keep };
  r.index = { ...tree };
}

/** Three-way merge of trees. Returns the merged tree and the paths that conflict (with markers written). */
function mergeTrees(base: Tree, ours: Tree, theirs: Tree, oursLabel: string, theirsLabel: string): { tree: Tree; conflicts: string[] } {
  const tree: Tree = {};
  const conflicts: string[] = [];
  const paths = new Set([...Object.keys(base), ...Object.keys(ours), ...Object.keys(theirs)]);
  for (const p of [...paths].sort()) {
    const b = base[p];
    const o = ours[p];
    const t = theirs[p];
    let v: string | undefined;
    if (o === t) v = o;
    else if (o === b) v = t;
    else if (t === b) v = o;
    else {
      conflicts.push(p);
      v = `<<<<<<< ${oursLabel}\n${o ?? ''}\n=======\n${t ?? ''}\n>>>>>>> ${theirsLabel}`;
    }
    if (v !== undefined) tree[p] = v;
  }
  return { tree, conflicts };
}

/** Applies the change introduced by `commit` (relative to its first parent) onto the current HEAD. */
function applyCommitChange(r: SimRepo, commitId: string, label: string): { tree: Tree; conflicts: string[] } {
  const c = r.commits[commitId];
  const parentTree = c.parents[0] ? r.commits[c.parents[0]].tree : {};
  return mergeTrees(parentTree, headTree(r), c.tree, 'HEAD', label);
}

// ---------------------------------------------------------------------------
// Command implementations
// ---------------------------------------------------------------------------
type Handler = (r: SimRepo, args: string[]) => string;

function flag(args: string[], ...names: string[]): boolean {
  const i = args.findIndex((a) => names.includes(a));
  if (i >= 0) {
    args.splice(i, 1);
    return true;
  }
  return false;
}
function option(args: string[], ...names: string[]): string | undefined {
  const i = args.findIndex((a) => names.includes(a));
  if (i < 0) return undefined;
  const v = args[i + 1];
  if (v === undefined) fail(`error: option '${args[i]}' needs a value`);
  args.splice(i, 2);
  return v;
}

const git: Record<string, Handler> = {
  init(r) {
    if (r.initialized) return 'Reinitialized existing Git repository (simulated) in the practice folder';
    r.initialized = true;
    r.branches = { main: null };
    r.head = { type: 'branch', name: 'main' };
    return 'Initialized empty Git repository (simulated). Default branch: main';
  },

  status(r) {
    requireRepo(r);
    const s = getStatus(r);
    const lines: string[] = [];
    lines.push(r.head.type === 'branch' ? `On branch ${r.head.name}` : `HEAD detached at ${short(r.head.commit)}`);
    if (r.head.type === 'branch' && !r.branches[r.head.name]) lines.push('\nNo commits yet');
    if (r.merge) lines.push(`\nYou are in the middle of a merge.${s.conflicted.length ? '\n  (fix conflicts and run "git add <file>", then "git commit")' : '\n  (all conflicts fixed: run "git commit" to conclude the merge)'}`);
    if (s.conflicted.length) lines.push('\nUnmerged paths:\n' + s.conflicted.map((p) => `\tboth modified:   ${p}`).join('\n'));
    if (s.staged.length) lines.push('\nChanges to be committed:\n' + s.staged.map((x) => `\t${(x.change === 'added' ? 'new file' : x.change) + ':'}   ${x.path}`).join('\n'));
    if (s.unstaged.length) lines.push('\nChanges not staged for commit:\n' + s.unstaged.map((x) => `\t${x.change}:   ${x.path}`).join('\n'));
    if (s.untracked.length) lines.push('\nUntracked files:\n' + s.untracked.map((p) => `\t${p}`).join('\n'));
    if (!s.staged.length && !s.unstaged.length && !s.untracked.length && !s.conflicted.length && !r.merge) lines.push('\nnothing to commit, working tree clean');
    return lines.join('\n');
  },

  add(r, args) {
    requireRepo(r);
    flag(args, '-v');
    const all = flag(args, '-A', '--all') || args.includes('.');
    const paths = all ? [...new Set([...Object.keys(r.workdir), ...Object.keys(r.index)])] : args;
    if (!paths.length) fail('Nothing specified, nothing added. Try "git add <file>" or "git add ."');
    for (const p of paths) {
      if (p === '.') continue;
      if (p in r.workdir) r.index[p] = r.workdir[p];
      else if (p in r.index) delete r.index[p];
      else fail(`fatal: pathspec '${p}' did not match any files`);
    }
    return '';
  },

  rm(r, args) {
    requireRepo(r);
    const cached = flag(args, '--cached');
    if (!args.length) fail('usage: git rm [--cached] <file>');
    for (const p of args) {
      if (!(p in r.index)) fail(`fatal: pathspec '${p}' did not match any tracked files`);
      delete r.index[p];
      if (!cached) delete r.workdir[p];
    }
    return args.map((p) => `rm '${p}'`).join('\n');
  },

  restore(r, args) {
    requireRepo(r);
    const staged = flag(args, '--staged', '-S');
    if (!args.length) fail('usage: git restore [--staged] <file>');
    const head = headTree(r);
    for (const p of args) {
      if (staged) {
        if (p in head) r.index[p] = head[p];
        else delete r.index[p];
      } else {
        if (!(p in r.index)) fail(`error: pathspec '${p}' did not match any file known to git`);
        r.workdir[p] = r.index[p];
      }
    }
    return '';
  },

  commit(r, args) {
    requireRepo(r);
    const all = flag(args, '-a', '--all');
    const am = args.indexOf('-am');
    let message: string | undefined;
    if (am >= 0) {
      message = args[am + 1];
      args.splice(am, 2);
      for (const p of Object.keys(r.index)) {
        if (p in r.workdir) r.index[p] = r.workdir[p];
        else delete r.index[p];
      }
    } else message = option(args, '-m', '--message');
    if (all) {
      for (const p of Object.keys(r.index)) {
        if (p in r.workdir) r.index[p] = r.workdir[p];
        else delete r.index[p];
      }
    }
    if (flag(args, '--amend')) fail('"git commit --amend" is not part of this simulator yet. Use "git reset --soft HEAD~1" and commit again.');
    if (!message || !message.trim()) fail('error: this simulator needs a message: git commit -m "your message"');
    if (message.length > 200) fail('error: keep the commit message under 200 characters');
    if (r.merge) {
      const s = getStatus(r);
      if (s.conflicted.length) fail(`error: Committing is not possible because you have unmerged files: ${s.conflicted.join(', ')}\nFix them, remove the conflict markers, then "git add" each file.`);
      const parents = [headCommit(r)!, r.merge.theirs];
      const id = makeCommit(r, message, parents, r.index);
      advanceHead(r, id);
      r.merge = null;
      return `[${r.head.type === 'branch' ? r.head.name : 'detached'} ${short(id)}] ${message}\nMerge completed.`;
    }
    const parent = headCommit(r);
    if (sameTree(r.index, headTree(r))) fail(getStatus(r).unstaged.length || getStatus(r).untracked.length ? 'no changes added to commit (use "git add" first)' : 'nothing to commit, working tree clean');
    const id = makeCommit(r, message, parent ? [parent] : [], r.index);
    advanceHead(r, id);
    const changed = Object.keys({ ...r.index, ...(parent ? r.commits[parent].tree : {}) }).filter((p) => r.index[p] !== (parent ? r.commits[parent].tree[p] : undefined)).length;
    return `[${r.head.type === 'branch' ? r.head.name : 'detached HEAD'}${parent ? '' : ' (root-commit)'} ${short(id)}] ${message}\n ${changed} file${changed === 1 ? '' : 's'} changed`;
  },

  log(r, args) {
    requireRepo(r);
    const oneline = flag(args, '--oneline');
    flag(args, '--graph');
    const all = flag(args, '--all');
    const start = all
      ? [...Object.values(r.branches), ...Object.values(r.tags)].filter(Boolean) as string[]
      : [args[0] ? resolveRef(r, args[0]) : headCommit(r)].filter(Boolean) as string[];
    if (!start.length) fail(`fatal: your current branch '${r.head.type === 'branch' ? r.head.name : ''}' does not have any commits yet`);
    const set = new Set<string>();
    for (const s of start) for (const c of ancestors(r, s)) set.add(c);
    const list = [...set].map((c) => r.commits[c]).sort((a, b) => b.seq - a.seq);
    const labels = refLabels(r);
    return list
      .map((c) => {
        const l = labels[c.id]?.length ? ` (${labels[c.id].join(', ')})` : '';
        return oneline ? `${short(c.id)}${l} ${c.message}` : `commit ${c.id}${l}${c.parents.length > 1 ? `\nMerge: ${c.parents.map(short).join(' ')}` : ''}\n\n    ${c.message}\n`;
      })
      .join('\n');
  },

  branch(r, args) {
    requireRepo(r);
    const del = flag(args, '-d', '-D', '--delete');
    const force = args.includes('-D');
    if (flag(args, '-a', '--all') || !args.length) {
      const cur = r.head.type === 'branch' ? r.head.name : null;
      const local = Object.keys(r.branches).sort().map((b) => `${b === cur ? '* ' : '  '}${b}`);
      if (r.head.type === 'detached') local.unshift(`* (HEAD detached at ${short(r.head.commit)})`);
      const remote = r.remote ? Object.keys(r.remote.branches).map((b) => `  remotes/${r.remote!.name}/${b}`) : [];
      return [...local, ...remote].join('\n');
    }
    const name = args[0];
    if (del) {
      if (!(name in r.branches)) fail(`error: branch '${name}' not found.`);
      if (r.head.type === 'branch' && r.head.name === name) fail(`error: Cannot delete branch '${name}' checked out right now. Switch to another branch first.`);
      const tip = r.branches[name];
      if (!force && tip && !ancestors(r, headCommit(r)).has(tip)) fail(`error: The branch '${name}' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D ${name}'.`);
      delete r.branches[name];
      return `Deleted branch ${name}${tip ? ` (was ${short(tip)})` : ''}.`;
    }
    if (!validName(name)) fail(`fatal: '${name}' is not a valid branch name`);
    if (name in r.branches) fail(`fatal: a branch named '${name}' already exists`);
    const at = args[1] ? resolveRef(r, args[1]) : headCommit(r);
    if (!at) fail('fatal: make a first commit before creating branches');
    r.branches[name] = at;
    return '';
  },

  checkout(r, args) {
    requireRepo(r);
    const create = option(args, '-b');
    if (args[0] === '--') return git.restore(r, args.slice(1));
    if (create !== undefined) return createAndSwitch(r, create, args[0]);
    if (!args.length) fail('usage: git checkout <branch> | git checkout -b <new-branch>');
    const target = args[0];
    // "git checkout <file>" discards changes in a file
    if (!(target in r.branches) && (target in r.index) && !(target in r.tags)) return git.restore(r, [target]);
    return switchTo(r, target, true);
  },

  switch(r, args) {
    requireRepo(r);
    const create = option(args, '-c', '--create');
    if (create !== undefined) return createAndSwitch(r, create, args[0]);
    if (!args.length) fail('usage: git switch <branch> | git switch -c <new-branch>');
    if (!(args[0] in r.branches)) fail(`fatal: invalid reference: ${args[0]}\n(use "git switch -c ${args[0]}" to create it)`);
    return switchTo(r, args[0], false);
  },

  merge(r, args) {
    requireRepo(r);
    if (flag(args, '--abort')) {
      if (!r.merge) fail('fatal: There is no merge to abort.');
      r.merge = null;
      checkoutTree(r, headTree(r));
      return 'Merge aborted. Your branch is back to how it was before the merge.';
    }
    const noFf = flag(args, '--no-ff');
    const msg = option(args, '-m');
    if (r.merge) fail('fatal: You have not concluded your merge. Fix conflicts and commit, or run "git merge --abort".');
    if (!args.length) fail('usage: git merge <branch>');
    const theirs = resolveRef(r, args[0]);
    const ours = headCommit(r);
    if (!ours) fail('fatal: make a first commit before merging');
    requireClean(r, 'merge');
    if (ancestors(r, ours!).has(theirs)) return 'Already up to date.';
    if (!noFf && ancestors(r, theirs).has(ours!)) {
      advanceHead(r, theirs);
      checkoutTree(r, r.commits[theirs].tree);
      return `Updating ${short(ours!)}..${short(theirs)}\nFast-forward`;
    }
    const base = mergeBase(r, ours!, theirs);
    const { tree, conflicts } = mergeTrees(base ? r.commits[base].tree : {}, headTree(r), r.commits[theirs].tree, 'HEAD', args[0]);
    const message = msg || `Merge branch '${args[0]}'`;
    if (conflicts.length) {
      const clean: Tree = {};
      for (const [p, v] of Object.entries(tree)) if (!conflicts.includes(p)) clean[p] = v;
      r.index = { ...clean };
      for (const p of conflicts) delete r.index[p];
      r.workdir = { ...r.workdir, ...tree };
      r.merge = { theirs, conflicts, message };
      return `${conflicts.map((p) => `CONFLICT (content): Merge conflict in ${p}`).join('\n')}\nAutomatic merge failed; fix conflicts and then commit the result.`;
    }
    const id = makeCommit(r, message, [ours!, theirs], tree);
    advanceHead(r, id);
    checkoutTree(r, tree);
    return `Merge made by the 'ort' strategy (simulated).\n[${short(id)}] ${message}`;
  },

  rebase(r, args) {
    requireRepo(r);
    if (flag(args, '--abort', '--continue', '-i', '--interactive')) fail('This simulator runs a rebase in one step; interactive rebase and --continue are not simulated. If a rebase hits a conflict it is stopped and nothing changes.');
    if (r.head.type !== 'branch') fail('fatal: rebase needs a checked-out branch in this simulator');
    if (!args.length) fail('usage: git rebase <upstream-branch>');
    requireClean(r, 'rebase');
    const onto = resolveRef(r, args[0]);
    const ours = headCommit(r)!;
    if (ancestors(r, ours).has(onto)) return `Current branch ${r.head.name} is up to date.`;
    if (ancestors(r, onto).has(ours)) {
      advanceHead(r, onto);
      checkoutTree(r, r.commits[onto].tree);
      return `Successfully rebased and updated refs/heads/${r.head.name} (fast-forward).`;
    }
    const base = mergeBase(r, ours, onto);
    const ontoAnc = ancestors(r, onto);
    const toReplay = [...ancestors(r, ours)].filter((c) => !ontoAnc.has(c)).map((c) => r.commits[c]).filter((c) => c.parents.length === 1).sort((a, b) => a.seq - b.seq);
    // Work on a copy so a conflict leaves the real repository untouched.
    const trial = cloneRepo(r);
    trial.head = { type: 'detached', commit: onto };
    for (const c of toReplay) {
      const { tree, conflicts } = applyCommitChange(trial, c.id, short(c.id));
      if (conflicts.length) {
        fail(`CONFLICT (content): Merge conflict in ${conflicts.join(', ')} while replaying "${c.message}".\nThe rebase was stopped and nothing was changed. Try "git merge ${args[0]}" instead, which lets you resolve the conflict.`);
      }
      const id = makeCommit(trial, c.message, [headCommit(trial)!], tree);
      trial.head = { type: 'detached', commit: id };
    }
    const newTip = headCommit(trial)!;
    r.commits = trial.commits;
    r.seq = trial.seq;
    r.branches[r.head.name] = newTip;
    checkoutTree(r, r.commits[newTip].tree);
    return `Replayed ${toReplay.length} commit${toReplay.length === 1 ? '' : 's'} on top of ${args[0]}${base ? ` (old base ${short(base)})` : ''}.\nSuccessfully rebased and updated refs/heads/${r.head.name}.`;
  },

  'cherry-pick'(r, args) {
    requireRepo(r);
    if (!args.length) fail('usage: git cherry-pick <commit>');
    requireClean(r, 'cherry-pick');
    const id = resolveRef(r, args[0]);
    const c = r.commits[id];
    if (c.parents.length > 1) fail('error: this simulator does not cherry-pick merge commits');
    if (!headCommit(r)) fail('fatal: make a first commit before cherry-picking');
    const { tree, conflicts } = applyCommitChange(r, id, short(id));
    if (conflicts.length) fail(`error: could not apply ${short(id)}... ${c.message}\nCONFLICT in ${conflicts.join(', ')}. Nothing was changed.`);
    if (sameTree(tree, headTree(r))) fail('The previous cherry-pick is now empty: this change is already on the current branch.');
    const nid = makeCommit(r, c.message, [headCommit(r)!], tree);
    advanceHead(r, nid);
    checkoutTree(r, tree);
    return `[${r.head.type === 'branch' ? r.head.name : 'detached'} ${short(nid)}] ${c.message}`;
  },

  stash(r, args) {
    requireRepo(r);
    const sub = args[0] && !args[0].startsWith('-') ? args.shift()! : 'push';
    if (sub === 'list') return r.stash.map((s, i) => `stash@{${i}}: ${s.message}`).join('\n');
    if (sub === 'push' || sub === 'save') {
      const msg = option(args, '-m', '--message') || (sub === 'save' ? args.join(' ') : '');
      const s = getStatus(r);
      if (!s.staged.length && !s.unstaged.length) return 'No local changes to save';
      if (r.merge) fail('error: cannot stash during a merge');
      const branch = r.head.type === 'branch' ? r.head.name : 'detached';
      const base = headCommit(r);
      const tracked: Tree = {};
      for (const p of Object.keys(r.workdir)) if (p in r.index || p in headTree(r)) tracked[p] = r.workdir[p];
      r.stash.unshift({ message: `On ${branch}: ${msg || (base ? r.commits[base].message : 'WIP')}`, workdir: tracked, index: { ...r.index }, base });
      checkoutTree(r, headTree(r));
      return `Saved working directory and index state ${r.stash[0].message}`;
    }
    if (sub === 'pop' || sub === 'apply') {
      if (!r.stash.length) fail('error: No stash entries found.');
      requireClean(r, `stash ${sub}`);
      const s = r.stash[0];
      const { tree, conflicts } = mergeTrees(s.base ? r.commits[s.base].tree : {}, headTree(r), s.workdir, 'Updated upstream', 'Stashed changes');
      if (conflicts.length) fail(`error: stash ${sub} would conflict in ${conflicts.join(', ')}. Nothing was changed; the stash is kept.`);
      const untracked: Tree = {};
      for (const p of getStatus(r).untracked) untracked[p] = r.workdir[p];
      r.workdir = { ...tree, ...untracked };
      if (sub === 'pop') r.stash.shift();
      return `Restored: ${s.message}${sub === 'pop' ? '\nDropped stash@{0}' : ''}`;
    }
    if (sub === 'drop') {
      if (!r.stash.length) fail('error: No stash entries found.');
      const s = r.stash.shift()!;
      return `Dropped stash@{0} (${s.message})`;
    }
    fail(`Unknown stash command '${sub}'. Try: git stash, git stash list, git stash pop, git stash apply, git stash drop`);
    return '';
  },

  tag(r, args) {
    requireRepo(r);
    if (flag(args, '-d', '--delete')) {
      if (!(args[0] in r.tags)) fail(`error: tag '${args[0]}' not found.`);
      delete r.tags[args[0]];
      return `Deleted tag '${args[0]}'`;
    }
    option(args, '-m');
    flag(args, '-a');
    if (!args.length || flag(args, '-l', '--list')) return Object.keys(r.tags).sort().join('\n');
    const name = args[0];
    if (!validName(name)) fail(`fatal: '${name}' is not a valid tag name`);
    if (name in r.tags) fail(`fatal: tag '${name}' already exists`);
    const at = args[1] ? resolveRef(r, args[1]) : headCommit(r);
    if (!at) fail('fatal: make a first commit before tagging');
    r.tags[name] = at!;
    return '';
  },

  reset(r, args) {
    requireRepo(r);
    const mode = flag(args, '--hard') ? 'hard' : flag(args, '--soft') ? 'soft' : (flag(args, '--mixed'), 'mixed');
    if (r.merge && mode !== 'hard') fail('error: finish or abort the merge first (git merge --abort)');
    // "git reset <file>" unstages that file
    if (args[0] && !(args[0] in r.branches) && !(args[0] in r.tags) && (args[0] in r.index || args[0] in r.workdir) && !/^[0-9a-f]{4,}$/.test(args[0])) return git.restore(r, ['--staged', args[0]]);
    const target = resolveRef(r, args[0] || 'HEAD');
    advanceHead(r, target);
    const tree = r.commits[target].tree;
    if (mode === 'soft') return `HEAD is now at ${short(target)} (changes kept staged)`;
    if (mode === 'hard') {
      r.merge = null;
      checkoutTree(r, tree); // also resets the index; must run before the index changes so tracked files are removed

      return `HEAD is now at ${short(target)} ${r.commits[target].message}`;
    }
    r.index = { ...tree };
    return `Unstaged changes after reset. HEAD is now at ${short(target)}`;
  },

  revert(r, args) {
    requireRepo(r);
    flag(args, '--no-edit');
    if (!args.length) fail('usage: git revert <commit>');
    requireClean(r, 'revert');
    const id = resolveRef(r, args[0]);
    const c = r.commits[id];
    if (c.parents.length > 1) fail('error: this simulator does not revert merge commits');
    const parentTree = c.parents[0] ? r.commits[c.parents[0]].tree : {};
    const { tree, conflicts } = mergeTrees(c.tree, headTree(r), parentTree, 'HEAD', `parent of ${short(id)}`);
    if (conflicts.length) fail(`error: could not revert ${short(id)}: conflict in ${conflicts.join(', ')}. Nothing was changed.`);
    const message = `Revert "${c.message}"`;
    const nid = makeCommit(r, message, [headCommit(r)!], tree);
    advanceHead(r, nid);
    checkoutTree(r, tree);
    return `[${r.head.type === 'branch' ? r.head.name : 'detached'} ${short(nid)}] ${message}`;
  },

  diff(r, args) {
    requireRepo(r);
    const staged = flag(args, '--staged', '--cached');
    const from = staged ? headTree(r) : r.index;
    const to = staged ? r.index : r.workdir;
    const out: string[] = [];
    for (const p of [...new Set([...Object.keys(from), ...Object.keys(to)])].sort()) {
      if (!staged && !(p in r.index)) continue; // untracked files are not shown by git diff
      if (from[p] === to[p]) continue;
      out.push(`diff --git a/${p} b/${p}`);
      for (const l of (from[p] ?? '').split('\n')) if (from[p] !== undefined) out.push(`-${l}`);
      for (const l of (to[p] ?? '').split('\n')) if (to[p] !== undefined) out.push(`+${l}`);
    }
    return out.join('\n');
  },

  remote(r, args) {
    requireRepo(r);
    flag(args, '-v');
    if (args[0] === 'add') {
      const [, name, url] = args;
      if (!name || !url) fail('usage: git remote add <name> <url>');
      if (r.remote) fail(`error: remote ${r.remote.name} already exists (this simulator supports one remote)`);
      if (!validName(name)) fail('error: invalid remote name');
      r.remote = { name, url: url.slice(0, 200), branches: {} };
      return '';
    }
    return r.remote ? `${r.remote.name}\t${r.remote.url} (simulated remote, no network)` : '';
  },

  push(r, args) {
    requireRepo(r);
    if (!r.remote) fail('fatal: No configured push destination. Add one with "git remote add origin <url>".');
    flag(args, '-u', '--set-upstream');
    const force = flag(args, '--force', '-f');
    const name = args[0] || r.remote.name;
    if (name !== r.remote.name) fail(`fatal: '${name}' does not appear to be a git repository`);
    const branch = args[1] || (r.head.type === 'branch' ? r.head.name : fail('fatal: You are not currently on a branch.'));
    const local = r.branches[branch];
    if (!local) fail(`error: src refspec ${branch} does not match any (make a commit first)`);
    const remoteTip = r.remote.branches[branch];
    if (remoteTip && !ancestors(r, local!).has(remoteTip) && !force) fail(` ! [rejected]        ${branch} -> ${branch} (non-fast-forward)\nThe remote has commits you do not have. Pull first.`);
    r.remote.branches[branch] = local!;
    return `To ${r.remote.url} (simulated)\n   ${remoteTip ? short(remoteTip) : '[new branch]'}..${short(local!)}  ${branch} -> ${branch}`;
  },

  fetch(r) {
    requireRepo(r);
    if (!r.remote) fail('fatal: no remote configured');
    return 'Fetched from the simulated remote (it only contains what you pushed or the exercise set up).';
  },

  pull(r, args) {
    requireRepo(r);
    if (!r.remote) fail('fatal: no remote configured');
    if (r.head.type !== 'branch') fail('fatal: You are not currently on a branch.');
    const branch = args[1] || r.head.name;
    if (!r.remote.branches[branch]) fail(`fatal: couldn't find remote ref ${branch}`);
    return git.merge(r, [`${r.remote.name}/${branch}`]);
  },

  help() {
    return HELP;
  },
};

function createAndSwitch(r: SimRepo, name: string, startPoint?: string): string {
  const out = git.branch(r, [name, ...(startPoint ? [startPoint] : [])]);
  switchTo(r, name, false);
  return `${out}Switched to a new branch '${name}'`;
}

function switchTo(r: SimRepo, target: string, allowDetach: boolean): string {
  if (r.merge) fail('error: you need to resolve your current merge first');
  if (target in r.branches) {
    if (r.head.type === 'branch' && r.head.name === target) return `Already on '${target}'`;
    const tip = r.branches[target];
    const tree = tip ? r.commits[tip].tree : {};
    if (!sameTree(tree, headTree(r))) requireClean(r, 'checkout');
    const carried = getStatus(r);
    r.head = { type: 'branch', name: target };
    if (!carried.staged.length && !carried.unstaged.length) checkoutTree(r, tree);
    return `Switched to branch '${target}'`;
  }
  if (!allowDetach) fail(`fatal: invalid reference: ${target}`);
  const id = resolveRef(r, target);
  requireClean(r, 'checkout');
  r.head = { type: 'detached', commit: id };
  checkoutTree(r, r.commits[id].tree);
  return `Note: switching to '${target}'.\nYou are in 'detached HEAD' state. Create a branch with "git switch -c <name>" to keep commits made here.\nHEAD is now at ${short(id)} ${r.commits[id].message}`;
}

function refLabels(r: SimRepo): Record<string, string[]> {
  const labels: Record<string, string[]> = {};
  const add = (id: string | null | undefined, l: string) => {
    if (id) (labels[id] ||= []).push(l);
  };
  if (r.head.type === 'detached') add(r.head.commit, 'HEAD');
  for (const [b, id] of Object.entries(r.branches)) add(id, r.head.type === 'branch' && r.head.name === b ? `HEAD -> ${b}` : b);
  for (const [t, id] of Object.entries(r.tags)) add(id, `tag: ${t}`);
  if (r.remote) for (const [b, id] of Object.entries(r.remote.branches)) add(id, `${r.remote.name}/${b}`);
  return labels;
}

// ---------------------------------------------------------------------------
// Simulated shell helpers for editing files (only inside the simulated working directory).
// ---------------------------------------------------------------------------
function writeFile(r: SimRepo, path: string, content: string, append: boolean): void {
  if (!validPath(path)) fail(`Invalid file name '${path}'. Use letters, numbers, dots, dashes, underscores and folders.`);
  if (!(path in r.workdir) && Object.keys(r.workdir).length >= LIMITS.files) fail(`This practice folder is limited to ${LIMITS.files} files.`);
  const next = append && path in r.workdir ? `${r.workdir[path]}\n${content}` : content;
  if (next.length > LIMITS.fileSize) fail(`Files are limited to ${LIMITS.fileSize} characters in the simulator.`);
  r.workdir[path] = next;
}

const shell: Record<string, Handler> = {
  echo(r, args) {
    const op = args.findIndex((a) => a === '>' || a === '>>');
    if (op < 0) return args.join(' ');
    const target = args[op + 1];
    if (!target) fail('echo: missing file name after redirection');
    writeFile(r, target, args.slice(0, op).join(' '), args[op] === '>>');
    return '';
  },
  touch(r, args) {
    if (!args.length) fail('usage: touch <file>');
    for (const p of args) if (!(p in r.workdir)) writeFile(r, p, '', false);
    return '';
  },
  cat(r, args) {
    if (!args.length) fail('usage: cat <file>');
    return args.map((p) => (p in r.workdir ? r.workdir[p] : fail(`cat: ${p}: No such file`))).join('\n');
  },
  ls(r) {
    return Object.keys(r.workdir).sort().join('\n');
  },
  rm(r, args) {
    flag(args, '-f');
    if (!args.length) fail('usage: rm <file>');
    for (const p of args) {
      if (!(p in r.workdir)) fail(`rm: cannot remove '${p}': No such file`);
      delete r.workdir[p];
    }
    return '';
  },
  clear() {
    return '';
  },
};

export const HELP = `This is a simulated terminal. Nothing runs on a real computer.
Files:  echo "text" > file   echo "more" >> file   cat file   ls   touch file   rm file
Git:    init status add rm restore commit log branch checkout switch merge rebase
        cherry-pick stash tag reset revert diff remote push fetch pull
Refs:   branch names, tags, HEAD, HEAD~1, HEAD^, origin/<branch>, or the first 4+ characters of a commit id`;

/** Parses and applies one command line. Never throws for user errors; returns ok=false with Git-style output. */
export function runCommand(repo: SimRepo, line: string): CommandResult {
  const trimmed = (line || '').trim();
  if (!trimmed) return { ok: true, output: '' };
  if (trimmed.length > LIMITS.commandLength) return { ok: false, output: `Commands are limited to ${LIMITS.commandLength} characters.` };
  if (/[;&|`$]|\$\(/.test(trimmed.replace(/(["'])(?:(?!\1).)*\1/g, ''))) {
    return { ok: false, output: 'Chaining, pipes and shell substitutions are not available. Run one command at a time.' };
  }
  let tokens: string[];
  try {
    tokens = tokenize(trimmed);
  } catch (e: any) {
    return { ok: false, output: e.message };
  }
  const work = cloneRepo(repo);
  try {
    let output: string;
    const [cmd, ...args] = tokens;
    if (cmd === 'git') {
      const [sub, ...rest] = args;
      if (!sub || sub === '--help' || sub === 'help') output = HELP;
      else if (!(sub in git)) throw new GitError(`git: '${sub}' is not a git command in this simulator. Type "help" for the list.`);
      else output = git[sub](work, rest);
    } else if (cmd === 'help') output = HELP;
    else if (cmd in shell) output = shell[cmd](work, args);
    else throw new GitError(`${cmd}: command not available. This terminal only simulates Git and a few file commands (type "help").`);
    work.history = [...work.history, trimmed].slice(-LIMITS.history);
    Object.assign(repo, work);
    return { ok: true, output };
  } catch (e: any) {
    if (!(e instanceof GitError)) throw e;
    repo.history = [...repo.history, trimmed].slice(-LIMITS.history);
    return { ok: false, output: e.message };
  }
}

/** A compact, client-friendly view of the repository. */
export function describeRepo(r: SimRepo) {
  const labels = refLabels(r);
  const commits = Object.values(r.commits)
    .sort((a, b) => b.seq - a.seq)
    .map((c) => ({ id: c.id, short_id: short(c.id), message: c.message, parents: c.parents.map(short), refs: labels[c.id] || [] }));
  return {
    initialized: r.initialized,
    head: r.head.type === 'branch' ? { branch: r.head.name, commit: r.branches[r.head.name] ? short(r.branches[r.head.name]!) : null } : { branch: null, commit: short(r.head.commit) },
    branches: Object.entries(r.branches).map(([name, id]) => ({ name, commit: id ? short(id) : null })),
    tags: Object.entries(r.tags).map(([name, id]) => ({ name, commit: short(id) })),
    remote: r.remote ? { name: r.remote.name, url: r.remote.url, branches: Object.entries(r.remote.branches).map(([name, id]) => ({ name, commit: short(id) })) } : null,
    commits,
    status: r.initialized ? getStatus(r) : null,
    files: Object.keys(r.workdir).sort().map((path) => ({ path, content: r.workdir[path] })),
    stash: r.stash.map((s, i) => `stash@{${i}}: ${s.message}`),
    merge_in_progress: r.merge ? { conflicts: r.merge.conflicts } : null,
  };
}

/** Runs a list of setup commands; used to build exercise starting states. Throws if any fails (a bug in the exercise). */
export function buildRepo(commands: string[]): SimRepo {
  const r = emptyRepo();
  for (const c of commands) {
    const res = runCommand(r, c);
    if (!res.ok) throw new Error(`Git lab setup command failed: ${c}: ${res.output}`);
  }
  r.history = [];
  return r;
}

/** Commit ids reachable from a branch, oldest first, with messages; handy for checks. */
export function branchCommits(r: SimRepo, branch: string): SimCommit[] {
  const tip = r.branches[branch];
  return [...ancestors(r, tip ?? null)].map((c) => r.commits[c]).sort((a, b) => a.seq - b.seq);
}

export { headCommit, headTree };
