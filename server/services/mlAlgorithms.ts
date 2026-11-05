// server/services/mlAlgorithms.ts
// Small, dependency-free implementations of the models the AI/ML Lab offers. Every model here is
// actually fitted on the student's rows; nothing is substituted or simulated. Models serialise to
// plain JSON so they survive the snapshot and can be reloaded for predictions.

export type Vec = number[];
export type Rng = () => number;

export function seededRng(seed: number): Rng {
  let s = (seed >>> 0) || 42;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Preprocessing: imputation, one-hot encoding and scaling, fitted on training rows only
// ---------------------------------------------------------------------------
export interface PreprocessSpec {
  features: Array<{
    name: string;
    kind: 'numeric' | 'categorical';
    fill: number | string | null; // imputation value
    categories?: string[]; // one-hot order
    center?: number;
    scale?: number;
  }>;
  missing: 'MEAN' | 'MEDIAN' | 'MODE' | 'DROP';
  scaling: 'STANDARD' | 'MINMAX' | 'NONE';
  expanded: string[]; // column names after one-hot encoding
}

const isMissing = (v: any) => v === null || v === undefined || v === '' || (typeof v === 'number' && Number.isNaN(v));

export function fitPreprocess(
  rows: Record<string, any>[],
  featureNames: string[],
  opts: { missing?: string; scaling?: string; kinds?: Record<string, 'numeric' | 'categorical'> }
): PreprocessSpec {
  const missing = (['MEAN', 'MEDIAN', 'MODE', 'DROP'].includes(String(opts.missing)) ? opts.missing : 'MEAN') as PreprocessSpec['missing'];
  const scaling = (['STANDARD', 'MINMAX', 'NONE'].includes(String(opts.scaling)) ? opts.scaling : 'STANDARD') as PreprocessSpec['scaling'];
  const features: PreprocessSpec['features'] = [];
  const expanded: string[] = [];
  for (const name of featureNames) {
    const present = rows.map((r) => r[name]).filter((v) => !isMissing(v));
    const numericShare = present.filter((v) => typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)))).length / (present.length || 1);
    const kind = opts.kinds?.[name] || (numericShare >= 0.95 ? 'numeric' : 'categorical');
    if (kind === 'numeric') {
      const nums = present.map(Number).filter((n) => Number.isFinite(n));
      const sorted = [...nums].sort((a, b) => a - b);
      const mean = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
      const median = sorted.length ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) : 0;
      const counts = new Map<number, number>();
      nums.forEach((n) => counts.set(n, (counts.get(n) || 0) + 1));
      const mode = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? 0;
      const fill = missing === 'MEDIAN' ? median : missing === 'MODE' ? mode : mean;
      const filled = rows.map((r) => (isMissing(r[name]) ? fill : Number(r[name]) || 0));
      let center = 0;
      let scale = 1;
      if (scaling === 'STANDARD') {
        center = filled.reduce((a, b) => a + b, 0) / (filled.length || 1);
        scale = Math.sqrt(filled.reduce((a, v) => a + (v - center) ** 2, 0) / (filled.length || 1)) || 1;
      } else if (scaling === 'MINMAX') {
        const mn = Math.min(...filled);
        const mx = Math.max(...filled);
        center = mn;
        scale = mx - mn || 1;
      }
      features.push({ name, kind, fill, center, scale });
      expanded.push(name);
    } else {
      const counts = new Map<string, number>();
      present.forEach((v) => counts.set(String(v), (counts.get(String(v)) || 0) + 1));
      const categories = [...counts.keys()].sort();
      const mode = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? null;
      features.push({ name, kind, fill: mode, categories });
      categories.forEach((c) => expanded.push(`${name}=${c}`));
    }
  }
  return { features, missing, scaling, expanded };
}

/** True when the row has a missing feature value (used for the DROP strategy). */
export function rowHasMissing(spec: PreprocessSpec, row: Record<string, any>): boolean {
  return spec.features.some((f) => isMissing(row[f.name]));
}

export function transformRow(spec: PreprocessSpec, row: Record<string, any>): Vec {
  const out: Vec = [];
  for (const f of spec.features) {
    const raw = row[f.name];
    if (f.kind === 'numeric') {
      const n = isMissing(raw) || !Number.isFinite(Number(raw)) ? Number(f.fill) || 0 : Number(raw);
      out.push((n - (f.center || 0)) / (f.scale || 1));
    } else {
      const v = isMissing(raw) ? String(f.fill ?? '') : String(raw);
      // Unknown categories (not seen in training) encode as all zeros.
      for (const c of f.categories || []) out.push(v === c ? 1 : 0);
    }
  }
  return out;
}

/** Maps importance over expanded (one-hot) columns back to original features, normalised to 1. */
export function collapseImportance(spec: PreprocessSpec, imp: number[]): Array<{ feature: string; importance: number }> {
  const totals: Record<string, number> = {};
  spec.expanded.forEach((col, i) => {
    const base = col.includes('=') ? col.slice(0, col.indexOf('=')) : col;
    totals[base] = (totals[base] || 0) + Math.abs(imp[i] || 0);
  });
  const sum = Object.values(totals).reduce((a, b) => a + b, 0);
  return spec.features
    .map((f) => ({ feature: f.name, importance: parseFloat((sum ? (totals[f.name] || 0) / sum : 1 / spec.features.length).toFixed(3)) }))
    .sort((a, b) => b.importance - a.importance);
}

// ---------------------------------------------------------------------------
// Decision trees (CART) and random forests
// ---------------------------------------------------------------------------
export type TreeNode =
  | { leaf: true; value: number | string; dist?: Record<string, number>; n: number }
  | { leaf: false; f: number; t: number; l: TreeNode; r: TreeNode; n: number };

interface TreeOpts {
  task: 'classification' | 'regression';
  maxDepth: number;
  minSamplesSplit: number;
  maxFeatures?: number; // features tried per split (random forest)
  rng?: Rng;
}

function gini(labels: string[]): number {
  const c: Record<string, number> = {};
  labels.forEach((l) => (c[l] = (c[l] || 0) + 1));
  return 1 - Object.values(c).reduce((a, n) => a + (n / labels.length) ** 2, 0);
}
function variance(ys: number[]): number {
  const m = ys.reduce((a, b) => a + b, 0) / (ys.length || 1);
  return ys.reduce((a, y) => a + (y - m) ** 2, 0) / (ys.length || 1);
}

export function fitTree(X: Vec[], y: Array<string | number>, opts: TreeOpts, importance: number[]): TreeNode {
  const dims = X[0]?.length || 0;
  const impurity = (idx: number[]) =>
    opts.task === 'classification' ? gini(idx.map((i) => String(y[i]))) : variance(idx.map((i) => Number(y[i])));
  const leaf = (idx: number[]): TreeNode => {
    if (opts.task === 'classification') {
      const dist: Record<string, number> = {};
      idx.forEach((i) => (dist[String(y[i])] = (dist[String(y[i])] || 0) + 1));
      const value = Object.entries(dist).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
      return { leaf: true, value, dist, n: idx.length };
    }
    return { leaf: true, value: idx.reduce((a, i) => a + Number(y[i]), 0) / idx.length, n: idx.length };
  };
  const build = (idx: number[], depth: number): TreeNode => {
    const imp = impurity(idx);
    if (depth >= opts.maxDepth || idx.length < opts.minSamplesSplit || imp === 0) return leaf(idx);
    let feats = Array.from({ length: dims }, (_, d) => d);
    if (opts.maxFeatures && opts.maxFeatures < dims && opts.rng) {
      for (let i = feats.length - 1; i > 0; i--) {
        const j = Math.floor(opts.rng() * (i + 1));
        [feats[i], feats[j]] = [feats[j], feats[i]];
      }
      feats = feats.slice(0, opts.maxFeatures);
    }
    let best = { gain: 0, f: -1, t: 0, l: [] as number[], r: [] as number[] };
    for (const f of feats) {
      const values = [...new Set(idx.map((i) => X[i][f]))].sort((a, b) => a - b);
      // Candidate thresholds: midpoints, capped at 32 per feature for speed.
      const step = Math.max(1, Math.floor(values.length / 32));
      for (let v = step; v < values.length; v += step) {
        const t = (values[v - 1] + values[v]) / 2;
        const l = idx.filter((i) => X[i][f] <= t);
        const r = idx.filter((i) => X[i][f] > t);
        if (!l.length || !r.length) continue;
        const gain = imp - (l.length / idx.length) * impurity(l) - (r.length / idx.length) * impurity(r);
        if (gain > best.gain + 1e-12) best = { gain, f, t, l, r };
      }
    }
    if (best.f < 0) return leaf(idx);
    importance[best.f] += best.gain * idx.length;
    return { leaf: false, f: best.f, t: best.t, l: build(best.l, depth + 1), r: build(best.r, depth + 1), n: idx.length };
  };
  return build(X.map((_, i) => i), 0);
}

export function treeLeaf(node: TreeNode, x: Vec): Extract<TreeNode, { leaf: true }> {
  let n = node;
  while (!n.leaf) n = x[n.f] <= n.t ? n.l : n.r;
  return n;
}

export function treeDepth(node: TreeNode): number {
  return node.leaf ? 0 : 1 + Math.max(treeDepth(node.l), treeDepth(node.r));
}

export function fitForest(
  X: Vec[],
  y: Array<string | number>,
  opts: TreeOpts & { nEstimators: number; seed: number },
  importance: number[]
): TreeNode[] {
  const rng = seededRng(opts.seed);
  const dims = X[0]?.length || 1;
  const maxFeatures = opts.task === 'classification' ? Math.max(1, Math.round(Math.sqrt(dims))) : Math.max(1, Math.round(dims / 3));
  const trees: TreeNode[] = [];
  for (let t = 0; t < opts.nEstimators; t++) {
    const idx = Array.from({ length: X.length }, () => Math.floor(rng() * X.length)); // bootstrap sample
    trees.push(fitTree(idx.map((i) => X[i]), idx.map((i) => y[i]), { ...opts, maxFeatures, rng }, importance));
  }
  return trees;
}

export function forestPredict(trees: TreeNode[], x: Vec, task: 'classification' | 'regression'): { value: string | number; probs?: Record<string, number> } {
  if (task === 'regression') return { value: trees.reduce((a, t) => a + Number(treeLeaf(t, x).value), 0) / trees.length };
  const votes: Record<string, number> = {};
  trees.forEach((t) => {
    const v = String(treeLeaf(t, x).value);
    votes[v] = (votes[v] || 0) + 1;
  });
  const value = Object.entries(votes).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  const probs: Record<string, number> = {};
  Object.entries(votes).forEach(([k, n]) => (probs[k] = parseFloat((n / trees.length).toFixed(3))));
  return { value, probs };
}

// ---------------------------------------------------------------------------
// Multinomial logistic regression (softmax) trained by batch gradient descent
// ---------------------------------------------------------------------------
export interface LogisticModel {
  classes: string[];
  W: number[][]; // classes x (dims + 1), last column is the bias
}

function softmax(z: number[]): number[] {
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

export function logisticProbs(model: LogisticModel, x: Vec): number[] {
  return softmax(model.W.map((w) => w.reduce((a, wi, d) => a + wi * (d < x.length ? x[d] : 1), 0)));
}

export function fitLogistic(
  X: Vec[],
  y: string[],
  classes: string[],
  opts: { learningRate: number; epochs: number; l2?: number; valX?: Vec[]; valY?: string[] }
): { model: LogisticModel; curve: Array<{ iteration: number; loss: number; val_loss?: number }> } {
  const dims = X[0]?.length || 0;
  const W = classes.map(() => Array(dims + 1).fill(0));
  const model = { classes, W };
  const l2 = opts.l2 ?? 1e-3;
  const loss = (xs: Vec[], ys: string[]) =>
    xs.length ? -xs.reduce((a, x, i) => a + Math.log(Math.max(1e-12, logisticProbs(model, x)[classes.indexOf(ys[i])])), 0) / xs.length : 0;
  const curve: Array<{ iteration: number; loss: number; val_loss?: number }> = [];
  for (let epoch = 1; epoch <= opts.epochs; epoch++) {
    const grad = classes.map(() => Array(dims + 1).fill(0));
    X.forEach((x, i) => {
      const p = logisticProbs(model, x);
      classes.forEach((c, k) => {
        const err = p[k] - (y[i] === c ? 1 : 0);
        for (let d = 0; d < dims; d++) grad[k][d] += err * x[d];
        grad[k][dims] += err;
      });
    });
    W.forEach((w, k) => {
      for (let d = 0; d <= dims; d++) w[d] -= opts.learningRate * (grad[k][d] / X.length + (d < dims ? l2 * w[d] : 0));
    });
    if (epoch === 1 || epoch === opts.epochs || epoch % Math.max(1, Math.floor(opts.epochs / 20)) === 0) {
      curve.push({
        iteration: epoch,
        loss: parseFloat(loss(X, y).toFixed(4)),
        val_loss: opts.valX?.length ? parseFloat(loss(opts.valX, opts.valY!).toFixed(4)) : undefined,
      });
    }
  }
  return { model, curve };
}
