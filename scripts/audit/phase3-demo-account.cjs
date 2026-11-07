// Phase 3 batch 5: the seeded demo login (student@btech.edu) must not show invented connections, scores or applications.
const { api, check, summary } = require('./phase3-lib.cjs');
(async () => {
  const l = await api('POST', '/auth/login', null, { email: 'student@btech.edu', password: 'Password123!' });
  const t = l.j.data?.token;
  check('DEMO login works', l.s === 200, l.s);
  const ep = await api('GET', '/external-profiles', t);
  check('DEMO no external profile is CONNECTED/VERIFIED by seed', (ep.j.profiles || []).every((p) => !['CONNECTED', 'SYNCED'].includes(p.connection_status)), JSON.stringify((ep.j.profiles || []).map((p) => p.connection_status)));
  const gh = await api('GET', '/github/status', t);
  check('DEMO GitHub is not connected by seed', gh.s === 200 && gh.d.is_connected === false, gh.d.is_connected);
  const mi = await api('GET', '/mock-interviews/sessions', t);
  check('DEMO no seeded mock interview score', mi.s === 200 && mi.d.length === 0, mi.d.length);
  const ap = await api('GET', '/applications', t);
  check('DEMO no seeded internship applications', ap.s === 200 && ap.d.length === 0, ap.d.length);
  const ic = await api('GET', '/integrations/connections', t);
  check('DEMO no seeded integration connections', ic.s === 200 && ic.d.length === 0, ic.d.length);
  summary();
})();
