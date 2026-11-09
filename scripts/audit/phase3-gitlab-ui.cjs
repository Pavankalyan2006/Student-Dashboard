// Phase 3 browser check of the Git practice lab: registers a synthetic student, solves the first exercise in the UI at 1366px and 390px,
// and reports horizontal overflow, passed checks and page errors. Needs the server on localhost:3400 and Playwright. Screenshots go to /tmp/p3/shots.
const { chromium } = require('playwright');
(async () => {
  const BASE = 'http://localhost:3400';
  const reg = await fetch(BASE + '/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: `p3ui${Date.now()}@example.test`, password: 'TestPass123', name: 'P3 UI' }) }).then((r) => r.json());
  const t = reg.data.token;
  await fetch(BASE + '/api/v1/students/me/onboarding/complete', { method: 'POST', headers: { Authorization: 'Bearer ' + t, 'Content-Type': 'application/json' }, body: '{}' });
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((x) => localStorage.setItem('auth_token', x), t);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(BASE + '/git', { waitUntil: 'networkidle', timeout: 45000 });
    await p.getByRole('button', { name: /Your first commit/ }).first().click();
    await p.waitForSelector('#git-cmd');
    for (const c of ['git init', 'echo "My project" > README.md', 'git add README.md', 'git commit -m "Add README"']) {
      console.log('cmd', c); await p.fill('#git-cmd', c, { timeout: 5000 }).catch(async (e) => { await p.screenshot({ path: '/tmp/p3/shots/fail.png' }); throw e; }); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
    }
    await p.waitForTimeout(600);
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const passed = await p.locator('[aria-label="passed"]').count();
    console.log(w, 'overflow', overflow, 'checks passed', passed, 'completed text', await p.getByText('What happened').count(), 'errors', errs.join('|'));
    await p.screenshot({ path: `/tmp/p3/shots/git-${w}.png`, fullPage: false });
    await ctx.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
