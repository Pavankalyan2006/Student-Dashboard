// Operating systems simulators: CPU scheduling, page replacement and disk scheduling.
// Pure functions, no I/O. Every number shown on the Virtual Lab page comes from these.

// ---------- CPU scheduling ----------

export type CpuAlgorithm = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'PRIORITY' | 'PRIORITY_P';

export interface Proc {
  id: string;
  arrival: number;
  burst: number;
  /** Lower number = higher priority. */
  priority?: number;
}
export interface GanttSlot {
  pid: string | null; // null = CPU idle
  start: number;
  end: number;
}
export interface ProcResult extends Proc {
  completion: number;
  turnaround: number;
  waiting: number;
  response: number;
}
export interface ScheduleResult {
  gantt: GanttSlot[];
  processes: ProcResult[];
  avg_turnaround: number;
  avg_waiting: number;
  avg_response: number;
  /** Busy time / total time, 0–100. */
  utilisation: number;
  context_switches: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function validateProcs(procs: Proc[]): string | null {
  if (!procs.length) return 'Add at least one process.';
  if (procs.length > 20) return 'Use 20 processes or fewer.';
  const ids = new Set<string>();
  for (const p of procs) {
    if (!p.id.trim()) return 'Every process needs a name.';
    if (ids.has(p.id)) return `Process name ${p.id} is used twice.`;
    ids.add(p.id);
    if (!Number.isInteger(p.arrival) || p.arrival < 0 || p.arrival > 1000) return `${p.id}: arrival must be a whole number from 0 to 1000.`;
    if (!Number.isInteger(p.burst) || p.burst < 1 || p.burst > 100) return `${p.id}: burst must be a whole number from 1 to 100.`;
  }
  return null;
}

/**
 * Simulates one tick at a time. Ties are broken by arrival time, then by the order the processes were entered,
 * which is how most textbooks break them.
 */
export function schedule(procs: Proc[], algo: CpuAlgorithm, quantum = 2): ScheduleResult {
  const order = new Map(procs.map((p, i) => [p.id, i]));
  const remaining = new Map(procs.map((p) => [p.id, p.burst]));
  const firstRun = new Map<string, number>();
  const completion = new Map<string, number>();
  const ticks: (string | null)[] = [];
  const preemptive = algo === 'SRTF' || algo === 'RR' || algo === 'PRIORITY_P';
  const q = Math.max(1, Math.floor(quantum));
  const readyQueue: string[] = []; // RR only
  const queued = new Set<string>();
  let current: string | null = null;
  let sliceUsed = 0;
  let t = 0;
  const byTie = (a: Proc, b: Proc) => a.arrival - b.arrival || order.get(a.id)! - order.get(b.id)!;
  const arrived = () => procs.filter((p) => p.arrival <= t && remaining.get(p.id)! > 0);

  while (completion.size < procs.length && t < 100_000) {
    // RR: newly arrived processes join the queue before a preempted one goes to the back.
    if (algo === 'RR') {
      for (const p of [...procs].sort(byTie)) {
        if (p.arrival <= t && remaining.get(p.id)! > 0 && !queued.has(p.id) && p.id !== current) {
          readyQueue.push(p.id);
          queued.add(p.id);
        }
      }
      if (current && sliceUsed >= q && remaining.get(current)! > 0) {
        readyQueue.push(current);
        queued.add(current);
        current = null;
      }
      if (!current && readyQueue.length) {
        current = readyQueue.shift()!;
        queued.delete(current);
        sliceUsed = 0;
      }
    } else if (!current || preemptive) {
      const ready = arrived();
      if (ready.length) {
        const key = (p: Proc) =>
          algo === 'FCFS' ? 0 : algo === 'SJF' ? p.burst : algo === 'SRTF' ? remaining.get(p.id)! : p.priority ?? 0;
        ready.sort((a, b) => key(a) - key(b) || byTie(a, b));
        // A running process keeps the CPU on a tie.
        const best = ready[0];
        if (!current || key(best) < key(procs.find((p) => p.id === current)!)) current = best.id;
      }
    }

    if (!current) {
      ticks.push(null);
      t++;
      continue;
    }
    if (!firstRun.has(current)) firstRun.set(current, t);
    ticks.push(current);
    remaining.set(current, remaining.get(current)! - 1);
    sliceUsed++;
    t++;
    if (remaining.get(current) === 0) {
      completion.set(current, t);
      current = null;
      sliceUsed = 0;
    }
  }

  const gantt: GanttSlot[] = [];
  ticks.forEach((pid, i) => {
    const last = gantt[gantt.length - 1];
    if (last && last.pid === pid) last.end = i + 1;
    else gantt.push({ pid, start: i, end: i + 1 });
  });
  const processes = procs.map((p) => {
    const c = completion.get(p.id)!;
    return { ...p, completion: c, turnaround: c - p.arrival, waiting: c - p.arrival - p.burst, response: firstRun.get(p.id)! - p.arrival };
  });
  const n = processes.length;
  const busy = ticks.filter(Boolean).length;
  const runs = gantt.filter((g) => g.pid);
  return {
    gantt,
    processes,
    avg_turnaround: r2(processes.reduce((s, p) => s + p.turnaround, 0) / n),
    avg_waiting: r2(processes.reduce((s, p) => s + p.waiting, 0) / n),
    avg_response: r2(processes.reduce((s, p) => s + p.response, 0) / n),
    utilisation: ticks.length ? r2((busy / ticks.length) * 100) : 0,
    context_switches: Math.max(0, runs.length - 1),
  };
}

// ---------- Page replacement ----------

export type PageAlgorithm = 'FIFO' | 'LRU' | 'OPT';

export interface PageStep {
  page: number;
  frames: (number | null)[];
  hit: boolean;
  /** Page removed on this step, if any. */
  evicted: number | null;
}
export interface PageResult {
  steps: PageStep[];
  faults: number;
  hits: number;
  hit_ratio: number;
}

export function parseReferenceString(s: string): number[] | null {
  const parts = s.split(/[\s,]+/).filter(Boolean);
  if (!parts.length || parts.length > 60) return null;
  const nums = parts.map(Number);
  return nums.every((n) => Number.isInteger(n) && n >= 0 && n <= 99) ? nums : null;
}

export function replacePages(refs: number[], frameCount: number, algo: PageAlgorithm): PageResult {
  const frames: (number | null)[] = Array(frameCount).fill(null);
  const loadedAt = new Map<number, number>();
  const lastUsed = new Map<number, number>();
  const steps: PageStep[] = [];
  let faults = 0;
  refs.forEach((page, i) => {
    let evicted: number | null = null;
    const hit = frames.includes(page);
    if (!hit) {
      faults++;
      let slot = frames.indexOf(null);
      if (slot === -1) {
        const victimOf = (f: number) => {
          if (algo === 'FIFO') return loadedAt.get(f)!;
          if (algo === 'LRU') return lastUsed.get(f)!;
          // OPT: the page used furthest in the future (never used again counts as furthest).
          const next = refs.indexOf(f, i + 1);
          return next === -1 ? -Infinity : -next;
        };
        slot = 0;
        for (let k = 1; k < frames.length; k++) if (victimOf(frames[k]!) < victimOf(frames[slot]!)) slot = k;
        evicted = frames[slot];
      }
      frames[slot] = page;
      loadedAt.set(page, i);
    }
    lastUsed.set(page, i);
    steps.push({ page, frames: [...frames], hit, evicted });
  });
  return { steps, faults, hits: refs.length - faults, hit_ratio: refs.length ? r2(((refs.length - faults) / refs.length) * 100) : 0 };
}

// ---------- Disk scheduling ----------

export type DiskAlgorithm = 'FCFS' | 'SSTF' | 'SCAN' | 'CSCAN' | 'LOOK' | 'CLOOK';

export interface DiskResult {
  /** Cylinders visited in order, starting at the head. */
  path: number[];
  total_movement: number;
}

/** `direction` is the way the head is moving at the start (toward higher or lower cylinders). */
export function scheduleDisk(requests: number[], head: number, maxCylinder: number, algo: DiskAlgorithm, direction: 'up' | 'down' = 'up'): DiskResult {
  const path = [head];
  const lower = requests.filter((r) => r < head).sort((a, b) => b - a);
  const upper = requests.filter((r) => r >= head).sort((a, b) => a - b);
  if (algo === 'FCFS') path.push(...requests);
  else if (algo === 'SSTF') {
    const left = [...requests];
    let at = head;
    while (left.length) {
      let best = 0;
      for (let i = 1; i < left.length; i++) if (Math.abs(left[i] - at) < Math.abs(left[best] - at)) best = i;
      at = left.splice(best, 1)[0];
      path.push(at);
    }
  } else {
    const first = direction === 'up' ? upper : lower;
    const second = direction === 'up' ? lower : upper;
    const edge = direction === 'up' ? maxCylinder : 0;
    const otherEdge = direction === 'up' ? 0 : maxCylinder;
    path.push(...first);
    if (algo === 'SCAN') {
      if (second.length) path.push(edge, ...second);
    } else if (algo === 'LOOK') path.push(...second);
    else if (algo === 'CSCAN') {
      if (second.length) path.push(edge, otherEdge, ...[...second].reverse());
    } else if (algo === 'CLOOK') path.push(...[...second].reverse());
  }
  // Drop a repeated cylinder (e.g. a request already at the edge).
  const clean = path.filter((c, i) => i === 0 || c !== path[i - 1]);
  let total = 0;
  for (let i = 1; i < clean.length; i++) total += Math.abs(clean[i] - clean[i - 1]);
  return { path: clean, total_movement: total };
}
