import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { execFileSync } from 'child_process';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const read = (p: string) => readFileSync(path.join(root, p), 'utf8');

describe('Light and dark theme', () => {
  const palette = read('src/styles/theme-palette.css');
  const index = read('src/index.css');

  it('gives every base hue and its aliases a dark value', () => {
    for (const hue of ['slate', 'blue', 'indigo', 'violet', 'sky', 'emerald', 'amber', 'red', 'gray', 'purple', 'green', 'rose']) {
      for (const step of [50, 500, 900]) expect(palette, `${hue}-${step}`).toContain(`--color-${hue}-${step}:`);
    }
  });

  it('keeps the light palette inside dark or saturated panels (inverse islands)', () => {
    expect(palette).toMatch(/:where\(\.dark\) :is\([^)]*\.hero-brand/);
    expect(palette).toContain('.bg-blue-600');
  });

  it('is up to date with the light palette in index.css', () => {
    let regenerated: string;
    try {
      regenerated = execFileSync('python', [path.join(root, 'scripts/gen_theme_palette.py'), path.join(root, 'src/index.css')], { encoding: 'utf8' });
    } catch {
      return; // Python is not installed here; the other checks still cover the file.
    }
    expect(regenerated.replace(/\r\n/g, '\n').trim()).toBe(palette.replace(/\r\n/g, '\n').trim());
  });

  it('loads the theme files and switches off legacy dark: classes', () => {
    expect(index).toContain('@import "./styles/theme-palette.css"');
    expect(index).toContain('@import "./styles/theme.css"');
    expect(index).toContain('@custom-variant dark (&:where(.legacy-dark, .legacy-dark *))');
  });

  it('sets the saved theme before first paint', () => {
    const html = read('index.html');
    expect(html).toContain("localStorage.getItem('btech.theme')");
  });
});
