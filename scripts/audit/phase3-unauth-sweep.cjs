// Phase 3 batch 5: call every /api/v1 route declared in server/api/routes without a token and record the status.
// Route list comes from the source (method + mounted path); ":params" are filled with "p3probe". Output: one line per route.
// A route that answers anything other than 401 without a token is listed as OPEN for review.
const fs = require('fs');
const path = require('path');
const BASE = process.env.BASE || 'http://localhost:3400';
const root = path.join(__dirname, '../../server/api');
const router = fs.readFileSync(path.join(root, 'router.ts'), 'utf8');
const imports = {};
for (const m of router.matchAll(/import\s+(?:\{\s*(\w+)\s*\}|(\w+))\s+from\s+'\.\/routes\/(\w+)'/g)) imports[m[1] || m[2]] = m[3];
const mounts = {};
for (const m of router.matchAll(/apiV1Router\.use\('([^']*)',\s*(?:\w+,\s*)*(\w+)\)/g)) (mounts[m[2]] = mounts[m[2]] || []).push(m[1]);
const routes = [];
for (const [v, file] of Object.entries(imports)) {
  const src = fs.readFileSync(path.join(root, 'routes', file + '.ts'), 'utf8');
  for (const m of src.matchAll(/\.(get|post|put|patch|delete)\(\s*'([^']+)'/g)) {
    const pre = (mounts[v] || [])[0];
    if (pre === undefined) continue;
    routes.push({ method: m[1].toUpperCase(), path: ('/api/v1' + pre.replace(/\/$/, '') + m[2]).replace(/\/\//g, '/'), file });
  }
}
(async () => {
  const out = [];
  for (const r of routes) {
    const url = BASE + r.path.replace(/:[A-Za-z_]+/g, 'p3probe');
    let s;
    try {
      const res = await fetch(url, { method: r.method, redirect: 'manual', headers: { 'Content-Type': 'application/json' }, body: r.method === 'GET' || r.method === 'DELETE' ? undefined : '{}' });
      s = res.status;
    } catch (e) { s = 'ERR'; }
    out.push({ ...r, status: s });
  }
  const open = out.filter((r) => r.status !== 401);
  for (const r of out) console.log(`${r.status === 401 ? 'AUTH' : 'OPEN'} ${r.status} ${r.method} ${r.path} (${r.file})`);
  console.log(`\n${out.length} routes, ${out.length - open.length} require sign-in, ${open.length} answer without a token`);
})();
