// Phase 6 Stage 1: browser walkthrough with one synthetic student.
//  1. Registers through the real 7-step form on a phone-sized screen (390x844) and times it.
//  2. Visits the pages pilot students will use at 390 px and 1366 px and records load time,
//     horizontal overflow, uncaught page errors, console errors, API 5xx and error screens.
// Synthetic data only. Usage: BASE=http://localhost:3611 node scripts/pilot/phase6-ui-walkthrough.cjs <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = process.env.BASE || 'http://localhost:3611';
const OUT = process.argv[2] || 'pilot-ui-out';
fs.mkdirSync(`${OUT}/shots`, { recursive: true });

// Every student entry in the sidebar (src/components/navigation/Sidebar.tsx), plus Settings.
const PAGES = [
  '/dashboard', '/semester-command-center', '/ai-agent', '/courses', '/notes', '/documents', '/doubts', '/flashcards',
  '/study-planner', '/languages', '/coding', '/dsa', '/sql-lab', '/ml-lab', '/system-design', '/git', '/labs', '/quiz',
  '/exams', '/interviews', '/assessment/gate-preparation', '/projects', '/github', '/research', '/knowledge', '/career',
  '/resume', '/mock-interviews', '/applications', '/placement', '/integrations', '/profile/external', '/career/jobs',
  '/community', '/community/questions', '/community/discussions', '/community/resources', '/progress', '/goals',
  '/profile', '/profile/edit', '/notifications', '/profile/settings', '/settings', '/sandbox',
];

(async () => {
  const browser = await chromium.launch();
  const report = { base: BASE, ran_at: new Date().toISOString(), registration: {}, pages: [] };

  // ---- 1. Registration on a phone-sized screen ----
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const regErrors = [];
  page.on('pageerror', (e) => regErrors.push(e.message.slice(0, 160)));
  const email = `p6.ui.${Date.now()}@example.test`;
  const t0 = Date.now();
  const marks = {};
  const mark = (k) => (marks[k] = Date.now() - t0);
  try {
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    mark('form_loaded');
    await page.fill('#full_name', 'Pilot UI Synthetic');
    await page.fill('#email', email);
    await page.fill('#password', 'Phase6Pass1');
    await page.fill('#confirm_password', 'Phase6Pass1');
    const boxes = page.locator('input[type=checkbox]');
    await boxes.nth(0).check(); await boxes.nth(1).check();
    await page.screenshot({ path: `${OUT}/shots/reg-1-account-390.png`, fullPage: true });
    await page.click('button:has-text("Create account")');
    await page.waitForSelector('#college', { timeout: 15000 }); mark('account_created');
    await page.fill('#college', 'Synthetic Institute of Technology');
    await page.selectOption('#degree', { index: 1 });
    await page.fill('#branch', 'Computer Science and Engineering');
    await page.selectOption('#current_semester', '5');
    await page.selectOption('#academic_year', '3');
    await page.fill('#expected_graduation_year', String(new Date().getFullYear() + 2));
    await page.fill('#subjects', 'Operating Systems'); await page.keyboard.press('Enter');
    await page.screenshot({ path: `${OUT}/shots/reg-2-academic-390.png`, fullPage: true });
    await page.click('button:has-text("Save and continue")');
    await page.waitForSelector('#skill_name', { timeout: 10000 }); mark('academic_saved');
    await page.fill('#skill_name', 'Python');
    await page.click('button:has-text("Add")');
    await page.selectOption('select[aria-label="Proficiency for Python"]', 'INTERMEDIATE');
    await page.click('button:has-text("Save and continue")');
    await page.waitForSelector('button:has-text("Skip for now")', { timeout: 10000 }); mark('skills_saved');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Skip for now")');
    await page.waitForSelector('#target_roles', { timeout: 10000 });
    await page.fill('#target_roles', 'Backend Developer'); await page.keyboard.press('Enter');
    await page.click('button:has-text("Save and continue")');
    await page.waitForSelector('#preferred_languages', { timeout: 10000 }); mark('career_saved');
    await page.fill('#preferred_languages', 'English'); await page.keyboard.press('Enter');
    await page.fill('#weekly_study_hours', '10');
    await page.click('button:has-text("Save and continue")');
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/shots/reg-7-review-390.png`, fullPage: true });
    // Refresh in the middle of the last step: the wizard must come back on the review step.
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    report.registration.review_after_refresh = await page.locator('button', { hasText: /finish|complete registration/i }).count() > 0;
    await page.locator('button', { hasText: /finish|complete registration/i }).first().click();
    await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(() => {});
    mark('completed');
    report.registration.final_url = page.url().replace(BASE, '');
    report.registration.ok = report.registration.final_url.startsWith('/dashboard');
  } catch (e) {
    report.registration.ok = false;
    report.registration.error = e.message.split('\n')[0];
    await page.screenshot({ path: `${OUT}/shots/reg-failure-390.png`, fullPage: true }).catch(() => {});
  }
  report.registration.email_domain = 'example.test';
  report.registration.timings_ms = marks;
  report.registration.page_errors = regErrors;
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  await ctx.close();

  // ---- 2. Page sweep ----
  for (const [w, h] of [[390, 844], [1366, 900]]) {
    const c = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    if (token) await c.addInitScript((x) => localStorage.setItem('auth_token', x), token);
    for (const path of PAGES) {
      const p = await c.newPage();
      const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
      const cons = []; p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|ERR_NAME|net::ERR/.test(m.text())) cons.push(m.text().slice(0, 140)); });
      const bad = []; p.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) bad.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
      const s = Date.now();
      let loadErr = null;
      await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => (loadErr = e.message.split('\n')[0]));
      const ms = Date.now() - s;
      const info = await p.evaluate(() => ({
        overflow_px: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        h1: (document.querySelector('h1')?.innerText || '').slice(0, 60),
        error_screen: /something went wrong|page not found|404/i.test(document.body.innerText.slice(0, 3000)),
        redirected_to: location.pathname,
      })).catch(() => ({}));
      if (w === 390 && ['/dashboard', '/profile', '/coding', '/quiz', '/settings', '/community/questions'].includes(path)) {
        await p.screenshot({ path: `${OUT}/shots/page${path.replace(/\//g, '-')}-${w}.png` }).catch(() => {});
      }
      report.pages.push({ width: w, path, load_ms: ms, ...info, page_errors: errs, console_errors: cons, api_5xx: bad, load_error: loadErr });
      await p.close();
    }
    await c.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/ui-walkthrough.json`, JSON.stringify(report, null, 2));
  const probs = report.pages.filter((x) => x.overflow_px > 0 || x.page_errors.length || x.api_5xx.length || x.error_screen || x.load_error);
  console.log(JSON.stringify({ registration: report.registration, pages: report.pages.length, with_problems: probs.length }, null, 2));
})().catch((e) => { console.error(e); process.exit(1); });
