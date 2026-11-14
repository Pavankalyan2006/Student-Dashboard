# Deployment Verification Report

Status: **NOT DEPLOYED — awaiting the owner's merge.**

The live site (https://btechplatform.vercel.app) deploys from `main` through Vercel. This work is on a branch and in a
pull request; it has not been merged, so the live site still shows the previous design. Deploying is the owner's call.

## After merge, verify on the live site

1. Sign in with the demo account and check the footer reads "Designed for &lt;registered name&gt;".
2. Change the full name in Profile → Account, save, and confirm the footer and sidebar update without a reload; reload and confirm again.
3. Open `/pilot-feedback`: it should land on `/dashboard`. The sidebar and Settings → Privacy & Data should have no feedback link.
4. Re-run the existing scripts (they no longer visit the retired page):
   - `scripts/pilot/production-ui-walkthrough.cjs <outdir>`
   - `scripts/pilot/production-deep-click.cjs`
   - `scripts/pilot/phase6-synthetic-journeys.cjs` (still exercises the kept feedback API)
5. Spot-check 390 px and 1440 px on the dashboard, GATE, Knowledge Base and Language Learning.

## Pre-deploy validation done here

Local production-like run (`npm run dev`, in-memory data, legacy auth, seeded demo student): see
`UI_UX_REGRESSION_TEST_REPORT.md` and `RESPONSIVE_DESIGN_REPORT.md`.
