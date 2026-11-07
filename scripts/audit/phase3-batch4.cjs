// Phase 3 batch 4 HTTP probe: Applications (E2E 9), Placement Prep (E2E 10), Connected Platforms (E2E 11) and Jobs Discovery.
// Usage: BASE=http://localhost:3400 node scripts/audit/phase3-batch4.cjs create|verify   (state in STATE, default /tmp/p3/batch4.json)
// No AI model and no outbound access to GitHub/Codeforces/Remotive here, so AI answers must be 503 and external checks must fail honestly.
const fs = require('fs');
const { api, reg, check, summary } = require('./phase3-lib.cjs');
const STATE = process.env.STATE || '/tmp/p3/batch4.json';
const JD = 'We need a backend intern with Python, SQL and Docker. Experience with React is a plus.';

async function applications(A, B, st) {
  const bad = await api('POST', '/applications', A.t, { company_name: 'Synthetic Co', role: 'Intern', application_url: 'javascript:alert(1)' });
  check('AP javascript: application URL refused', bad.s === 400, bad.s);
  const badStatus = await api('POST', '/applications', A.t, { company_name: 'Synthetic Co', role: 'Intern', status: 'HIRED_BY_MAGIC' });
  check('AP unknown status refused', badStatus.s === 400, badStatus.s);
  const ok = await api('POST', '/applications', A.t, { company_name: 'Synthetic Co', role: 'Backend Intern', status: 'SAVED', application_url: 'https://example.test/jobs/1', job_description: JD });
  check('AP create saved application', ok.s === 201 || ok.s === 200, ok.s);
  st.app = ok.d.id;
  check('AP no invented location, deadline or notes', !ok.d.location && !ok.d.deadline && !ok.d.notes, JSON.stringify({ l: ok.d.location, d: ok.d.deadline, n: ok.d.notes }));
  const jd = ok.d.jd_analysis;
  check('AP JD analysis lists catalogue skills named in the JD', jd && jd.required_skills.some((r) => r.name === 'Python') && jd.required_skills.some((r) => r.name === 'Docker'), jd && jd.required_skills.map((r) => r.name).join(','));
  check('AP new student has no evidence, readiness 0', jd && jd.readiness_percent === 0, jd && jd.readiness_percent);
  const up = await api('PATCH', `/applications/${st.app}/status`, A.t, { status: 'APPLIED', note: 'Submitted on the company site myself' });
  check('AP status change adds a timeline entry', up.s === 200 && up.d.timeline.some((t) => /APPLIED/.test(t.title)), up.s);
  check('AP student B cannot read A\'s application', [403, 404].includes((await api('GET', `/applications/${st.app}`, B.t)).s));
  check('AP student B cannot change A\'s application', [403, 404].includes((await api('PATCH', `/applications/${st.app}/status`, B.t, { status: 'REJECTED' })).s));
  const listB = await api('GET', '/applications', B.t);
  check('AP B\'s list does not contain A\'s application', listB.s === 200 && !listB.d.some((a) => a.id === st.app));
}

async function placement(A, st) {
  const r = await api('GET', '/placements/readiness', A.t);
  check('PL readiness answers', r.s === 200, r.s);
  st.readiness = r.d;
  const recs = await api('GET', '/placements/recommendations', A.t);
  check('PL recommendations name their basis', recs.s === 200 && (Array.isArray(recs.d) ? recs.d.every((x) => x.basis) : true), recs.s);
  const qs = await api('GET', '/placements/questions', A.t);
  const list = Array.isArray(qs.d) ? qs.d : qs.d.questions || qs.d.items || [];
  check('PL question bank has at least 30 questions', list.length >= 30 || (qs.d.total || 0) >= 30, list.length || qs.d.total);
  check('PL empty assessment refused', (await api('POST', '/placements/assessments/submit', A.t, { answers: {} })).s === 400);
  check('PL unknown question id refused', (await api('POST', '/placements/assessments/submit', A.t, { answers: { pq_does_not_exist: 'A' } })).s === 400);
  const q = list[0];
  const sub = await api('POST', '/placements/assessments/submit', A.t, { answers: { [q.id]: '__wrong__' }, time_spent_seconds: 30 });
  check('PL assessment scored from real answers (wrong answer gives 0%)', sub.s === 200 && sub.d.score_percentage === 0 && sub.d.correct_answers === 0 && sub.d.time_spent_seconds === 30, `${sub.d.score_percentage}% ${sub.d.time_spent_seconds}s`);
  const hist = await api('GET', '/placements/assessments/history', A.t);
  check('PL assessment saved in history', hist.s === 200 && (Array.isArray(hist.d) ? hist.d.length : (hist.d.items || []).length) >= 1, hist.s);
  st.histLen = Array.isArray(hist.d) ? hist.d.length : (hist.d.items || []).length;
  const coach = await api('POST', '/placements/coach/ask', A.t, { question: 'How do I explain a hash map?' });
  check('PL AI coach without a model: 503, nothing generated', coach.s === 503 && coach.j.code === 'AI_UNAVAILABLE', `${coach.s} ${coach.j.code}`);
  const star = await api('POST', '/placements/star/improve', A.t, { raw_answer: 'In my team project the API was slow, so I added caching and it got faster.' });
  check('PL STAR improver without a model: 503', star.s === 503 && star.j.code === 'AI_UNAVAILABLE', star.s);
}

async function platforms(A, B, st) {
  const add = await api('POST', '/external-profiles', A.t, { platform_id: 'github', profile_url: 'https://github.com/synthetic-p3-user', oauth_verified: true });
  check('CP GitHub link with a client "oauth_verified" claim is LINKED, not CONNECTED', (add.s === 201) && add.j.profile.connection_status === 'LINKED', `${add.s} ${add.j.profile?.connection_status}`);
  st.profile = add.j.profile?.id;
  const listA = await api('GET', '/external-profiles', A.t);
  const profsA = listA.j.profiles || listA.d.profiles || listA.d;
  check('CP A sees the profile', Array.isArray(profsA) && profsA.some((p) => p.id === st.profile));
  const listB = await api('GET', '/external-profiles', B.t);
  const profsB = listB.j.profiles || listB.d.profiles || listB.d;
  check('CP B does not see A\'s profile (was all saved under the demo student)', Array.isArray(profsB) && !profsB.some((p) => p.id === st.profile), JSON.stringify(profsB).slice(0, 80));
  check('CP B cannot read A\'s profile by id', [403, 404].includes((await api('GET', `/external-profiles/${st.profile}`, B.t)).s));
  const sync = await api('POST', `/external-profiles/${st.profile}/sync`, A.t);
  const sp = sync.j.profile || {};
  check('CP sync of an unverified GitHub link stays LINKED and counts only imported repositories', sync.s === 200 && sp.connection_status === 'LINKED' && sp.metrics_summary?.imported_repositories === 0 && sp.metrics_summary?.public_repositories === undefined, `${sp.connection_status} ${JSON.stringify(sp.metrics_summary)}`);
  const lc = await api('POST', '/external-profiles', A.t, { platform_id: 'leetcode', profile_url: 'https://leetcode.com/u/synthetic-p3/' });
  check('CP LeetCode link saved as LINKED', lc.s === 201 && lc.j.profile.connection_status === 'LINKED', `${lc.s} ${lc.j.profile?.connection_status}`);
  st.lc = lc.j.profile?.id;
  const ch = await api('POST', `/external-profiles/${st.lc}/verify-challenge/start`, A.t);
  check('CP LeetCode offers no fake verification challenge', ch.s === 400, ch.s);

  const conn = await api('POST', '/integrations/connections/leetcode/connect', A.t, { username: 'synthetic-p3', profile_url: 'https://leetcode.com/u/synthetic-p3/' });
  check('CP integrations connect gives LINKED with no scopes', conn.s < 300 && conn.d.status === 'LINKED' && conn.d.scopes.length === 0, `${conn.s} ${conn.d.status}`);
  st.conn = conn.d.id;
  const code = await api('POST', '/integrations/connections/leetcode/connect', A.t, { code: 'fake-oauth-code' });
  check('CP integrations refuse a client-supplied OAuth code', code.s === 400, code.s);
  const start = await api('POST', '/integrations/connections/linkedin/start', A.t);
  check('CP no OAuth start for LinkedIn (no app registered)', start.s === 400 && start.j.code === 'OAUTH_NOT_AVAILABLE', `${start.s} ${start.j.code}`);
  const csync = await api('POST', `/integrations/connections/${st.conn}/sync`, A.t);
  check('CP LeetCode sync reports ERROR, imports nothing', csync.d.sync_status === 'ERROR', `${csync.s} ${csync.d.sync_status}`);
  const conB = await api('GET', '/integrations/connections', B.t);
  check('CP B does not see A\'s integration', conB.s === 200 && !conB.d.some((c) => c.id === st.conn));
  check('CP jobs list requires sign-in', (await api('GET', '/integrations/jobs')).s === 401);
  const imp = await api('POST', '/integrations/jobs/import', A.t, { title: 'Backend Intern', company_name: 'Synthetic Co', description: JD, url: 'https://example.test/jobs/2' });
  check('CP job import saved for A', imp.s < 300 && imp.d.id, imp.s);
  st.job = imp.d.id;
  const an = await api('POST', `/integrations/jobs/${st.job}/analyze`, A.t);
  check('CP job analysis: fit from listed skills with a stated basis', an.s === 200 && an.d.basis && (an.d.fit_score === null || typeof an.d.fit_score === 'number'), `${an.s} ${an.d.fit_score}`);
  check('CP B cannot analyse A\'s job', [403, 404].includes((await api('POST', `/integrations/jobs/${st.job}/analyze`, B.t)).s));
  const jb = await api('GET', '/integrations/jobs', B.t);
  check('CP B\'s job list is empty of A\'s imports', jb.s === 200 && !jb.d.some((j) => j.id === st.job));
  const consist = await api('GET', '/integrations/consistency', A.t);
  check('CP consistency claims no score', consist.s === 200 && consist.d.overall_consistency_score === null, consist.d.overall_consistency_score);
}

async function jobs(A, B, st) {
  const list = await api('GET', '/jobs-discovery/jobs?limit=200', A.t);
  const jl = list.d.jobs || [];
  check('JD no hand-written seed listings are served', !jl.some((j) => /^(govt|pvt)_.*_2026$/.test(j.id)), jl.length);
  const src = await api('GET', '/jobs-discovery/sources');
  const sources = src.d.sources || [];
  check('JD only Remotive is enabled; no source claims HEALTHY before a sync', sources.filter((s) => s.enabled).map((s) => s.id).join() === 'src_remotive_api' && !sources.some((s) => s.health_status === 'HEALTHY' && !s.last_successful_sync), sources.map((s) => `${s.id}:${s.health_status}`).join(' '));
  const sync = await api('POST', '/jobs-discovery/sync', A.t);
  const run = (sync.d.sync_runs || [])[0];
  check('JD sync with no outbound access: FAILED run, nothing added, error reported', sync.s === 200 && run && run.status === 'FAILED' && sync.d.total_added === 0 && run.errors?.length, run && `${run.status} ${run.errors?.[0]}`);
  check('JD analyze-jd requires sign-in', (await api('POST', '/jobs-discovery/analyze-jd', null, { description: JD })).s === 401);
  const an = await api('POST', '/jobs-discovery/analyze-jd', A.t, { description: JD, title: 'Backend Intern' });
  check('JD analysis without a model: catalogue skills only, no summary', an.s === 200 && an.d.ai_available === false && !an.d.summary && an.d.extracted_skills.includes('Python'), JSON.stringify(an.d.extracted_skills));
  const stats = await api('GET', '/jobs-discovery/stats', A.t);
  check('JD stats: matching count not invented', stats.s === 200 && stats.d.matching_profile_count === 0, stats.d.matching_profile_count);
}

(async () => {
  const mode = process.argv[2];
  if (mode === 'create') {
    const A = await reg('b4a'); const B = await reg('b4b');
    const st = { A, B };
    await applications(A, B, st);
    await placement(A, st);
    await platforms(A, B, st);
    await jobs(A, B, st);
    fs.writeFileSync(STATE, JSON.stringify(st, null, 2));
  } else if (mode === 'verify') {
    const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
    const login = async (u) => (await api('POST', '/auth/login', null, { email: u.email, password: 'TestPass123' })).j.data.token;
    const tA = await login(st.A); const tB = await login(st.B);
    const app = await api('GET', `/applications/${st.app}`, tA);
    check('AP application and JD analysis survive a restart', app.s === 200 && app.d.status === 'APPLIED' && app.d.jd_analysis?.required_skills?.length > 0, app.s);
    const hist = await api('GET', '/placements/assessments/history', tA);
    const n = Array.isArray(hist.d) ? hist.d.length : (hist.d.items || []).length;
    check('PL assessment history survives a restart', n === st.histLen, n);
    const p = await api('GET', `/external-profiles/${st.profile}`, tA);
    const prof = p.j.profile || p.d.profile || p.d;
    check('CP profile survives a restart, still LINKED and owned by A', p.s === 200 && prof.connection_status === 'LINKED', `${p.s} ${prof?.connection_status}`);
    check('CP B still cannot see A\'s profile after restart', [403, 404].includes((await api('GET', `/external-profiles/${st.profile}`, tB)).s));
    const c = await api('GET', '/integrations/connections', tA);
    check('CP integration link survives a restart as LINKED', c.d.some((x) => x.id === st.conn && x.status === 'LINKED'));
    const j = await api('GET', '/integrations/jobs', tA);
    check('CP imported job survives a restart', j.d.some((x) => x.id === st.job));
  }
  summary();
})().catch((e) => { console.error(e); process.exitCode = 1; });
