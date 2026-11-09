// Phase 3 batch 3 HTTP probe: RAG (E2E test 6), Career (E2E test 7), Resume (E2E test 8).
// Usage: BASE=http://localhost:3400 node scripts/audit/phase3-batch3.cjs create|verify   (state in STATE, default /tmp/p3/batch3.json)
// No AI model is configured here, so every AI suggestion endpoint must answer 503 with nothing generated.
const fs = require('fs');
const { api, reg, check, summary } = require('./phase3-lib.cjs');
const STATE = process.env.STATE || '/tmp/p3/batch3.json';
const b64 = (t) => Buffer.from(t).toString('base64');

async function rag(A, B, st) {
  const docs = {
    paging: 'Paging divides memory into fixed-size frames. A page table maps page numbers to frame numbers. The TLB caches recent translations.',
    tcp: 'TCP provides reliable delivery with sequence numbers and acknowledgements. The three-way handshake uses SYN, SYN-ACK and ACK.',
  };
  st.rag = {};
  for (const [k, text] of Object.entries(docs)) {
    const up = await api('POST', '/documents', A.t, { originalName: `${k}-${Date.now()}.txt`, mimeType: 'text/plain', sizeBytes: text.length, contentBase64: b64(text), title: `P3 ${k}` });
    st.rag[k] = up.d.id;
  }
  // processing is asynchronous on upload; poll until both are READY
  for (let i = 0; i < 30; i++) {
    const s = await Promise.all(Object.values(st.rag).map((id) => api('GET', `/documents/${id}`, A.t)));
    if (s.every((r) => r.d.status === 'READY')) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const q1 = await api('POST', '/knowledge-base/ask', A.t, { question: 'What does the TLB cache?' });
  check('RAG question cites the matching document only', q1.d.citations.length > 0 && q1.d.citations.every((c) => c.document_id === st.rag.paging), q1.d.citations.map((c) => c.document_id).join(','));
  check('RAG confidence is labelled as retrieval similarity', q1.d.confidence_basis === 'RETRIEVAL_SIMILARITY' && typeof q1.d.confidence_score === 'number');
  const q2 = await api('POST', '/knowledge-base/ask', A.t, { question: 'Describe the TCP three-way handshake' });
  check('RAG second topic routes to the TCP document', q2.d.citations[0]?.document_id === st.rag.tcp);
  const q3 = await api('POST', '/knowledge-base/ask', A.t, { question: 'How do I bake sourdough bread?' });
  check('RAG out-of-scope question: NO_SOURCES, no citations', q3.d.answer_mode === 'NO_SOURCES' && q3.d.citations.length === 0, q3.d.answer_mode);
  const qb = await api('POST', '/knowledge-base/ask', B.t, { question: 'What does the TLB cache?' });
  check('RAG student B gets nothing from A\'s documents', !qb.d.citations.some((c) => Object.values(st.rag).includes(c.document_id)));
  const qs = await api('POST', '/knowledge-base/ask', A.t, { question: 'What does the TLB cache?', document_id: st.rag.tcp });
  check('RAG scoped to one document does not cite others', !qs.d.citations.some((c) => c.document_id === st.rag.paging), `${qs.s} ${qs.d.answer_mode}`);
}

async function career(A, B, st) {
  const empty = await api('GET', '/career/dashboard-summary', A.t);
  check('CR new student: no invented alignment, no target role', empty.s === 200 && empty.d.readiness.skills_aligned_percentage === null, JSON.stringify(empty.d.readiness?.skills_aligned_percentage));
  const roles = await api('GET', '/career/roles', A.t);
  check('CR role catalogue loads', roles.s === 200 && roles.d.length >= 10, roles.d.length);
  const be = roles.d.find((r) => r.slug === 'backend-developer');
  st.roleId = be.id; st.roleName = be.name;
  check('CR profile rejects bad values', (await api('PATCH', '/career/profile', A.t, { target_roles: 'not-a-list' })).s === 400);
  const pr = await api('PATCH', '/career/profile', A.t, { target_roles: [be.name], technical_skills: ['Python'], student_id: 'std_someone_else', is_admin: true });
  check('CR profile saves own fields and ignores others', pr.s === 200 && pr.d.target_roles[0] === be.name && pr.d.is_admin === undefined, pr.s);
  const rec = await api('GET', '/career/recommendations', A.t);
  check('CR recommendations answer', rec.s === 200, rec.s);
  const rm = await api('POST', '/career/roadmaps', A.t, { role_id: be.id });
  check('CR roadmap generated from the role learning path', rm.s === 201 && rm.d.steps.length > 0, `${rm.d.steps?.length} steps`);
  st.roadmap = rm.d.id;
  const step = rm.d.steps[0];
  const up = await api('PATCH', `/career/roadmaps/${rm.d.id}/steps/${step.id}`, A.t, { status: 'COMPLETED' });
  check('CR mark a roadmap step complete', up.s === 200, up.s);
  st.stepId = step.id;
  check('CR student B cannot read A\'s roadmap', [403, 404].includes((await api('GET', `/career/roadmaps/${rm.d.id}`, B.t)).s));
  check('CR roadmap without role_id is refused', (await api('POST', '/career/roadmaps', A.t, {})).s === 400);
}

async function resume(A, B, st) {
  const c = await api('POST', '/resumes', A.t, { title: 'P3 resume' });
  check('RS create resume with no invented target role', c.s === 201 && c.d.resume.target_role !== 'Software Engineer' && c.d.resume.summary === '', JSON.stringify(c.d.resume?.target_role));
  const rid = c.d.resume.id; st.rid = rid;
  check('RS student B cannot open A\'s resume', [403, 404].includes((await api('GET', `/resumes/${rid}`, B.t)).s));
  check('RS student B cannot ask AI on A\'s resume', [403, 404].includes((await api('POST', `/resumes/${rid}/ai/bullet`, B.t, { task: 'x' })).s));
  await api('PATCH', `/resumes/${rid}`, A.t, { target_role: st.roleName, summary: 'Third-year CSE student who builds backend services in Python.' });
  await api('PUT', `/resumes/${rid}/profile`, A.t, { full_name: 'P3 Student', email: A.email, phone: '', github_url: '' });
  await api('PUT', `/resumes/${rid}/skills`, A.t, { skills: [{ skill: 'Python', category: 'LANGUAGE', proficiency: 'INTERMEDIATE', source: 'MANUAL' }] });
  const proj = await api('POST', '/projects', A.t, { title: 'P3 attendance API', domain: 'Web', project_type: 'MINI_PROJECT', start_date: '2026-10-01' });
  const imp = await api('POST', `/resumes/${rid}/projects/import`, A.t, { project_id: proj.d.id });
  check('RS import the student\'s own project', imp.s === 201 || imp.s === 200, imp.s);
  const imp2 = await api('POST', `/resumes/${rid}/projects/import`, A.t, { project_id: proj.d.id });
  check('RS importing the same project twice does not duplicate it', imp2.d.id === imp.d.id);
  const bproj = await api('POST', '/projects', B.t, { title: 'B secret project', domain: 'Web', project_type: 'MINI_PROJECT' });
  check('RS cannot import another student\'s project', [403, 404].includes((await api('POST', `/resumes/${rid}/projects/import`, A.t, { project_id: bproj.d.id })).s));
  await api('PUT', `/resumes/${rid}/projects`, A.t, { projects: [{ ...imp.d, highlighted_features: ['responsible for the login endpoint'] }] });
  const an = await api('GET', `/resumes/${rid}/analyze`, A.t);
  const a = an.d;
  check('RS analysis compares against the target role skills', an.s === 200 && a.role_alignment.target_role === st.roleName && a.keyword_coverage.found_keywords.some((k) => /Python/.test(k)), a.keyword_coverage?.coverage_percentage);
  check('RS contact score counts the 2 of 4 fields given', /Contact fields 8\/15/.test(a.scoring_explanation), a.scoring_explanation);
  check('RS weak phrasing flagged without a rewritten claim', a.weak_bullet_phrasings.length === 1 && a.weak_bullet_phrasings[0].suggestion === '' && !JSON.stringify(a).includes('Engineered'));
  check('RS analysis is not labelled an ATS score', /not an ATS score/.test(a.disclaimer));
  const t = await api('POST', `/resumes/${rid}/tailor`, A.t, { job_description: 'Backend role using Python, Kafka and Kubernetes', job_title: 'Backend Intern', company: 'Example Co' });
  check('RS tailoring: gaps listed, no summary rewrite', t.s === 200 && t.d.suggested_wording.length === 0 && t.d.potential_skill_gaps.length > 0, t.s);
  check('RS tailoring without a job description is refused', (await api('POST', `/resumes/${rid}/tailor`, A.t, {})).s === 400);
  for (const [path, body] of [['summary', {}], ['bullet', { task: 'built an attendance API' }], ['improve', { current_text: 'Made an API', improvement_type: 'CONCISE' }]]) {
    const r = await api('POST', `/resumes/${rid}/ai/${path}`, A.t, body);
    check(`RS AI ${path} without an AI provider is 503 AI_UNAVAILABLE`, r.s === 503 && r.j.code === 'AI_UNAVAILABLE', `${r.s} ${r.j.code}`);
  }
  check('RS AI bullet without a task is refused', (await api('POST', `/resumes/${rid}/ai/bullet`, A.t, {})).s === 400);
  const v = await api('POST', `/resumes/${rid}/versions`, A.t, {});
  check('RS save a version', [200, 201].includes(v.s), v.s);
  st.score = a.calculated_score;
}

async function create() {
  const A = await reg('b3a');
  const B = await reg('b3b');
  const st = { A, B };
  await rag(A, B, st);
  await career(A, B, st);
  await resume(A, B, st);
  fs.writeFileSync(STATE, JSON.stringify(st));
  summary();
}

async function verify() {
  const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const { A } = st;
  const q = await api('POST', '/knowledge-base/ask', A.t, { question: 'What does the TLB cache?' });
  check('RAG after restart: still cites the paging document', q.d.citations.some((c) => c.document_id === st.rag.paging));
  const prof = await api('GET', '/career/profile', A.t);
  check('CR after restart: target role kept', prof.d.target_roles?.[0] === st.roleName);
  const rm = await api('GET', `/career/roadmaps/${st.roadmap}`, A.t);
  check('CR after restart: roadmap and completed step kept', rm.s === 200 && rm.d.steps.find((s) => s.id === st.stepId)?.status === 'COMPLETED', rm.s);
  const sum = await api('GET', '/career/dashboard-summary', A.t);
  check('CR after restart: dashboard alignment now measured', typeof sum.d.readiness.skills_aligned_percentage === 'number', sum.d.readiness.skills_aligned_percentage);
  const r = await api('GET', `/resumes/${st.rid}`, A.t);
  check('RS after restart: resume, project and skills kept', r.s === 200 && r.d.projects.length === 1 && r.d.skills.length === 1, r.s);
  const an = await api('GET', `/resumes/${st.rid}/analyze`, A.t);
  check('RS after restart: same analysis score (deterministic)', an.d.calculated_score === st.score, `${an.d.calculated_score} vs ${st.score}`);
  const vs = await api('GET', `/resumes/${st.rid}/versions`, A.t);
  check('RS after restart: version kept', (vs.d || []).length >= 1);
  summary();
}

(process.argv[2] === 'verify' ? verify : create)().catch((e) => { console.error(e); process.exitCode = 1; });
