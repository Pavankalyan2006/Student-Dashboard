// Fills and submits every "create / add / new / ask / post" flow on the live site through the UI.
// For each page: clicks each create-style button, fills every visible empty field with valid test
// data, submits, and records success/error toasts, API 4xx/5xx and page errors. Then reloads the page
// and checks the new item's text is still shown (saved, not just optimistic).
// Same account set-up as production-deep-click.cjs. Synthetic @example.test accounts only.
// Usage: BASE=https://site [PAGES=/a,/b] node scripts/pilot/production-form-fill.cjs <outdir>
const { chromium } = require('playwright');
const fs = require('fs');
const fb = require('./firebase-accounts.cjs');
const BASE = process.env.BASE;
const OUT = process.argv[2] || 'form-fill-out';
fs.mkdirSync(`${OUT}/shots`, { recursive: true });
const PAGES = (process.env.PAGES || '/notes,/documents,/doubts,/flashcards,/study-planner,/projects,/research,/knowledge,/goals,/applications,/community/questions,/community/discussions,/community/resources,/resume,/profile/external,/exams,/quiz,/interviews,/mock-interviews,/career,/placement,/integrations,/github,/courses,/sql-lab,/git,/ml-lab,/system-design').split(',');
const OPENERS = /^\s*(\+\s*)?(create|add|new|ask|post|start|generate|upload|write|track|log|plan|schedule|submit)\b/i;
const SUBMIT = /^\s*(create|save|add|post|submit|generate|ask|start|upload|publish|track|log|schedule|solve|continue|confirm)\b/i;
const SKIP = /log ?out|sign ?out|delete|remove|account/i;
const created = [];
const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 5)}`;

async function api(method, path, token, body) {
  const r = await fetch(`${BASE}/api/v1${path}`, { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined });
  return r.status;
}

async function fillVisible(scope, marker) {
  return scope.evaluate((marker) => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const set = (el, v) => {
      const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : el.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    };
    const filled = [];
    const d = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    for (const el of document.querySelectorAll('input, textarea, select')) {
      if (!vis(el) || el.disabled || el.readOnly) continue;
      const t = (el.getAttribute('type') || el.tagName).toLowerCase();
      if (['hidden', 'file', 'checkbox', 'radio', 'submit', 'button', 'search', 'range', 'color'].includes(t)) continue;
      if (el.closest('nav, aside, header')) continue;
      const name = (el.getAttribute('name') || el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.id || t).slice(0, 40);
      if (/search|filter/i.test(name)) continue;
      if (el.tagName === 'SELECT') { if (el.options.length > 1 && !el.value) { set(el, el.options[1].value); filled.push(name); } continue; }
      if (el.value) continue;
      let v = `${marker} ${name.replace(/[^a-z0-9 ]/gi, '').slice(0, 12)}`.trim();
      if (el.maxLength > 0 && v.length > el.maxLength) v = v.slice(0, el.maxLength);
      if (t === 'email') v = `${marker.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.test`;
      else if (t === 'number') v = el.min && Number(el.min) > 1 ? el.min : '3';
      else if (t === 'date') v = d;
      else if (t === 'datetime-local') v = `${d}T10:00`;
      else if (t === 'time') v = '10:00';
      else if (t === 'url' || /url|link|github|website/i.test(name)) v = 'https://example.com/e2e';
      else if (t === 'textarea') v = `${marker}: this is an end-to-end test entry written by the automated check. It explains the topic in a few sentences so validation that needs a longer text passes.`;
      set(el, v); filled.push(name);
    }
    return filled;
  }, marker);
}

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const browser = await chromium.launch(proxy ? { proxy } : {});
  const email = `form.fill.${uniq()}@example.test`;
  const password = `Form-Fill-${Math.random().toString(36).slice(2, 8)}-9!`;
  const su = await fb.signUp(email, password);
  created.push(su.body.localId);
  await fb.markVerified(su.body.localId);
  const tok = (await fb.signIn(email, password)).body.idToken;
  await api('POST', '/auth/firebase/session', tok, { full_name: 'Form Fill Student', accept_terms: true, accept_privacy: true });
  const steps = { 1: { full_name: 'Form Fill Student', accept_terms: true, accept_privacy: true }, 2: { college: 'Synthetic Institute of Technology', degree: 'B.Tech', branch: 'Computer Science and Engineering', academic_year: 3, current_semester: 5, expected_graduation_year: new Date().getFullYear() + 2, subjects: ['Operating Systems'] }, 3: { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }] }, 4: { projects: [] }, 5: { target_roles: ['Backend Developer'] }, 6: { preferred_languages: ['English'], explanation_style: 'STANDARD', weekly_study_hours: 10 } };
  for (const s of [1, 2, 3, 4, 5, 6]) await api('PUT', `/profile/me/onboarding/steps/${s}`, tok, { data: steps[s] });
  await api('POST', '/profile/me/onboarding/complete', tok, {});

  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 }, ignoreHTTPSErrors: Boolean(proxy) });
  const p = await ctx.newPage();
  const st = { errs: [], api: [] };
  p.on('pageerror', (e) => st.errs.push(e.message.slice(0, 160)));
  p.on('response', (r) => { if (r.url().includes('/api/') && r.status() >= 400 && r.request().method() !== 'GET') st.api.push(`${r.status()} ${r.request().method()} ${r.url().replace(BASE, '').slice(0, 80)}`); });
  p.on('dialog', (d) => d.accept().catch(() => {}));
  await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await p.fill('input[type=email]', email); await p.fill('input[type=password]', password);
  await p.locator('form button[type=submit]').first().click();
  await p.waitForURL(/dashboard|onboarding/, { timeout: 30000 });

  // Record every toast as it appears (they disappear after a few seconds).
  await ctx.addInitScript(() => {
    window.__toasts = [];
    const seen = new WeakSet();
    new MutationObserver(() => {
      document.querySelectorAll('[data-sonner-toast]').forEach((t) => {
        if (seen.has(t) || !t.innerText.trim()) return;
        seen.add(t);
        window.__toasts.push({ type: t.getAttribute('data-type') || 'default', text: t.innerText.trim().slice(0, 160) });
      });
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
  const results = [];
  for (const path of PAGES) {
    await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
    const openers = await p.locator('main button').evaluateAll((els, re) => els.map((e) => (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ')).filter((t) => new RegExp(re, 'i').test(t)), OPENERS.source).catch(() => []);
    const uniqOpeners = [...new Set(openers)].filter((t) => !SKIP.test(t)).slice(0, 6);
    if (!uniqOpeners.length) { results.push({ path, opener: null, note: 'no create-style buttons' }); continue; }
    for (const label of uniqOpeners) {
      await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
      st.errs = []; st.api = [];
      const r = { path, opener: label };
      try {
        await p.locator('main button').filter({ hasText: label }).first().click({ timeout: 4000 });
        await p.waitForTimeout(1000);
        const marker = `E2E${uniq().slice(-6)}`;
        const dialog = p.locator('[role=dialog], .fixed.inset-0').last();
        const scope = (await dialog.count()) && (await dialog.isVisible().catch(() => false)) ? dialog : p.locator('main');
        r.filled = await fillVisible(scope, marker);
        const subs = await scope.locator('button').evaluateAll((els, re) => els.map((e, i) => ({ i, t: (e.innerText || '').trim().replace(/\s+/g, ' '), type: e.getAttribute('type'), dis: e.disabled })).filter((b) => !b.dis && (b.type === 'submit' || new RegExp(re, 'i').test(b.t))), SUBMIT.source);
        const pick = subs.find((b) => b.type === 'submit' && b.t !== label) || subs.find((b) => b.t !== label) || subs[0];
        if (!r.filled.length && !pick) { r.result = 'OPENED_NOTHING_TO_FILL'; }
        else if (!pick) { r.result = 'NO_SUBMIT_BUTTON'; }
        else {
          r.submit = pick.t;
          await p.evaluate(() => { window.__toasts = []; });
          await scope.locator('button').nth(pick.i).click({ timeout: 4000 });
          // Wait for a toast (AI generation can take a while), up to 25 s.
          for (let t = 0; t < 25; t++) { await p.waitForTimeout(1000); if ((await p.evaluate(() => window.__toasts.length).catch(() => 0)) > 0) break; }
          await p.waitForTimeout(1000);
          const toasts = await p.evaluate(() => window.__toasts).catch(() => []);
          r.toast_ok = toasts.filter((x) => x.type !== 'error').map((x) => x.text);
          r.toast_err = toasts.filter((x) => x.type === 'error').map((x) => x.text);
          r.inline_err = (await scope.innerText().catch(() => '')).match(/(required|invalid|must be|cannot be|too short|please (enter|select|provide)[^.\n]*)/i)?.[0] || null;
          await p.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
          await p.waitForTimeout(800);
          r.persisted = (await p.locator('body').innerText().catch(() => '')).includes(marker);
          r.result = st.api.some((x) => x.startsWith('5')) || st.errs.length ? 'ERROR' : r.toast_err.length ? 'REJECTED' : r.persisted ? 'SAVED' : r.toast_ok.length ? 'OK_TOAST' : r.inline_err ? 'VALIDATION_SHOWN' : 'NO_FEEDBACK';
        }
      } catch (e) { r.result = 'CLICK_FAILED'; r.error = e.message.split('\n')[0].slice(0, 120); }
      r.api_errors = st.api.slice(0, 4); r.page_errors = st.errs.slice(0, 2);
      if (!['SAVED'].includes(r.result)) await p.screenshot({ path: `${OUT}/shots/${path.replace(/\//g, '-')}-${label.replace(/[^a-z0-9]+/gi, '_').slice(0, 30)}.png` }).catch(() => {});
      results.push(r);
      console.error(`${path} [${label}] -> ${r.result}${r.submit ? ` via "${r.submit}"` : ''}`);
    }
  }
  await browser.close();
  for (const uid of created) await fb.deleteAccount(uid).catch(() => {});
  fs.writeFileSync(`${OUT}/form-fill.json`, JSON.stringify({ base: BASE, ran_at: new Date().toISOString(), results, firebase_users_deleted: created.length }, null, 2));
  const by = {}; for (const r of results) by[r.result || 'none'] = (by[r.result || 'none'] || 0) + 1;
  console.log(JSON.stringify(by));
})().catch(async (e) => { console.error(e); for (const uid of created) await fb.deleteAccount(uid).catch(() => {}); process.exit(1); });
