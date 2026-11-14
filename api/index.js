// Vercel serverless entry point. vercel.json rewrites /api/* and /health* here.
// The server is TypeScript with extensionless ESM imports, which Node cannot load directly,
// so `npm run build` bundles it into api/_lib/handler.mjs (scripts/build-vercel-api.mjs).
export { default } from './_lib/handler.mjs';
