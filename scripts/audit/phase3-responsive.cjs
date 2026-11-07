// Phase 3 batch 5: responsive and smoke check of the 12 Phase 3 module pages at 390, 768 and 1366 px for a fresh
// synthetic student. Records horizontal overflow, uncaught page errors, console errors, API 5xx and whether the page
// has a main landmark and an h1. Screenshots for 390 and 1366 go to docs/phase-3-audit/evidence/resp-*.png.
const { chromium } = require('playwright');
(async () => {
  const BASE = process.env.BASE || 'http://localhost:3400';
  const j = (p, t, body) => fetch(BASE + '/api/v1' + p, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());
  const reg = await j('/auth/register', null, { email: `p3resp${Date.now()}@example.test`, password: 'TestPass123', name: 'P3 Responsive' });
  const t = reg.data.token;
  await j('/students/me/onboarding/complete', t, {});
  const pages = [
    ['mock-interviews', '/mock-interviews'], ['projects', '/projects'], ['github', '/github'], ['git', '/git'],
    ['research', '/research'], ['knowledge-base', '/knowledge-base'], ['documents', '/documents'], ['career', '/career'],
    ['resume', '/resume'], ['applications', '/career/applications'], ['placements', '/placements'],
    ['integrations', '/integrations'], ['external-profiles', '/profile/external'], ['jobs', '/jobs'],
  ];
  const b = await chromium.launch();
  let problems = 0;
  for (const [w, h] of [[390, 844], [768, 1024], [1366, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((x) => localStorage.setItem('auth_token', x), t);
    for (const [name, path] of pages) {
      const p = await ctx.newPage();
      const errs = []; p.on('pageerror', (e) => errs.push(e.message.slice(0, 120)));
      const cons = []; p.on('console', (m) => { if (m.type() === 'error') cons.push(m.text().slice(0, 120)); });
      const bad = []; p.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) bad.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
      await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
      await p.waitForTimeout(700);
      const info = await p.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        main: !!document.querySelector('main'),
        h1: document.querySelectorAll('h1').length,
        unlabeledButtons: Array.from(document.querySelectorAll('button')).filter((x) => !(x.innerText || '').trim() && !x.getAttribute('aria-label') && !x.getAttribute('title')).length,
      }));
      if (w !== 768) await p.screenshot({ path: `docs/phase-3-audit/evidence/resp-${name}-${w}.png` });
      const ok = info.overflow <= 0 && errs.length === 0 && bad.length === 0;
      if (!ok) problems++;
      console.log(JSON.stringify({ ok, width: w, page: path, ...info, page_errors: errs, console_errors: cons.length, api_5xx: bad }));
      await p.close();
    }
    await ctx.close();
  }
  console.log(`\n${pages.length * 3 - problems}/${pages.length * 3} page/width combinations with no overflow, page error or API 5xx`);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
