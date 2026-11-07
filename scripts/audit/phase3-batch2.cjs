// Phase 3 batch 2 HTTP probe: Research (E2E test 5), Git practice lab (E2E test 4), Knowledge Base.
// Usage: BASE=http://localhost:3400 node scripts/audit/phase3-batch2.cjs create|verify   (state in STATE, default /tmp/p3/batch2.json)
// No AI model is configured: AI endpoints must answer 503. Live paper search may be blocked by the network,
// in which case the curated list must be labelled as such.
const fs = require('fs');
const { api, reg, check, summary } = require('./phase3-lib.cjs');
const STATE = process.env.STATE || '/tmp/p3/batch2.json';

async function research(A, B, st) {
  const p = await api('POST', '/research', A.t, { title: 'P3 probe: efficient transformers', topic: 'Efficient attention', domain: 'Machine Learning', research_type: 'LITERATURE_REVIEW', objective: 'Survey efficient attention', research_question: 'Which attention variants reduce memory?' });
  check('RS create project', [200, 201].includes(p.s) && p.d.id, p.s);
  const pid = p.d.id; st.pid = pid;
  const meth = await api('GET', `/research/${pid}/methodology`, A.t);
  check('RS no invented methodology on a new project', meth.s === 200 && !meth.d?.id, JSON.stringify(meth.d).slice(0, 60));
  const s = await api('POST', `/research/${pid}/papers/search`, A.t, { query: 'attention transformer' });
  const src = s.d.source;
  check('RS search answers and names its source', s.s === 200 && ['OPENALEX', 'CURATED'].includes(src), `${src}, ${s.d.papers?.length} results${s.d.live_error ? ', live error: ' + s.d.live_error : ''}`);
  if (src === 'CURATED') check('RS curated results are labelled CURATED with a note (live search unavailable)', s.d.papers.every((x) => x.provider === 'CURATED') && !!s.d.source_note);
  check('RS student B cannot search in A\'s project', [403, 404].includes((await api('POST', `/research/${pid}/papers/search`, B.t, { query: 'x' })).s));
  const pick = s.d.papers[0];
  check('RS result has a source link to open', !!pick && /^https?:\/\//.test(pick.url || (pick.doi ? 'https://doi.org/' + pick.doi : '')), pick?.url || pick?.doi);
  const saved = await api('POST', `/research/${pid}/papers/import`, A.t, { paper: { ...pick, id: 'paper_seed_1' } });
  check('RS save paper (server id, client id ignored)', saved.s === 201 && saved.d.id !== 'paper_seed_1' && saved.d.research_project_id === pid, saved.d.id);
  const dup = await api('POST', `/research/${pid}/papers/import`, A.t, { paper: pick });
  check('RS saving the same paper again does not duplicate it', dup.d.id === saved.d.id);
  check('RS empty title is refused', (await api('POST', `/research/${pid}/papers/import`, A.t, { paper: { title: '' } })).s === 400);
  const n = await api('PATCH', `/research/papers/${saved.d.id}`, A.t, { notes: 'P3 note: read section 3', reading_status: 'READING' });
  check('RS save notes and reading status', n.s === 200 && n.d.notes === 'P3 note: read section 3' && n.d.reading_status === 'READING', n.s);
  check('RS invalid reading status refused', (await api('PATCH', `/research/papers/${saved.d.id}`, A.t, { reading_status: 'DONE' })).s === 400);
  check('RS student B cannot read or edit A\'s paper', [403, 404].includes((await api('GET', `/research/papers/${saved.d.id}`, B.t)).s) && [403, 404].includes((await api('PATCH', `/research/papers/${saved.d.id}`, B.t, { notes: 'x' })).s));
  const an = await api('POST', `/research/papers/${saved.d.id}/analyze`, A.t);
  check('RS analysis without an AI provider is 503 (no template analysis)', an.s === 503, an.s);
  check('RS gaps without an AI provider is 503', (await api('POST', `/research/${pid}/gaps/analyze`, A.t)).s === 503);
  check('RS literature review without an AI provider is 503', (await api('POST', `/research/${pid}/literature-review/generate`, A.t, { strategy: 'thematic' })).s === 503);
  const other = s.d.papers[1] || (await api('POST', `/research/${pid}/papers/search`, A.t, { query: 'retrieval' })).d.papers.find((x) => x.title !== pick.title);
  const second = other && (await api('POST', `/research/${pid}/papers/import`, A.t, { paper: other }));
  if (second) {
    const cmp = await api('POST', '/research/papers/compare', A.t, { paper_ids: [saved.d.id, second.d.id] });
    check('RS compare uses saved metadata only, no ranking', cmp.s === 200 && cmp.d.columns.join() === 'Paper,Year,Authors' && !cmp.d.rankings, cmp.s);
    st.second = second.d.id;
  }
  const cit = await api('POST', `/research/${pid}/citations`, A.t, { paper_id: saved.d.id, style: 'APA' });
  check('RS APA citation from saved metadata', [200, 201].includes(cit.s) && cit.d.formatted_citation?.includes(pick.title.slice(0, 20)), cit.s);
  st.paper = saved.d.id; st.title = pick.title;
}

async function gitlab(A, B, st) {
  const lessons = await api('GET', '/git-lab/lessons', A.t);
  check('GL lessons list (13 topics)', lessons.s === 200 && lessons.d.length >= 13, lessons.d.length);
  check('GL lessons need auth', (await api('GET', '/git-lab/lessons', null)).s === 401);
  const done = await api('POST', '/git-lab/lessons/branches/complete', A.t);
  check('GL mark lesson read', done.s === 200 && done.d.completed === true);
  const ex = await api('GET', '/git-lab/exercises/resolve-conflict', A.t);
  check('GL open conflict exercise (starts from a prepared repository)', ex.s === 200 && ex.d.repo.commits.length === 3 && ex.d.evaluation.passed === false, ex.d.repo?.commits?.length);
  const host = await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'ls; cat /etc/passwd' });
  check('GL host command chaining refused', host.s === 200 && host.d.result.ok === false, host.d.result?.output);
  const other = await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'whoami' });
  check('GL non-simulated programs refused', other.d.result.ok === false);
  const m = await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'git merge feature/title' });
  check('GL merge produces a conflict', /CONFLICT/.test(m.d.result.output) && !!m.d.repo.merge_in_progress, m.d.result.output.split('\n')[0]);
  const early = await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'git commit -m "too early"' });
  check('GL commit with unresolved conflict refused', early.d.result.ok === false);
  check('GL solution locked before hints are used', (await api('GET', '/git-lab/exercises/resolve-conflict/solution', A.t)).s === 403);
  const h = await api('POST', '/git-lab/exercises/resolve-conflict/hint', A.t);
  check('GL hint', h.s === 200 && !!h.d.hint && h.d.hints_used === 1);
  await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'echo "Title: Student Portal" > app.txt' });
  await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'git add app.txt' });
  const fin = await api('POST', '/git-lab/exercises/resolve-conflict/commands', A.t, { command: 'git commit -m "Merge feature/title"' });
  check('GL exercise graded complete from the repository state', fin.d.evaluation.passed === true && fin.d.newly_completed === true && !!fin.d.explanation, fin.d.evaluation.checks.filter((c) => !c.passed).map((c) => c.label).join('; '));
  const bex = await api('GET', '/git-lab/exercises/resolve-conflict', B.t);
  check('GL student B has their own untouched repository', bex.d.evaluation.passed === false && !bex.d.repo.merge_in_progress && bex.d.repo.commits.length === 3);
  const sb = await api('POST', '/git-lab/sandbox/commands', A.t, { command: 'git init' });
  await api('POST', '/git-lab/sandbox/commands', A.t, { command: 'echo hi > a.txt' });
  check('GL sandbox works', sb.d.result.ok && sb.d.repo.initialized);
  const prog = await api('GET', '/git-lab/progress', A.t);
  check('GL progress counts the completion', prog.d.exercises_completed === 1 && prog.d.lessons_completed === 1, JSON.stringify(prog.d).slice(0, 80));
}

async function create() {
  const A = await reg('A'); const B = await reg('B');
  const st = { A, B };
  await research(A, B, st);
  await gitlab(A, B, st);
  fs.writeFileSync(STATE, JSON.stringify(st));
  summary();
}

async function verify() {
  const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  const { A } = st;
  const papers = await api('GET', `/research/${st.pid}/papers`, A.t);
  const p = (papers.d || []).find((x) => x.id === st.paper);
  check('RS after restart: saved paper still there', !!p && p.title === st.title);
  check('RS after restart: notes and reading status kept', p?.notes === 'P3 note: read section 3' && p?.reading_status === 'READING');
  const proj = await api('GET', `/research/${st.pid}`, A.t);
  check('RS after restart: search history kept', Array.isArray(proj.d.search_history) && proj.d.search_history.length >= 1, proj.d.search_history?.length);
  const prog = await api('GET', '/git-lab/progress', A.t);
  check('GL after restart: lesson and exercise completion kept', prog.d.exercises_completed === 1 && prog.d.lessons_completed === 1);
  const ex = await api('GET', '/git-lab/exercises/resolve-conflict', A.t);
  check('GL after restart: exercise repository and hint usage kept', ex.d.evaluation.passed === true && ex.d.hints.length === 1);
  const sb = await api('GET', '/git-lab/sandbox', A.t);
  check('GL after restart: sandbox repository kept', sb.d.repo.files.some((f) => f.path === 'a.txt'));
  const up = await api('GET', '/progress', A.t);
  const row = (up.d.category_breakdown || up.d.categoryBreakdown || []).find((c) => c.category === 'Git Practice Lab');
  check('GL unified progress shows the Git lab', up.s === 200 && (row?.completed === 1 || up.d.subsystems?.git?.exercises_completed === 1), up.s + ' ' + JSON.stringify(row || up.d.subsystems?.git));
  if (st.second) {
    const del = await api('DELETE', `/research/papers/${st.second}`, A.t);
    const after = await api('GET', `/research/${st.pid}/papers`, A.t);
    check('RS remove a paper', del.s === 200 && !after.d.some((x) => x.id === st.second));
  }
  summary();
}

(process.argv[2] === 'verify' ? verify : create)().catch((e) => { console.error(e); process.exitCode = 1; });
