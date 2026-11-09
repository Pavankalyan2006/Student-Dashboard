const { chromium } = require('playwright');
const SP = process.argv[2];
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const shot = (n) => page.screenshot({ path: `${SP}/shots/${n}.png`, fullPage: true });
  await page.goto('http://localhost:3311/register');
  await page.waitForSelector('#full_name');
  await page.fill('#full_name', 'Browser Test Student');
  await page.fill('#email', `p5.browser.${Date.now()}@example.test`);
  await page.fill('#password', 'Phase5Pass1');
  await page.fill('#confirm_password', 'Phase5Pass1');
  const boxes = page.locator('input[type=checkbox]');
  await boxes.nth(0).check(); await boxes.nth(1).check();
  await shot('1-account');
  await page.click('button:has-text("Create account")');
  await page.waitForSelector('#college', { timeout: 15000 });
  // Step 2: academic
  await page.fill('#college', 'Browser Synthetic College');
  await page.selectOption('#degree', { index: 1 });
  await page.fill('#branch', 'Computer Science and Engineering');
  await page.selectOption('#current_semester', '5');
  await page.selectOption('#academic_year', '3');
  await page.fill('#expected_graduation_year', String(new Date().getFullYear() + 2));
  await page.fill('#subjects', 'Operating Systems'); await page.keyboard.press('Enter');
  await shot('2-academic');
  await page.click('button:has-text("Save and continue")');
  // Step 3: skills
  await page.waitForSelector('#skill_name', { timeout: 10000 });
  await page.fill('#skill_name', 'Python');
  await page.click('button:has-text("Add")');
  await page.click('button:has-text("Save and continue")');
  await page.waitForTimeout(800);
  const profErr = await page.locator('text=/must be chosen|choose/i').count();
  await page.selectOption('select[aria-label="Proficiency for Python"]', 'INTERMEDIATE');
  await shot('3-skills');
  await page.click('button:has-text("Save and continue")');
  // Step 4: skip
  await page.waitForSelector('button:has-text("Skip for now")', { timeout: 10000 });
  await page.waitForTimeout(500);
  await page.click('button:has-text("Skip for now")');
  // Step 5: career
  await page.waitForSelector('#target_roles', { timeout: 10000 });
  await page.fill('#target_roles', 'Backend Developer'); await page.keyboard.press('Enter');
  await shot('5-career');
  await page.click('button:has-text("Save and continue")');
  // Step 6: learning
  await page.waitForSelector('#preferred_languages', { timeout: 10000 });
  await page.fill('#preferred_languages', 'English'); await page.keyboard.press('Enter');
  await page.fill('#weekly_study_hours', '10');
  await page.click('button:has-text("Save and continue")');
  await page.waitForTimeout(1500);
  await shot('7-review');
  const finish = page.locator('button', { hasText: /finish|complete registration/i });
  console.log('finish buttons', await finish.count());
  await finish.first().click();
  await page.waitForTimeout(3000);
  await shot('8-after');
  console.log('url', page.url(), 'proficiency error shown before choosing:', profErr);
  await page.goto('http://localhost:3311/dashboard'); await page.waitForTimeout(3000); await shot('9-dashboard');
  await page.goto('http://localhost:3311/courses'); await page.waitForTimeout(3000); await shot('10-courses');
  await page.goto('http://localhost:3311/profile/edit'); await page.waitForTimeout(3000); await shot('11-profile-edit');
  await page.goto('http://localhost:3311/semester'); await page.waitForTimeout(3000); await shot('12-semester');
  console.log(errors.slice(0, 15).join('\n'));
  await browser.close();
})().catch((e) => { console.error('FAILED', e.message); process.exit(1); });
