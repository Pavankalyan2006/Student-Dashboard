// Phase 2 › Batch 2 › AI/ML Lab: real algorithms, honest preprocessing, ownership and CSV validation.
// Synthetic data only.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestApi, TestApi } from './helpers/httpApp';
import { MlLabService } from '../../server/services/mlLabService';
import { fitPreprocess, transformRow } from '../../server/services/mlAlgorithms';

let api: TestApi;
beforeAll(async () => {
  api = await startTestApi();
});
afterAll(async () => {
  await api.close();
});

function studyCsv(n = 120): string {
  const lines = ['hours,attendance,section,result'];
  let s = 11;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const h = +(rnd() * 10).toFixed(1);
    const a = Math.round(50 + rnd() * 50);
    lines.push(`${i === 3 ? '' : h},${a},${['A', 'B', 'C'][i % 3]},${h * 6 + a * 0.6 > 75 ? 'pass' : 'fail'}`);
  }
  return lines.join('\n');
}

const iris = (model: string, hp: Record<string, any> = {}) => ({
  name: 'Iris ' + model,
  dataset_id: 'ds_iris',
  dataset_name: 'Iris Flower Classification',
  task_type: 'CLASSIFICATION' as const,
  model_type: model,
  target_column: 'species',
  feature_columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width'],
  train_split: 0.8,
  hyperparameters: hp,
});

describe('Phase 2 › Batch 2 › ML algorithms are real and named honestly', () => {
  it.each([
    ['Random Forest', /Random Forest/],
    ['Decision Tree', /Decision Tree/],
    ['Logistic Regression', /Logistic Regression/],
    ['KNN', /Nearest/],
  ])('%s trains the named algorithm with metrics from its own confusion matrix', async (model, label) => {
    const exp: any = await MlLabService.runExperiment('p2-ml-algo', iris(model, { n_estimators: 15, max_depth: 4 }));
    expect(exp.algorithm).toMatch(label);
    const cm = exp.metrics.confusion_matrix;
    const total = cm.flat().reduce((a: number, b: number) => a + b, 0);
    expect(total).toBe(30); // 20% of 150 rows held out
    expect(exp.metrics.accuracy).toBeCloseTo(cm.reduce((a: number, r: number[], i: number) => a + r[i], 0) / total, 4);
    expect(exp.metrics.accuracy).toBeGreaterThan(0.8);
  });

  it('the same configuration gives the same result (seeded split), and hyperparameters change the model', async () => {
    const a: any = await MlLabService.runExperiment('p2-ml-seed', iris('Decision Tree', { max_depth: 3 }));
    const b: any = await MlLabService.runExperiment('p2-ml-seed', iris('Decision Tree', { max_depth: 3 }));
    expect(a.metrics.confusion_matrix).toEqual(b.metrics.confusion_matrix);
    const stump: any = await MlLabService.runExperiment('p2-ml-seed', iris('Decision Tree', { max_depth: 1 }));
    expect(stump.metrics.accuracy).toBeLessThan(0.75); // a depth-1 tree can separate at most 2 of 3 classes
  });

  it('an algorithm the sandbox does not implement is refused, not silently substituted', async () => {
    await expect(MlLabService.runExperiment('p2-ml-x', iris('XGBoost'))).rejects.toThrow(/Supported/i);
  });

  it('preprocessing is fitted on training rows only and one-hot encodes categories', () => {
    const train = [{ x: 1, c: 'a' }, { x: 3, c: 'b' }, { x: null, c: 'a' }];
    const spec = fitPreprocess(train as any, ['x', 'c'], { missing: 'MEAN', scaling: 'STANDARD', kinds: { x: 'numeric', c: 'categorical' } });
    const xs = spec.features.find((f: any) => f.name === 'x') as any;
    expect(xs.fill).toBe(2); // mean of the two training values, not of any test value
    const vec = transformRow(spec, { x: 2, c: 'b' } as any);
    expect(vec.length).toBe(spec.expanded.length);
    expect(spec.expanded.length).toBe(3); // x + c=a + c=b
    expect(vec[0]).toBeCloseTo(0, 6); // 2 is the training mean, so it standardises to 0
  });
});

describe('Phase 2 › Batch 2 › ML Lab over HTTP', () => {
  it('CSV upload validates input, trains, predicts with validation, saves history, and isolates students', async () => {
    const A = await api.register('ml-a');
    const B = await api.register('ml-b');
    expect((await api.call('POST', '/ml-lab/datasets/upload', A.token, { name: 'x', csvContent: '' })).status).toBe(400);
    expect((await api.call('POST', '/ml-lab/datasets/upload', A.token, { name: 'x', csvContent: 'a,b\n1,2,3' })).status).toBe(400);
    expect((await api.call('POST', '/ml-lab/datasets/upload', A.token, { name: 'x', csvContent: 'a,a\n1,2' })).status).toBe(400);
    const quoted = await api.call('POST', '/ml-lab/datasets/upload', A.token, { name: 'q', csvContent: 'n,"label, long"\n1,"x, y"\n2,"z ""q"""' });
    expect(quoted.status).toBe(201);
    expect(quoted.body.data.preview[1]['label, long']).toBe('z "q"');

    const up = await api.call('POST', '/ml-lab/datasets/upload', A.token, { name: 'Study (synthetic)', csvContent: studyCsv(), target_column: 'result' });
    expect(up.status).toBe(201);
    const ds = up.body.data;
    const listB = await api.call('GET', '/ml-lab/datasets', B.token);
    expect(listB.body.data.some((d: any) => d.id === ds.id)).toBe(false);

    const train = await api.call('POST', '/ml-lab/experiments', A.token, {
      name: 'Pass model', dataset_id: ds.id, task_type: 'CLASSIFICATION', model_type: 'Random Forest', target_column: 'result',
      feature_columns: ['hours', 'attendance', 'section'], train_split: 0.8, hyperparameters: { n_estimators: 20, max_depth: 5 },
      preprocessing: { missing_value_strategy: 'MEDIAN', scaling: 'MINMAX' },
    });
    expect(train.status).toBe(201);
    const exp = train.body.data;
    expect(exp.preprocessing_applied).toMatchObject({ missing_value_strategy: 'MEDIAN', scaling: 'MINMAX', categorical_encoding: 'ONE_HOT' });
    expect(exp.feature_schema.find((f: any) => f.name === 'section').options.sort()).toEqual(['A', 'B', 'C']);

    expect((await api.call('GET', `/ml-lab/experiments/${exp.id}`, B.token)).status).toBe(404);
    expect((await api.call('POST', `/ml-lab/experiments/${exp.id}/predict`, B.token, { inputs: { hours: 9, attendance: 95, section: 'A' } })).status).toBe(404);

    const bad = await api.call('POST', `/ml-lab/experiments/${exp.id}/predict`, A.token, { inputs: { hours: 'many', attendance: 95, section: 'Q' } });
    expect(bad.status).toBe(400);
    const good = await api.call('POST', `/ml-lab/experiments/${exp.id}/predict`, A.token, { inputs: { hours: 9.5, attendance: 95, section: 'B' } });
    expect(good.status).toBe(200);
    expect(good.body.data.predicted_label).toBe('pass');

    const hist = await api.call('GET', `/ml-lab/predictions?experiment_id=${exp.id}`, A.token);
    expect(hist.body.data).toHaveLength(1);
    expect((await api.call('GET', '/ml-lab/predictions', B.token)).body.data).toHaveLength(0);

    expect((await api.call('DELETE', `/ml-lab/datasets/${ds.id}`, B.token)).status).toBe(404);
    expect((await api.call('DELETE', '/ml-lab/datasets/ds_iris', A.token)).status).toBe(400);
    expect((await api.call('DELETE', `/ml-lab/datasets/${ds.id}`, A.token)).status).toBe(200);
  }, 30000);
});
