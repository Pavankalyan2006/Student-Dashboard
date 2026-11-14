// Production browser walkthrough against a Firebase-auth deployment (e.g. Vercel).
//  1. Signs up through the real registration form (phone size) and records what the student sees
//     (with Firebase, a verify-your-email step is expected before onboarding can be finished).
//  2. Creates a second account through Firebase, marks it verified (admin, test only), completes
//     onboarding through the API, signs in through the real login form, then visits every student
//     page at 390 px and 1366 px recording errors, API 5xx, overflow and error screens.
//  3. Deletes both Firebase accounts.
// Needs FIREBASE_WEB_API_KEY and FIREBASE_SERVICE_ACCOUNT_BASE64. Synthetic emails only (@example.test).
// Usage: BASE=https://site node scripts/pilot/production-ui-walkthrough.cjs <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const fb = require('./firebase-accounts.cjs');
const BASE = process.env.BASE;
const OUT = process.argv[2] || 'prod-ui-out';
fs.mkdirSync(`${OUT}/shots`, { recursive: true });
const ALL_PAGES = [
  '/dashboard', '/semester-command-center', '/ai-agent', '/courses', '/notes', '/documents', '/doubts', '/flashcards',
  '/study-planner', '/languages', '/coding', '/dsa', '/sql-lab', '/ml-lab', '/system-design', '/git', '/labs', '/quiz',
  '/exams', '/interviews', '/assessment/gate-preparation', '/projects', '/github', '/research', '/knowledge', '/career',
  '/resume', '/mock-interviews', '/applications', '/placement', '/integrations', '/profile/external', '/career/jobs',
  '/community', '/community/questions', '/community/discussions', '/community/resources', '/progress', '/goals',
  '/profile', '/profile/edit', '/notifications', '/profile/settings', '/settings', '/sandbox',
];
const PAGES = process.env.PAGES ? process.env.PAGES.split(',') : ALL_PAGES;
const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const created = [];

async function api(method, path, token, body) {
  const r = await fetch(`${BASE}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json().catch(() => null) };
}

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch(proxy ? { proxy } : {});
  const report = { base: BASE, ran_at: new Date().toISOString(), registration_ui: {}, login_ui: {}, pages: [] };

  // ---- 1. Registration form ----
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: Boolean(proxy) });
    const page = await ctx.newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    const email = `prod.ui.reg.${uniq()}@example.test`;
    try {
      await page.goto(`${BASE}/register`, { waitUntil: 'networkidle', timeout: 45000 });
      await page.screenshot({ path: `${OUT}/shots/register-form-390.png`, fullPage: true });
      await page.fill('#full_name', 'Prod UI Synthetic');
      await page.fill('#email', email);
      await page.fill('#password', 'ProdUi-Pass-77!');
      await page.fill('#confirm_password', 'ProdUi-Pass-77!');
      const boxes = page.locator('input[type=checkbox]');
      await boxes.nth(0).check(); await boxes.nth(1).check();
      await page.click('button:has-text("Create account")');
      await page.waitForTimeout(6000);
      await page.screenshot({ path: `${OUT}/shots/register-after-submit-390.png`, fullPage: true });
      const text = (await page.locator('body').innerText()).slice(0, 1500);
      report.registration_ui = { url_after: page.url().replace(BASE, ''), shows_verify_email: /verif/i.test(text), shows_next_step: (await page.locator('#college').count()) > 0, error_text: (text.match(/(error|failed|could not|invalid)[^\n]{0,120}/i) || [null])[0], page_errors: errs };
    } catch (e) {
      report.registration_ui = { error: e.message.split('\n')[0], page_errors: errs };
      await page.screenshot({ path: `${OUT}/shots/register-failure-390.png`, fullPage: true }).catch(() => {});
    }
    const si = await fb.signIn(email, 'ProdUi-Pass-77!');
    if (si.body?.localId) created.push(si.body.localId);
    report.registration_ui.firebase_account_created = Boolean(si.body?.localId);
    await ctx.close();
  }

  // ---- 2. Verified student, login form, page sweep ----
  const email = `prod.ui.${uniq()}@example.test`;
  const password = 'ProdUi-Pass-88!';
  const su = await fb.signUp(email, password);
  if (su.body?.localId) created.push(su.body.localId);
  await fb.markVerified(su.body?.localId);
  const tok = (await fb.signIn(email, password)).body?.idToken;
  await api('POST', '/auth/firebase/session', tok, { full_name: 'Prod UI Student', accept_terms: true, accept_privacy: true });
  const steps = {
    1: { full_name: 'Prod UI Student', accept_terms: true, accept_privacy: true },
    2: { college: 'Synthetic Institute of Technology', degree: 'B.Tech', branch: 'Computer Science and Engineering', academic_year: 3, current_semester: 5, expected_graduation_year: new Date().getFullYear() + 2, subjects: ['Operating Systems'] },
    3: { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }] },
    4: { projects: [] },
    5: { target_roles: ['Backend Developer'] },
    6: { preferred_languages: ['English'], explanation_style: 'STANDARD', weekly_study_hours: 10 },
  };
  for (const s of [1, 2, 3, 4, 5, 6]) await api('PUT', `/profile/me/onboarding/steps/${s}`, tok, { data: steps[s] });
  const done = await api('POST', '/profile/me/onboarding/complete', tok, {});
  report.login_ui.onboarding_complete_status = done.status;

  for (const [w, h] of [[390, 844], [1366, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, ignoreHTTPSErrors: Boolean(proxy) });
    const lp = await ctx.newPage();
    const lerr = []; lp.on('pageerror', (e) => lerr.push(e.message.slice(0, 160)));
    try {
      await lp.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 45000 });
      await lp.fill('input[type=email]', email);
      await lp.fill('input[type=password]', password);
      await lp.locator('form button[type=submit]').first().click();
      await lp.waitForURL(/dashboard|onboarding/, { timeout: 30000 });
      report.login_ui[`w${w}`] = { ok: true, landed: lp.url().replace(BASE, ''), page_errors: lerr };
    } catch (e) {
      report.login_ui[`w${w}`] = { ok: false, error: e.message.split('\n')[0], landed: lp.url().replace(BASE, ''), page_errors: lerr };
      await lp.screenshot({ path: `${OUT}/shots/login-failure-${w}.png`, fullPage: true }).catch(() => {});
    }
    await lp.close();
    for (const path of PAGES) {
      const p = await ctx.newPage();
      const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
      const cons = []; p.on('console', (m) => { if (m.type() === 'error' && !/net::ERR|favicon/.test(m.text())) cons.push(m.text().slice(0, 140)); });
      const bad = []; p.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) bad.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
      const s = Date.now();
      let loadErr = null;
      await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => (loadErr = e.message.split('\n')[0]));
      const ms = Date.now() - s;
      const info = await p.evaluate(() => ({
        overflow_px: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        h1: (document.querySelector('h1')?.innerText || '').slice(0, 60),
        error_screen: /something went wrong|page not found|failed to load|unable to load/i.test(document.body.innerText.slice(0, 4000)),
        redirected_to: location.pathname,
        overflow_by: (() => {
          const W = window.innerWidth;
          const over = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.left < W && r.right > W + 1; };
          const name = (el) => el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\s+/).slice(0, 5).join('.') : '');
          const leaves = [...document.body.querySelectorAll('*')].filter((el) => over(el) && ![...el.children].some(over));
          return leaves.slice(0, 3).map((el) => ({ sel: name(el).slice(0, 140), parent: name(el.parentElement).slice(0, 100), over: Math.round(el.getBoundingClientRect().right - W), w: Math.round(el.getBoundingClientRect().width) }));
        })(),
      })).catch(() => ({}));
      if (info.error_screen || errs.length || bad.length || loadErr || ['/dashboard', '/profile', '/ai-agent', '/courses'].includes(path)) {
        await p.screenshot({ path: `${OUT}/shots/page${path.replace(/\//g, '-')}-${w}.png` }).catch(() => {});
      }
      report.pages.push({ width: w, path, load_ms: ms, ...info, page_errors: errs, console_errors: cons, api_5xx: bad, load_error: loadErr });
      await p.close();
    }
    await ctx.close();
  }
  await browser.close();
  for (const uid of created) await fb.deleteAccount(uid);
  report.firebase_users_deleted = created.length;
  fs.writeFileSync(`${OUT}/ui-walkthrough.json`, JSON.stringify(report, null, 2));
  const probs = report.pages.filter((x) => x.overflow_px > 0 || x.page_errors.length || x.api_5xx.length || x.error_screen || x.load_error || x.redirected_to === '/login');
  console.log(JSON.stringify({ registration_ui: report.registration_ui, login_ui: report.login_ui, pages: report.pages.length, with_problems: probs.length, problems: probs.map((x) => ({ w: x.width, path: x.path, to: x.redirected_to, err: x.page_errors[0], api: x.api_5xx[0], screen: x.error_screen, load: x.load_error, of: x.overflow_px, by: x.overflow_px ? x.overflow_by : undefined })) }, null, 2));
})().catch(async (e) => { console.error(e); for (const uid of created) await fb.deleteAccount(uid).catch(() => {}); process.exit(1); });
