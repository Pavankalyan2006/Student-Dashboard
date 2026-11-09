// Shared helpers for the Phase 3 HTTP probes. Synthetic students only.
const BASE = (process.env.BASE || 'http://localhost:3400') + '/api/v1';
const api = async (m, p, t, b, extraHeaders) => {
  const r = await fetch(BASE + p, { method: m, redirect: 'manual', headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}), ...(extraHeaders || {}) }, body: b !== undefined ? (typeof b === 'string' ? b : JSON.stringify(b)) : undefined });
  let j; try { j = await r.json(); } catch { j = {}; }
  return { s: r.status, j, d: j.data ?? j, h: r.headers };
};
const reg = async (k) => {
  const e = `p3${k}.${Date.now()}${Math.floor(Math.random() * 1e4)}@example.test`;
  const r = await api('POST', '/auth/register', null, { email: e, password: 'TestPass123', name: 'P3 ' + k });
  const t = r.j.data.token;
  await api('POST', '/students/me/onboarding/complete', t, {});
  return { email: e, t, id: r.j.data.user?.id || r.j.data.student?.id };
};
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  -- ' + detail : ''}`); };
const summary = () => { const f = results.filter((r) => !r.ok).length; console.log(`\n${results.length - f}/${results.length} PASS`); process.exitCode = f ? 1 : 0; };
module.exports = { api, reg, check, summary, BASE };
