// Architecture Studio diagrams: a small text language for class, sequence, flowchart/activity and ER diagrams,
// parsed and laid out here and drawn as SVG. Pure (no DOM), shared by the browser and the server, which uses it to
// check AI-drafted diagrams before returning them. The text is the editable source of every diagram.
//
// All user text is escaped before it goes into the SVG.
import type { DatabaseDesign } from '../models/systemDesignTypes';

export type DiagramKind = 'class' | 'sequence' | 'flowchart' | 'er';
export const DIAGRAM_KINDS: DiagramKind[] = ['class', 'sequence', 'flowchart', 'er'];
export const DIAGRAM_LIMITS = { maxSource: 10_000, maxNodes: 60, maxEdges: 120, maxDiagrams: 20 };

export interface DiagramError {
  line: number;
  message: string;
}
export interface RenderedDiagram {
  svg: string;
  width: number;
  height: number;
  errors: DiagramError[];
  /** Counts, for tests and the editor's status line. */
  nodes: number;
  edges: number;
}

export const escapeXml = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const FONT = 13;
const CHAR = 7.2; // average glyph width at 13px
const textW = (s: string, size = FONT) => Math.ceil(s.length * CHAR * (size / FONT));
const clipText = (s: string, n = 60) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

const lines = (src: string) =>
  String(src || '')
    .slice(0, DIAGRAM_LIMITS.maxSource)
    .split(/\r?\n/)
    .map((raw, i) => ({ n: i + 1, text: raw.replace(/%%.*$/, '').trim() }))
    .filter((l) => l.text);

function svgDoc(width: number, height: number, body: string): string {
  const w = Math.max(160, Math.ceil(width));
  const h = Math.max(80, Math.ceil(height));
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${FONT}">` +
    `<defs>` +
    `<marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#334155"/></marker>` +
    `<marker id="open" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10" fill="none" stroke="#334155"/></marker>` +
    `<marker id="triangle" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12" markerHeight="12" orient="auto-start-reverse"><path d="M0,0 L12,6 L0,12 z" fill="#fff" stroke="#334155"/></marker>` +
    `<marker id="diamond" viewBox="0 0 14 10" refX="13" refY="5" markerWidth="14" markerHeight="10" orient="auto-start-reverse"><path d="M0,5 L7,0 L14,5 L7,10 z" fill="#fff" stroke="#334155"/></marker>` +
    `<marker id="diamondFilled" viewBox="0 0 14 10" refX="13" refY="5" markerWidth="14" markerHeight="10" orient="auto-start-reverse"><path d="M0,5 L7,0 L14,5 L7,10 z" fill="#334155"/></marker>` +
    `</defs><rect width="100%" height="100%" fill="#ffffff"/>${body}</svg>`
  );
}

// ---------- Layered layout (flowchart, class, ER) ----------

interface LNode {
  id: string;
  w: number;
  h: number;
  x?: number;
  y?: number;
  order: number;
}
interface LEdge {
  from: string;
  to: string;
}

/** Longest-path layers from the sources, ignoring edges that close a cycle; nodes centred in each row. */
function layered(nodes: LNode[], edges: LEdge[], gapX = 48, gapY = 70, pad = 24, padX = 70): { width: number; height: number } {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out = new Map<string, string[]>();
  for (const e of edges) if (byId.has(e.from) && byId.has(e.to) && e.from !== e.to) out.set(e.from, [...(out.get(e.from) || []), e.to]);
  // Drop back edges found by DFS so the rest is acyclic.
  const state = new Map<string, number>();
  const forward = new Map<string, string[]>();
  const visit = (id: string) => {
    state.set(id, 1);
    for (const t of out.get(id) || []) {
      if (state.get(t) === 1) continue; // back edge
      forward.set(id, [...(forward.get(id) || []), t]);
      if (!state.get(t)) visit(t);
    }
    state.set(id, 2);
  };
  for (const n of nodes) if (!state.get(n.id)) visit(n.id);
  const layer = new Map<string, number>(nodes.map((n) => [n.id, 0]));
  // Relax edges |V| times (graph is acyclic now).
  for (let k = 0; k < nodes.length; k++) {
    let changed = false;
    for (const [f, ts] of forward)
      for (const t of ts)
        if (layer.get(t)! < layer.get(f)! + 1) {
          layer.set(t, layer.get(f)! + 1);
          changed = true;
        }
    if (!changed) break;
  }
  const rows: LNode[][] = [];
  for (const n of [...nodes].sort((a, b) => a.order - b.order)) (rows[layer.get(n.id)!] ||= []).push(n);
  const rowW = rows.map((r) => (r || []).reduce((s, n) => s + n.w, 0) + gapX * Math.max(0, (r || []).length - 1));
  const width = Math.max(...rowW, 100) + padX * 2;
  let y = pad;
  for (const r of rows) {
    if (!r) continue;
    const h = Math.max(...r.map((n) => n.h));
    let x = (width - rowW[rows.indexOf(r)]) / 2;
    for (const n of r) {
      n.x = x;
      n.y = y + (h - n.h) / 2;
      x += n.w + gapX;
    }
    y += h + gapY;
  }
  return { width, height: y - gapY + pad };
}

/** Point where the line from the box centre towards (tx, ty) leaves the box. */
function boxExit(n: LNode, tx: number, ty: number) {
  const cx = n.x! + n.w / 2;
  const cy = n.y! + n.h / 2;
  const dx = tx - cx;
  const dy = ty - cy;
  if (!dx && !dy) return { x: cx, y: cy };
  const sx = dx ? n.w / 2 / Math.abs(dx) : Infinity;
  const sy = dy ? n.h / 2 / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return { x: cx + dx * s, y: cy + dy * s };
}

/** True when the segment p-q passes through the box (Liang-Barsky clipping). */
function crosses(n: LNode, p: { x: number; y: number }, q: { x: number; y: number }): boolean {
  const m = 4;
  const x0 = n.x! - m, x1 = n.x! + n.w + m, y0 = n.y! - m, y1 = n.y! + n.h + m;
  let t0 = 0, t1 = 1;
  const dx = q.x - p.x, dy = q.y - p.y;
  for (const [pp, qq] of [[-dx, p.x - x0], [dx, x1 - p.x], [-dy, p.y - y0], [dy, y1 - p.y]]) {
    if (pp === 0) {
      if (qq < 0) return false;
      continue;
    }
    const r = qq / pp;
    if (pp < 0) t0 = Math.max(t0, r);
    else t1 = Math.min(t1, r);
    if (t0 > t1) return false;
  }
  return true;
}

function edgePath(a: LNode, b: LNode, others: LNode[] = []): { d: string; mx: number; my: number; x1: number; y1: number; x2: number; y2: number } {
  if (a === b) {
    const x = a.x! + a.w;
    const y = a.y! + a.h / 2;
    return { d: `M${x},${y - 10} C${x + 40},${y - 30} ${x + 40},${y + 30} ${x},${y + 10}`, mx: x + 34, my: y, x1: x, y1: y - 10, x2: x, y2: y + 10 };
  }
  const p1 = boxExit(a, b.x! + b.w / 2, b.y! + b.h / 2);
  const p2 = boxExit(b, a.x! + a.w / 2, a.y! + a.h / 2);
  // An edge that goes back up is drawn as a curve so it does not overlap the forward edges.
  if (b.y! < a.y! - 1) {
    const off = Math.max(a.x! + a.w, b.x! + b.w) + 40;
    const q1 = { x: a.x! + a.w, y: a.y! + a.h / 2 };
    const q2 = { x: b.x! + b.w, y: b.y! + b.h / 2 };
    return { d: `M${q1.x},${q1.y} C${off},${q1.y} ${off},${q2.y} ${q2.x},${q2.y}`, mx: off - 10, my: (q1.y + q2.y) / 2, x1: q1.x, y1: q1.y, x2: q2.x, y2: q2.y };
  }
  // A long edge that would pass through another box goes round it on the left.
  const blocking = others.filter((o) => o !== a && o !== b && crosses(o, p1, p2));
  if (blocking.length) {
    const left = Math.min(a.x!, b.x!, ...blocking.map((o) => o.x!)) - 36;
    const q1 = { x: a.x!, y: a.y! + a.h / 2 };
    const q2 = { x: b.x!, y: b.y! + b.h / 2 };
    return { d: `M${q1.x},${q1.y} C${left},${q1.y} ${left},${q2.y} ${q2.x},${q2.y}`, mx: left + 8, my: (q1.y + q2.y) / 2, x1: q1.x, y1: q1.y, x2: q2.x, y2: q2.y };
  }
  return { d: `M${p1.x},${p1.y} L${p2.x},${p2.y}`, mx: (p1.x + p2.x) / 2, my: (p1.y + p2.y) / 2, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
}

const label = (x: number, y: number, text: string, opts: { anchor?: string; weight?: number; size?: number; fill?: string; bg?: boolean } = {}) => {
  const t = escapeXml(text);
  const bg = opts.bg ? `<rect x="${x - textW(text, opts.size) / 2 - 3}" y="${y - (opts.size || FONT) + 1}" width="${textW(text, opts.size) + 6}" height="${(opts.size || FONT) + 5}" fill="#fff" opacity="0.9"/>` : '';
  return `${bg}<text x="${x}" y="${y}" text-anchor="${opts.anchor || 'middle'}"${opts.weight ? ` font-weight="${opts.weight}"` : ''}${opts.size ? ` font-size="${opts.size}"` : ''} fill="${opts.fill || '#0f172a'}">${t}</text>`;
};

// ---------- Flowchart / activity ----------

type Shape = 'rect' | 'round' | 'circle' | 'diamond' | 'io';
const NODE_RE = /^([A-Za-z_][\w-]*)\s*(?:\(\((.+?)\)\)|\[\/(.+?)\/\]|\[(.+?)\]|\((.+?)\)|\{(.+?)\})?/;

function parseNodeToken(tok: string): { id: string; text?: string; shape?: Shape } | null {
  const m = NODE_RE.exec(tok.trim());
  if (!m || m[0].length !== tok.trim().length) return null;
  if (m[2]) return { id: m[1], text: m[2], shape: 'circle' };
  if (m[3]) return { id: m[1], text: m[3], shape: 'io' };
  if (m[4]) return { id: m[1], text: m[4], shape: 'rect' };
  if (m[5]) return { id: m[1], text: m[5], shape: 'round' };
  if (m[6]) return { id: m[1], text: m[6], shape: 'diamond' };
  return { id: m[1] };
}

export function renderFlowchart(src: string): RenderedDiagram {
  const errors: DiagramError[] = [];
  const nodes = new Map<string, { text: string; shape: Shape; order: number }>();
  const edges: { from: string; to: string; label?: string; dashed: boolean }[] = [];
  const touch = (t: { id: string; text?: string; shape?: Shape }) => {
    const cur = nodes.get(t.id);
    if (!cur) {
      if (nodes.size >= DIAGRAM_LIMITS.maxNodes) return false;
      nodes.set(t.id, { text: t.text || t.id, shape: t.shape || 'rect', order: nodes.size });
    } else if (t.text) nodes.set(t.id, { ...cur, text: t.text, shape: t.shape || cur.shape });
    return true;
  };
  for (const { n, text } of lines(src)) {
    if (/^(flowchart|graph|activity)\b/i.test(text)) continue;
    // Split on arrows, keeping their labels: a -- yes --> b, a -->|yes| b, a -.-> b
    const parts = text.split(/\s*(--\s*[^->|]+?\s*-->|-->\|[^|]*\||-\.->|-->|---)\s*/);
    if (parts.length === 1) {
      const t = parseNodeToken(text);
      if (!t) errors.push({ line: n, message: 'Not a node or an arrow. Write a node like A[Text] or an arrow like A --> B.' });
      else if (!touch(t)) errors.push({ line: n, message: `At most ${DIAGRAM_LIMITS.maxNodes} nodes.` });
      continue;
    }
    let prev: string | null = null;
    let ok = true;
    for (let i = 0; i < parts.length; i += 2) {
      const t = parseNodeToken(parts[i]);
      if (!t) {
        errors.push({ line: n, message: `"${clipText(parts[i], 30)}" is not a node name.` });
        ok = false;
        break;
      }
      if (!touch(t)) {
        errors.push({ line: n, message: `At most ${DIAGRAM_LIMITS.maxNodes} nodes.` });
        ok = false;
        break;
      }
      if (prev) {
        const arrow = parts[i - 1];
        const lbl = /^--\s*(.+?)\s*-->$/.exec(arrow)?.[1] || /^-->\|(.*)\|$/.exec(arrow)?.[1] || undefined;
        if (edges.length < DIAGRAM_LIMITS.maxEdges) edges.push({ from: prev, to: t.id, label: lbl?.trim() || undefined, dashed: arrow === '-.->' });
      }
      prev = t.id;
    }
    if (!ok) continue;
  }
  const L: LNode[] = [...nodes].map(([id, v]) => {
    const w = Math.max(v.shape === 'diamond' ? 110 : 90, textW(clipText(v.text)) + (v.shape === 'diamond' ? 60 : v.shape === 'io' ? 44 : 28));
    const h = v.shape === 'diamond' ? 64 : v.shape === 'circle' ? 40 : 40;
    return { id, w, h, order: v.order };
  });
  const { width, height } = layered(L, edges);
  const byId = new Map(L.map((x) => [x.id, x]));
  let body = '';
  for (const e of edges) {
    const a = byId.get(e.from)!;
    const b = byId.get(e.to)!;
    const p = edgePath(a, b, L);
    body += `<path d="${p.d}" fill="none" stroke="#334155" stroke-width="1.4"${e.dashed ? ' stroke-dasharray="5 4"' : ''} marker-end="url(#arrow)"/>`;
    if (e.label) body += label(p.mx, p.my + 4, clipText(e.label, 30), { size: 12, fill: '#475569', bg: true });
  }
  for (const n of L) {
    const v = nodes.get(n.id)!;
    const x = n.x!;
    const y = n.y!;
    const cx = x + n.w / 2;
    const cy = y + n.h / 2;
    const style = 'fill="#eff6ff" stroke="#2563eb" stroke-width="1.4"';
    if (v.shape === 'diamond') body += `<path d="M${cx},${y} L${x + n.w},${cy} L${cx},${y + n.h} L${x},${cy} z" fill="#fffbeb" stroke="#d97706" stroke-width="1.4"/>`;
    else if (v.shape === 'circle') body += `<rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="${n.h / 2}" fill="#0f172a"/>`;
    else if (v.shape === 'io') body += `<path d="M${x + 14},${y} L${x + n.w},${y} L${x + n.w - 14},${y + n.h} L${x},${y + n.h} z" ${style}/>`;
    else body += `<rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="${v.shape === 'round' ? 14 : 4}" ${style}/>`;
    body += label(cx, cy + 4, clipText(v.text), { fill: v.shape === 'circle' ? '#fff' : '#0f172a' });
  }
  return { svg: svgDoc(width + 40, height, body), width: width + 40, height, errors, nodes: nodes.size, edges: edges.length };
}

// ---------- Class diagram ----------

interface ClassBox {
  name: string;
  stereotype?: string;
  attrs: string[];
  methods: string[];
  order: number;
}
const CLASS_REL = /^([A-Za-z_][\w]*)\s*(?:"([^"]{1,12})"\s*)?(<\|--|\*--|o--|-->|\.\.>|\.\.\|>|--)\s*(?:"([^"]{1,12})"\s*)?([A-Za-z_][\w]*)\s*(?::\s*(.+))?$/;

export function renderClass(src: string): RenderedDiagram {
  const errors: DiagramError[] = [];
  const classes = new Map<string, ClassBox>();
  const rels: { a: string; b: string; kind: string; ma?: string; mb?: string; label?: string }[] = [];
  const ensure = (name: string) => {
    if (!classes.has(name) && classes.size < DIAGRAM_LIMITS.maxNodes) classes.set(name, { name, attrs: [], methods: [], order: classes.size });
    return classes.get(name);
  };
  let open: ClassBox | null = null;
  const addMember = (m: string) => {
    const t = m.trim().replace(/;$/, '');
    if (!t || !open) return;
    (t.includes('(') ? open.methods : open.attrs).push(clipText(t, 48));
  };
  for (const { n, text } of lines(src)) {
    if (/^classDiagram$/i.test(text)) continue;
    if (open) {
      if (text === '}') {
        open = null;
        continue;
      }
      const close = text.endsWith('}');
      for (const m of text.replace(/}$/, '').split(';')) addMember(m);
      if (close) open = null;
      continue;
    }
    const c = /^(?:(abstract|interface|enum)\s+)?class\s+([A-Za-z_]\w*)\s*(\{(.*?)(\})?)?$/.exec(text) || /^(interface|enum)\s+([A-Za-z_]\w*)\s*(\{(.*?)(\})?)?$/.exec(text);
    if (c) {
      const box = ensure(c[2]);
      if (!box) {
        errors.push({ line: n, message: `At most ${DIAGRAM_LIMITS.maxNodes} classes.` });
        continue;
      }
      if (c[1]) box.stereotype = c[1].toLowerCase();
      if (c[3]) {
        open = box;
        for (const m of (c[4] || '').split(';')) addMember(m);
        if (c[5]) open = null;
      }
      continue;
    }
    const r = CLASS_REL.exec(text);
    if (r) {
      if (!ensure(r[1]) || !ensure(r[5])) {
        errors.push({ line: n, message: `At most ${DIAGRAM_LIMITS.maxNodes} classes.` });
        continue;
      }
      if (rels.length < DIAGRAM_LIMITS.maxEdges) rels.push({ a: r[1], b: r[5], kind: r[3], ma: r[2], mb: r[4], label: r[6]?.trim() });
      continue;
    }
    errors.push({ line: n, message: 'Write "class Name { member; method() }" or a relation such as "Animal <|-- Dog" or "Order *-- Item : has".' });
  }
  if (open) errors.push({ line: lines(src).at(-1)?.n || 1, message: `class ${open.name} is missing its closing "}".` });

  const rowH = 18;
  const L: LNode[] = [...classes.values()].map((c) => {
    const rows = [c.name, ...c.attrs, ...c.methods, ...(c.stereotype ? ['«x»'] : [])];
    const w = Math.max(120, ...rows.map((r) => textW(r) + 24));
    const h = 30 + (c.stereotype ? 14 : 0) + Math.max(1, c.attrs.length) * rowH + Math.max(1, c.methods.length) * rowH + 12;
    return { id: c.name, w, h, order: c.order };
  });
  // Layout: parents above children. "A <|-- B" means B extends A; "A ..|> B" means A implements B.
  const layoutEdges = rels.map((r) => (r.kind === '..|>' ? { from: r.b, to: r.a } : { from: r.a, to: r.b }));
  const { width, height } = layered(L, layoutEdges, 56, 80);
  const byId = new Map(L.map((x) => [x.id, x]));
  let body = '';
  for (const r of rels) {
    const a = byId.get(r.a)!;
    const b = byId.get(r.b)!;
    const p = edgePath(a, b, L);
    const dashed = r.kind.startsWith('..');
    // Marker placement follows UML: the triangle and diamonds sit on the "whole" or "parent" end.
    const start = r.kind === '<|--' ? 'url(#triangle)' : r.kind === '*--' ? 'url(#diamondFilled)' : r.kind === 'o--' ? 'url(#diamond)' : '';
    const end = r.kind === '-->' ? 'url(#open)' : r.kind === '..>' ? 'url(#open)' : r.kind === '..|>' ? 'url(#triangle)' : '';
    body += `<path d="${p.d}" fill="none" stroke="#334155" stroke-width="1.3"${dashed ? ' stroke-dasharray="6 4"' : ''}${start ? ` marker-start="${start}"` : ''}${end ? ` marker-end="${end}"` : ''}/>`;
    if (r.label) body += label(p.mx, p.my - 4, clipText(r.label, 30), { size: 12, fill: '#475569', bg: true });
    if (r.ma) body += label(p.x1 + (p.x2 > p.x1 ? 14 : -14), p.y1 + (p.y2 > p.y1 ? 16 : -6), r.ma, { size: 11, fill: '#334155' });
    if (r.mb) body += label(p.x2 + (p.x1 > p.x2 ? 14 : -14), p.y2 + (p.y1 > p.y2 ? 16 : -6), r.mb, { size: 11, fill: '#334155' });
  }
  for (const n of L) {
    const c = classes.get(n.id)!;
    const x = n.x!;
    let y = n.y!;
    body += `<rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" fill="#f8fafc" stroke="#334155" stroke-width="1.3"/>`;
    if (c.stereotype) {
      body += label(x + n.w / 2, y + 14, `«${c.stereotype}»`, { size: 11, fill: '#64748b' });
      y += 14;
    }
    body += label(x + n.w / 2, y + 20, c.name, { weight: 600, fill: c.stereotype === 'abstract' ? '#475569' : '#0f172a' });
    y += 30;
    body += `<line x1="${x}" y1="${y}" x2="${x + n.w}" y2="${y}" stroke="#334155"/>`;
    const attrs = c.attrs.length ? c.attrs : [''];
    attrs.forEach((a, i) => (body += label(x + 8, y + 14 + i * rowH, a, { anchor: 'start', size: 12 })));
    y += attrs.length * rowH + 4;
    body += `<line x1="${x}" y1="${y}" x2="${x + n.w}" y2="${y}" stroke="#334155"/>`;
    const ms = c.methods.length ? c.methods : [''];
    ms.forEach((m, i) => (body += label(x + 8, y + 14 + i * rowH, m, { anchor: 'start', size: 12 })));
  }
  return { svg: svgDoc(width + 40, height, body), width: width + 40, height, errors, nodes: classes.size, edges: rels.length };
}

// ---------- Sequence diagram ----------

export function renderSequence(src: string): RenderedDiagram {
  const errors: DiagramError[] = [];
  const parts: { id: string; label: string; actor: boolean }[] = [];
  type Step = { kind: 'msg'; from: number; to: number; text: string; style: 'sync' | 'reply' | 'async' } | { kind: 'note'; from: number; to: number; text: string };
  const steps: Step[] = [];
  const idx = (name: string, actor = false, lbl?: string) => {
    let i = parts.findIndex((p) => p.id === name);
    if (i < 0 && parts.length < 20) {
      parts.push({ id: name, label: lbl || name, actor });
      i = parts.length - 1;
    }
    return i;
  };
  for (const { n, text } of lines(src)) {
    if (/^sequenceDiagram$/i.test(text)) continue;
    const p = /^(participant|actor)\s+([A-Za-z_][\w-]*)(?:\s+as\s+(.+))?$/i.exec(text);
    if (p) {
      if (idx(p[2], p[1].toLowerCase() === 'actor', p[3]?.trim()) < 0) errors.push({ line: n, message: 'At most 20 participants.' });
      continue;
    }
    const note = /^note\s+over\s+([A-Za-z_][\w-]*)(?:\s*,\s*([A-Za-z_][\w-]*))?\s*:\s*(.+)$/i.exec(text);
    if (note) {
      const a = idx(note[1]);
      const b = note[2] ? idx(note[2]) : a;
      if (a < 0 || b < 0) errors.push({ line: n, message: 'At most 20 participants.' });
      else steps.push({ kind: 'note', from: Math.min(a, b), to: Math.max(a, b), text: clipText(note[3].trim(), 60) });
      continue;
    }
    const m = /^([A-Za-z_][\w-]*)\s*(->>|-->|->)\s*([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(text);
    if (m) {
      const a = idx(m[1]);
      const b = idx(m[3]);
      if (a < 0 || b < 0) errors.push({ line: n, message: 'At most 20 participants.' });
      else if (steps.length < DIAGRAM_LIMITS.maxEdges) steps.push({ kind: 'msg', from: a, to: b, text: clipText(m[4].trim(), 60), style: m[2] === '-->' ? 'reply' : m[2] === '->>' ? 'async' : 'sync' });
      continue;
    }
    errors.push({ line: n, message: 'Write "A -> B: message", "B --> A: reply", "participant Name" or "note over A: text".' });
  }
  const colW = parts.map((p, i) => {
    const longest = Math.max(0, ...steps.filter((s) => s.kind === 'msg' && Math.min(s.from, s.to) === i && Math.abs(s.to - s.from) === 1).map((s) => textW(s.text, 12)));
    return Math.max(140, textW(p.label) + 40, longest + 30);
  });
  const xs: number[] = [];
  let x = 30;
  for (let i = 0; i < parts.length; i++) {
    xs.push(x + Math.min(colW[i], 200) / 2);
    x += colW[i];
  }
  const top = 20;
  const boxH = 34;
  let y = top + boxH + 30;
  let body = '';
  const stepRows: string[] = [];
  for (const s of steps) {
    if (s.kind === 'note') {
      const x1 = xs[s.from] - 50;
      const x2 = xs[s.to] + 50;
      const w = Math.max(x2 - x1, textW(s.text, 12) + 20);
      const cx = (x1 + x2) / 2;
      stepRows.push(`<rect x="${cx - w / 2}" y="${y - 14}" width="${w}" height="26" fill="#fef9c3" stroke="#ca8a04"/>${label(cx, y + 4, s.text, { size: 12 })}`);
      y += 38;
      continue;
    }
    const x1 = xs[s.from];
    const x2 = xs[s.to];
    const dash = s.style === 'reply' ? ' stroke-dasharray="6 4"' : '';
    const marker = s.style === 'sync' ? 'url(#arrow)' : 'url(#open)';
    if (s.from === s.to) {
      stepRows.push(`<path d="M${x1},${y} h40 v20 h-40" fill="none" stroke="#334155" stroke-width="1.3"${dash} marker-end="${marker}"/>${label(x1 + 46, y + 4, s.text, { anchor: 'start', size: 12 })}`);
      y += 44;
    } else {
      stepRows.push(`<line x1="${x1}" y1="${y}" x2="${x2 + (x2 > x1 ? -2 : 2)}" y2="${y}" stroke="#334155" stroke-width="1.3"${dash} marker-end="${marker}"/>${label((x1 + x2) / 2, y - 6, s.text, { size: 12 })}`);
      y += 36;
    }
  }
  const bottom = y + 6;
  parts.forEach((p, i) => {
    const w = Math.min(colW[i], 200) - 20;
    body += `<line x1="${xs[i]}" y1="${top + boxH}" x2="${xs[i]}" y2="${bottom}" stroke="#94a3b8" stroke-dasharray="4 4"/>`;
    for (const yy of [top, bottom]) {
      if (p.actor) body += `<circle cx="${xs[i]}" cy="${yy + 8}" r="7" fill="none" stroke="#334155"/><line x1="${xs[i]}" y1="${yy + 15}" x2="${xs[i]}" y2="${yy + 26}" stroke="#334155"/>${label(xs[i], yy + boxH + 6, clipText(p.label, 24), { weight: 600 })}`;
      else body += `<rect x="${xs[i] - w / 2}" y="${yy}" width="${w}" height="${boxH}" rx="4" fill="#eff6ff" stroke="#2563eb"/>${label(xs[i], yy + 21, clipText(p.label, 24), { weight: 600 })}`;
    }
  });
  body += stepRows.join('');
  const width = x + 30;
  const height = bottom + boxH + 30;
  return { svg: svgDoc(width, height, body), width, height, errors, nodes: parts.length, edges: steps.filter((s) => s.kind === 'msg').length };
}

// ---------- ER diagram ----------

const CARD: Record<string, string> = { '||': '1', '|o': '0..1', 'o|': '0..1', '}o': '0..*', 'o{': '0..*', '}|': '1..*', '|{': '1..*' };
const ER_REL = /^([A-Za-z_]\w*)\s*(\|\||\|o|\}o|\}\|)--(\|\||o\||o\{|\|\{)\s*([A-Za-z_]\w*)\s*(?::\s*(.+))?$/;

export interface ErEntity {
  name: string;
  attrs: { name: string; type?: string; key?: 'PK' | 'FK' }[];
}
export function parseEr(src: string) {
  const errors: DiagramError[] = [];
  const entities = new Map<string, ErEntity & { order: number }>();
  const rels: { a: string; b: string; ca: string; cb: string; label?: string }[] = [];
  const ensure = (name: string) => {
    if (!entities.has(name) && entities.size < DIAGRAM_LIMITS.maxNodes) entities.set(name, { name, attrs: [], order: entities.size });
    return entities.get(name);
  };
  let open: ErEntity | null = null;
  const addAttr = (raw: string, n: number) => {
    const t = raw.trim().replace(/;$/, '');
    if (!t || !open) return;
    const m = /^(\*)?([A-Za-z_]\w*)(?:\s+([A-Za-z_][\w()]*))?(?:\s+(PK|FK))?$/i.exec(t);
    if (!m) {
      errors.push({ line: n, message: `"${clipText(t, 30)}" is not an attribute. Write "name type", and mark keys with * or PK/FK.` });
      return;
    }
    if (open.attrs.length < 30) open.attrs.push({ name: m[2], type: m[3], key: m[1] || m[4]?.toUpperCase() === 'PK' ? 'PK' : m[4]?.toUpperCase() === 'FK' ? 'FK' : undefined });
  };
  for (const { n, text } of lines(src)) {
    if (/^erDiagram$/i.test(text)) continue;
    if (open) {
      if (text === '}') {
        open = null;
        continue;
      }
      const close = text.endsWith('}');
      for (const a of text.replace(/}$/, '').split(';')) addAttr(a, n);
      if (close) open = null;
      continue;
    }
    const e = /^(?:entity|table)\s+([A-Za-z_]\w*)\s*(\{(.*?)(\})?)?$/i.exec(text);
    if (e) {
      const ent = ensure(e[1]);
      if (!ent) {
        errors.push({ line: n, message: `At most ${DIAGRAM_LIMITS.maxNodes} entities.` });
        continue;
      }
      if (e[2]) {
        open = ent;
        for (const a of (e[3] || '').split(';')) addAttr(a, n);
        if (e[4]) open = null;
      }
      continue;
    }
    const r = ER_REL.exec(text);
    if (r) {
      if (!ensure(r[1]) || !ensure(r[4])) {
        errors.push({ line: n, message: `At most ${DIAGRAM_LIMITS.maxNodes} entities.` });
        continue;
      }
      if (rels.length < DIAGRAM_LIMITS.maxEdges) rels.push({ a: r[1], b: r[4], ca: CARD[r[2]], cb: CARD[r[3]], label: r[5]?.trim() });
      continue;
    }
    errors.push({ line: n, message: 'Write "entity Name { *id int; name text }" or a relationship such as "Student ||--o{ Enrollment : makes".' });
  }
  if (open) errors.push({ line: lines(src).at(-1)?.n || 1, message: `entity ${open.name} is missing its closing "}".` });
  return { entities, rels, errors };
}

export function renderEr(src: string): RenderedDiagram {
  const { entities, rels, errors } = parseEr(src);
  const rowH = 18;
  const L: LNode[] = [...entities.values()].map((e) => {
    const rows = [e.name, ...e.attrs.map((a) => `${a.key ? `${a.key} ` : ''}${a.name} ${a.type || ''}`)];
    return { id: e.name, w: Math.max(130, ...rows.map((r) => textW(r) + 30)), h: 30 + Math.max(1, e.attrs.length) * rowH + 8, order: e.order };
  });
  const { width, height } = layered(L, rels.map((r) => ({ from: r.a, to: r.b })), 80, 90);
  const byId = new Map(L.map((x) => [x.id, x]));
  let body = '';
  for (const r of rels) {
    const p = edgePath(byId.get(r.a)!, byId.get(r.b)!, L);
    body += `<path d="${p.d}" fill="none" stroke="#334155" stroke-width="1.3"/>`;
    const ux = p.x2 - p.x1;
    const uy = p.y2 - p.y1;
    const len = Math.hypot(ux, uy) || 1;
    const off = (t: number, sign: number) => ({ x: (sign > 0 ? p.x1 : p.x2) + (ux / len) * t * sign - (uy / len) * 10, y: (sign > 0 ? p.y1 : p.y2) + (uy / len) * t * sign + (ux / len) * 10 + 4 });
    const s = off(18, 1);
    const e = off(18, -1);
    body += label(s.x, s.y, r.ca, { size: 11, weight: 600, fill: '#1d4ed8' }) + label(e.x, e.y, r.cb, { size: 11, weight: 600, fill: '#1d4ed8' });
    if (r.label) body += label(p.mx, p.my - 4, clipText(r.label, 30), { size: 12, fill: '#475569', bg: true });
  }
  for (const n of L) {
    const e = entities.get(n.id)!;
    const x = n.x!;
    const y = n.y!;
    body += `<rect x="${x}" y="${y}" width="${n.w}" height="${n.h}" rx="4" fill="#fff" stroke="#334155" stroke-width="1.3"/><rect x="${x}" y="${y}" width="${n.w}" height="28" rx="4" fill="#0f172a"/>`;
    body += label(x + n.w / 2, y + 19, e.name, { weight: 600, fill: '#fff' });
    e.attrs.forEach((a, i) => {
      const yy = y + 30 + 14 + i * rowH;
      if (a.key) body += label(x + 8, yy, a.key, { anchor: 'start', size: 10, weight: 700, fill: a.key === 'PK' ? '#b45309' : '#1d4ed8' });
      body += label(x + 34, yy, a.name, { anchor: 'start', size: 12, weight: a.key === 'PK' ? 600 : undefined });
      if (a.type) body += label(x + n.w - 8, yy, a.type, { anchor: 'end', size: 11, fill: '#64748b' });
    });
  }
  return { svg: svgDoc(width + 40, height, body), width: width + 40, height, errors, nodes: entities.size, edges: rels.length };
}

export function renderDiagram(kind: DiagramKind, src: string): RenderedDiagram {
  if (kind === 'class') return renderClass(src);
  if (kind === 'sequence') return renderSequence(src);
  if (kind === 'er') return renderEr(src);
  return renderFlowchart(src);
}

/** ER source from the System Design Lab's Database Design workspace, so an existing schema can be drawn. */
export function erFromDatabaseDesign(design: DatabaseDesign | undefined): string {
  const ents = design?.entities || [];
  if (!ents.length) return '';
  const id = (s: string) => String(s || '').replace(/[^\w]/g, '_') || 'Entity';
  const nameOf = new Map<string, string>();
  for (const e of ents) {
    nameOf.set(e.id, id(e.name));
    nameOf.set(e.name, id(e.name));
  }
  const out: string[] = [];
  for (const e of ents) {
    out.push(`entity ${id(e.name)} {`);
    for (const a of e.attributes || []) out.push(`  ${a.is_primary_key ? '*' : ''}${id(a.name)} ${String(a.data_type || 'text').replace(/[^\w()]/g, '') || 'text'}${a.is_foreign_key && !a.is_primary_key ? ' FK' : ''}`);
    out.push('}');
  }
  const CARDS: Record<string, string> = { ONE_TO_ONE: '||--||', ONE_TO_MANY: '||--o{', MANY_TO_MANY: '}o--o{' };
  for (const r of design?.relationships || []) {
    const from = nameOf.get(r.source_entity);
    const to = nameOf.get(r.target_entity);
    if (from && to) out.push(`${from} ${CARDS[r.type] || '||--o{'} ${to}`);
  }
  return out.join('\n');
}

export const DIAGRAM_TEMPLATES: Record<DiagramKind, string> = {
  class: `class Student {
  -id: int
  -name: string
  +enroll(course: Course): void
}
class Course {
  -code: string
  -credits: int
}
abstract class Person {
  #email: string
}
Person <|-- Student
Student "1" --> "*" Course : enrolls in`,
  sequence: `actor Student
participant App
participant API
participant DB as Database
Student -> App: Log in
App -> API: POST /auth/login
API -> DB: Find user by email
DB --> API: User row
note over API: Compare password hash
API --> App: 200 + session token
App --> Student: Show dashboard`,
  flowchart: `start((Start)) --> read[/Read n/]
read --> check{n > 1?}
check -- yes --> loop[Try divisors 2 to sqrt n]
check -- no --> notPrime[Not prime]
loop --> found{Divisor found?}
found -- yes --> notPrime
found -- no --> prime[Prime]
prime --> stop((End))
notPrime --> stop`,
  er: `entity Student {
  *id int
  name text
  email text
}
entity Course {
  *code text
  title text
  credits int
}
entity Enrollment {
  *id int
  student_id int FK
  course_code text FK
  grade text
}
Student ||--o{ Enrollment : makes
Course ||--o{ Enrollment : has`,
};

/** Positions for boxes of the given size, in layers along the edges (used to place AI-proposed components). */
export function layoutGraph(nodes: { id: string; w: number; h: number }[], edges: { from: string; to: string }[], gapX = 60, gapY = 90): Map<string, { x: number; y: number }> {
  const L: LNode[] = nodes.map((n, i) => ({ ...n, order: i }));
  layered(L, edges, gapX, gapY, 40, 40);
  return new Map(L.map((n) => [n.id, { x: Math.round(n.x!), y: Math.round(n.y!) }]));
}
