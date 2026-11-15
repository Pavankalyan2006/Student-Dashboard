import * as React from 'react';
import { FlaskConical, Cpu, MemoryStick, HardDrive, Network, Binary, Database, Plus, Trash2, Bot } from 'lucide-react';
import { PageContainer, PageHeader, PageSection } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { useUiStore } from '../../../store/uiStore';
import { cn } from '../../../lib/utils';
import { schedule, validateProcs, replacePages, parseReferenceString, scheduleDisk, type CpuAlgorithm, type PageAlgorithm, type DiskAlgorithm, type Proc } from '../sims/os';
import { parseCidr, subnetInfo, splitSubnet } from '../sims/net';
import { parseExpression, truthTable, simplify } from '../sims/logic';
import { parseAttributes, parseFDs, closure, normalForm } from '../sims/dbms';

type SimId = 'cpu' | 'paging' | 'disk' | 'subnet' | 'logic' | 'fd';
const SIMS: { id: SimId; label: string; subject: string; icon: React.ReactNode }[] = [
  { id: 'cpu', label: 'CPU scheduling', subject: 'Operating Systems', icon: <Cpu className="h-4 w-4" /> },
  { id: 'paging', label: 'Page replacement', subject: 'Operating Systems', icon: <MemoryStick className="h-4 w-4" /> },
  { id: 'disk', label: 'Disk scheduling', subject: 'Operating Systems', icon: <HardDrive className="h-4 w-4" /> },
  { id: 'subnet', label: 'Subnetting', subject: 'Computer Networks', icon: <Network className="h-4 w-4" /> },
  { id: 'logic', label: 'Logic & K-map', subject: 'Digital Logic', icon: <Binary className="h-4 w-4" /> },
  { id: 'fd', label: 'Normalization', subject: 'DBMS', icon: <Database className="h-4 w-4" /> },
];

const input = 'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none';
const COLORS = ['bg-blue-200', 'bg-emerald-200', 'bg-amber-200', 'bg-violet-200', 'bg-rose-200', 'bg-sky-200', 'bg-lime-200', 'bg-orange-200'];

function Err({ msg }: { msg: string | null }) {
  return msg ? <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700" role="alert">{msg}</p> : null;
}
function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-lg font-semibold text-slate-900">{value}</p></div>;
}
function Table({ head, rows, testId }: { head: string[]; rows: React.ReactNode[][]; testId?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm" data-testid={testId}>
        <thead className="bg-slate-50 text-xs text-slate-500"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="whitespace-nowrap px-3 py-1.5 tabular-nums">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function CpuSim({ explain }: { explain: (s: string) => void }) {
  const [procs, setProcs] = React.useState<Proc[]>([
    { id: 'P1', arrival: 0, burst: 8, priority: 3 },
    { id: 'P2', arrival: 1, burst: 4, priority: 1 },
    { id: 'P3', arrival: 2, burst: 9, priority: 4 },
    { id: 'P4', arrival: 3, burst: 5, priority: 2 },
  ]);
  const [algo, setAlgo] = React.useState<CpuAlgorithm>('SRTF');
  const [quantum, setQuantum] = React.useState(2);
  const error = validateProcs(procs);
  const r = error ? null : schedule(procs, algo, quantum);
  const set = (i: number, k: keyof Proc, v: string) => setProcs((ps) => ps.map((p, j) => (j === i ? { ...p, [k]: k === 'id' ? v.slice(0, 6) : Number(v) } : p)));
  const color = (pid: string | null) => (pid ? COLORS[procs.findIndex((p) => p.id === pid) % COLORS.length] : 'bg-slate-100');
  const total = r ? r.gantt[r.gantt.length - 1]?.end || 1 : 1;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-medium text-slate-600">Algorithm
          <select className={cn(input, 'mt-1 block')} value={algo} onChange={(e) => setAlgo(e.target.value as CpuAlgorithm)} data-testid="cpu-algo">
            <option value="FCFS">First come, first served</option>
            <option value="SJF">Shortest job first (non-preemptive)</option>
            <option value="SRTF">Shortest remaining time (preemptive)</option>
            <option value="RR">Round robin</option>
            <option value="PRIORITY">Priority (non-preemptive)</option>
            <option value="PRIORITY_P">Priority (preemptive)</option>
          </select>
        </label>
        {algo === 'RR' && <label className="text-xs font-medium text-slate-600">Time quantum<input className={cn(input, 'mt-1 block w-24')} type="number" min={1} max={20} value={quantum} onChange={(e) => setQuantum(Number(e.target.value))} /></label>}
      </div>
      <Table
        head={['Process', 'Arrival', 'Burst', ...(algo.startsWith('PRIORITY') ? ['Priority (low = first)'] : []), '']}
        rows={procs.map((p, i) => [
          <input key="id" className={cn(input, 'w-20')} value={p.id} aria-label="Process name" onChange={(e) => set(i, 'id', e.target.value)} />,
          <input key="a" className={cn(input, 'w-20')} type="number" min={0} value={p.arrival} aria-label={`${p.id} arrival`} onChange={(e) => set(i, 'arrival', e.target.value)} />,
          <input key="b" className={cn(input, 'w-20')} type="number" min={1} value={p.burst} aria-label={`${p.id} burst`} onChange={(e) => set(i, 'burst', e.target.value)} />,
          ...(algo.startsWith('PRIORITY') ? [<input key="p" className={cn(input, 'w-20')} type="number" min={0} value={p.priority ?? 0} aria-label={`${p.id} priority`} onChange={(e) => set(i, 'priority', e.target.value)} />] : []),
          <button key="x" type="button" className="rounded p-1 text-slate-400 hover:text-rose-600" aria-label={`Remove ${p.id}`} onClick={() => setProcs((ps) => ps.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></button>,
        ])}
      />
      <Button size="sm" variant="outline" className="gap-1.5" disabled={procs.length >= 20} onClick={() => setProcs((ps) => [...ps, { id: `P${ps.length + 1}`, arrival: 0, burst: 3, priority: 1 }])}><Plus className="h-3.5 w-3.5" /> Add process</Button>
      <Err msg={error} />
      {r && (
        <>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-slate-500">Gantt chart</p>
            <div className="flex h-12 w-full min-w-0 overflow-hidden rounded-lg border border-slate-200" data-testid="cpu-gantt">
              {r.gantt.map((g, i) => (
                <div key={i} className={cn('flex min-w-0 items-center justify-center border-r border-white text-xs font-semibold text-slate-800', color(g.pid))} style={{ width: `${((g.end - g.start) / total) * 100}%` }} title={`${g.pid ?? 'Idle'}: ${g.start}–${g.end}`}>
                  <span className="truncate">{g.pid ?? 'idle'}</span>
                </div>
              ))}
            </div>
            <div className="relative mt-1 h-4 text-[10px] text-slate-500">
              {r.gantt.map((g, i) => <span key={i} className="absolute -translate-x-1/2" style={{ left: `${(g.start / total) * 100}%` }}>{g.start}</span>)}
              <span className="absolute right-0">{total}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="Avg waiting" value={r.avg_waiting} />
            <Stat label="Avg turnaround" value={r.avg_turnaround} />
            <Stat label="Avg response" value={r.avg_response} />
            <Stat label="CPU busy" value={`${r.utilisation}%`} />
          </div>
          <Table head={['Process', 'Completion', 'Turnaround', 'Waiting', 'Response']} rows={r.processes.map((p) => [p.id, p.completion, p.turnaround, p.waiting, p.response])} testId="cpu-table" />
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => explain(`Explain step by step how ${algo} scheduling runs these processes (name arrival/burst${algo.startsWith('PRIORITY') ? '/priority' : ''}): ${procs.map((p) => `${p.id} ${p.arrival}/${p.burst}${algo.startsWith('PRIORITY') ? `/${p.priority}` : ''}`).join(', ')}${algo === 'RR' ? ` with quantum ${quantum}` : ''}. My simulator gives the Gantt chart ${r.gantt.map((g) => `${g.pid ?? 'idle'}(${g.start}-${g.end})`).join(' ')} and average waiting time ${r.avg_waiting}. Check it and explain why.`)}><Bot className="h-3.5 w-3.5" /> Explain with AI Tutor</Button>
        </>
      )}
    </div>
  );
}

function PagingSim({ explain }: { explain: (s: string) => void }) {
  const [refStr, setRefStr] = React.useState('7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1');
  const [frames, setFrames] = React.useState(3);
  const refs = parseReferenceString(refStr);
  const okFrames = Number.isInteger(frames) && frames >= 1 && frames <= 8;
  const results = refs && okFrames ? (['FIFO', 'LRU', 'OPT'] as PageAlgorithm[]).map((a) => ({ a, r: replacePages(refs, frames, a) })) : null;
  const [show, setShow] = React.useState<PageAlgorithm>('LRU');
  const cur = results?.find((x) => x.a === show)?.r;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-xs font-medium text-slate-600">Reference string<input className={cn(input, 'mt-1 block w-full')} value={refStr} onChange={(e) => setRefStr(e.target.value)} /></label>
        <label className="text-xs font-medium text-slate-600">Frames<input className={cn(input, 'mt-1 block w-20')} type="number" min={1} max={8} value={frames} onChange={(e) => setFrames(Number(e.target.value))} /></label>
      </div>
      <Err msg={!refs ? 'Enter up to 60 page numbers from 0 to 99, separated by spaces or commas.' : !okFrames ? 'Use 1 to 8 frames.' : null} />
      {results && (
        <>
          <div className="grid grid-cols-3 gap-2" data-testid="paging-faults">
            {results.map(({ a, r }) => (
              <button key={a} type="button" onClick={() => setShow(a)} aria-pressed={show === a} className={cn('rounded-lg p-3 text-left ring-1', show === a ? 'bg-blue-50 ring-blue-300' : 'bg-slate-50 ring-transparent')}>
                <p className="text-xs text-slate-500">{a === 'OPT' ? 'Optimal' : a}</p><p className="text-lg font-semibold text-slate-900">{r.faults} faults</p><p className="text-[11px] text-slate-500">{r.hit_ratio}% hits</p>
              </button>
            ))}
          </div>
          {cur && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
              <table className="text-center text-xs tabular-nums">
                <tbody>
                  <tr>{cur.steps.map((s, i) => <td key={i} className="px-1.5 py-1 font-semibold text-slate-900">{s.page}</td>)}</tr>
                  {Array.from({ length: frames }, (_, f) => (
                    <tr key={f}>{cur.steps.map((s, i) => <td key={i} className={cn('border border-slate-100 px-1.5 py-1', !s.hit && cur.steps[i].frames[f] === s.page ? 'bg-rose-100 font-semibold' : '')}>{s.frames[f] ?? ''}</td>)}</tr>
                  ))}
                  <tr>{cur.steps.map((s, i) => <td key={i} className={cn('px-1.5 py-1 text-[10px]', s.hit ? 'text-emerald-600' : 'text-rose-600')}>{s.hit ? 'hit' : 'miss'}</td>)}</tr>
                </tbody>
              </table>
            </div>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => explain(`For the reference string ${refStr} with ${frames} frames, my simulator gives FIFO ${results[0].r.faults}, LRU ${results[1].r.faults} and Optimal ${results[2].r.faults} page faults. Walk me through ${show} step by step and explain Belady's anomaly in one paragraph.`)}><Bot className="h-3.5 w-3.5" /> Explain with AI Tutor</Button>
        </>
      )}
    </div>
  );
}

function DiskSim({ explain }: { explain: (s: string) => void }) {
  const [reqStr, setReqStr] = React.useState('98 183 37 122 14 124 65 67');
  const [head, setHead] = React.useState(53);
  const [max, setMax] = React.useState(199);
  const [dir, setDir] = React.useState<'up' | 'down'>('up');
  const tokens = reqStr.split(/[\s,]+/).filter(Boolean);
  const reqs = tokens.length && tokens.every((t) => /^\d{1,5}$/.test(t)) ? tokens.map(Number) : null;
  const valid = reqs && reqs.length <= 40 && reqs.every((r) => Number.isInteger(r) && r >= 0 && r <= max) && Number.isInteger(head) && head >= 0 && head <= max && max >= 10 && max <= 10000;
  const algos: DiskAlgorithm[] = ['FCFS', 'SSTF', 'SCAN', 'CSCAN', 'LOOK', 'CLOOK'];
  const results = valid ? algos.map((a) => ({ a, r: scheduleDisk(reqs!, head, max, a, dir) })) : null;
  const [show, setShow] = React.useState<DiskAlgorithm>('SSTF');
  const cur = results?.find((x) => x.a === show)?.r;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 text-xs font-medium text-slate-600">Request queue<input className={cn(input, 'mt-1 block w-full')} value={reqStr} onChange={(e) => setReqStr(e.target.value)} /></label>
        <label className="text-xs font-medium text-slate-600">Head<input className={cn(input, 'mt-1 block w-20')} type="number" value={head} onChange={(e) => setHead(Number(e.target.value))} /></label>
        <label className="text-xs font-medium text-slate-600">Last cylinder<input className={cn(input, 'mt-1 block w-24')} type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} /></label>
        <label className="text-xs font-medium text-slate-600">Moving<select className={cn(input, 'mt-1 block')} value={dir} onChange={(e) => setDir(e.target.value as 'up' | 'down')}><option value="up">Toward higher</option><option value="down">Toward lower</option></select></label>
      </div>
      <Err msg={valid ? null : 'Enter up to 40 cylinder numbers between 0 and the last cylinder, and a head position in that range.'} />
      {results && cur && (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6" data-testid="disk-totals">
            {results.map(({ a, r }) => (
              <button key={a} type="button" onClick={() => setShow(a)} aria-pressed={show === a} className={cn('rounded-lg p-2 text-left ring-1', show === a ? 'bg-blue-50 ring-blue-300' : 'bg-slate-50 ring-transparent')}>
                <p className="text-[11px] text-slate-500">{a.replace('CSCAN', 'C-SCAN').replace('CLOOK', 'C-LOOK')}</p><p className="font-semibold text-slate-900">{r.total_movement}</p>
              </button>
            ))}
          </div>
          <svg viewBox={`0 0 ${max} ${cur.path.length * 12 + 10}`} preserveAspectRatio="none" className="h-56 w-full rounded-xl border border-slate-200 bg-white" role="img" aria-label={`${show} head movement`}>
            <polyline fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" points={cur.path.map((c, i) => `${c},${5 + i * 12}`).join(' ')} />
          </svg>
          <div className="-mt-3 flex justify-between text-[10px] text-slate-500"><span>0</span><span>Cylinder</span><span>{max}</span></div>
          <p className="text-xs text-slate-600">Order: {cur.path.join(' → ')}</p>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => explain(`Disk requests ${reqStr}, head at ${head}, cylinders 0-${max}, moving ${dir === 'up' ? 'toward higher' : 'toward lower'} cylinders. My simulator gives ${show} total head movement ${cur.total_movement} with order ${cur.path.join(', ')}. Explain ${show} step by step and compare it with SSTF and SCAN.`)}><Bot className="h-3.5 w-3.5" /> Explain with AI Tutor</Button>
        </>
      )}
    </div>
  );
}

function SubnetSim({ explain }: { explain: (s: string) => void }) {
  const [cidr, setCidr] = React.useState('192.168.10.77/26');
  const [parts, setParts] = React.useState(4);
  const p = parseCidr(cidr);
  const info = p ? subnetInfo(p.ip, p.prefix) : null;
  const split = p && parts >= 2 && parts <= 64 ? splitSubnet(p.ip, p.prefix, parts) : null;
  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium text-slate-600">IPv4 address with prefix or mask<input className={cn(input, 'mt-1 block w-full max-w-sm')} value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="10.1.2.3/20 or 10.1.2.3 255.255.240.0" data-testid="subnet-input" /></label>
      <Err msg={info ? null : 'Enter an address like 192.168.1.10/24 or 192.168.1.10 255.255.255.0.'} />
      {info && (
        <>
          <Table head={['Field', 'Value']} testId="subnet-table" rows={[
            ['Network', `${info.network}/${info.prefix}`], ['Broadcast', info.broadcast], ['Subnet mask', info.mask], ['Wildcard', info.wildcard], ['Mask in binary', <code key="b" className="text-xs">{info.binary_mask}</code>],
            ['Usable hosts', info.first_host ? `${info.first_host} – ${info.last_host} (${info.usable_hosts.toLocaleString()})` : '—'], ['Total addresses', info.total_addresses.toLocaleString()], ['Class', info.ip_class], ['Private range (RFC 1918)', info.private_range ? 'Yes' : 'No'],
          ]} />
          <div className="flex items-end gap-3">
            <label className="text-xs font-medium text-slate-600">Split into<input className={cn(input, 'mt-1 block w-24')} type="number" min={2} max={64} value={parts} onChange={(e) => setParts(Number(e.target.value))} /></label>
            <span className="pb-2 text-xs text-slate-500">{split ? `${split.subnets.length} subnets of /${split.prefix}` : 'Not possible with this prefix'}</span>
          </div>
          {split && <Table head={['Subnet', 'Hosts', 'Broadcast']} rows={split.subnets.map((s) => [s.cidr, s.first_host ? `${s.first_host} – ${s.last_host}` : '—', s.broadcast])} />}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => explain(`Explain step by step, in binary, how to find the network address, broadcast address and host range for ${cidr}. My calculator says network ${info.network}/${info.prefix}, broadcast ${info.broadcast}, ${info.usable_hosts} usable hosts.`)}><Bot className="h-3.5 w-3.5" /> Explain with AI Tutor</Button>
        </>
      )}
    </div>
  );
}

function LogicSim({ explain }: { explain: (s: string) => void }) {
  const [expr, setExpr] = React.useState("(A & B) | (A & !C) | (B & C')");
  let error: string | null = null;
  let table: ReturnType<typeof truthTable> | null = null;
  let sop = '';
  try {
    table = truthTable(parseExpression(expr));
    sop = simplify(table.vars, table.minterms);
  } catch (e: any) {
    error = e?.message || 'That expression could not be read.';
  }
  return (
    <div className="space-y-4">
      <label className="block text-xs font-medium text-slate-600">Boolean expression<input className={cn(input, 'mt-1 block w-full font-mono')} value={expr} onChange={(e) => setExpr(e.target.value)} data-testid="logic-input" /></label>
      <p className="text-[11px] text-slate-500">Use AND (&amp;, *, .), OR (|, +), NOT (!, ~, A'), XOR (^), NAND, NOR, XNOR, brackets, 0 and 1. Up to 6 variables.</p>
      <Err msg={error} />
      {table && (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Stat label="Simplified (sum of products)" value={<span className="font-mono" data-testid="logic-sop">{sop}</span>} />
            <Stat label="Minterms" value={<span className="text-sm">{table.minterms.length ? `Σm(${table.minterms.join(', ')})` : 'none'}</span>} />
          </div>
          <Table head={[...table.vars, 'Out']} rows={table.rows.map((r) => [...r.values.map((v) => (v ? 1 : 0)), <strong key="o" className={r.out ? 'text-emerald-700' : 'text-slate-400'}>{r.out ? 1 : 0}</strong>])} />
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => explain(`Simplify ${expr} step by step using a K-map${table!.vars.length > 4 ? ' or Quine-McCluskey' : ''}. My simulator gives minterms Σm(${table!.minterms.join(', ')}) and the sum of products ${sop}. Show the groupings and check the result.`)}><Bot className="h-3.5 w-3.5" /> Explain with AI Tutor</Button>
        </>
      )}
    </div>
  );
}

function FdSim({ explain }: { explain: (s: string) => void }) {
  const [attrs, setAttrs] = React.useState('A B C D E');
  const [fdText, setFdText] = React.useState('A -> B\nB -> C\nC D -> E');
  const [of, setOf] = React.useState('A');
  let error: string | null = null;
  let nf: ReturnType<typeof normalForm> | null = null;
  let all: string[] = [];
  let fds: ReturnType<typeof parseFDs> = [];
  try {
    all = parseAttributes(attrs);
    if (!all.length) throw new Error('List the attributes of the relation.');
    fds = parseFDs(fdText);
    nf = normalForm(all, fds);
  } catch (e: any) {
    error = e?.message || 'Check the attributes and dependencies.';
  }
  const ofAttrs = parseAttributes(of).filter((a) => all.includes(a));
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">Attributes<input className={cn(input, 'mt-1 block w-full')} value={attrs} onChange={(e) => setAttrs(e.target.value)} /></label>
        <label className="text-xs font-medium text-slate-600">Closure of<input className={cn(input, 'mt-1 block w-full')} value={of} onChange={(e) => setOf(e.target.value)} /></label>
      </div>
      <label className="block text-xs font-medium text-slate-600">Functional dependencies (one per line)<textarea className="mt-1 block h-24 w-full rounded-lg border border-slate-200 p-2.5 font-mono text-sm focus:border-blue-400 focus:outline-none" value={fdText} onChange={(e) => setFdText(e.target.value)} data-testid="fd-input" /></label>
      <p className="text-[11px] text-slate-500">Single-letter attributes can be written together (AB → C). For longer names use commas or spaces (roll, course → grade).</p>
      <Err msg={error} />
      {nf && (
        <>
          <div className="grid gap-2 sm:grid-cols-3">
            <Stat label="Candidate keys" value={<span className="text-sm">{nf.keys.map((k) => `{${k.join(', ')}}`).join('  ') || '—'}</span>} />
            <Stat label="Highest normal form" value={<span data-testid="fd-nf">{nf.highest}</span>} />
            <Stat label={`Closure of {${ofAttrs.join(', ')}}`} value={<span className="text-sm">{ofAttrs.length ? `{${closure(ofAttrs, fds).join(', ')}}` : '—'}</span>} />
          </div>
          {nf.violations.length > 0 && (
            <ul className="space-y-1.5">
              {nf.violations.map((v, i) => <li key={i} className="rounded-lg bg-amber-50 p-2.5 text-sm text-amber-900"><strong>Breaks {v.form}:</strong> {v.fd.lhs.join(',')} → {v.fd.rhs.join(',')}. {v.why}</li>)}
            </ul>
          )}
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => explain(`Relation R(${all.join(', ')}) with dependencies ${fds.map((f) => `${f.lhs.join('')}→${f.rhs.join('')}`).join(', ')}. My tool finds candidate keys ${nf!.keys.map((k) => k.join('')).join(', ')} and says it is in ${nf!.highest}. Explain why, and decompose it into BCNF (or 3NF if BCNF loses a dependency), step by step.`)}><Bot className="h-3.5 w-3.5" /> Explain with AI Tutor</Button>
        </>
      )}
    </div>
  );
}

/**
 * Virtual University Lab: simulators for core B.Tech subjects that run entirely in the browser. They compute
 * results from the inputs the student types; no code is sent to or run on the server.
 */
export function VirtualLabPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);
  const initial = (new URLSearchParams(window.location.search).get('sim') as SimId) || 'cpu';
  const [sim, setSim] = React.useState<SimId>(SIMS.some((s) => s.id === initial) ? initial : 'cpu');
  const explain = (prompt: string) => {
    setAiInitialPrompt(prompt);
    onNavigate('/ai-agent');
  };
  const meta = SIMS.find((s) => s.id === sim)!;
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Practice"
        title="Virtual Lab"
        description="Simulators for Operating Systems, Computer Networks, Digital Logic and DBMS. Change the inputs and every table and chart updates. Everything runs in your browser."
        icon={<FlaskConical className="h-6 w-6" />}
        actions={<Button variant="outline" onClick={() => onNavigate('/labs')}>Lab Assistant</Button>}
      />
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Simulators">
        {SIMS.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={sim === s.id} onClick={() => setSim(s.id)} className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ring-1', sim === s.id ? 'bg-slate-900 text-white ring-slate-900' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50')} data-testid={`sim-${s.id}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>
      <PageSection className="min-w-0" title={meta.label} description={meta.subject}>
        {sim === 'cpu' && <CpuSim explain={explain} />}
        {sim === 'paging' && <PagingSim explain={explain} />}
        {sim === 'disk' && <DiskSim explain={explain} />}
        {sim === 'subnet' && <SubnetSim explain={explain} />}
        {sim === 'logic' && <LogicSim explain={explain} />}
        {sim === 'fd' && <FdSim explain={explain} />}
      </PageSection>
    </PageContainer>
  );
}

export default VirtualLabPage;
