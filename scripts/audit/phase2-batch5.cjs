// Phase 2 batch 5 HTTP probe: journeys J5-J10, cross-module integration and cross-cutting security checks.
// J1-J3 are in phase2-batch1.cjs, J4 in phase2-batch2.cjs.
// Usage: BASE=http://localhost:3300 node scripts/audit/phase2-batch5.cjs create|verify   (state in /tmp/p2/batch5.json)
// Synthetic students only. No AI model is assumed; AI endpoints are expected to answer 503.
const fs = require('fs');
const BASE = (process.env.BASE || 'http://localhost:3300') + '/api/v1';
const STATE = process.env.STATE || '/tmp/p2/batch5.json';
const api = async (m, p, t, b) => {
  const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b !== undefined ? (typeof b === 'string' ? b : JSON.stringify(b)) : undefined });
  let j; try { j = await r.json(); } catch { j = {}; }
  return { s: r.status, j, d: j.data ?? j };
};
const reg = async (k) => { const e = `p2j${k}.${Date.now()}${Math.floor(Math.random() * 1e4)}@example.test`; const r = await api('POST', '/auth/register', null, { email: e, password: 'TestPass123', name: 'P2 ' + k }); const t = r.j.data.token; await api('POST', '/students/me/onboarding/complete', t, {}); return { email: e, t, id: r.j.data.user?.id || r.j.data.student?.id }; };
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? '  -- ' + detail : ''}`); };

async function create() {
  const A = await reg('A'); const B = await reg('B');
  const st = { A, B };

  // J5 System Design: open challenge -> build architecture -> save -> reload -> continue; interview practice; AI honest.
  const proj = await api('POST', '/system-design/challenges/sd_chal_01/start', A.t, {});
  check('J5 open challenge creates a project', proj.s === 201 && proj.d.challenge_id === 'sd_chal_01' && proj.d.components.length > 0, proj.s);
  const comps = [
    { id: 'c1', name: 'API Gateway', category: 'NETWORKING', type: 'API_GATEWAY', tech: 'nginx', x: 100, y: 100 },
    { id: 'c2', name: 'URL Service', category: 'COMPUTE', type: 'APP_SERVER', tech: 'node', x: 300, y: 100 },
  ];
  const saved = await api('PATCH', `/system-design/projects/${proj.d.id}`, A.t, { components: comps, connections: [{ id: 'e1', source_id: 'c1', target_id: 'c2', label: 'HTTP' }] });
  check('J5 save architecture', saved.s === 200 && saved.d.components.length === 2, saved.s);
  const reload = await api('GET', `/system-design/projects/${proj.d.id}`, A.t);
  check('J5 reload returns the saved diagram', reload.s === 200 && reload.d.components.length === 2 && reload.d.connections.length === 1);
  const cont = await api('PATCH', `/system-design/projects/${proj.d.id}`, A.t, { components: [...reload.d.components, { id: 'c3', name: 'Cache', category: 'STORAGE', type: 'CACHE', tech: 'redis', x: 500, y: 100 }] });
  check('J5 continue editing after reload', cont.s === 200 && cont.d.components.length === 3);
  check('J5 student B cannot open the project', (await api('GET', `/system-design/projects/${proj.d.id}`, B.t)).s === 404);
  st.project = proj.d.id;
  const iv = await api('POST', '/system-design/interviews', A.t, { challenge_id: 'sd_url_shortener' });
  check('J5 start interview', iv.s === 201, iv.s);
  const steps = ['REQUIREMENTS_CLARIFICATION', 'SCALE_ESTIMATION', 'API_DESIGN', 'DATA_MODEL', 'HIGH_LEVEL_DESIGN', 'DETAILED_DESIGN', 'BOTTLENECK_ANALYSIS', 'RELIABILITY_SECURITY', 'TRADEOFFS_REVIEW', 'FINAL_SUMMARY'];
  let last;
  for (const s of steps) last = await api('POST', `/system-design/interviews/${iv.d.id}/responses`, A.t, { step: s, notes: `For ${s}: users can shorten links; 1,200 RPS at peak; 2 TB storage; POST /api/urls; a load balancer, service and cache; replica failover with TLS; trade-off of consistency versus latency because cost matters. In summary, next we would monitor it.` });
  check('J5 interview completed with checklist score (no hire verdict)', last.d.status === 'COMPLETED' && typeof last.d.overall_score === 'number' && !/HIRE/.test(last.d.debrief_feedback?.overall_verdict || ''), `score=${last.d.overall_score}`);
  check('J5 student B cannot read the interview', (await api('GET', `/system-design/interviews/${iv.d.id}`, B.t)).s === 404);
  const tutor = await api('POST', '/system-design/ai-tutor', A.t, { prompt: 'Explain sharding', mode: 'CONCEPT' });
  check('J5 AI tutor without a model answers 503 (no canned text)', tutor.s === 503, tutor.s);
  st.interview = iv.d.id;

  // J6 Lab Assistant + Viva: lab, experiment, code run (sandbox), viva keyword check, report from real data.
  const lab = await api('POST', '/labs', A.t, { name: 'OS Lab', subject: 'Operating Systems', semester: 5 });
  const exp = await api('POST', `/labs/${lab.d.id}/experiments`, A.t, { title: 'FCFS', aim: 'Simulate FCFS', expected_output: 'avg 17', code_language: 'python', viva_questions: [{ id: 'vq1', question: 'What is the convoy effect?', expected_concept: 'Short processes wait behind a long CPU-bound process.' }] });
  check('J6 create lab and experiment', lab.s === 201 && exp.s === 201);
  const run = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/code/run`, A.t, { code: 'print(sum([0,24,27])/3)', language: 'python' });
  check('J6 run code in the sandbox', run.s === 200 && /17/.test(run.d.stdout || ''), (run.d.stdout || run.j.message || '').trim());
  const obs = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/observations`, A.t, { observation_table: { headers: ['Process', 'Burst', 'Waiting'], rows: [['P1', '24', '0'], ['P2', '3', '24'], ['P3', '3', '27']], notes: 'P2 and P3 waited behind P1' } });
  check('J6 enter observations', obs.s === 200 && obs.d.observation_table?.rows?.length === 3, obs.s);
  const rep = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/report`, A.t, {});
  check('J6 report uses the real program output and observations', rep.s === 200 && /17/.test(rep.d.actual_output) && rep.d.expected_output === 'avg 17' && rep.d.observation_table?.rows?.length === 3, JSON.stringify(rep.d.actual_output));
  const reopen = await api('GET', `/labs/${lab.d.id}/experiments/${exp.d.id}/report`, A.t);
  check('J6 reopen the saved report', reopen.s === 200 && reopen.d.id === rep.d.id, reopen.s);
  check('J6 student B cannot open the lab', (await api('GET', `/labs/${lab.d.id}`, B.t)).s === 404);
  st.lab = lab.d.id; st.exp = exp.d.id; st.report = rep.d.id;

  // J7 Viva: select topic (experiment) -> answer -> submit -> feedback -> history.
  const viva = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/viva/vq1/evaluate`, A.t, { student_answer: 'Short processes wait behind a long process.' });
  check('J7 viva feedback is a labelled keyword check (no model configured)', viva.s === 200 && viva.d.ai_evaluation?.method === 'KEYWORD_MATCH', viva.d.ai_evaluation?.score);
  const gen = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/viva/generate`, A.t, {});
  check('J7 AI viva question generation without a model answers 503', gen.s === 503, gen.s);
  const hist = await api('GET', `/labs/${lab.d.id}/experiments/${exp.d.id}`, A.t);
  check('J7 viva history: answer and feedback stored on the experiment', hist.d.viva_questions?.[0]?.student_answer && hist.d.viva_questions[0].ai_evaluation?.method === 'KEYWORD_MATCH');

  // J8 Quiz: create, attempt, answers hidden until submit, server score, review, notification.
  const quiz = await api('POST', '/quiz', A.t, { title: 'Networks', source_type: 'TOPIC', questions: [
    { question_text: '2+2?', question_type: 'MCQ', options: ['3', '4', '5', '6'], correct_answer: '4' },
    { question_text: 'TCP is connection-oriented', question_type: 'TRUE_FALSE', options: ['True', 'False'], correct_answer: 'True' }] });
  const start = await api('POST', `/quiz/${quiz.d.id}/start`, A.t, {});
  const qs = (await api('GET', `/quiz/${quiz.d.id}/questions`, A.t)).d;
  check('J8 questions delivered without answers', !JSON.stringify(qs).includes('correct_answer'));
  check('J8 review refused before submit', (await api('GET', `/quiz/attempts/${start.d.attempt.id}/review`, A.t)).s === 400);
  const sub = await api('POST', `/quiz/attempts/${start.d.attempt.id}/submit`, A.t, { answers: { [qs[0].id]: '4', [qs[1].id]: 'False' }, score: 100 });
  check('J8 server-side score ignores client score', sub.d.correct_count === 1 && sub.d.percentage === 50, `${sub.d.correct_count}/2 = ${sub.d.percentage}%`);
  await new Promise((r) => setTimeout(r, 300));
  const notes = await api('GET', '/notifications', A.t);
  const qn = (notes.d.items || notes.d || []).find?.((n) => /Quiz Result/.test(n.title));
  check('J8 notification states correct answers and links to the quiz', qn && /answered 1 of 2 correctly \(50%\)/.test(qn.message) && qn.link === `/quiz/${quiz.d.id}/result`, qn ? `${qn.message} | ${qn.link}` : `notifications status ${notes.s}`);
  st.quiz = quiz.d.id; st.attempt = start.d.attempt.id;

  // J9 Exam Preparation: select exam -> review topics -> generate tasks -> sync with Study Planner.
  const date = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);
  const ex = await api('POST', '/exams', A.t, { title: 'OS End Sem', subject: 'Operating Systems', exam_date: date, available_prep_hours: 20, syllabus: 'Scheduling, Deadlocks, Paging, File Systems' });
  check('J9 create exam (0% readiness, all topics WEAK)', ex.s === 201 && ex.d.readiness_score === 0, ex.d.readiness_score);
  const up = await api('PATCH', `/exams/${ex.d.id}/topics/${ex.d.topics[0].id}`, A.t, { confidence: 'STRONG' });
  check('J9 readiness follows confidence', up.d.readiness_score === 25, up.d.readiness_score);
  const tasks = ex.d.topics.slice(0, 3).map((t, i) => ({ title: `Revise ${t.name}`, subject: 'Operating Systems', topic: t.name, date: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10), duration_minutes: 60, priority: 'HIGH' }));
  const plan = await api('POST', '/study-planner/plans', A.t, { title: 'Revision: OS End Sem', type: 'EXAM', target_date: date, total_hours_target: 3, tasks });
  check('J9 sync revision tasks to the Study Planner', plan.s === 201 && plan.d.tasks.length === 3 && plan.d.tasks[0].status === 'PENDING', plan.s);
  const plans = (await api('GET', '/study-planner/plans', A.t)).d;
  check('J9 planner lists the synced plan', plans.some((p) => p.id === plan.d.id));
  st.exam = ex.d.id; st.plan = plan.d.id;

  // J10 GATE: select paper -> select topic -> attempt -> submit -> evaluation -> progress.
  const prof = await api('POST', '/gate/profile', A.t, { paper_code: 'CS' });
  check('J10 select paper (profile saved, no invented goals)', prof.s === 200 && prof.d.paper_code === 'CS' && !prof.d.air_goal, prof.s);
  const topicQs = await api('GET', '/gate/questions?paper_code=CS&topic_id=cs_top_31', A.t);
  check('J10 select topic filters the question bank', topicQs.s === 200 && topicQs.d.length >= 1 && topicQs.d.every((q) => q.topic_id === 'cs_top_31'), topicQs.d.length);
  const qlist = (await api('GET', '/gate/questions?paper_code=CS', A.t)).d;
  check('J10 question bank hides answer keys', !JSON.stringify(qlist).includes('correct_answer'));
  const mcq = qlist.find((q) => q.question_type === 'MCQ');
  const att = await api('POST', `/gate/questions/${mcq.id}/attempt`, A.t, { selected_answer: mcq.options[0].id });
  check('J10 practice attempt scored with key revealed after answering', att.s === 200 && att.d.correct_answer !== undefined, `correct=${att.d.is_correct}`);
  const ms = await api('POST', '/gate/tests/gate_test_cs_os_speed/start', A.t, {});
  const res = await api('POST', `/gate/sessions/${ms.d.id}/submit`, A.t, {});
  check('J10 mock test gives raw marks, no estimated GATE score', res.s === 200 && res.d.estimated_gate_score === undefined, `marks=${res.d.total_marks_obtained}`);
  const dash = (await api('GET', '/gate/dashboard', A.t)).d;
  check('J10 dashboard counts the real practice attempt', dash.metrics.total_questions_practiced >= 1 && dash.metrics.estimated_gate_score === undefined, dash.metrics.total_questions_practiced);

  // INT Integration: one student's activity shows up across modules and nowhere for student B.
  const sol = 'import sys\nd=sys.stdin.read().split("\\n")\nnums=list(map(int,d[0].split()))\nt=int(d[1])\nseen={}\nfor i,x in enumerate(nums):\n  if t-x in seen:\n    print(seen[t-x],i);break\n  seen[x]=i';
  const dsa = await api('POST', '/dsa/problems/dsa_top150_001/submit', A.t, { language: 'python', source_code: sol });
  check('INT DSA accepted', dsa.d.status === 'ACCEPTED', dsa.d.status);
  await new Promise((r) => setTimeout(r, 300));
  const n2 = await api('GET', '/notifications', A.t);
  const dn = (n2.d.items || n2.d || []).find?.((n) => /DSA Problem Solved/.test(n.title));
  check('INT DSA notification has no invented points and a working link', dn && !/points/.test(dn.message) && dn.link === '/dsa/problem/dsa_top150_001', dn ? `${dn.message} | ${dn.link}` : 'missing');
  const labs = (await api('GET', '/labs', A.t)).d;
  check('INT dashboard lab widget data: experiments embedded with counts', labs[0]?.experiments?.length === 1 && labs[0].experiments_count === 1);
  const nB = await api('GET', '/notifications', B.t);
  check('INT student B sees none of A\'s notifications', !JSON.stringify(nB.d).includes('Quiz Result') && !JSON.stringify(nB.d).includes('DSA Problem Solved'));

  // Security (cross-cutting).
  const unauth = ['/coding/sessions', '/dsa/progress', '/sql-lab/workspaces', '/ml-lab/experiments', '/system-design/projects', '/labs', '/quiz/attempts', '/exams', '/gate/dashboard'];
  const codes = await Promise.all(unauth.map((p) => api('GET', p).then((r) => r.s)));
  check('SEC every page API needs sign-in (401 without a token)', codes.every((c) => c === 401), codes.join(','));
  const forged = await api('GET', '/labs', 'eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOiJzdGRfZGVtb18xIn0.');
  check('SEC forged unsigned token rejected', forged.s === 401, forged.s);
  const spoof = await api('POST', '/exams', B.t, { title: 'x', subject: 'y', exam_date: date, syllabus: 'a', student_id: A.id });
  check('SEC student_id in the body is ignored', spoof.s === 201 && spoof.d.student_id !== A.id && (await api('GET', '/exams', A.t)).d.length === 1);
  const attach = await api('POST', '/sql-lab/execute', A.t, { db_name: 'university_db', query: "ATTACH DATABASE '/etc/passwd' AS x" });
  check('SEC SQL Lab blocks ATTACH', attach.d.success === false && /disabled/.test(attach.d.error || ''), attach.d.error);
  const big = await api('POST', '/labs/' + st.lab + '/upload', A.t, { file_data: 'A'.repeat(15 * 1024 * 1024), filename: 'm.pdf' });
  check('SEC lab manual over 10 MB refused', big.s === 400, big.j.message);
  const exe = await api('POST', '/labs/' + st.lab + '/upload', A.t, { file_data: 'aGVsbG8=', filename: '../../evil.exe' });
  check('SEC lab manual with unsupported type refused', exe.s === 400, exe.j.message);
  const huge = await api('POST', '/exams', A.t, '{"title":"' + 'x'.repeat(26 * 1024 * 1024) + '"}');
  check('SEC request body over 25 MB refused', huge.s === 413 || huge.s === 400, huge.s);
  const traversal = await api('GET', '/labs/..%2F..%2Fetc%2Fpasswd', A.t);
  check('SEC path-like ids are just unknown ids', traversal.s === 404, traversal.s);

  fs.mkdirSync('/tmp/p2', { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(st));
}

async function verify() {
  const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const { A, B } = st;
  const pj = await api('GET', `/system-design/projects/${st.project}`, A.t);
  check('J5 system design project survives restart (3 components)', pj.s === 200 && pj.d.components.length === 3);
  const iv = await api('GET', `/system-design/interviews/${st.interview}`, A.t);
  check('J5 interview and score survive restart', iv.s === 200 && iv.d.status === 'COMPLETED');
  const exp = await api('GET', `/labs/${st.lab}/experiments/${st.exp}`, A.t);
  check('J6 experiment output and observations survive restart', exp.s === 200 && /17/.test(exp.d.actual_output || '') && exp.d.observation_table?.rows?.length === 3);
  const rp = await api('GET', `/labs/${st.lab}/experiments/${st.exp}/report`, A.t);
  check('J6 report reopens after restart', rp.s === 200 && rp.d.id === st.report);
  check('J7 viva history survives restart', !!exp.d.viva_questions[0].student_answer && exp.d.viva_questions[0].ai_evaluation?.method === 'KEYWORD_MATCH');
  const rv = await api('GET', `/quiz/attempts/${st.attempt}/review`, A.t);
  check('J8 quiz review survives restart', rv.s === 200 && rv.d.correct_count === 1);
  const ex = await api('GET', `/exams/${st.exam}`, A.t);
  check('J9 exam readiness survives restart', ex.s === 200 && ex.d.readiness_score === 25);
  const plans = (await api('GET', '/study-planner/plans', A.t)).d;
  check('J9 synced study plan survives restart', plans.some((p) => p.id === st.plan && p.tasks.length === 3));
  const dash = (await api('GET', '/gate/dashboard', A.t)).d;
  check('J10 GATE attempts survive restart', dash.metrics.total_questions_practiced >= 1);
  const prog = (await api('GET', '/dsa/progress', A.t)).d;
  check('INT DSA solved status survives restart', (prog.problems_solved || []).includes('dsa_top150_001'));
  check('INT student B still isolated after restart', (await api('GET', '/labs', B.t)).d.length === 0 && (await api('GET', '/exams', B.t)).d.length === 1);
}

(async () => {
  const mode = process.argv[2] || 'create';
  await (mode === 'verify' ? verify() : create());
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} PASS`);
  process.exit(failed ? 1 : 0);
})();
