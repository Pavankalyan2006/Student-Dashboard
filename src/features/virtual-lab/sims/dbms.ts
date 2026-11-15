// DBMS: functional dependencies. Attribute closure, candidate keys and the highest normal form (up to BCNF).
// Pure functions, no I/O. Attributes are single letters (A-Z) or comma-separated names.

export interface FD {
  lhs: string[];
  rhs: string[];
}

const split = (s: string) => {
  const t = s.trim();
  if (!t) return [];
  return (t.includes(',') ? t.split(',') : t.includes(' ') ? t.split(/\s+/) : [...t]).map((x) => x.trim()).filter(Boolean);
};

/** "A, B, C, D" or "ABCD". */
export function parseAttributes(s: string): string[] {
  return [...new Set(split(s))];
}

/** One dependency per line or separated by ";": "AB -> C" or "A,B -> C". */
export function parseFDs(s: string): FD[] {
  const out: FD[] = [];
  for (const line of s.split(/[;\n]/).map((x) => x.trim()).filter(Boolean)) {
    const m = /^(.+?)\s*(?:->|→)\s*(.+)$/.exec(line);
    if (!m) throw new Error(`"${line}" is not a dependency. Write it like AB -> C.`);
    const lhs = split(m[1]);
    const rhs = split(m[2]);
    if (!lhs.length || !rhs.length) throw new Error(`"${line}" needs attributes on both sides.`);
    out.push({ lhs, rhs });
  }
  if (out.length > 30) throw new Error('Use 30 dependencies or fewer.');
  return out;
}

export function closure(attrs: string[], fds: FD[]): string[] {
  const res = new Set(attrs);
  let grew = true;
  while (grew) {
    grew = false;
    for (const fd of fds) {
      if (fd.lhs.every((a) => res.has(a)) && fd.rhs.some((a) => !res.has(a))) {
        fd.rhs.forEach((a) => res.add(a));
        grew = true;
      }
    }
  }
  return [...res].sort();
}

/** Every minimal set of attributes whose closure is the whole relation. */
export function candidateKeys(all: string[], fds: FD[]): string[][] {
  if (all.length > 12) throw new Error('Use 12 attributes or fewer.');
  const onRight = new Set(fds.flatMap((f) => f.rhs));
  const onLeft = new Set(fds.flatMap((f) => f.lhs));
  // Attributes never on a right side must be in every key; ones only on the right are in none.
  const core = all.filter((a) => !onRight.has(a));
  const optional = all.filter((a) => onRight.has(a) && onLeft.has(a) && !core.includes(a));
  const keys: string[][] = [];
  const isKey = (set: string[]) => closure(set, fds).length === all.length && all.every((a) => closure(set, fds).includes(a));
  for (let size = 0; size <= optional.length; size++) {
    const combos: string[][] = [];
    const pick = (start: number, acc: string[]) => {
      if (acc.length === size) return void combos.push(acc);
      for (let i = start; i < optional.length; i++) pick(i + 1, [...acc, optional[i]]);
    };
    pick(0, []);
    for (const c of combos) {
      const set = [...core, ...c];
      if (keys.some((k) => k.every((a) => set.includes(a)))) continue; // not minimal
      if (isKey(set)) keys.push(set.sort());
    }
  }
  return keys;
}

export interface NormalFormResult {
  keys: string[][];
  prime: string[];
  highest: '1NF' | '2NF' | '3NF' | 'BCNF';
  /** The first dependency that breaks the next normal form up, in plain words. */
  violations: { form: '2NF' | '3NF' | 'BCNF'; fd: FD; why: string }[];
}

export function normalForm(all: string[], fds: FD[]): NormalFormResult {
  const unknown = fds.flatMap((f) => [...f.lhs, ...f.rhs]).filter((a) => !all.includes(a));
  if (unknown.length) throw new Error(`Not in the relation: ${[...new Set(unknown)].join(', ')}`);
  const keys = candidateKeys(all, fds);
  const prime = [...new Set(keys.flat())].sort();
  const isSuperkey = (attrs: string[]) => all.every((a) => closure(attrs, fds).includes(a));
  const violations: NormalFormResult['violations'] = [];
  const fmt = (xs: string[]) => xs.join(xs.some((x) => x.length > 1) ? ',' : '');
  for (const fd of fds) {
    const nonTrivial = fd.rhs.filter((a) => !fd.lhs.includes(a));
    if (!nonTrivial.length) continue;
    const nonPrimeRhs = nonTrivial.filter((a) => !prime.includes(a));
    const partial = nonPrimeRhs.length > 0 && keys.some((k) => fd.lhs.every((a) => k.includes(a)) && fd.lhs.length < k.length);
    if (partial) violations.push({ form: '2NF', fd, why: `${fmt(fd.lhs)} is part of a key and decides non-key ${fmt(nonPrimeRhs)} (partial dependency).` });
    else if (!isSuperkey(fd.lhs) && nonPrimeRhs.length) violations.push({ form: '3NF', fd, why: `${fmt(fd.lhs)} is not a superkey and decides non-key ${fmt(nonPrimeRhs)} (transitive dependency).` });
    else if (!isSuperkey(fd.lhs)) violations.push({ form: 'BCNF', fd, why: `${fmt(fd.lhs)} is not a superkey but decides ${fmt(nonTrivial)}.` });
  }
  const highest = violations.some((v) => v.form === '2NF') ? '1NF' : violations.some((v) => v.form === '3NF') ? '2NF' : violations.length ? '3NF' : 'BCNF';
  return { keys, prime, highest, violations };
}
