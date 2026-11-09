#!/bin/bash
# Phase 3 full regression: tsc, vitest, vite build, every Phase 3 probe (create -> restart -> verify), the integration
# and demo-account probes, and the Phase 1/2 probes, against a server started with a fresh snapshot.
# Needs RESTART (a script that restarts the server keeping DATA_SNAPSHOT_PATH; "fresh" as $1 deletes the snapshot).
# Usage: BASE=http://localhost:3400 RESTART=/tmp/p3/restart.sh scripts/audit/phase3-regression.sh > out.txt
set -u
S=${STATE_DIR:-/tmp/p3reg}; mkdir -p "$S"
echo "# Phase 3 full regression, $(date -u +%FT%TZ)"
echo "## tsc"; npx tsc --noEmit -p . && echo "tsc: 0 errors"
echo "## vitest"; npx vitest run 2>&1 | grep -E "Test Files|Tests "
echo "## vite build"; npx vite build 2>&1 | grep -E "built in|error"
$RESTART fresh >/dev/null
for b in 1 2 3 4; do echo "## phase3 batch$b create"; STATE=$S/b$b.json node scripts/audit/phase3-batch$b.cjs create 2>&1 | grep -E "^FAIL |PASS$"; done
for b in 1 2 5; do echo "## phase2 batch$b create"; STATE=$S/p2b$b.json node scripts/audit/phase2-batch$b.cjs create > $S/c.txt 2>&1; echo "PASS $(grep -c "PASS" $S/c.txt) FAIL $(grep -c "FAIL" $S/c.txt)"; done
echo "## api-checks (Phase 1)"; node scripts/audit/api-checks.cjs > $S/api.txt 2>&1; echo "PASS $(grep -c '^PASS' $S/api.txt) FAIL $(grep -c '^FAIL' $S/api.txt)"
$RESTART >/dev/null
for b in 1 2 3 4; do echo "## phase3 batch$b verify after restart"; STATE=$S/b$b.json node scripts/audit/phase3-batch$b.cjs verify 2>&1 | grep -E "^FAIL |PASS$"; done
for b in 1 2 5; do echo "## phase2 batch$b verify after restart"; STATE=$S/p2b$b.json node scripts/audit/phase2-batch$b.cjs verify > $S/v.txt 2>&1; echo "PASS $(grep -c 'PASS' $S/v.txt) FAIL $(grep -c 'FAIL' $S/v.txt)"; done
echo "## integration"; node scripts/audit/phase3-integration.cjs 2>&1 | grep -E "^FAIL |PASS$"
echo "## demo account"; node scripts/audit/phase3-demo-account.cjs 2>&1 | grep -E "^FAIL |PASS$"
echo "## e2e extra (resume PDF export, placement plan, platform disconnect)"; node scripts/audit/phase3-e2e-extra.cjs 2>&1 | grep -E "^FAIL |PASS$"
