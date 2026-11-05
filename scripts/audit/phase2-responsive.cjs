// Phase 2 responsive + basic accessibility sweep over the 12 lab and assessment pages.
// Usage: BASE=http://localhost:3000 node scripts/audit/phase2-responsive.cjs [out.json]
// Registers a synthetic student, adds a little data (note, deck, plan, language), then loads each
// Phase 1 page at 360/390/768/1024/1366/1440px and records horizontal overflow, the widest offending
// elements, unlabeled buttons, inputs without an accessible name, images without alt, and h1 count.
const { chromium } = require('playwright');
const BASE = process.env.BASE || 'http://localhost:3000';
const WIDTHS = [360, 390, 768, 1024, 1366, 1440];
const ROUTES = ['/coding', '/dsa', '/sql-lab', '/sandbox', '/ml-lab', '/system-design', '/labs', '/viva', '/quiz',
  '/exams', '/assessment/gate-preparation'];
(async () => {
  const api = (path, method, token, body) => fetch(BASE + '/api/v1' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined }).then((r) => r.json()).catch(() => ({}));
  const reg = await api('/auth/register', 'POST', null, { name: 'Responsive Check P2', email: `resp.${Date.now()}@example.test`, password: 'TestPass123' });
  const t = reg.data.token;
  await api('/students/me/onboarding/complete', 'POST', t, {});
  await api('/labs', 'POST', t, { name: 'OS Lab', subject: 'Operating Systems', semester: 5 });
  await api('/exams', 'POST', t, { title: 'OS End Sem', subject: 'Operating Systems', exam_date: new Date(Date.now() + 864e6).toISOString().slice(0, 10), syllabus: 'Scheduling, Deadlocks, Paging' });
  await api('/quiz', 'POST', t, { title: 'Networks', source_type: 'TOPIC', questions: [{ question_text: '2+2?', question_type: 'MCQ', options: ['3', '4'], correct_answer: '4' }] });
  const b = await chromium.launch();
  const out = [];
  for (const w of WIDTHS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
    await ctx.addInitScript((x) => localStorage.setItem('auth_token', x), t);
    for (const r of ROUTES) {
      const p = await ctx.newPage();
      const errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
      await p.waitForTimeout(700);
      const m = await p.evaluate(() => {
        const iw = window.innerWidth;
        const visible = (el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed';
        const name = (el) => (el.innerText || '').trim() || el.getAttribute('aria-label') || el.getAttribute('title') || (el.getAttribute('aria-labelledby') ? 'lb' : '');
        const offenders = [...document.querySelectorAll('main *')].filter((el) => {
          const rc = el.getBoundingClientRect();
          if (rc.width === 0 || rc.right <= iw + 1) return false;
          // ignore content inside horizontally scrollable containers
          for (let a = el.parentElement; a; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return false; }
          return true;
        }).slice(0, 3).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 3).join('.')} right=${Math.round(el.getBoundingClientRect().right)}`);
        const inputs = [...document.querySelectorAll('input:not([type=hidden]),textarea,select')].filter(visible).filter((i) => {
          if (i.getAttribute('aria-label') || i.getAttribute('aria-labelledby') || i.getAttribute('title')) return false;
          if (i.id && document.querySelector(`label[for="${CSS.escape(i.id)}"]`)) return false;
          if (i.closest('label')) return false;
          return true;
        });
        return {
          sw: document.documentElement.scrollWidth, iw,
          h1: document.querySelectorAll('h1').length,
          unlabeledButtons: [...document.querySelectorAll('button')].filter(visible).filter((x) => !name(x)).length,
          unlabeledInputs: inputs.length,
          unlabeledInputPlaceholders: inputs.slice(0, 3).map((i) => i.getAttribute('placeholder') || i.type),
          imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
          offenders,
        };
      });
      const row = { width: w, route: r, overflow: m.sw > m.iw, ...m, pageErrors: errors.slice(0, 2) };
      out.push(row);
      console.log(JSON.stringify(row));
      await p.close();
    }
    await ctx.close();
  }
  require('fs').writeFileSync(process.argv[2] || 'phase2-responsive.json', JSON.stringify(out, null, 2));
  await b.close();
})();
