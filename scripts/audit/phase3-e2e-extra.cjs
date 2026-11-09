// Phase 3 batch 5: E2E steps not covered by the batch probes.
// E2E 9 Resume: add education and skills, open the preview in Chromium, print it to PDF and check the PDF text.
// E2E 11 Placement: create a plan for a real role, refuse an unknown role, B cannot read A's plan.
// E2E 12 Connected Platforms: link, disconnect, profile reads DISCONNECTED.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const { api, reg, check, summary } = require('./phase3-lib.cjs');
const BASE = process.env.BASE || 'http://localhost:3400';
(async () => {
  const A = await reg('e2eA'); const B = await reg('e2eB');
  // E2E 9
  const r = await api('POST', '/resumes', A.t, { title: 'P3 E2E Resume' });
  const rid = r.d.resume.id;
  const ed = await api('PUT', `/resumes/${rid}/education`, A.t, { education: [{ institution: 'Synthetic Institute of Technology', degree: 'B.Tech', field_of_study: 'Computer Science', start_date: '2023-08', end_date: '2027-05', grade: '8.4 CGPA', description: '' }] });
  check('E2E9 add education', ed.s === 200, ed.s);
  const sk = await api('PUT', `/resumes/${rid}/skills`, A.t, { skills: [{ skill: 'Python', category: 'PROGRAMMING', proficiency: 'INTERMEDIATE', source: 'MANUAL' }, { skill: 'PostgreSQL', category: 'DATABASE', proficiency: 'BEGINNER', source: 'MANUAL' }] });
  check('E2E9 add skills', sk.s === 200, sk.s);
  const pr = await api('POST', '/projects', A.t, { title: 'P3 E2E Library Tracker', domain: 'Web', project_type: 'MINI_PROJECT' });
  const imp = await api('POST', `/resumes/${rid}/projects/import`, A.t, { project_id: pr.d.id });
  check('E2E9 add project', imp.s === 200, imp.s);
  const b = await chromium.launch();
  const ctx = await b.newContext();
  await ctx.addInitScript((x) => localStorage.setItem('auth_token', x), A.t);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`${BASE}/resume/${rid}/preview`, { waitUntil: 'networkidle', timeout: 45000 });
  await p.waitForTimeout(800);
  const text = await p.evaluate(() => document.body.innerText);
  check('E2E9 preview shows education, skills and project', /Synthetic Institute of Technology/.test(text) && /PostgreSQL/.test(text) && /P3 E2E Library Tracker/.test(text) && errs.length === 0, errs.join(';'));
  const pdfPath = '/tmp/p3-e2e-resume.pdf';
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: pdfPath, format: 'A4' });
  let pdfText = '';
  try { pdfText = execFileSync('pdftotext', [pdfPath, '-']).toString(); } catch (e) { pdfText = ''; }
  check('E2E9 printed PDF contains the resume content', /Synthetic Institute of Technology/.test(pdfText) && /Python/.test(pdfText) && /P3 E2E Library Tracker/.test(pdfText), `${fs.statSync(pdfPath).size} bytes`);
  check('E2E9 printed PDF has no app navigation chrome', !/Ask AI|Learning Workspace/.test(pdfText));
  await b.close();
  const rb = await api('GET', `/resumes/${rid}`, B.t);
  check('E2E9 B cannot read A\'s resume', [403, 404].includes(rb.s), rb.s);

  // E2E 11
  const roles = await api('GET', '/placements/roles', A.t);
  const role = (Array.isArray(roles.d) ? roles.d : roles.d.roles || [])[0];
  const plan = await api('POST', '/placements/plans', A.t, { target_role_id: role.id, duration_weeks: 2 });
  check('E2E11 plan created for a real role', plan.s === 201 && plan.d.plan.target_role_id === role.id && plan.d.tasks.length > 0, `${plan.s} ${plan.d.tasks?.length} tasks`);
  check('E2E11 unknown role refused (no "Software Engineer" fallback)', (await api('POST', '/placements/plans', A.t, { target_role_id: 'role_nope' })).s === 404);
  check('E2E11 B cannot read A\'s plan', [403, 404].includes((await api('GET', `/placements/plans/${plan.d.plan.id}`, B.t)).s));

  // E2E 12
  const add = await api('POST', '/external-profiles', A.t, { platform_id: 'codeforces', profile_url: 'https://codeforces.com/profile/synthetic_p3' });
  // Codeforces supports sync, so adding it runs a first sync; Codeforces is unreachable here, so the link is saved
  // with status FAILED and the reason, never CONNECTED.
  check('E2E12 link Codeforces profile: saved, not CONNECTED, sync failure explained', add.s === 201 && ['LINKED', 'FAILED'].includes(add.j.profile.connection_status) && (add.j.profile.connection_status === 'LINKED' || !!add.j.profile.last_error_summary), `${add.j.profile?.connection_status} ${add.j.profile?.last_error_summary || ''}`);
  const ch = await api('POST', `/external-profiles/${add.j.profile.id}/verify-challenge/start`, A.t);
  check('E2E12 verification challenge issued', ch.s === 200 && ch.j.challenge && (ch.j.challenge.token || ch.j.challenge.code), ch.s);
  const chk = await api('POST', `/external-profiles/${add.j.profile.id}/verify-challenge/check`, A.t);
  check('E2E12 live check cannot reach Codeforces here: not verified, says why', chk.s >= 400 || chk.j.verified === false || /not|could|unable/i.test(JSON.stringify(chk.j)), `${chk.s} ${JSON.stringify(chk.j).slice(0, 120)}`);
  const dis = await api('POST', `/external-profiles/${add.j.profile.id}/disconnect`, A.t);
  const after = await api('GET', `/external-profiles/${add.j.profile.id}`, A.t);
  const ap = after.j.profile || after.d;
  check('E2E12 disconnect', dis.s === 200 && ap.connection_status === 'DISCONNECTED', ap.connection_status);
  check('E2E12 B cannot disconnect A\'s profile', [403, 404].includes((await api('POST', `/external-profiles/${add.j.profile.id}/disconnect`, B.t)).s));
  summary();
})().catch((e) => { console.error(e); process.exitCode = 1; });
