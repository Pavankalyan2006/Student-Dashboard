// Phase 3 browser check for batch 4 pages at 1366px and 390px: Applications Tracker, Placement Prep, Integrations Center,
// External Profile Hub, Profile Settings and Jobs Discovery. A fresh synthetic student has linked nothing, so no page may say "Connected".
const { chromium } = require('playwright');
(async () => {
  const BASE = 'http://localhost:3400';
  const j = (p, t, body) => fetch(BASE + '/api/v1' + p, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json());
  const reg = await j('/auth/register', null, { email: `p3b4ui${Date.now()}@example.test`, password: 'TestPass123', name: 'P3 Batch4 UI' });
  const t = reg.data.token;
  await j('/students/me/onboarding/complete', t, {});
  await j('/external-profiles', t, { platform_id: 'leetcode', profile_url: 'https://leetcode.com/u/synthetic-ui/' });
  const pages = [
    ['applications', '/career/applications'],
    ['placements', '/placements'],
    ['integrations', '/integrations'],
    ['external-profiles', '/profile/external'],
    ['settings', '/settings'],
    ['jobs', '/jobs'],
  ];
  const b = await chromium.launch();
  for (const [w, h] of [[1366, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript((x) => localStorage.setItem('auth_token', x), t);
    for (const [name, path] of pages) {
      const p = await ctx.newPage();
      const errs = []; p.on('pageerror', (e) => errs.push(e.message));
      const bad = []; p.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 500) bad.push(`${r.status()} ${r.url().replace(BASE, '')}`); });
      await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 });
      if (name === 'settings') {
        const tab = p.locator('main').getByRole('button', { name: 'Connected Platforms', exact: true }).first();
        if (await tab.count()) await tab.click();
      }
      await p.waitForTimeout(1200);
      const text = await p.evaluate(() => document.body.innerText);
      // "Connected" as a status word (not "Not connected", "Connected Platforms" headings or "connected feeds").
      const connectedClaims = (text.replace(/shows as Connected only after/g, '').match(/(^|[^a-z])CONNECTED(?! PLATFORMS)|\bConnected\b(?! Platforms| platforms| public)/g) || []).length;
      const notLinked = /LINKED · NOT VERIFIED|Not verified|not verified|NOT LINKED|Profile link only|Linked/i.test(text);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await p.screenshot({ path: `docs/phase-3-audit/evidence/b4-${name}-${w}.png` });
      console.log(JSON.stringify({ width: w, page: path, connected_claims: connectedClaims, shows_linked_or_unverified: notLinked, overflow, page_errors: errs, api_5xx: bad }));
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
