// Phase 3 batch 5 integration probe: data a student enters in one module must reach the others that use it, and
// never another student's. Flow: declare a skill -> project with a technology -> resume imports the project ->
// application JD analysis and imported-job fit use the declared skill -> knowledge base answers from an uploaded
// document -> B sees none of it. Usage: BASE=... node scripts/audit/phase3-integration.cjs
const { api, reg, check, summary } = require('./phase3-lib.cjs');
const b64 = (t) => Buffer.from(t).toString('base64');
(async () => {
  const A = await reg('intA'); const B = await reg('intB');
  const skills = await api('GET', '/skills', A.t);
  const list = Array.isArray(skills.d) ? skills.d : skills.d.skills || [];
  const py = list.find((s) => s.name === 'Python');
  check('INT skill catalogue has Python', !!py);
  const dec = await api('POST', '/skills/declare', A.t, { skill_id: py.id, proficiency: 'INTERMEDIATE' });
  check('INT declare Python on the profile', dec.s === 201, dec.s);

  const proj = await api('POST', '/projects', A.t, { title: 'P3 Integration Inventory API', domain: 'Web', project_type: 'MINI_PROJECT', description: 'Inventory REST API' });
  const pid = proj.d.id;
  check('INT create project', proj.s === 201 && pid, proj.s);
  const tech = await api('POST', `/projects/${pid}/technologies`, A.t, { technology: 'Python', category: 'BACKEND' });
  check('INT add Python to the project', tech.s === 201, tech.s);

  const res = await api('POST', '/resumes', A.t, { title: 'P3 Integration Resume' });
  const rid = res.d.resume?.id || res.d.id;
  const imp = await api('POST', `/resumes/${rid}/projects/import`, A.t, { project_id: pid });
  const r = await api('GET', `/resumes/${rid}`, A.t);
  const rp = (r.d.projects || []).find((p) => p.title === 'P3 Integration Inventory API');
  check('INT resume holds the project with its technology', (imp.s === 200 || imp.s === 409 || imp.s === 400) && rp && JSON.stringify(rp).includes('Python'), `${imp.s} ${rp ? 'found' : 'missing'}`);
  check('INT B cannot import A\'s project into B\'s resume', [403, 404].includes((await api('POST', `/resumes/${(await api('POST', '/resumes', B.t, { title: 'B' })).d.resume.id}/projects/import`, B.t, { project_id: pid })).s));

  const app = await api('POST', '/applications', A.t, { company_name: 'Synthetic Co', role: 'Backend Intern', status: 'SAVED', job_description: 'Looking for Python and Docker skills.' });
  const reqs = app.d.jd_analysis?.required_skills || [];
  const pyReq = reqs.find((x) => x.name === 'Python'); const dk = reqs.find((x) => x.name === 'Docker');
  check('INT application JD analysis sees the declared Python skill, without calling the declaration evidence', pyReq && pyReq.evidence_status === 'DEVELOPING', pyReq && pyReq.evidence_status);
  check('INT and reports Docker as not on the profile', dk && dk.evidence_status === 'NOT_YET_ASSESSED', dk && dk.evidence_status);
  const appB = await api('POST', '/applications', B.t, { company_name: 'Synthetic Co', role: 'Backend Intern', job_description: 'Looking for Python and Docker skills.' });
  check('INT B\'s analysis is not affected by A\'s skills', (appB.d.jd_analysis?.required_skills || []).every((x) => x.evidence_status === 'NOT_YET_ASSESSED'));

  const job = await api('POST', '/integrations/jobs/import', A.t, { title: 'Backend Intern', company_name: 'Synthetic Co', description: 'Python and Docker', url: 'https://example.test/j' });
  const an = await api('POST', `/integrations/jobs/${job.d.id}/analyze`, A.t);
  check('INT imported job fit uses the profile and the project', an.s === 200 && (an.d.matched_skills || []).includes('Python') && (an.d.relevant_projects || []).length >= 1, `${an.d.fit_score} ${JSON.stringify(an.d.matched_skills)} projects=${(an.d.relevant_projects || []).length}`);

  const text = 'The inventory service stores stock levels in PostgreSQL and exposes them through a REST API.';
  const doc = await api('POST', '/documents', A.t, { originalName: `int-${Date.now()}.txt`, mimeType: 'text/plain', sizeBytes: text.length, contentBase64: b64(text), title: 'P3 Integration notes' });
  for (let i = 0; i < 30; i++) { if ((await api('GET', `/documents/${doc.d.id}`, A.t)).d.status === 'READY') break; await new Promise((x) => setTimeout(x, 500)); }
  const ask = await api('POST', '/knowledge-base/ask', A.t, { question: 'Where are stock levels stored?' });
  check('INT knowledge base answers from the uploaded document', ask.s === 200 && ask.d.citations.some((c) => c.document_id === doc.d.id), ask.d.answer_mode);
  const askB = await api('POST', '/knowledge-base/ask', B.t, { question: 'Where are stock levels stored?' });
  check('INT B gets no citation from A\'s document', !askB.d.citations.some((c) => c.document_id === doc.d.id));

  const dash = await api('GET', '/career/dashboard-summary', A.t);
  check('INT career dashboard answers for a student with records', dash.s === 200, dash.s);
  summary();
})().catch((e) => { console.error(e); process.exitCode = 1; });
