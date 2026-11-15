import { describe, it, expect } from 'vitest';
import { schedule, validateProcs, replacePages, parseReferenceString, scheduleDisk } from '../features/virtual-lab/sims/os';
import { parseCidr, subnetInfo, splitSubnet } from '../features/virtual-lab/sims/net';
import { parseExpression, truthTable, simplify } from '../features/virtual-lab/sims/logic';
import { parseFDs, parseAttributes, closure, candidateKeys, normalForm } from '../features/virtual-lab/sims/dbms';
import { whatIfCgpa } from '../../server/services/academicMath';

// Textbook example (Silberschatz-style): P1 0/8, P2 1/4, P3 2/9, P4 3/5.
const P = [
  { id: 'P1', arrival: 0, burst: 8, priority: 3 },
  { id: 'P2', arrival: 1, burst: 4, priority: 1 },
  { id: 'P3', arrival: 2, burst: 9, priority: 4 },
  { id: 'P4', arrival: 3, burst: 5, priority: 2 },
];

describe('CPU scheduling', () => {
  it('FCFS', () => {
    const r = schedule(P, 'FCFS');
    expect(r.gantt.map((g) => `${g.pid}:${g.start}-${g.end}`)).toEqual(['P1:0-8', 'P2:8-12', 'P3:12-21', 'P4:21-26']);
    expect(r.avg_waiting).toBe(8.75);
  });
  it('SRTF matches the textbook average waiting time of 6.5', () => {
    const r = schedule(P, 'SRTF');
    expect(r.gantt.map((g) => g.pid)).toEqual(['P1', 'P2', 'P4', 'P1', 'P3']);
    expect(r.avg_waiting).toBe(6.5);
  });
  it('SJF (non-preemptive), priority and round robin', () => {
    expect(schedule(P, 'SJF').gantt.map((g) => g.pid)).toEqual(['P1', 'P2', 'P4', 'P3']);
    expect(schedule(P, 'PRIORITY').gantt.map((g) => g.pid)).toEqual(['P1', 'P2', 'P4', 'P3']);
    const rr = schedule([{ id: 'A', arrival: 0, burst: 5 }, { id: 'B', arrival: 0, burst: 3 }, { id: 'C', arrival: 0, burst: 1 }], 'RR', 2);
    expect(rr.gantt.map((g) => `${g.pid}:${g.start}-${g.end}`)).toEqual(['A:0-2', 'B:2-4', 'C:4-5', 'A:5-7', 'B:7-8', 'A:8-9']);
    expect(rr.processes.find((p) => p.id === 'A')!.completion).toBe(9);
  });
  it('shows idle time and validates input', () => {
    const r = schedule([{ id: 'A', arrival: 2, burst: 2 }], 'FCFS');
    expect(r.gantt[0]).toEqual({ pid: null, start: 0, end: 2 });
    expect(r.utilisation).toBe(50);
    expect(validateProcs([{ id: 'A', arrival: 0, burst: 0 }])).toMatch(/burst/);
    expect(validateProcs([{ id: 'A', arrival: 0, burst: 1 }, { id: 'A', arrival: 1, burst: 1 }])).toMatch(/twice/);
  });
});

describe('Page replacement and disk scheduling', () => {
  const refs = parseReferenceString('7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1')!;
  it('gives the textbook fault counts with 3 frames', () => {
    expect(replacePages(refs, 3, 'FIFO').faults).toBe(15);
    expect(replacePages(refs, 3, 'LRU').faults).toBe(12);
    expect(replacePages(refs, 3, 'OPT').faults).toBe(9);
    expect(parseReferenceString('1 x 2')).toBeNull();
  });
  it('gives the textbook head movement', () => {
    const q = [98, 183, 37, 122, 14, 124, 65, 67];
    expect(scheduleDisk(q, 53, 199, 'FCFS').total_movement).toBe(640);
    expect(scheduleDisk(q, 53, 199, 'SSTF').total_movement).toBe(236);
    expect(scheduleDisk(q, 53, 199, 'SCAN', 'down').total_movement).toBe(236);
    expect(scheduleDisk(q, 53, 199, 'LOOK', 'up').total_movement).toBe(299);
    expect(scheduleDisk(q, 53, 199, 'CSCAN', 'up').path.slice(-3)).toEqual([0, 14, 37]);
  });
});

describe('Subnetting', () => {
  it('computes network, broadcast and hosts', () => {
    const p = parseCidr('192.168.10.77/26')!;
    expect(subnetInfo(p.ip, p.prefix)).toMatchObject({ network: '192.168.10.64', broadcast: '192.168.10.127', mask: '255.255.255.192', first_host: '192.168.10.65', last_host: '192.168.10.126', usable_hosts: 62, ip_class: 'C', private_range: true });
    expect(parseCidr('10.0.0.1 255.255.0.0')!.prefix).toBe(16);
    expect(parseCidr('300.1.1.1/24')).toBeNull();
    expect(parseCidr('10.0.0.1 255.0.255.0')).toBeNull();
    expect(subnetInfo(parseCidr('8.8.8.8/32')!.ip, 32).usable_hosts).toBe(1);
  });
  it('splits into equal subnets', () => {
    const p = parseCidr('192.168.1.0/24')!;
    const s = splitSubnet(p.ip, p.prefix, 3)!;
    expect(s.prefix).toBe(26);
    expect(s.subnets.map((x) => x.cidr)).toEqual(['192.168.1.0/26', '192.168.1.64/26', '192.168.1.128/26', '192.168.1.192/26']);
  });
});

describe('Logic', () => {
  it('parses all operator spellings with the right precedence', () => {
    const t = truthTable(parseExpression("A + B . C'"));
    expect(t.vars).toEqual(['A', 'B', 'C']);
    expect(t.minterms).toEqual([2, 4, 5, 6, 7]);
    expect(truthTable(parseExpression('A NAND B')).minterms).toEqual([0, 1, 2]);
    expect(truthTable(parseExpression('NOT (A XOR B)')).minterms).toEqual([0, 3]);
    expect(() => parseExpression('A & (B')).toThrow(/bracket/);
    expect(() => parseExpression('A B')).toThrow();
  });
  it('simplifies with Quine-McCluskey', () => {
    expect(simplify(['A', 'B', 'C'], [2, 4, 5, 6, 7])).toBe("A + BC'");
    expect(simplify(['A', 'B'], [0, 1, 2, 3])).toBe('1');
    expect(simplify(['A', 'B'], [])).toBe('0');
    expect(simplify(['A', 'B', 'C', 'D'], [0, 1, 2, 5, 6, 7, 8, 9, 10, 14])).toBe("A'BD + B'C' + CD'");
  });
});

describe('Functional dependencies', () => {
  it('computes closures, keys and normal forms', () => {
    const all = parseAttributes('ABCDE');
    const fds = parseFDs('A -> B; B -> C; CD -> E');
    expect(closure(['A'], fds)).toEqual(['A', 'B', 'C']);
    expect(candidateKeys(all, fds)).toEqual([['A', 'D']]);
    const nf = normalForm(all, fds);
    expect(nf.highest).toBe('1NF'); // A -> B is partial on key AD
    expect(normalForm(parseAttributes('ABC'), parseFDs('A -> B\nB -> C')).highest).toBe('2NF');
    expect(normalForm(parseAttributes('ABC'), parseFDs('AB -> C; C -> B')).highest).toBe('3NF');
    expect(normalForm(parseAttributes('AB'), parseFDs('A -> B')).highest).toBe('BCNF');
    expect(candidateKeys(parseAttributes('ABC'), parseFDs('AB -> C; C -> B')).map((k) => k.join(''))).toEqual(['AB', 'AC']);
    expect(() => parseFDs('A B')).toThrow(/dependency/);
    expect(() => normalForm(parseAttributes('AB'), parseFDs('A -> Z'))).toThrow(/Not in the relation/);
  });
});

describe('What-if CGPA', () => {
  const rec = {
    scale: 'O_10' as const,
    semesters: [
      { semester: 1, subjects: [{ id: 'a', name: 'M1', credits: 4, grade: 'A' }, { id: 'b', name: 'P', credits: 4, grade: 'O' }] },
      { semester: 2, subjects: [{ id: 'c', name: 'M2', credits: 4, grade: '' }] },
    ],
  };
  it('projects the CGPA from hypothetical grades and a future semester without changing the record', () => {
    expect(whatIfCgpa(rec, {}).projected_cgpa).toBe(9);
    const r = whatIfCgpa(rec, { c: 'B' });
    expect(r.projected_cgpa).toBe(8);
    expect(r.delta).toBe(-1);
    expect(r.semesters.find((s) => s.semester === 2)).toMatchObject({ sgpa: 6, changed: true });
    expect(whatIfCgpa(rec, {}, { sgpa: 7, credits: 8 }).projected_cgpa).toBe(8);
    expect(whatIfCgpa(rec, {}, { sgpa: 12, credits: 8 }).projected_cgpa).toBe(9); // invalid extra ignored
    expect(rec.semesters[1].subjects[0].grade).toBe('');
  });
});

describe('Academic record ids', () => {
  it('gives every subject a unique id even when the client sends none', async () => {
    const { sanitiseRecord } = await import('../../server/services/academicRecordsService');
    const r = sanitiseRecord('std_ids', { scale: 'O_10', semesters: [{ semester: 1, subjects: [{ name: 'A', credits: 4, grade: 'A' }, { name: 'B', credits: 4, grade: 'O' }] }, { semester: 2, subjects: [{ name: 'C', credits: 4, grade: '' }, { name: 'D', credits: 4, grade: '' }] }] });
    const ids = r.semesters.flatMap((s) => s.subjects.map((x) => x.id));
    expect(new Set(ids).size).toBe(4);
    const dup = sanitiseRecord('std_ids', { semesters: [{ semester: 1, subjects: [{ id: 'x', name: 'A' }, { id: 'x', name: 'B' }] }] });
    expect(new Set(dup.semesters[0].subjects.map((x) => x.id)).size).toBe(2);
  });
});
