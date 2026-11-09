// Phase 3 batch 1 HTTP probe: Mock Interviews, Projects, GitHub (E2E tests 1-3 of the Phase 3 spec).
// Usage: BASE=http://localhost:3400 node scripts/audit/phase3-batch1.cjs create|verify   (state in STATE, default /tmp/p3/batch1.json)
// No AI model and no GitHub network access are assumed: AI endpoints must answer 503, GitHub calls must fail honestly.
const fs = require('fs');
const { api, reg, check, summary } = require('./phase3-lib.cjs');
const STATE = process.env.STATE || '/tmp/p3/batch1.json';

async function create() {
  const A = await reg('A'); const B = await reg('B');
  const st = { A, B };

  // Test 1 - Mock Interview: configure -> start -> answer -> complete -> feedback -> history.
  const types = await api('GET', '/mock-interviews/types', A.t);
  check('MI types list', types.s === 200 && types.d.length >= 10, types.d.length);
  const resumeless = await api('POST', '/mock-interviews/sessions', A.t, { category: 'RESUME', target_role: 'Software Development Engineer' });
  check('MI resume interview without a resume is refused (400)', resumeless.s === 400, resumeless.s);
  const dsa = await api('POST', '/mock-interviews/sessions', A.t, { category: 'DSA', target_role: 'Software Development Engineer', max_questions: 4 });
  check('MI DSA interview asks a coding question (was a fixed microservices question)', dsa.s === 201 && dsa.d.initial_question.question_type === 'CODING', dsa.d.initial_question?.topic);
  const s = await api('POST', '/mock-interviews/sessions', A.t, { category: 'CODING', target_role: 'Software Development Engineer', difficulty: 'INTERMEDIATE', max_questions: 4 });
  check('MI create CODING session', s.s === 201 && s.d.session.status === 'READY', s.s);
  const sid = s.d.session.id; st.sid = sid;
  check('MI report before finishing is 409 and does not complete the session', (await api('GET', `/mock-interviews/sessions/${sid}/report`, A.t)).s === 409);
  check('MI student B cannot open the session (403)', [403, 404].includes((await api('GET', `/mock-interviews/sessions/${sid}`, B.t)).s));
  await api('POST', `/mock-interviews/sessions/${sid}/start`, A.t);
  const q1 = s.d.initial_question;
  const junk = await api('POST', `/mock-interviews/sessions/${sid}/answers`, A.t, { question_id: q1.id, answer_text: 'asdf' });
  check('MI junk answer scores 0 (no length bonus or minimum)', junk.s === 200 && junk.d.answer.evaluation.score === 0 && junk.d.answer.evaluation.method === 'KEYWORD_MATCH', `score=${junk.d.answer?.evaluation?.score}`);
  check('MI re-answering the same question is refused', (await api('POST', `/mock-interviews/sessions/${sid}/answers`, A.t, { question_id: q1.id, answer_text: 'again' })).s === 400);
  let q = junk.d.next_question; const asked = new Set([q1.question]);
  let repeated = false; let done = junk.d.is_completed; let n = 1;
  while (q && !done && n < 12) {
    if (asked.has(q.question)) repeated = true; asked.add(q.question);
    const r = await api('POST', `/mock-interviews/sessions/${sid}/answers`, A.t, { question_id: q.id, answer_text: `I would use ${(q.expected_concepts || []).join(', ')}.`, duration_seconds: 90 });
    if (n === 1) check('MI answer naming the reference concepts gets full keyword coverage', r.d.answer.evaluation.score === 100, r.d.answer.evaluation.score);
    q = r.d.next_question; done = r.d.is_completed; n++;
  }
  check('MI no question repeated within the interview', !repeated, `${asked.size} distinct questions`);
  check('MI interview completes', done === true);
  const rep = await api('GET', `/mock-interviews/sessions/${sid}/report`, A.t);
  check('MI report labelled as keyword check, not a hiring assessment', rep.s === 200 && rep.d.scoring_method === 'KEYWORD_MATCH' && /not a hiring assessment/i.test(rep.d.scoring_definition), rep.d.overall_score);
  check('MI report has no canned communication observations', Array.isArray(rep.d.communication_observations) && rep.d.communication_observations.length === 0);
  check('MI report duration comes from answer timings (no 30-min default)', rep.d.duration_minutes < 30, rep.d.duration_minutes);
  st.score = rep.d.overall_score;
  const legacy = await api('POST', '/placements/interviews', A.t, { interview_type: 'TECHNICAL' });
  check('Placement interview endpoint creates a session in the same history', legacy.s === 201, legacy.s);
  if (legacy.s === 201) {
    const lq = legacy.d.initial_question;
    await api('POST', `/placements/interviews/${legacy.d.session.id}/start`, A.t);
    const la = await api('POST', `/placements/interviews/${legacy.d.session.id}/answers`, A.t, { question_id: lq.id, answer_text: 'no idea' });
    check('Placement interview uses the same honest evaluator', la.s === 200 && la.d.answer.evaluation.method === 'KEYWORD_MATCH' && la.d.answer.evaluation.score === 0, la.d.answer?.evaluation?.score);
    check('Placement feedback before completion is 409', (await api('GET', `/placements/interviews/${legacy.d.session.id}/feedback`, A.t)).s === 409);
  }

  // Test 2 - Project: create -> tasks -> link GitHub URL -> save -> refresh -> retrieve.
  const p = await api('POST', '/projects', A.t, { title: 'Campus bus tracker', domain: 'IoT', project_type: 'MINI_PROJECT', repository_url: 'https://github.com/example/bus-tracker', start_date: '2026-11-01' });
  check('PRJ create with repository URL and start date', p.s === 201 && p.d.repository_url === 'https://github.com/example/bus-tracker' && p.d.description === '', p.s);
  st.pid = p.d.id;
  check('PRJ no invented description or target users', p.d.description === '' && p.d.target_users === '' && !(p.d.tags || []).includes(null));
  check('PRJ invalid repository URL is refused', (await api('PATCH', `/projects/${p.d.id}`, A.t, { repository_url: 'javascript:alert(1)' })).s === 400);
  check('PRJ title is required', (await api('POST', '/projects', A.t, {})).s === 400);
  const hijack = await api('PATCH', `/projects/${p.d.id}`, A.t, { student_id: B.id, progress_percentage: 99, status: 'IN_PROGRESS' });
  const after = await api('GET', `/projects/${p.d.id}`, A.t);
  check('PRJ PATCH ignores student_id and progress (mass assignment closed)', hijack.s === 200 && after.d.student_id !== B.id && after.d.progress_percentage === 0 && after.d.status === 'IN_PROGRESS', `owner=${after.d.student_id === A.id}`);
  check('PRJ student B cannot read the project', [403, 404].includes((await api('GET', `/projects/${p.d.id}`, B.t)).s));
  const mod = await api('POST', `/projects/${p.d.id}/modules`, A.t, { name: 'GPS ingest', description: 'Reads GPS', priority: 'HIGH' });
  const t1 = await api('POST', `/projects/${p.d.id}/tasks`, A.t, { module_id: mod.d.id, title: 'Parse NMEA sentences', description: 'd', priority: 'HIGH' });
  const t2 = await api('POST', `/projects/${p.d.id}/tasks`, A.t, { module_id: mod.d.id, title: 'Test parser edge cases', description: 'd', priority: 'MEDIUM' });
  check('PRJ add module and two tasks', mod.s === 201 && t1.s === 201 && t2.s === 201);
  await api('PATCH', `/projects/${p.d.id}/tasks/${t1.d.id}`, A.t, { status: 'DONE' });
  const prog = await api('GET', `/projects/${p.d.id}/progress`, A.t);
  check('PRJ progress computed from tasks', prog.d.tasks_total === 2 && prog.d.tasks_completed === 1, JSON.stringify(prog.d).slice(0, 80));
  const arch = await api('GET', `/projects/${p.d.id}/architecture`, A.t);
  check('PRJ empty architecture is not filled with a template', arch.s === 200 && arch.d.nodes.length === 0);
  for (const ai of ['generate-plan', 'generate-architecture', 'analyze-scope', 'analyze-risks', 'suggest-technologies', 'ask-ai'])
    check(`PRJ AI ${ai} without a model answers 503`, (await api('POST', `/projects/${p.d.id}/${ai}`, A.t, { question: 'next?' })).s === 503);
  check('PRJ AI ideas without a model answers 503', (await api('POST', '/projects/generate-ideas', A.t, { domain: 'web' })).s === 503);
  const docs0 = await api('POST', `/projects/${p.d.id}/documentation/generate`, A.t, { document_type: 'README' });
  const docs = await api('GET', `/projects/${p.d.id}/documentation`, A.t);
  check('PRJ doc generation 503 saves nothing', docs0.s === 503 && docs.d.length === 0, docs0.s);

  // Test 3 - GitHub: connect -> authorize -> profile -> repos -> sync -> disconnect.
  const conn = await api('GET', '/github/connect', A.t);
  check('GH OAuth start without an OAuth app answers 503 (no hard-coded client id)', conn.s === 503 && conn.j.code === 'OAUTH_NOT_CONFIGURED', conn.s);
  const fakeCb = await api('GET', '/github/callback?username=torvalds', A.t);
  check('GH callback with only a username no longer connects an account', fakeCb.s === 400 && fakeCb.j.code === 'OAUTH_STATE_INVALID', fakeCb.s);
  const st0 = await api('GET', '/github/status', A.t);
  check('GH status stays not connected', st0.s === 200 && st0.d.is_connected === false);
  const pat = await api('POST', '/github/connect-pat', A.t, { token: 'ghp_invalidtoken000000000000000000000000' });
  check('GH invalid or unreachable PAT connects nothing', pat.s >= 400 && (await api('GET', '/github/status', A.t)).d.is_connected === false, pat.s);
  check('GH sync without a connection is 404', (await api('POST', '/github/sync', A.t)).s === 404);
  const user = await api('POST', '/github/connect-username', A.t, { username: 'bad name!' });
  check('GH invalid username refused', user.s === 400, user.s);
  fs.mkdirSync(require('path').dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(st));
}

async function verify() {
  const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const { A, B } = st;
  const hist = await api('GET', '/mock-interviews/sessions', A.t);
  const mine = (hist.d || []).find((x) => x.id === st.sid);
  check('after restart: MI session in history as COMPLETED with the same score', mine && mine.status === 'COMPLETED' && mine.overall_score === st.score, mine && `${mine.status} ${mine.overall_score}`);
  const rep = await api('GET', `/mock-interviews/sessions/${st.sid}/report`, A.t);
  check('after restart: MI report retrievable', rep.s === 200 && rep.d.per_question_feedback.length >= 2);
  check('after restart: B still cannot read A\'s report', [403, 404].includes((await api('GET', `/mock-interviews/sessions/${st.sid}/report`, B.t)).s));
  const p = await api('GET', `/projects/${st.pid}`, A.t);
  check('after restart: project keeps repository URL and status', p.s === 200 && p.d.repository_url === 'https://github.com/example/bus-tracker' && p.d.status === 'IN_PROGRESS');
  const tasks = await api('GET', `/projects/${st.pid}/tasks`, A.t);
  check('after restart: project tasks kept with status', tasks.d.length === 2 && tasks.d.some((t) => t.status === 'DONE'));
}

(process.argv[2] === 'verify' ? verify() : create()).then(summary).catch((e) => { console.error(e); process.exitCode = 1; });
