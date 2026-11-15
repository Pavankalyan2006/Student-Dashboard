// Phase 8 QA: visits every client route as a newly registered student, at desktop and phone width,
// and records for each one:
//   - uncaught page errors and console errors
//   - API responses of 500 or more (and 4xx, listed separately)
//   - a not-found or "something went wrong" screen
//   - a blank main area
//   - content wider than the window (sideways scrolling on a phone)
// Usage: BASE=http://localhost:3100 OUT=dir [WIDTHS=1366,390] [ROUTES=/a,/b] node scripts/audit/phase8-route-sweep.cjs
// Runs against a local server only by default; it registers one @example.test student.
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = process.env.BASE || 'http://localhost:3100';
const OUT = process.env.OUT || 'phase8-sweep';
const WIDTHS = (process.env.WIDTHS || '1366,390').split(',').map(Number);
const ROUTES_FILE = process.env.ROUTES_FILE;
const routes = process.env.ROUTES
  ? process.env.ROUTES.split(',')
  : ROUTES_FILE
    ? fs.readFileSync(ROUTES_FILE, 'utf8').split(/\s+/).filter(Boolean)
    : [];

(async () => {
  fs.mkdirSync(`${OUT}/shots`, { recursive: true });
  const email = `p8.sweep.${Date.now()}@example.test`;
  const reg = await fetch(`${BASE}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ full_name: 'Sweep Student', name: 'Sweep Student', email, password: 'Str0ng!Passw0rd#2026', semester: 5 }),
  }).then((r) => r.json());
  const token = reg.data?.token;
  if (!token) throw new Error(`register failed: ${JSON.stringify(reg).slice(0, 200)}`);
  await fetch(`${BASE}/api/v1/students/me/onboarding/complete`, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: '{}' });

  const browser = await chromium.launch();
  const results = [];
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 600 ? 844 : 900 } });
    await ctx.addInitScript((t) => localStorage.setItem('auth_token', t), token);
    for (const route of routes) {
      const page = await ctx.newPage();
      const errors = [];
      const api5xx = [];
      const api4xx = [];
      page.on('pageerror', (e) => errors.push(`PAGEERROR ${e.message.slice(0, 200)}`));
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)); });
      page.on('response', (res) => {
        const u = res.url();
        if (!u.includes('/api/')) return;
        const line = `${res.status()} ${res.request().method()} ${u.replace(BASE, '')}`;
        if (res.status() >= 500) api5xx.push(line);
        else if (res.status() >= 400) api4xx.push(line);
      });
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 });
      } catch (e) {
        errors.push(`GOTO ${e.message.slice(0, 100)}`);
      }
      await page.waitForTimeout(800);
      const info = await page.evaluate(() => {
        const main = document.querySelector('main') || document.body;
        const text = (main.innerText || '').replace(/\s+/g, ' ').trim();
        return {
          text: text.slice(0, 300),
          length: text.length,
          h1: (document.querySelector('h1')?.textContent || '').trim().slice(0, 80),
          overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth,
        };
      });
      const r = {
        width,
        route,
        final: page.url().replace(BASE, ''),
        h1: info.h1,
        notFound: /page not found|\b404\b/i.test(info.text.slice(0, 300)),
        crashed: /something went wrong/i.test(info.text),
        blank: info.length < 20,
        overflow: info.overflow > 2 ? info.overflow : 0,
        errors: [...new Set(errors)],
        api5xx: [...new Set(api5xx)],
        api4xx: [...new Set(api4xx)],
      };
      if (r.notFound || r.crashed || r.blank || r.overflow || r.errors.length || r.api5xx.length) {
        await page.screenshot({ path: `${OUT}/shots/${width}${route.replace(/\//g, '_')}.png` }).catch(() => {});
      }
      results.push(r);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
  const bad = results.filter((r) => r.notFound || r.crashed || r.blank || r.overflow || r.errors.length || r.api5xx.length);
  console.log(`checked ${results.length} page loads (${routes.length} routes x ${WIDTHS.length} widths); ${bad.length} with problems`);
  for (const r of bad) console.log(JSON.stringify(r));
})();
