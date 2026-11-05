// Phase 2 batch 5 HTTP probe: journeys J5-J10 and cross-cutting security checks.
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

  // J5 System Design: interview practice in order, checklist score, private session, AI tutor honest.
  const iv = await api('POST', '/system-design/interviews', A.t, { challenge_id: 'sd_url_shortener' });
  check('J5 start interview', iv.s === 201, iv.s);
  const steps = ['REQUIREMENTS_CLARIFICATION', 'SCALE_ESTIMATION', 'API_DESIGN', 'DATA_MODEL', 'HIGH_LEVEL_DESIGN', 'DETAILED_DESIGN', 'BOTTLENECK_ANALYSIS', 'RELIABILITY_SECURITY', 'TRADEOFFS_REVIEW', 'FINAL_SUMMARY'];
  let last;
  for (const s of steps) last = await api('POST', `/system-design/interviews/${iv.d.id}/responses`, A.t, { step: s, notes: `For ${s}: users can shorten links; 1,200 RPS at peak; 2 TB storage; POST /api/urls; a load balancer, service and cache; replica failover with TLS; trade-off of consistency versus latency because cost matters. In summary, next we would monitor it.` });
  check('J5 interview completed with checklist score (no hire verdict)', last.d.status === 'COMPLETED' && typeof last.d.overall_score === 'number' && !/HIRE/.test(last.d.debrief_feedback?.overall_verdict || ''), `score=${last.d.overall_score}`);
  check('J5 student B cannot read the session', (await api('GET', `/system-design/interviews/${iv.d.id}`, B.t)).s === 404);
  const tutor = await api('POST', '/system-design/ai-tutor', A.t, { prompt: 'Explain sharding', mode: 'CONCEPT' });
  check('J5 AI tutor without a model answers 503 (no canned text)', tutor.s === 503, tutor.s);
  st.interview = iv.d.id;

  // J6 Lab Assistant + Viva: lab, experiment, code run (sandbox), viva keyword check, report from real data.
  const lab = await api('POST', '/labs', A.t, { name: 'OS Lab', subject: 'Operating Systems', semester: 5 });
  const exp = await api('POST', `/labs/${lab.d.id}/experiments`, A.t, { title: 'FCFS', aim: 'Simulate FCFS', expected_output: 'avg 17', code_language: 'python', viva_questions: [{ id: 'vq1', question: 'What is the convoy effect?', expected_concept: 'Short processes wait behind a long CPU-bound process.' }] });
  check('J6 create lab and experiment', lab.s === 201 && exp.s === 201);
  const run = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/code/run`, A.t, { code: 'print(sum([0,24,27])/3)', language: 'python' });
  check('J6 run code in the sandbox', run.s === 200 && /17/.test(run.d.stdout || ''), (run.d.stdout || run.j.message || '').trim());
  const viva = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/viva/vq1/evaluate`, A.t, { student_answer: 'Short processes wait behind a long process.' });
  check('J6 viva feedback is a labelled keyword check', viva.d.ai_evaluation?.method === 'KEYWORD_MATCH', viva.d.ai_evaluation?.score);
  const rep = await api('POST', `/labs/${lab.d.id}/experiments/${exp.d.id}/report`, A.t, {});
  check('J6 report uses the real program output', rep.s === 200 && /17/.test(rep.d.actual_output) && rep.d.expected_output === 'avg 17', JSON.stringify(rep.d.actual_output));
  check('J6 student B cannot open the lab', (await api('GET', `/labs/${lab.d.id}`, B.t)).s === 404);
  st.lab = lab.d.id; st.exp = exp.d.id;

  // J7 Quiz: create, attempt, answers hidden until submit, server score, review, notification.
  const quiz = await api('POST', '/quiz', A.t, { title: 'Networks', source_type: 'TOPIC', questions: [
    { question_text: '2+2?', question_type: 'MCQ', options: ['3', '4', '5', '6'], correct_answer: '4' },
    { question_text: 'TCP is connection-oriented', question_type: 'TRUE_FALSE', options: ['True', 'False'], correct_answer: 'True' }] });
  const start = await api('POST', `/quiz/${quiz.d.id}/start`, A.t, {});
  const qs = (await api('GET', `/quiz/${quiz.d.id}/questions`, A.t)).d;
  check('J7 questions delivered without answers', !JSON.stringify(qs).includes('correct_answer'));
  check('J7 review refused before submit', (await api('GET', `/quiz/attempts/${start.d.attempt.id}/review`, A.t)).s === 400);
  const sub = await api('POST', `/quiz/attempts/${start.d.attempt.id}/submit`, A.t, { answers: { [qs[0].id]: '4', [qs[1].id]: 'False' }, score: 100 });
  check('J7 server-side score ignores client score', sub.d.correct_count === 1 && sub.d.percentage === 50, `${sub.d.correct_count}/2 = ${sub.d.percentage}%`);
  await new Promise((r) => setTimeout(r, 300));
  const notes = await api('GET', '/notifications', A.t);
  const qn = (notes.d.items || notes.d || []).find?.((n) => /Quiz Result/.test(n.title));
  check('J7 notification states correct answers and links to the quiz', qn && /answered 1 of 2 correctly \(50%\)/.test(qn.message) && qn.link === `/quiz/${quiz.d.id}/result`, qn ? `${qn.message} | ${qn.link}` : `notifications status ${notes.s}`);
  st.quiz = quiz.d.id; st.attempt = start.d.attempt.id;

  // J8 Exam Preparation: create with real date and syllabus, update confidence, readiness follows.
  const date = new Date(Date.now() + 20 * 86400000).toISOString().slice(0, 10);
  const ex = await api('POST', '/exams', A.t, { title: 'OS End Sem', subject: 'Operating Systems', exam_date: date, available_prep_hours: 20, syllabus: 'Scheduling, Deadlocks, Paging, File Systems' });
  check('J8 create exam (0% readiness, all topics WEAK)', ex.s === 201 && ex.d.readiness_score === 0, ex.d.readiness_score);
  const up = await api('PATCH', `/exams/${ex.d.id}/topics/${ex.d.topics[0].id}`, A.t, { confidence: 'STRONG' });
  check('J8 readiness follows confidence', up.d.readiness_score === 25, up.d.readiness_score);
  st.exam = ex.d.id;

  // J9 GATE: practice question, mock test with raw marks, dashboard from real attempts.
  const qlist = (await api('GET', '/gate/questions?paper_code=CS', A.t)).d;
  check('J9 question bank hides answer keys', !JSON.stringify(qlist).includes('correct_answer'));
  const mcq = qlist.find((q) => q.question_type === 'MCQ');
  const att = await api('POST', `/gate/questions/${mcq.id}/attempt`, A.t, { selected_answer: mcq.options[0].id });
  check('J9 practice attempt scored with key revealed after answering', att.s === 200 && att.d.correct_answer !== undefined, `correct=${att.d.is_correct}`);
  const ms = await api('POST', '/gate/tests/gate_test_cs_os_speed/start', A.t, {});
  const res = await api('POST', `/gate/sessions/${ms.d.id}/submit`, A.t, {});
  check('J9 mock test gives raw marks, no estimated GATE score', res.s === 200 && res.d.estimated_gate_score === undefined, `marks=${res.d.total_marks_obtained}`);
  const dash = (await api('GET', '/gate/dashboard', A.t)).d;
  check('J9 dashboard counts the real practice attempt', dash.metrics.total_questions_practiced >= 1 && dash.metrics.estimated_gate_score === undefined, dash.metrics.total_questions_practiced);

  // J10 Integration: one student's activity shows up across modules and nowhere for student B.
  const sol = 'import sys\nd=sys.stdin.read().split("\\n")\nnums=list(map(int,d[0].split()))\nt=int(d[1])\nseen={}\nfor i,x in enumerate(nums):\n  if t-x in seen:\n    print(seen[t-x],i);break\n  seen[x]=i';
  const dsa = await api('POST', '/dsa/problems/dsa_top150_001/submit', A.t, { language: 'python', source_code: sol });
  check('J10 DSA accepted', dsa.d.status === 'ACCEPTED', dsa.d.status);
  await new Promise((r) => setTimeout(r, 300));
  const n2 = await api('GET', '/notifications', A.t);
  const dn = (n2.d.items || n2.d || []).find?.((n) => /DSA Problem Solved/.test(n.title));
  check('J10 DSA notification has no invented points and a working link', dn && !/points/.test(dn.message) && dn.link === '/dsa/problem/dsa_top150_001', dn ? `${dn.message} | ${dn.link}` : 'missing');
  const labs = (await api('GET', '/labs', A.t)).d;
  check('J10 dashboard lab widget data: experiments embedded with counts', labs[0]?.experiments?.length === 1 && labs[0].experiments_count === 1);
  const nB = await api('GET', '/notifications', B.t);
  check('J10 student B sees none of A\'s notifications', !JSON.stringify(nB.d).includes('Quiz Result') && !JSON.stringify(nB.d).includes('DSA Problem Solved'));

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
  const iv = await api('GET', `/system-design/interviews/${st.interview}`, A.t);
  check('J5 interview and score survive restart', iv.s === 200 && iv.d.status === 'COMPLETED');
  const exp = await api('GET', `/labs/${st.lab}/experiments/${st.exp}`, A.t);
  check('J6 experiment output and viva answer survive restart', exp.s === 200 && /17/.test(exp.d.actual_output || '') && !!exp.d.viva_questions[0].student_answer);
  const rv = await api('GET', `/quiz/attempts/${st.attempt}/review`, A.t);
  check('J7 quiz review survives restart', rv.s === 200 && rv.d.correct_count === 1);
  const ex = await api('GET', `/exams/${st.exam}`, A.t);
  check('J8 exam readiness survives restart', ex.s === 200 && ex.d.readiness_score === 25);
  const dash = (await api('GET', '/gate/dashboard', A.t)).d;
  check('J9 GATE attempts survive restart', dash.metrics.total_questions_practiced >= 1);
  const prog = (await api('GET', '/dsa/progress', A.t)).d;
  check('J10 DSA solved status survives restart', (prog.problems_solved || []).includes('dsa_top150_001'));
  check('J10 student B still isolated after restart', (await api('GET', '/labs', B.t)).d.length === 0 && (await api('GET', '/exams', B.t)).d.length === 1);
}

(async () => {
  const mode = process.argv[2] || 'create';
  await (mode === 'verify' ? verify() : create());
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} PASS`);
  process.exit(failed ? 1 : 0);
})();
