// Phase 6 Stage 1: internal testing with two synthetic accounts (A and B).
// Walks the ten pilot workflows through the HTTP API of a running local server, records every
// call's status and duration, and prints a JSON report. Synthetic data only: emails end in
// @example.test. This is NOT pilot evidence from real students.
//
//   BASE=http://localhost:3611 node scripts/pilot/phase6-synthetic-journeys.cjs > out.json
const { call, uniq, summary } = require('./lib.cjs');

const results = [];
function record(workflow, step, ok, detail) {
  results.push({ workflow, step, result: ok === null ? 'BLOCKED' : ok ? 'PASS' : 'FAIL', detail: detail || '' });
}
const short = (b) => (typeof b === 'string' ? b : JSON.stringify(b) ?? '').slice(0, 220);

const STEPS = (label, semester) => ({
  1: { full_name: `Pilot Synthetic ${label}`, accept_terms: true, accept_privacy: true },
  2: { college: 'Synthetic Institute of Technology', degree: 'B.Tech', branch: 'Computer Science and Engineering', academic_year: Math.ceil(semester / 2), current_semester: semester, expected_graduation_year: new Date().getFullYear() + 2, subjects: ['Operating Systems', 'Database Management Systems'] },
  3: { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }] },
  4: { projects: [{ title: `Library Tracker ${label}`, description: 'Synthetic CRUD project', technologies: ['Python'] }] },
  5: { target_roles: ['Backend Developer'] },
  6: { preferred_languages: ['English'], explanation_style: 'STANDARD', weekly_study_hours: 10 },
});

async function register(label, semester) {
  const W = 'WF1 Registration';
  const email = `p6.${label.toLowerCase()}.${uniq()}@example.test`;
  const body = { email, password: 'Phase6Pass1', confirm_password: 'Phase6Pass1', name: `Pilot Synthetic ${label}`, accept_terms: true, accept_privacy: true };
  // A double submit (double click / retry after a dropped response) must create one account.
  const [r1, r2] = await Promise.all([call('POST', '/auth/register', null, body, 'POST /auth/register'), call('POST', '/auth/register', null, body, 'POST /auth/register')]);
  const codes = [r1.status, r2.status].sort();
  record(W, `${label}: duplicate submit creates one account`, codes[0] === 201 && codes[1] === 409, `statuses ${codes.join('/')}`);
  const ok = r1.status === 201 ? r1 : r2;
  const token = ok.body?.data?.token;
  const id = ok.body?.data?.student?.id;
  const steps = STEPS(label, semester);
  // Interrupted onboarding: save steps 1-2, then "come back" and read the resume point.
  for (const s of [1, 2]) await call('PUT', `/profile/me/onboarding/steps/${s}`, token, { data: steps[s] }, 'PUT /profile/me/onboarding/steps/:n');
  const resume = await call('GET', '/profile/me/onboarding', token);
  record(W, `${label}: onboarding resumes after interruption`, resume.body?.data?.onboarding?.current_step === 3, `current_step ${resume.body?.data?.onboarding?.current_step}`);
  for (const s of [3, 4, 4, 5, 6]) await call('PUT', `/profile/me/onboarding/steps/${s}`, token, { data: steps[s] }, 'PUT /profile/me/onboarding/steps/:n');
  const c1 = await call('POST', '/profile/me/onboarding/complete', token, {});
  const c2 = await call('POST', '/profile/me/onboarding/complete', token, {});
  record(W, `${label}: onboarding completes (retry safe)`, c1.status === 200 && c2.status === 200, `${c1.status}/${c2.status}`);
  const me = await call('GET', '/profile/me', token);
  record(W, `${label}: retried project step does not duplicate`, me.body?.data?.profile?.experience?.projects?.length === 1, `projects ${me.body?.data?.profile?.experience?.projects?.length}`);
  await call('POST', '/auth/logout', token, {});
  const li = await call('POST', '/auth/login', null, { email, password: 'Phase6Pass1' });
  record(W, `${label}: logout and login again`, li.status === 200, `${li.status}`);
  const bad = await call('POST', '/auth/login', null, { email, password: 'WrongPass9' }, 'POST /auth/login (wrong password)');
  record(W, `${label}: wrong password refused with a clear message`, bad.status === 401, `${bad.status} ${short(bad.body?.error?.message || bad.body)}`);
  return { label, email, id, token: li.body?.data?.token || token };
}

(async () => {
  const A = await register('A', 5);
  const B = await register('B', 3);

  // ---- Profile propagation ----
  {
    const W = 'Profile propagation';
    const noteBefore = await call('POST', '/notes', A.token, { title: 'Semester 5 OS notes', content: 'Paging, segmentation and TLBs.', tags: ['os'] });
    const sem = await call('PATCH', '/profile/me/academic', A.token, { current_semester: 6, academic_year: 3 });
    record(W, 'semester change saves', sem.status === 200, `${sem.status} ${sem.status !== 200 ? short(sem.body) : ''}`);
    const prof = await call('GET', '/profile/me', A.token);
    record(W, 'Student Profile shows new semester', prof.body?.data?.profile?.academic?.current_semester === 6);
    const so = await call('GET', '/semester/overview', A.token);
    record(W, 'Semester Command Center shows new semester', so.body?.data?.config?.semester_number === 6, `semester_number ${so.body?.data?.config?.semester_number}`);
    const tutor = await call('GET', '/profile/me/context/tutor', A.token);
    record(W, 'AI Tutor context uses new semester', JSON.stringify(tutor.body?.data || {}).includes('"current_semester":6') || tutor.body?.data?.semester === 6, short(tutor.body?.data));
    const note = await call('GET', `/notes/${noteBefore.body?.data?.id}`, A.token);
    record(W, 'historical note unchanged after semester change', note.status === 200 && note.body?.data?.title === 'Semester 5 OS notes');
    const sk = await call('PUT', '/profile/me/skills', A.token, { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }, { name: 'PostgreSQL', category: 'DATABASE', proficiency: 'BEGINNER' }] });
    record(W, 'add a skill', sk.status === 200, `${sk.status} ${sk.status !== 200 ? short(sk.body) : ''}`);
    const career = await call('GET', '/career/recommendations', A.token);
    const roles = career.body?.data?.potentially_relevant_roles || [];
    record(W, 'Career recommendations consider profile skills', roles.some((r) => r.match_percentage > 0), `top ${roles[0]?.role_name} ${roles[0]?.match_percentage}% — ${career.body?.data?.explanation}`);
    const skillsMod = await call('GET', '/skills/profile', A.token, undefined, 'GET /skills/profile');
    record(W, 'Skills store sees profile skills', JSON.stringify(skillsMod.body).includes('PostgreSQL'), `${skillsMod.status}`);
    const rc = await call('GET', '/profile/me/context/resume', A.token);
    record(W, 'Resume context includes new skill', JSON.stringify(rc.body).includes('PostgreSQL'));
    const jc = await call('GET', '/profile/me/context/jobs', A.token);
    record(W, 'Jobs context includes new skill', JSON.stringify(jc.body).includes('PostgreSQL'));
  }

  // ---- Isolation ----
  {
    const W = 'Isolation';
    const aNotes = await call('GET', '/notes', A.token);
    const bNotes = await call('GET', '/notes', B.token);
    record(W, 'B cannot see A notes', !JSON.stringify(bNotes.body).includes('Semester 5 OS notes') && JSON.stringify(aNotes.body).includes('Semester 5 OS notes'));
    const bMe = await call('GET', '/profile/me', B.token);
    record(W, 'B profile has no A data', !JSON.stringify(bMe.body).includes(A.email) && !JSON.stringify(bMe.body).includes('Library Tracker A'));
    const unauth = await call('GET', '/profile/me', null, undefined, 'GET /profile/me (no token)');
    record(W, 'no token → 401', unauth.status === 401);
  }

  // ---- WF2 Academic learning ----
  {
    const W = 'WF2 Academic learning';
    const recs = await call('GET', '/profile/me/recommendations/courses', A.token);
    record(W, 'course recommendations from profile', (recs.body?.data?.items || []).length > 0, `${(recs.body?.data?.items || []).length} items`);
    const courses = await call('GET', '/courses?limit=5', A.token);
    const list = courses.body?.data?.courses || courses.body?.data?.items || courses.body?.data || [];
    const course = Array.isArray(list) ? list[0] : null;
    record(W, 'course catalogue lists courses', Boolean(course), `${courses.status}`);
    if (course) {
      const open = await call('GET', `/courses/${course.id}`, A.token, undefined, 'GET /courses/:id');
      record(W, 'open a course', open.status === 200);
      const en = await call('POST', `/courses/${course.id}/enroll`, A.token, {}, 'POST /courses/:id/enroll');
      record(W, 'enroll in a course', en.status === 200 || en.status === 201 || en.status === 409, `${en.status}`);
    }
    const tutor = await call('POST', '/ai/chat', A.token, { message: 'Explain paging in operating systems in two sentences.' }, 'POST /ai/chat');
    // /ai/chat streams server-sent events; with no provider configured it streams an honest "AI unavailable" message.
    const text = typeof tutor.body === 'string' ? tutor.body : JSON.stringify(tutor.body);
    const unavailable = tutor.status === 503 || /AI unavailable|AI_UNAVAILABLE/.test(text);
    record(W, 'AI Tutor answers', unavailable ? null : tutor.status === 200, unavailable ? `${tutor.status} AI unavailable (no GEMINI_API_KEY)` : `${tutor.status}`);
    const note = await call('POST', '/notes', A.token, { title: 'Paging summary', content: 'Pages map virtual to physical frames.' });
    record(W, 'create study notes', note.status === 201);
  }

  // ---- WF3 Revision ----
  {
    const W = 'WF3 Revision';
    const deck = await call('POST', '/flashcards/decks', A.token, { title: 'OS revision', subject: 'Operating Systems' }, 'POST /flashcards/decks');
    record(W, 'create a flashcard deck', deck.status === 201 || deck.status === 200, `${deck.status} ${deck.status >= 300 ? short(deck.body) : ''}`);
    const deckId = deck.body?.data?.id;
    if (deckId) {
      const card = await call('POST', `/flashcards/decks/${deckId}/cards`, A.token, { front: 'What is a TLB?', back: 'A cache of page-table entries.' }, 'POST /flashcards/decks/:id/cards');
      record(W, 'add a card', card.status === 201 || card.status === 200, `${card.status} ${card.status >= 300 ? short(card.body) : ''}`);
      const cardId = card.body?.data?.id;
      if (cardId) {
        const rev = await call('POST', `/flashcards/decks/${deckId}/cards/${cardId}/review`, A.token, { rating: 'GOOD' }, 'POST /flashcards/.../review');
        record(W, 'review a card', rev.status === 200, `${rev.status} ${rev.status >= 300 ? short(rev.body) : ''}`);
      }
    }
    const gen = await call('POST', '/ai/tutor/generate-flashcards', A.token, { topic: 'Paging' }, 'POST /ai/tutor/generate-flashcards');
    record(W, 'AI flashcard generation', gen.status === 200 ? true : gen.status === 503 ? null : false, `${gen.status} ${short(gen.body?.error?.code || '')}`);
    const quizzes = await call('GET', '/quizzes', A.token);
    const qlist = Array.isArray(quizzes.body?.data) ? quizzes.body.data : [];
    record(W, 'a new student has a quiz to take without AI', qlist.length > 0 ? true : null, `${qlist.length} quizzes; the Quiz UI only creates quizzes by AI generation`);
    const gq = await call('POST', '/quiz/generate', A.token, { topic: 'Paging', question_count: 3 }, 'POST /quiz/generate');
    record(W, 'AI quiz generation', gq.status === 200 || gq.status === 201 ? true : gq.status === 503 ? null : false, `${gq.status} ${short(gq.body?.error?.code || '')}`);
    // API-created quiz (the same route the app uses to save a generated quiz) to test scoring.
    const QS = [
      { question_text: 'A TLB caches?', question_type: 'MCQ', options: ['Page-table entries', 'Disk blocks', 'Processes', 'Sockets'], correct_answer: 'Page-table entries' },
      { question_text: 'Paging removes external fragmentation.', question_type: 'TRUE_FALSE', options: ['True', 'False'], correct_answer: 'True' },
    ];
    const cq = await call('POST', '/quiz', A.token, { title: 'Paging check', source_type: 'TOPIC', questions: QS }, 'POST /quiz');
    const qid = cq.body?.data?.id;
    const start = await call('POST', `/quiz/${qid}/start`, A.token, {}, 'POST /quiz/:id/start');
    const attemptId = start.body?.data?.attempt?.id;
    const qq = (await call('GET', `/quiz/${qid}/questions`, A.token, undefined, 'GET /quiz/:id/questions')).body?.data || [];
    const sub = await call('POST', `/quiz/attempts/${attemptId}/submit`, A.token, { answers: { [qq[0]?.id]: 'Page-table entries', [qq[1]?.id]: 'False' }, score: 100 }, 'POST /quiz/attempts/:id/submit');
    record(W, 'quiz scored server-side (1 of 2 correct)', sub.status === 200 && sub.body?.data?.correct_count === 1, `${sub.status} correct ${sub.body?.data?.correct_count}`);
    const qp = await call('GET', '/quiz/progress', A.token);
    record(W, 'quiz progress reflects the attempt', JSON.stringify(qp.body).includes('"total_attempts":1') || JSON.stringify(qp.body).includes('Paging'), short(qp.body?.data));
  }

  // ---- WF4 Programming ----
  {
    const W = 'WF4 Programming';
    const run = await call('POST', '/coding/run', A.token, { language: 'python', source_code: 'print(sum(range(10)))' }, 'POST /coding/run');
    const out = JSON.stringify(run.body?.data || run.body);
    record(W, 'run Python code', run.status === 200 && out.includes('45') ? true : run.status === 503 ? null : false, `${run.status} ${short(out)}`);
    const save = await call('POST', '/coding/saved', A.token, { title: 'Sum to ten', language: 'python', source_code: 'print(sum(range(10)))' }, 'POST /coding/saved');
    record(W, 'save the program', save.status === 201 || save.status === 200, `${save.status} ${save.status >= 300 ? short(save.body) : ''}`);
    const bsaved = await call('GET', '/coding/saved', B.token);
    record(W, 'B cannot see A saved code', !JSON.stringify(bsaved.body).includes('Sum to ten'));
  }

  // ---- WF5 AI/ML experimentation ----
  {
    const W = 'WF5 AI/ML experimentation';
    // A small synthetic dataset generated here (hours studied, attendance -> pass/fail).
    const rows = ['hours,attendance,section,result'];
    for (let i = 0; i < 60; i++) {
      const h = (i % 12) + 1, a = 50 + ((i * 7) % 50), sec = ['A', 'B', 'C'][i % 3];
      rows.push(`${h},${a},${sec},${h * 6 + a / 2 > 55 ? 'pass' : 'fail'}`);
    }
    const up = await call('POST', '/ml-lab/datasets/upload', A.token, { name: 'Synthetic study data', csvContent: rows.join('\n'), target_column: 'result' }, 'POST /ml-lab/datasets/upload');
    record(W, 'upload a CSV dataset', up.status === 201, `${up.status} ${up.status >= 300 ? short(up.body) : ''}`);
    const ds = up.body?.data;
    if (ds) {
      const tr = await call('POST', '/ml-lab/experiments', A.token, {
        name: 'Pass model', dataset_id: ds.id, task_type: 'CLASSIFICATION', model_type: 'Decision Tree', target_column: 'result',
        feature_columns: ['hours', 'attendance', 'section'], train_split: 0.8, hyperparameters: { max_depth: 4 },
        preprocessing: { missing_value_strategy: 'MEDIAN', scaling: 'MINMAX' },
      }, 'POST /ml-lab/experiments');
      const m = tr.body?.data?.metrics || {};
      record(W, 'train a model and see evaluation metrics', tr.status === 201 && typeof m.accuracy === 'number', `${tr.status} accuracy ${m.accuracy}`);
      const bds = await call('GET', '/ml-lab/datasets', B.token);
      record(W, 'B cannot see A dataset', !JSON.stringify(bds.body).includes(ds.id));
    }
  }

  // ---- WF6 Research and RAG ----
  {
    const W = 'WF6 Research';
    const rp = await call('POST', '/research', A.token, { title: 'Page replacement policies', topic: 'Operating Systems', objective: 'Compare FIFO and LRU page replacement', description: 'Synthetic pilot research project' }, 'POST /research');
    record(W, 'create a research project', rp.status === 201, `${rp.status} ${rp.status >= 300 ? short(rp.body) : ''}`);
    const pid = rp.body?.data?.id;
    if (pid) {
      const ps = await call('POST', `/research/${pid}/papers/search`, A.token, { query: 'page replacement' }, 'POST /research/:id/papers/search');
      const papers = ps.body?.data?.papers || ps.body?.data?.results || ps.body?.data || [];
      const src = JSON.stringify(ps.body).match(/"(source|provider|mode)":"([A-Z_]+)"/);
      // Live providers (OpenAlex etc.) may be unreachable; the fallback is a small labelled CURATED list.
      const n = Array.isArray(papers) ? papers.length : 0;
      const curatedOnly = src && src[2] === 'CURATED';
      record(W, 'search for papers', ps.status !== 200 ? false : n > 0 ? true : curatedOnly ? null : false, `${ps.status} ${n} results ${src ? src[2] : ''}${curatedOnly && !n ? ' (live providers unreachable; curated list has no match)' : ''}`);
    }
    const text = 'Belady anomaly: with FIFO page replacement, adding frames can increase page faults. LRU does not have this anomaly.';
    const doc = await call('POST', '/documents', A.token, { title: 'Page replacement notes', originalName: 'page-replacement.txt', mimeType: 'text/plain', sizeBytes: Buffer.byteLength(text), contentBase64: Buffer.from(text).toString('base64') }, 'POST /documents');
    record(W, 'upload supporting material', doc.status === 201 || doc.status === 200, `${doc.status} ${doc.status >= 300 ? short(doc.body) : ''}`);
    const docId = doc.body?.data?.id;
    if (docId) {
      const ask = await call('POST', '/knowledge-base/ask', A.token, { question: 'Which policy shows Belady anomaly?', document_id: docId }, 'POST /knowledge-base/ask');
      const unavailable = ask.status === 503 || /AI_UNAVAILABLE|not configured/i.test(JSON.stringify(ask.body));
      const answerText = JSON.stringify(ask.body?.data || {});
      record(W, 'ask a question grounded in the document (RAG)', unavailable ? null : ask.status === 200 && /FIFO/i.test(answerText), `${ask.status} ${short(ask.body?.data?.answer || ask.body?.error?.code || ask.body?.message || '')} | mode ${ask.body?.data?.mode || ask.body?.data?.answer_mode || '?'} | citations ${(ask.body?.data?.citations || ask.body?.data?.sources || []).length}`);
      const bdoc = await call('POST', '/knowledge-base/ask', B.token, { question: 'Which policy?', document_id: docId }, 'POST /knowledge-base/ask (other student)');
      record(W, 'B cannot query A document', bdoc.status === 404 || bdoc.status === 403, `${bdoc.status}`);
    }
  }

  // ---- WF8 Learning goals ----
  {
    const W = 'WF8 Learning goals';
    const due = new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10);
    const g = await call('POST', '/goals', A.token, { title: 'Finish OS unit 3', category: 'ACADEMIC', target_date: due, milestones: [{ title: 'Read paging' }, { title: 'Solve 5 problems' }] });
    record(W, 'create a goal', g.status === 201, `${g.status} ${g.status >= 300 ? short(g.body) : ''}`);
    const goal = g.body?.data;
    const ms = goal?.milestones?.[0];
    if (goal && ms) {
      const t = await call('POST', `/goals/${goal.id}/milestones/${ms.id}/toggle`, A.token, {}, 'POST /goals/:id/milestones/:mid/toggle');
      const pct = t.body?.data?.progress ?? t.body?.data?.progress_percentage;
      record(W, 'complete a milestone updates progress', t.status === 200 && pct > 0, `${t.status} progress ${pct}`);
    }
    const bg = await call('GET', `/goals/${goal?.id}`, B.token, undefined, 'GET /goals/:id (other student)');
    record(W, 'B cannot read A goal', bg.status === 404 || bg.status === 403, `${bg.status}`);
  }

  // ---- WF9 Community ----
  {
    const W = 'WF9 Community';
    const topics = await call('GET', '/community/topics', A.token);
    const topicId = (topics.body?.data || [])[0]?.id;
    const q = await call('POST', '/community/questions', A.token, { title: 'How does a TLB miss get handled?', description: 'I understand paging but not what happens on a TLB miss in hardware vs software managed TLBs.', topic_id: topicId, tags: ['os'] });
    record(W, 'post a question', q.status === 201 || q.status === 200, `${q.status} ${q.status >= 300 ? short(q.body) : ''}`);
    const qid = q.body?.data?.id;
    if (qid) {
      const view = await call('GET', `/community/questions/${qid}`, B.token, undefined, 'GET /community/questions/:id');
      const txt = JSON.stringify(view.body);
      record(W, 'other students see the question', view.status === 200);
      record(W, 'public question exposes no email/phone/CGPA', !txt.includes(A.email) && !/"cgpa"|"phone"/i.test(txt));
      const ans = await call('POST', `/community/questions/${qid}/answers`, B.token, { content: 'On a miss the MMU walks the page table (hardware-managed) or traps to the OS (software-managed).', body: 'On a miss the MMU walks the page table (hardware-managed) or traps to the OS (software-managed).' }, 'POST /community/questions/:id/answers');
      record(W, 'answer a question', ans.status === 201 || ans.status === 200, `${ans.status} ${ans.status >= 300 ? short(ans.body) : ''}`);
      const edit = await call('PATCH', `/community/questions/${qid}`, B.token, { title: 'Hijacked' }, 'PATCH /community/questions/:id (other student)');
      record(W, 'B cannot edit A question', edit.status === 403 || edit.status === 404, `${edit.status}`);
      const notes = await call('GET', '/notifications', A.token);
      record(W, 'A notified of the answer', JSON.stringify(notes.body).toLowerCase().includes('answer'), `${notes.status}`);
    }
  }

  // ---- WF7 Career ----
  {
    const W = 'WF7 Career';
    const r = await call('POST', '/resumes', A.token, { title: 'Pilot resume' }, 'POST /resumes');
    record(W, 'create a resume', r.status === 201 || r.status === 200, `${r.status} ${r.status >= 300 ? short(r.body) : ''}`);
    const rtxt = JSON.stringify(r.body?.data || {});
    record(W, 'resume pre-fills profile skills', rtxt.includes('Python') || rtxt.includes('PostgreSQL'), short(r.body?.data?.skills || ''));
    const jobs = await call('GET', '/jobs-discovery/jobs', A.token, undefined, 'GET /jobs-discovery/jobs');
    const jl = jobs.body?.data?.jobs || jobs.body?.data || [];
    record(W, 'jobs list (genuine listings only)', jobs.status === 200 ? (Array.isArray(jl) && jl.length ? true : null) : false, `${jobs.status} ${Array.isArray(jl) ? jl.length : '?'} listings`);
    const app = await call('POST', '/applications', A.token, { company_name: 'Synthetic Co', role: 'Backend Intern', status: 'APPLIED' }, 'POST /applications');
    record(W, 'save an application', app.status === 201 || app.status === 200, `${app.status} ${app.status >= 300 ? short(app.body) : ''}`);
    const bApps = await call('GET', '/applications', B.token);
    record(W, 'B cannot see A application', !JSON.stringify(bApps.body).includes('Synthetic Co'));
  }

  // ---- WF10 Account management ----
  {
    const W = 'WF10 Account management';
    const np = await call('PATCH', '/notifications/preferences', A.token, { email_enabled: false });
    record(W, 'update notification preferences', np.status === 200, `${np.status} ${np.status >= 300 ? short(np.body) : ''}`);
    const vis = await call('PATCH', '/profile/privacy', A.token, { profile_visibility: 'PRIVATE' }, 'PATCH /profile/privacy');
    record(W, 'set profile visibility', vis.status === 200, `${vis.status} ${vis.status >= 300 ? short(vis.body) : ''}`);
    const li = await call('POST', '/auth/login', null, { email: A.email, password: 'Phase6Pass1' });
    const pv = await call('GET', '/profile/privacy', li.body?.data?.token);
    record(W, 'visibility persists after login', pv.body?.data?.profile_visibility === 'PRIVATE', short(pv.body?.data));
  }

  // ---- Pilot feedback (only when the server has PILOT_FEEDBACK_ENABLED=true) ----
  {
    const W = 'Pilot feedback';
    const cfg = await call('GET', '/pilot-feedback/config', A.token);
    if (!cfg.body?.data?.enabled) record(W, 'feedback open on this server', null, 'PILOT_FEEDBACK_ENABLED is not true');
    else {
      const f = await call('POST', '/pilot-feedback', A.token, { consent: true, consent_version: cfg.body.data.consent_version, ratings: { reg_easy: 4 }, tasks_attempted: ['WF1'], comments: 'Synthetic Stage 1 entry' });
      record(W, 'submit private feedback', f.status === 201, `${f.status}`);
      const bl = await call('GET', '/pilot-feedback/mine', B.token);
      record(W, 'B cannot see A feedback', !JSON.stringify(bl.body).includes('Synthetic Stage 1 entry'));
      const w = await call('DELETE', `/pilot-feedback/mine/${f.body?.data?.id}`, A.token, undefined, 'DELETE /pilot-feedback/mine/:id');
      record(W, 'withdraw feedback', w.status === 200);
    }
  }

  console.log(JSON.stringify({ base: process.env.BASE || 'http://localhost:3611', ran_at: new Date().toISOString(), students: [A.id, B.id], results, timings: summary() }, null, 2));
})().catch((e) => {
  console.error('FAILED', e);
  process.exit(1);
});
