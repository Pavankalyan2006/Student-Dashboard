// Phase 2 batch 2 HTTP probe: AI/ML Lab journey (CSV upload -> train -> evaluate -> predict -> history -> persistence).
// Usage: BASE=http://localhost:3300 node scripts/audit/phase2-batch2.cjs create|verify   (state in /tmp/p2/batch2.json)
const fs = require('fs');
const BASE = (process.env.BASE || 'http://localhost:3300') + '/api/v1';
const STATE = process.env.STATE || '/tmp/p2/batch2.json';
const api = async (m, p, t, b) => { const r = await fetch(BASE + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined }); let j; try { j = await r.json(); } catch { j = {}; } return { s: r.status, j }; };
const reg = async (k) => { const e = `p2ml${k}.${Date.now()}${Math.floor(Math.random() * 1e4)}@example.test`; const r = await api('POST', '/auth/register', null, { email: e, password: 'TestPass123', name: 'P2 ML ' + k }); const t = r.j.data.token; await api('POST', '/students/me/onboarding/complete', t, {}); return { email: e, t }; };
const results = [];
const check = (name, ok, detail) => { results.push({ name, ok: !!ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -- ' + detail : ''}`); };
const d = (r) => r.j.data ?? r.j;

function synthCsv() {
  // Synthetic study-habits data, deterministic. Target: pass/fail by hours + attendance, with a category column and one missing value.
  const lines = ['hours_studied,attendance_pct,section,"notes, free text",result'];
  let s = 7;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 120; i++) {
    const h = +(rnd() * 10).toFixed(1); const a = Math.round(50 + rnd() * 50); const sec = ['A', 'B', 'C'][i % 3];
    const pass = h * 6 + a * 0.6 > 75 ? 'pass' : 'fail';
    lines.push(`${i === 5 ? '' : h},${a},${sec},"row ${i}, synthetic",${pass}`);
  }
  return lines.join('\n');
}

(async () => {
  const mode = process.argv[2] || 'create';
  if (mode === 'create') {
    const A = await reg('A'); const B = await reg('B');
    const anon = await api('GET', '/ml-lab/datasets');
    check('Unauthenticated dataset list is rejected', anon.s === 401, `status ${anon.s}`);
    const empty = await api('POST', '/ml-lab/datasets/upload', A.t, { name: 'x', csvContent: '' });
    check('Empty CSV rejected with 400', empty.s === 400, d(empty)?.message || JSON.stringify(empty.j.error));
    const bad = await api('POST', '/ml-lab/datasets/upload', A.t, { name: 'x', csvContent: 'a,b\n1,2,3\n' });
    check('Row with wrong column count rejected', bad.s === 400, JSON.stringify(bad.j.error?.message || bad.j.message));
    const dup = await api('POST', '/ml-lab/datasets/upload', A.t, { name: 'x', csvContent: 'a,a\n1,2\n' });
    check('Duplicate header rejected', dup.s === 400);
    const big = await api('POST', '/ml-lab/datasets/upload', A.t, { name: 'x', csvContent: 'a\n' + '1\n'.repeat(3_000_000) });
    check('CSV over 5 MB rejected', big.s === 400 || big.s === 413, `status ${big.s}`);
    const up = await api('POST', '/ml-lab/datasets/upload', A.t, { name: 'Study habits (synthetic)', csvContent: synthCsv(), target_column: 'result' });
    const ds = d(up);
    check('Valid CSV uploaded (quoted comma field kept intact)', up.s === 201 && ds.total_samples === 120 && ds.preview?.[0]?.['notes, free text'] === 'row 0, synthetic', `samples=${ds?.total_samples} notes0=${JSON.stringify(ds?.preview?.[0]?.['notes, free text'])}`);
    const dsB = await api('GET', '/ml-lab/datasets', B.t);
    check('Student B cannot see student A dataset', !(d(dsB) || []).some((x) => x.id === ds.id));

    const exps = {};
    for (const model of ['Random Forest', 'Decision Tree', 'Logistic Regression', 'KNN']) {
      const r = await api('POST', '/ml-lab/experiments', A.t, {
        name: 'Pass predictor ' + model, dataset_id: ds.id, dataset_name: ds.name, task_type: 'CLASSIFICATION', model_type: model,
        target_column: 'result', feature_columns: ['hours_studied', 'attendance_pct', 'section'], train_split: 0.8,
        hyperparameters: { n_estimators: 25, max_depth: 5, epochs: 300, learning_rate: 0.1, n_neighbors: 5 },
        preprocessing: { missing_value_strategy: 'MEAN', scaling: 'STANDARD' },
      });
      const e = d(r); exps[model] = e?.id;
      const cm = e?.metrics?.confusion_matrix; const tot = cm ? cm.flat().reduce((a, b) => a + b, 0) : 0; const diag = cm ? cm.reduce((a, row, i) => a + row[i], 0) : 0;
      check(`Train ${model}: real metrics from confusion matrix`, r.s === 201 && e.algorithm && Math.abs(e.metrics.accuracy - diag / tot) < 1e-4, `algorithm=${e?.algorithm} acc=${e?.metrics?.accuracy} test_rows=${tot}`);
    }
    const unsup = await api('POST', '/ml-lab/experiments', A.t, { name: 'x', dataset_id: ds.id, task_type: 'CLASSIFICATION', model_type: 'XGBoost', target_column: 'result', feature_columns: ['hours_studied'] });
    check('Unsupported model refused instead of silently substituted', unsup.s === 400, String(unsup.j.message || '').slice(0, 120));
    const crossExp = await api('GET', '/ml-lab/experiments/' + exps['Random Forest'], B.t);
    check('Student B cannot read student A experiment', crossExp.s === 404, `status ${crossExp.s}`);
    const crossPred = await api('POST', `/ml-lab/experiments/${exps['Random Forest']}/predict`, B.t, { inputs: { hours_studied: 5, attendance_pct: 80, section: 'A' } });
    check('Student B cannot predict with student A model', crossPred.s === 404, `status ${crossPred.s}`);
    const p1 = await api('POST', `/ml-lab/experiments/${exps['Random Forest']}/predict`, A.t, { inputs: { hours_studied: 9.5, attendance_pct: 95, section: 'B' } });
    check('Prediction for strong student is pass', p1.s === 200 && d(p1).predicted_label === 'pass', `${d(p1)?.predicted_label} conf=${d(p1)?.confidence}`);
    const p2 = await api('POST', `/ml-lab/experiments/${exps['Logistic Regression']}/predict`, A.t, { inputs: { hours_studied: 0.5, attendance_pct: 52, section: 'C' } });
    check('Prediction for weak student is fail (logistic)', p2.s === 200 && d(p2).predicted_label === 'fail', `${d(p2)?.predicted_label} conf=${d(p2)?.confidence}`);
    const pBad = await api('POST', `/ml-lab/experiments/${exps['Random Forest']}/predict`, A.t, { inputs: { hours_studied: 'lots', attendance_pct: 80, section: 'Z' } });
    check('Invalid prediction input rejected', pBad.s === 400, String(pBad.j.message || '').slice(0, 120));
    const hist = await api('GET', '/ml-lab/predictions?experiment_id=' + exps['Random Forest'], A.t);
    check('Prediction history saved', (d(hist) || []).length === 1, `count=${(d(hist) || []).length}`);
    const histB = await api('GET', '/ml-lab/predictions', B.t);
    check('Student B prediction history is empty', (d(histB) || []).length === 0);
    fs.mkdirSync('/tmp/p2', { recursive: true });
    fs.writeFileSync(STATE, JSON.stringify({ A, B, ds: ds.id, exps }));
  } else {
    const st = JSON.parse(fs.readFileSync(STATE, 'utf8'));
    const list = await api('GET', '/ml-lab/datasets', st.A.t);
    check('Uploaded dataset survives restart', (d(list) || []).some((x) => x.id === st.ds));
    const e = await api('GET', '/ml-lab/experiments/' + st.exps['Random Forest'], st.A.t);
    check('Experiment survives restart', e.s === 200 && d(e).status === 'COMPLETED');
    const p = await api('POST', `/ml-lab/experiments/${st.exps['Decision Tree']}/predict`, st.A.t, { inputs: { hours_studied: 9, attendance_pct: 90, section: 'A' } });
    check('Trained model still predicts after restart', p.s === 200 && d(p).predicted_label === 'pass', `${d(p)?.predicted_label}`);
    const hist = await api('GET', '/ml-lab/predictions', st.A.t);
    check('Prediction history survives restart', (d(hist) || []).length >= 2, `count=${(d(hist) || []).length}`);
    const del = await api('DELETE', '/ml-lab/datasets/' + st.ds, st.B.t);
    check('Student B cannot delete student A dataset', del.s === 404, `status ${del.s}`);
    const delBuiltin = await api('DELETE', '/ml-lab/datasets/ds_iris', st.A.t);
    check('Built-in dataset cannot be deleted', delBuiltin.s >= 400, `status ${delBuiltin.s}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} PASS`);
  process.exit(failed ? 1 : 0);
})();
