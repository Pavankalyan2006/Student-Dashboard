// Phase 3 browser check of the resume create flow and the Project Builder import picker (1366px and 390px).
// Registers a synthetic student with one project; reports URL after /resume/create, picker contents, overflow and page errors.
const { chromium } = require('playwright');
(async () => {
  const BASE = 'http://localhost:3400';
  const j = (p, t, body) => fetch(BASE + '/api/v1' + p, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());
  const reg = await j('/auth/register', null, { email: `p3rui${Date.now()}@example.test`, password: 'TestPass123', name: 'P3 Resume UI' });
  const t = reg.data.token;
  await j('/students/me/onboarding/complete', t, {});
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((x) => localStorage.setItem('auth_token', x), t);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + '/resume/create', { waitUntil: 'networkidle', timeout: 45000 });
    await p.waitForURL(/\/resume\/res_[^/]+\/edit/, { timeout: 15000 });
    const url = p.url();
    // New resumes pre-fill existing projects, so add one now to exercise the picker.
    await j('/projects', t, { title: `P3 UI library tracker`, domain: 'Web', project_type: 'MINI_PROJECT' });
    await p.getByRole('button', { name: 'Edit projects section' }).first().click();
    await p.getByRole('button', { name: /Import from Project Builder/ }).click();
    await p.getByRole('button', { name: 'P3 UI library tracker' }).waitFor({ timeout: 8000 });
    await p.getByRole('button', { name: 'P3 UI library tracker' }).click();
    await p.waitForTimeout(800);
    const after = await p.getByText('All your projects are already on this resume.').count();
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await p.screenshot({ path: `docs/phase-3-audit/evidence/resume-editor-${w}.png` });
    await p.goBack({ waitUntil: 'networkidle' });
    console.log(JSON.stringify({ width: w, opened_editor: url.replace(BASE, ''), imported_then_picker_empty: after === 1, back_goes_to: p.url().replace(BASE, ''), overflow, errors: errs }));
    await ctx.close();
  }
  const list = await j('/resumes', t);
  console.log('resumes created for 2 visits:', list.data.length);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
