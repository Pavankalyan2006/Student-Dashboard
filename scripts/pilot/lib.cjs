// Phase 6 pilot helpers: a tiny HTTP client that records status and duration for every call.
// Synthetic accounts only (emails end in @example.test). Never point this at real student data.
const BASE = process.env.BASE || 'http://localhost:3611';
const calls = [];
async function call(method, path, token, body, label) {
  const t0 = performance.now();
  let status = 0, json = null, err = null;
  try {
    const res = await fetch(`${BASE}/api/v1${path}`, {
      method,
      headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    status = res.status;
    const text = await res.text();
    try { json = JSON.parse(text); } catch { json = text.slice(-4000); }
  } catch (e) { err = e.message; }
  const ms = Math.round(performance.now() - t0);
  calls.push({ label: label || `${method} ${path.replace(/[0-9a-f-]{20,}|std_[a-z0-9_]+/gi, ':id')}`, method, status, ms, err });
  return { status, body: json, ms };
}
const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
function summary() {
  const byLabel = {};
  for (const c of calls) {
    const k = c.label;
    (byLabel[k] ||= []).push(c);
  }
  return Object.entries(byLabel).map(([label, cs]) => {
    const ms = cs.map((c) => c.ms).sort((a, b) => a - b);
    return { label, n: cs.length, statuses: [...new Set(cs.map((c) => c.status))].join(','), p50: ms[Math.floor((ms.length - 1) / 2)], max: ms[ms.length - 1] };
  });
}
module.exports = { BASE, call, uniq, calls, summary };
