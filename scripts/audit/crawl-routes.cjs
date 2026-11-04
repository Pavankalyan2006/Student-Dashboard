const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const routes = (process.env.ROUTES || '').split(',').filter(Boolean);
const OUT = process.env.OUT || 'shots';
(async () => {
  const fs = require('fs'); fs.mkdirSync(OUT, { recursive: true });
  const email = `crawl.${Date.now()}@example.test`;
  const reg = await fetch(BASE + '/api/v1/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Crawl Student', email, password: 'TestPass123', semester: 5 }) }).then(r => r.json());
  const token = reg.data.token;
  const c = await fetch(BASE + '/api/v1/students/me/onboarding/complete', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: '{}' });
  console.log('onboarding complete status', c.status, (await c.text()).slice(0, 200));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await ctx.addInitScript(t => localStorage.setItem('auth_token', t), token);
  const results = [];
  for (const r of routes) {
    const page = await ctx.newPage();
    const errs = [], bad = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0, 200)));
    page.on('response', res => { const u = res.url(); if (u.includes('/api/') && res.status() >= 400) bad.push(`${res.status()} ${res.request().method()} ${u.replace(BASE, '')}`); });
    try { await page.goto(BASE + r, { waitUntil: 'networkidle', timeout: 30000 }); } catch (e) { errs.push('GOTO ' + e.message.slice(0, 100)); }
    await page.waitForTimeout(1200);
    const body = (await page.locator('main').first().innerText().catch(() => page.locator('body').innerText())).replace(/\s+/g, ' ');
    const h1 = await page.locator('h1').first().innerText().catch(() => '');
    const notFound = /page not found|404/i.test(body.slice(0, 400));
    const crashed = /something went wrong/i.test(body);
    const name = r.replace(/\//g, '_') || 'root';
    await page.screenshot({ path: `${OUT}/${name}.png` });
    results.push({ route: r, finalUrl: page.url().replace(BASE, ''), h1, notFound, crashed, errs: [...new Set(errs)], bad: [...new Set(bad)], snippet: body.slice(0, 160) });
    await page.close();
  }
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
  for (const x of results) console.log(JSON.stringify(x));
  await browser.close();
})();
