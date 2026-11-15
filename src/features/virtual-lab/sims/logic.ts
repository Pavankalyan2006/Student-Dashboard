// Digital logic: parses a Boolean expression, builds its truth table and simplifies it to a sum of products
// with the Quine-McCluskey method. Pure functions, no I/O.
//
// Operators (case-insensitive words or symbols):
//   NOT: !A, ~A, NOT A, A'      AND: A & B, A * B, A . B, A AND B      NAND: A NAND B
//   OR:  A | B, A + B, A OR B   NOR: A NOR B      XOR: A ^ B, A XOR B   XNOR: A XNOR B
// Precedence, high to low: NOT, AND/NAND, XOR/XNOR, OR/NOR. Constants 0 and 1. Variables are names like A, B, Cin.

export type Node =
  | { t: 'var'; name: string }
  | { t: 'const'; v: boolean }
  | { t: 'not'; a: Node }
  | { t: 'bin'; op: 'AND' | 'NAND' | 'OR' | 'NOR' | 'XOR' | 'XNOR'; a: Node; b: Node };

type BinOp = 'AND' | 'NAND' | 'OR' | 'NOR' | 'XOR' | 'XNOR';
const KEYWORDS = new Set(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR']);
export const MAX_VARS = 6;

function tokenize(src: string): string[] {
  const out: string[] = [];
  const re = /\s*([A-Za-z_][A-Za-z0-9_]*|[01]|[!~&*.·|+^()'])/y;
  let i = 0;
  const s = src.trim();
  while (i < s.length) {
    re.lastIndex = i;
    const m = re.exec(s);
    if (!m) throw new Error(`Unexpected "${s[i]}" at position ${i + 1}`);
    out.push(m[1]);
    i = re.lastIndex;
    while (i < s.length && /\s/.test(s[i])) i++;
  }
  return out;
}

export function parseExpression(src: string): Node {
  if (!src.trim()) throw new Error('Type an expression, for example (A & B) | !C');
  if (src.length > 200) throw new Error('Keep the expression under 200 characters.');
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p]?.toUpperCase();
  const take = () => toks[p++];
  const binary = (next: () => Node, ops: Record<string, BinOp>) => (): Node => {
    let left = next();
    while (peek() !== undefined && ops[peek()!]) {
      const op = ops[take().toUpperCase()];
      left = { t: 'bin', op, a: left, b: next() };
    }
    return left;
  };
  const primary = (): Node => {
    const tok = take();
    if (tok === undefined) throw new Error('The expression ends too early.');
    let node: Node;
    if (tok === '(') {
      node = orExpr();
      if (take() !== ')') throw new Error('A bracket is not closed.');
    } else if (tok === '0' || tok === '1') node = { t: 'const', v: tok === '1' };
    else if (/^[A-Za-z_]/.test(tok) && !KEYWORDS.has(tok.toUpperCase())) node = { t: 'var', name: tok };
    else throw new Error(`Unexpected "${tok}".`);
    while (toks[p] === "'") {
      p++;
      node = { t: 'not', a: node };
    }
    return node;
  };
  const notExpr = (): Node => {
    const k = peek();
    if (k === '!' || k === '~' || k === 'NOT') {
      take();
      return { t: 'not', a: notExpr() };
    }
    return primary();
  };
  const andExpr = binary(notExpr, { '&': 'AND', '*': 'AND', '.': 'AND', '·': 'AND', AND: 'AND', NAND: 'NAND' });
  const xorExpr = binary(andExpr, { '^': 'XOR', XOR: 'XOR', XNOR: 'XNOR' });
  const orExpr: () => Node = binary(xorExpr, { '|': 'OR', '+': 'OR', OR: 'OR', NOR: 'NOR' });
  const tree = orExpr();
  if (p < toks.length) throw new Error(`Unexpected "${toks[p]}".`);
  const vars = variables(tree);
  if (vars.length > MAX_VARS) throw new Error(`Use at most ${MAX_VARS} variables (this has ${vars.length}).`);
  return tree;
}

export function variables(n: Node, acc = new Set<string>()): string[] {
  if (n.t === 'var') acc.add(n.name);
  else if (n.t === 'not') variables(n.a, acc);
  else if (n.t === 'bin') {
    variables(n.a, acc);
    variables(n.b, acc);
  }
  return [...acc].sort();
}

export function evaluate(n: Node, env: Record<string, boolean>): boolean {
  switch (n.t) {
    case 'var':
      return !!env[n.name];
    case 'const':
      return n.v;
    case 'not':
      return !evaluate(n.a, env);
    case 'bin': {
      const a = evaluate(n.a, env);
      const b = evaluate(n.b, env);
      switch (n.op) {
        case 'AND': return a && b;
        case 'NAND': return !(a && b);
        case 'OR': return a || b;
        case 'NOR': return !(a || b);
        case 'XOR': return a !== b;
        case 'XNOR': return a === b;
      }
    }
  }
}

export interface TruthTable {
  vars: string[];
  rows: { values: boolean[]; out: boolean }[];
  minterms: number[];
}

/** Rows in binary counting order; the first variable is the most significant bit. */
export function truthTable(n: Node): TruthTable {
  const vars = variables(n);
  const rows: TruthTable['rows'] = [];
  const minterms: number[] = [];
  for (let i = 0; i < 2 ** vars.length; i++) {
    const values = vars.map((_, k) => Boolean((i >> (vars.length - 1 - k)) & 1));
    const out = evaluate(n, Object.fromEntries(vars.map((v, k) => [v, values[k]])));
    rows.push({ values, out });
    if (out) minterms.push(i);
  }
  return { vars, rows, minterms };
}

/** Quine-McCluskey: prime implicants, then essential ones, then the fewest extra to cover the rest. */
export function simplify(vars: string[], minterms: number[]): string {
  const n = vars.length;
  if (minterms.length === 0) return '0';
  if (minterms.length === 2 ** n) return '1';
  type Imp = { bits: string; covers: number[] }; // bits: '0' | '1' | '-'
  let current: Imp[] = minterms.map((m) => ({ bits: m.toString(2).padStart(n, '0'), covers: [m] }));
  const primes: Imp[] = [];
  while (current.length) {
    const used = new Set<number>();
    const next = new Map<string, Imp>();
    for (let i = 0; i < current.length; i++) {
      for (let j = i + 1; j < current.length; j++) {
        const a = current[i].bits;
        const b = current[j].bits;
        let diff = -1;
        let count = 0;
        for (let k = 0; k < n; k++) if (a[k] !== b[k]) { diff = k; count++; }
        if (count === 1 && a[diff] !== '-' && b[diff] !== '-') {
          const bits = a.slice(0, diff) + '-' + a.slice(diff + 1);
          if (!next.has(bits)) next.set(bits, { bits, covers: [...new Set([...current[i].covers, ...current[j].covers])].sort((x, y) => x - y) });
          used.add(i);
          used.add(j);
        }
      }
    }
    current.forEach((imp, i) => {
      if (!used.has(i) && !primes.some((p) => p.bits === imp.bits)) primes.push(imp);
    });
    current = [...next.values()];
  }
  const chosen: Imp[] = [];
  const uncovered = new Set(minterms);
  for (const m of minterms) {
    const covering = primes.filter((p) => p.covers.includes(m));
    if (covering.length === 1 && !chosen.includes(covering[0])) {
      chosen.push(covering[0]);
      covering[0].covers.forEach((c) => uncovered.delete(c));
    }
  }
  while (uncovered.size) {
    const literals = (p: Imp) => p.bits.replace(/-/g, '').length;
    const best = primes
      .filter((p) => !chosen.includes(p))
      .sort((a, b) => b.covers.filter((c) => uncovered.has(c)).length - a.covers.filter((c) => uncovered.has(c)).length || literals(a) - literals(b))[0];
    chosen.push(best);
    best.covers.forEach((c) => uncovered.delete(c));
  }
  return chosen
    .map((p) => [...p.bits].map((b, k) => (b === '1' ? vars[k] : b === '0' ? `${vars[k]}'` : '')).join(''))
    .sort()
    .join(' + ');
}
