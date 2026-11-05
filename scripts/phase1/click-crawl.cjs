// Clicks every visible, non-destructive button on each route as a fresh synthetic student and
// records what happened: navigation, API requests (and failures), DOM change, console/page errors.
// Usage: BASE=http://localhost:3000 node scripts/phase1/click-crawl.cjs routes(comma) out.json
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const routes = process.argv[2].split(',');
const SKIP = /delete|remove|log ?out|sign ?out|reset|clear all|discard|unenroll|archive/i;
async function api(token, method, p, body) {
  const r = await fetch(BASE + '/api/v1' + p, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return r.json().catch(() => ({}));
}
(async () => {
  const reg = await api(null, 'POST', '/auth/register', { name: 'Phase One Crawler', email: `p1.${Date.now()}@example.test`, password: 'TestPass123' });
  const token = reg.data.token;
  await api(token, 'POST', '/students/me/onboarding/complete', {});
  // Seed a little real content so list pages have something to act on.
  const courses = await api(token, 'GET', '/courses?limit=3');
  const cid = courses?.data?.items?.[0]?.id; if (cid) await api(token, 'POST', `/courses/${cid}/enroll`, {});
  await api(token, 'POST', '/notes', { title: 'Crawler note', content: 'Normalization: 1NF, 2NF, 3NF.' });
  await api(token, 'POST', '/flashcards/decks', { title: 'Crawler deck', subject: 'DBMS' });
  const b = await chromium.launch(); const results = [];
  for (const route of routes) {
    const ctx = await b.newContext({ viewport: { width: 1366, height: 900 } });
    await ctx.addInitScript(t => localStorage.setItem('auth_token', t), token);
    const p = await ctx.newPage(); p.setDefaultTimeout(4000);
    const errs = []; const reqs = [];
    p.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 200)));
    p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
    p.on('response', r => { const u = r.url(); if (u.includes('/api/')) reqs.push({ m: r.request().method(), u: u.replace(BASE, '').split('?')[0], s: r.status() }); });
    await p.goto(BASE + route, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    const loadErrs = errs.splice(0); const loadReqs = reqs.splice(0);
    const labels = await p.evaluate(() => [...document.querySelectorAll('main button, main [role=tab], main a[href]')]
      .filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.disabled; })
      .map(e => (e.getAttribute('aria-label') || e.textContent || e.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 60)));
    const uniq = [...new Set(labels)].filter(l => l && !SKIP.test(l)).slice(0, 70);
    const clicks = [];
    for (const label of uniq) {
      await p.goto(BASE + route, { waitUntil: 'load' }); await p.waitForTimeout(1500); errs.length = 0; reqs.length = 0;
      const before = await p.evaluate(() => document.querySelector('main')?.innerHTML.length || 0);
      const url0 = p.url(); let clicked = true;
      try {
        const loc = p.locator('main').locator('button, [role=tab], a[href]').filter({ hasText: label }).first();
        if (await loc.count() === 0) { const l2 = p.locator(`main [aria-label="${label.replace(/"/g, '\\"')}"]`).first(); await l2.click({ timeout: 3000 }); }
        else await loc.click({ timeout: 3000 });
      } catch (e) { clicked = false; }
      await p.waitForTimeout(1200);
      const after = await p.evaluate(() => (document.querySelector('main')?.innerHTML.length || 0) + document.querySelectorAll('[role=dialog]').length * 100000);
      const effect = p.url() !== url0 ? 'navigated:' + p.url().replace(BASE, '') : reqs.length ? 'api' : after !== before ? 'ui-change' : 'NO-EFFECT';
      clicks.push({ label, clicked, effect, failedApi: reqs.filter(r => r.s >= 400), errors: errs.slice(0, 3) });
      await p.keyboard.press('Escape').catch(() => {});
    }
    results.push({ route, loadErrors: loadErrs, loadFailedApi: loadReqs.filter(r => r.s >= 400), buttons: uniq.length, clicks });
    console.log(route, 'buttons', uniq.length, 'no-effect', clicks.filter(c => c.effect === 'NO-EFFECT').length, 'failedApi', clicks.reduce((a, c) => a + c.failedApi.length, 0), 'errors', clicks.reduce((a, c) => a + c.errors.length, 0));
    await ctx.close();
  }
  require('fs').writeFileSync(process.argv[3], JSON.stringify(results, null, 2)); await b.close();
})();
