// Copies browser runtimes that the app serves from its own origin into public/vendor/ (git-ignored).
// Runs after `npm install` / `npm ci` (postinstall), so nothing binary is committed and Vercel builds
// get the same files.
//
//  - Pyodide (Python compiled to WebAssembly) for the in-browser code sandbox. Only the core runtime is
//    copied. Extra packages (numpy, pandas, scikit-learn) are fetched on first use from the official
//    Pyodide CDN: the copied lock file points each package at its CDN address, with the CDN's sha256
//    checksums kept, so a changed file is refused.
//  - Tesseract (text recognition / OCR, compiled to WebAssembly) with its English model, for reading
//    scanned PDFs and photos in the browser. Everything it needs is served from our origin.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'public', 'vendor');

function copyFiles(fromDir, toDir, files) {
  fs.mkdirSync(toDir, { recursive: true });
  for (const f of files) fs.copyFileSync(path.join(fromDir, f), path.join(toDir, f));
}

function pyodide() {
  let dir;
  try {
    dir = path.dirname(require.resolve('pyodide/package.json'));
  } catch {
    console.warn('[vendor] pyodide is not installed; the in-browser Python sandbox will be unavailable.');
    return;
  }
  const { version } = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const to = path.join(out, 'pyodide');
  copyFiles(dir, to, ['pyodide.mjs', 'pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip']);
  const cdn = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;
  const lock = JSON.parse(fs.readFileSync(path.join(dir, 'pyodide-lock.json'), 'utf8'));
  for (const p of Object.values(lock.packages)) p.file_name = cdn + p.file_name;
  fs.writeFileSync(path.join(to, 'pyodide-lock.json'), JSON.stringify(lock));
  fs.writeFileSync(path.join(to, 'VERSION'), `${version}\n`);
  console.log(`[vendor] pyodide ${version} -> public/vendor/pyodide (packages from ${cdn})`);
}

function tesseract() {
  let js, core, eng;
  try {
    js = path.dirname(require.resolve('tesseract.js/package.json'));
    core = path.dirname(require.resolve('tesseract.js-core/package.json'));
    eng = path.dirname(require.resolve('@tesseract.js-data/eng/package.json'));
  } catch {
    console.warn('[vendor] tesseract.js is not installed; reading scanned documents (OCR) will be unavailable.');
    return;
  }
  const to = path.join(out, 'tesseract');
  copyFiles(path.join(js, 'dist'), to, ['worker.min.js']);
  // The LSTM-only builds (plain, SIMD, relaxed SIMD); tesseract.js picks the one the browser supports.
  copyFiles(core, path.join(to, 'core'), ['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js']);
  copyFiles(path.join(eng, '4.0.0_best_int'), path.join(to, 'lang'), ['eng.traineddata.gz']);
  const { version } = JSON.parse(fs.readFileSync(path.join(js, 'package.json'), 'utf8'));
  fs.writeFileSync(path.join(to, 'VERSION'), `${version}\n`);
  console.log(`[vendor] tesseract.js ${version} -> public/vendor/tesseract`);
}

pyodide();
tesseract();
