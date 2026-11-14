// Bundles the Express server into one ESM file for the Vercel function (api/index.js).
// npm packages stay external: Vercel traces and ships them from node_modules.
import { build } from 'esbuild';

await build({
  entryPoints: ['server/vercel/handler.ts'],
  outfile: 'api/_lib/handler.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  sourcemap: false,
  logLevel: 'info',
  // Some dependencies are CommonJS and use require(); give the ESM bundle a require.
  banner: { js: "import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);" },
});
