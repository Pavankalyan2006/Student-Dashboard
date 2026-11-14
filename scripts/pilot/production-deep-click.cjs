// Deep interactive sweep of a live deployment: registers a student through the real sign-up form,
// verifies the email (Firebase Admin, test accounts only), completes onboarding, signs in through
// the login form, then on every student page clicks every visible button, tab and in-app link in
// the main content and records what happened:
//   - page errors (uncaught exceptions), API responses >= 500, error toasts, error screens
//   - "dead" controls: a click that changed nothing on screen, made no request and did not navigate
//   - in-app links that lead to a 404 / not-found screen
// Account-destroying controls (log out, delete account, deactivate) are never clicked.
// Needs BASE, FIREBASE_WEB_API_KEY, FIREBASE_SERVICE_ACCOUNT_BASE64. Synthetic @example.test only.
// Usage: BASE=https://site WORKERS=4 WIDTH=1366 [PAGES=/a,/b] node scripts/pilot/production-deep-click.cjs <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const fb = require('./firebase-accounts.cjs');

const BASE = process.env.BASE;
const OUT = process.argv[2] || 'deep-click-out';
const WIDTH = Number(process.env.WIDTH || 1366);
const HEIGHT = WIDTH < 600 ? 844 : 900;
const WORKERS = Number(process.env.WORKERS || 4);
const MAX_CLICKS = Number(process.env.MAX_CLICKS || 60);
fs.mkdirSync(`${OUT}/shots`, { recursive: true });

const ALL_PAGES = [
  '/dashboard', '/semester-command-center', '/ai-agent', '/courses', '/notes', '/documents', '/doubts', '/flashcards',
  '/study-planner', '/languages', '/coding', '/dsa', '/sql-lab', '/ml-lab', '/system-design', '/git', '/labs', '/quiz',
  '/exams', '/interviews', '/assessment/gate-preparation', '/projects', '/github', '/research', '/knowledge', '/career',
  '/resume', '/mock-interviews', '/applications', '/placement', '/integrations', '/profile/external', '/career/jobs',
  '/community', '/community/questions', '/community/discussions', '/community/resources', '/progress', '/goals',
  '/profile', '/profile/edit', '/notifications', '/profile/settings', '/settings', '/sandbox', '/pilot-feedback',
];
const PAGES = process.env.PAGES ? process.env.PAGES.split(',') : ALL_PAGES;
const DANGER = /log ?out|sign ?out|delete (my )?account|deactivate|close account|erase all|delete all my/i;
const ERROR_SCREEN = /something went wrong|page not found|404|failed to load|unable to load/i;

const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
const created = [];

async function api(method, path, token, body) {
  const r = await fetch(`${BASE}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, body: await r.json().catch(() => null) };
}

async function login(browser, proxy, email, password) {
  const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, ignoreHTTPSErrors: Boolean(proxy) });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/login`, { waitUntil: 'networkidle', timeout: 45000 });
  await p.fill('input[type=email]', email);
  await p.fill('input[type=password]', password);
  await p.locator('form button[type=submit]').first().click();
  await p.waitForURL(/dashboard|onboarding/, { timeout: 30000 });
  return { ctx, p };
}

// Clickable controls inside the page content (not the global sidebar / top bar).
async function listControls(p) {
  return p.evaluate(() => {
    const root = document.querySelector('main') || document.body;
    const skip = (el) => el.closest('nav, aside, [data-sidebar], header[role=banner]') && !el.closest('main');
    const out = [];
    const els = root.querySelectorAll('button, [role=tab], [role=button], a[href]');
    els.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      if (r.width < 4 || r.height < 4 || style.visibility === 'hidden' || style.display === 'none') return;
      if (skip(el)) return;
      const label = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      const href = el.tagName === 'A' ? el.getAttribute('href') : null;
      el.setAttribute('data-dc', String(i));
      out.push({ i, tag: el.tagName.toLowerCase(), label, href, disabled: el.disabled || el.getAttribute('aria-disabled') === 'true', target: el.getAttribute('target') });
    });
    return out;
  });
}

async function runWorker(browser, proxy, email, password, pages, wid, results) {
  let { ctx, p } = await login(browser, proxy, email, password);
  const state = { errs: [], bad: [], reqs: 0 };
  const wire = (pg) => {
    pg.on('pageerror', (e) => state.errs.push(e.message.slice(0, 160)));
    pg.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) state.bad.push(`${r.status()} ${r.request().method()} ${r.url().replace(BASE, '').slice(0, 90)}`); });
    pg.on('request', (r) => { if (!/\.(png|svg|jpg|woff2?|css)$/.test(r.url())) state.reqs++; });
    pg.on('dialog', (d) => d.dismiss().catch(() => {}));
  };
  wire(p);
  const open = async (path) => {
    await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    await p.waitForTimeout(400);
    await p.evaluate(() => {
      window.__mut = 0;
      new MutationObserver((m) => { window.__mut += m.length; }).observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    }).catch(() => {});
  };
  for (const path of pages) {
    const pageRes = { path, width: WIDTH, load: {}, controls: 0, clicked: 0, problems: [] };
    state.errs = []; state.bad = [];
    await open(path);
    const bodyText = await p.locator('body').innerText().catch(() => '');
    pageRes.load = { url: p.url().replace(BASE, ''), errors: [...state.errs], api5xx: [...state.bad], error_screen: ERROR_SCREEN.test(bodyText.slice(0, 3000)) };
    if (pageRes.load.error_screen || state.errs.length || state.bad.length) await p.screenshot({ path: `${OUT}/shots/${WIDTH}${path.replace(/\//g, '-')}-load.png` }).catch(() => {});
    let controls = await listControls(p).catch(() => []);
    pageRes.controls = controls.length;
    const seen = new Set();
    for (let k = 0; k < controls.length && pageRes.clicked < MAX_CLICKS; k++) {
      const c = controls[k];
      const key = `${c.tag}|${c.label}|${c.href}`;
      if (seen.has(key)) continue; seen.add(key);
      if (c.disabled || DANGER.test(c.label) || c.target === '_blank') continue;
      if (c.href && /^(https?:|mailto:|tel:)/.test(c.href) && !c.href.startsWith(BASE)) continue;
      // Fresh page for every control so one click's state (an open modal, a changed filter) can't
      // hide or fake the result of the next one.
      if (pageRes.clicked > 0) await open(path);
      const again = await listControls(p).catch(() => []);
      const m = again.find((x) => `${x.tag}|${x.label}|${x.href}` === key);
      if (!m) continue;
      const target = p.locator(`[data-dc="${m.i}"]`).first();
      state.errs = []; state.bad = []; state.reqs = 0;
      await p.evaluate(() => { window.__mut = 0; }).catch(() => {});
      const before = p.url();
      let clickErr = null;
      try { await target.click({ timeout: 3000 }); } catch (e) { clickErr = e.message.split('\n')[0].slice(0, 120); }
      await p.waitForTimeout(1200);
      pageRes.clicked++;
      const after = p.url();
      const mut = await p.evaluate(() => window.__mut || 0).catch(() => -1);
      const toastErr = await p.locator('[data-sonner-toast][data-type=error]').allInnerTexts().catch(() => []);
      const text = await p.locator('body').innerText().catch(() => '');
      const navigated = after !== before;
      const problem = {};
      if (state.errs.length) problem.page_errors = state.errs.slice(0, 2);
      if (state.bad.length) problem.api5xx = state.bad.slice(0, 3);
      if (toastErr.length) problem.error_toast = toastErr.slice(0, 2).map((t) => t.slice(0, 140));
      if (navigated && ERROR_SCREEN.test(text.slice(0, 2000))) problem.leads_to_error_screen = after.replace(BASE, '');
      if (!clickErr && !navigated && mut === 0 && state.reqs === 0) problem.dead = true;
      if (clickErr && !/intercepts pointer|not visible|outside of the viewport|detached/.test(clickErr)) problem.click_error = clickErr;
      if (Object.keys(problem).length) {
        pageRes.problems.push({ control: `${c.tag} "${c.label}"${c.href ? ` -> ${c.href}` : ''}`, ...problem });
        if (!problem.dead) await p.screenshot({ path: `${OUT}/shots/${WIDTH}${path.replace(/\//g, '-')}-${pageRes.clicked}.png` }).catch(() => {});
      }
      if (/\/login/.test(after)) { await ctx.close(); ({ ctx, p } = await login(browser, proxy, email, password)); wire(p); }
    }
    results.push(pageRes);
    console.error(`[w${wid}] ${path}: ${pageRes.clicked}/${pageRes.controls} clicked, ${pageRes.problems.length} problems`);
  }
  await ctx.close();
}

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch(proxy ? { proxy } : {});
  const report = { base: BASE, width: WIDTH, ran_at: new Date().toISOString(), registration: {}, pages: [] };

  // Register through the real sign-up form.
  const email = `deep.click.${uniq()}@example.test`;
  const password = `Deep-Click-${Math.random().toString(36).slice(2, 8)}-9!`;
  {
    const ctx = await browser.newContext({ viewport: { width: WIDTH, height: HEIGHT }, ignoreHTTPSErrors: Boolean(proxy) });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle', timeout: 45000 });
    await page.fill('#full_name', 'Deep Click Student');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirm_password', password);
    const boxes = page.locator('input[type=checkbox]');
    await boxes.nth(0).check(); await boxes.nth(1).check();
    await page.click('button:has-text("Create account")');
    await page.waitForTimeout(6000);
    report.registration.url_after = page.url().replace(BASE, '');
    await ctx.close();
  }
  const si = await fb.signIn(email, password);
  if (!si.body?.localId) throw new Error('registration through the form did not create an account');
  created.push(si.body.localId);
  await fb.markVerified(si.body.localId);
  const tok = (await fb.signIn(email, password)).body.idToken;
  await api('POST', '/auth/firebase/session', tok, { full_name: 'Deep Click Student', accept_terms: true, accept_privacy: true });
  const steps = {
    1: { full_name: 'Deep Click Student', accept_terms: true, accept_privacy: true },
    2: { college: 'Synthetic Institute of Technology', degree: 'B.Tech', branch: 'Computer Science and Engineering', academic_year: 3, current_semester: 5, expected_graduation_year: new Date().getFullYear() + 2, subjects: ['Operating Systems'] },
    3: { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }] },
    4: { projects: [] },
    5: { target_roles: ['Backend Developer'] },
    6: { preferred_languages: ['English'], explanation_style: 'STANDARD', weekly_study_hours: 10 },
  };
  for (const s of [1, 2, 3, 4, 5, 6]) await api('PUT', `/profile/me/onboarding/steps/${s}`, tok, { data: steps[s] });
  report.registration.onboarding_complete = (await api('POST', '/profile/me/onboarding/complete', tok, {})).status;

  const slices = Array.from({ length: WORKERS }, () => []);
  PAGES.forEach((pg, i) => slices[i % WORKERS].push(pg));
  const results = [];
  await Promise.all(slices.map((s, i) => runWorker(browser, proxy, email, password, s, i, results).catch((e) => console.error(`worker ${i} failed`, e.message))));
  report.pages = results.sort((a, b) => PAGES.indexOf(a.path) - PAGES.indexOf(b.path));

  for (const uid of created) await fb.deleteAccount(uid).catch(() => {});
  report.firebase_users_deleted = created.length;
  await browser.close();
  fs.writeFileSync(`${OUT}/deep-click.json`, JSON.stringify(report, null, 2));
  const total = report.pages.reduce((n, x) => n + x.clicked, 0);
  const probs = report.pages.flatMap((x) => [
    ...(x.load.errors.length || x.load.api5xx.length || x.load.error_screen ? [{ path: x.path, control: '(page load)', ...x.load }] : []),
    ...x.problems.map((pr) => ({ path: x.path, ...pr })),
  ]);
  console.log(JSON.stringify({ registration: report.registration, pages: report.pages.length, clicks: total, problems: probs.length }, null, 2));
})().catch(async (e) => { console.error(e); for (const uid of created) await fb.deleteAccount(uid).catch(() => {}); process.exit(1); });
