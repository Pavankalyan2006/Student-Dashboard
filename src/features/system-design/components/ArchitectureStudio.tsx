// Architecture Studio: editable class, sequence, flowchart/activity and ER diagrams written as text and drawn live,
// plus AI drafts (a starting architecture for the designer canvas, or a diagram) that the student reviews before
// using. Diagrams are saved with the design project.
import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Download, Sparkles, Database, Image as ImageIcon, AlertTriangle, Info, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { apiClient } from '../../../api/client';
import { cn } from '../../../lib/utils';
import { DIAGRAM_TEMPLATES, erFromDatabaseDesign, renderDiagram, type DiagramKind } from '../../../../server/services/diagramDsl';
import type { ArchitectureComponent, ArchitectureConnection, StudioDiagram, SystemDesignProject } from '../types/systemDesign';

const KINDS: { id: DiagramKind; label: string; help: string }[] = [
  { id: 'class', label: 'Class (UML)', help: 'class Name { -field: type; +method(): type }   A <|-- B (B extends A)   A *-- B composition   A o-- B aggregation   A --> B association   A ..> B dependency   A ..|> B (A implements B)   add "1" / "*" and ": label".' },
  { id: 'sequence', label: 'Sequence (UML)', help: 'participant Name [as Label]   actor Name   A -> B: call   B --> A: reply   A ->> B: async message   note over A, B: text' },
  { id: 'flowchart', label: 'Flowchart / activity', help: 'a[Step]  b{Decision?}  c((Start/End))  d[/Input or output/]  e(Rounded)   a --> b   b -- yes --> c   b -->|no| d   a -.-> e (dashed)' },
  { id: 'er', label: 'Entity relationship', help: 'entity Name { *id int; name text; other_id int FK }   A ||--o{ B : label   (|| one, |o zero or one, o{ zero or many, |{ one or many)' },
];

interface Proposal {
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
  dropped: number;
  rationale: string;
  tradeoffs: string[];
  bottlenecks: string[];
  scaling: string[];
  assumptions: string[];
  note: string;
}

const newId = () => `dg${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const download = (name: string, blob: Blob) => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};
const fileName = (title: string, ext: string) => `${title.replace(/[^\w-]+/g, '_').slice(0, 60) || 'diagram'}.${ext}`;

export function ArchitectureStudio({
  project,
  hasProject,
  onCreateProject,
  onSaveDiagrams,
  onApplyArchitecture,
}: {
  project: SystemDesignProject;
  hasProject: boolean;
  onCreateProject: () => void;
  onSaveDiagrams: (diagrams: StudioDiagram[]) => Promise<void>;
  onApplyArchitecture: (components: ArchitectureComponent[], connections: ArchitectureConnection[]) => void;
}) {
  const [diagrams, setDiagrams] = React.useState<StudioDiagram[]>(project.diagrams || []);
  const [selected, setSelected] = React.useState<string | null>(project.diagrams?.[0]?.id || null);
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [aiKind, setAiKind] = React.useState<'architecture' | DiagramKind>('architecture');
  const [aiText, setAiText] = React.useState('');
  const [aiBusy, setAiBusy] = React.useState(false);
  const [aiError, setAiError] = React.useState('');
  const [proposal, setProposal] = React.useState<Proposal | null>(null);
  const [aiNote, setAiNote] = React.useState('');

  React.useEffect(() => {
    setDiagrams(project.diagrams || []);
    setSelected(project.diagrams?.[0]?.id || null);
    setDirty(false);
  }, [project.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = diagrams.find((d) => d.id === selected) || null;
  const rendered = React.useMemo(() => (current ? renderDiagram(current.kind, current.source) : null), [current?.kind, current?.source]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (patch: Partial<StudioDiagram>) => {
    if (!current) return;
    setDiagrams(diagrams.map((d) => (d.id === current.id ? { ...d, ...patch, updated_at: new Date().toISOString() } : d)));
    setDirty(true);
  };
  const add = (kind: DiagramKind, source = DIAGRAM_TEMPLATES[kind], title?: string) => {
    if (diagrams.length >= 20) return toast.error('A design can hold up to 20 diagrams.');
    const d: StudioDiagram = { id: newId(), kind, title: title || `${KINDS.find((k) => k.id === kind)!.label} diagram`, source, updated_at: new Date().toISOString() };
    setDiagrams([...diagrams, d]);
    setSelected(d.id);
    setDirty(true);
  };
  const save = async () => {
    setSaving(true);
    try {
      await onSaveDiagrams(diagrams);
      setDirty(false);
      toast.success('Diagrams saved with this design');
    } catch (e: any) {
      toast.error(e?.message || 'The diagrams could not be saved.');
    } finally {
      setSaving(false);
    }
  };
  const exportSvg = () => current && rendered && download(fileName(current.title, 'svg'), new Blob([rendered.svg], { type: 'image/svg+xml' }));
  const exportPng = () => {
    if (!current || !rendered) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = rendered.width * 2;
      c.height = rendered.height * 2;
      const ctx = c.getContext('2d')!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      c.toBlob((b) => b && download(fileName(current.title, 'png'), b), 'image/png');
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(rendered.svg)}`;
  };
  const fromDatabase = () => {
    const src = erFromDatabaseDesign(project.database_design);
    if (!src) return toast.error('The Database Design tab has no tables yet.');
    add('er', src, 'Database schema');
  };

  const askAi = async () => {
    setAiBusy(true);
    setAiError('');
    setProposal(null);
    setAiNote('');
    try {
      if (aiKind === 'architecture') {
        setProposal(await apiClient.post<Proposal>('/system-design/architecture/propose', { description: aiText }));
      } else {
        const r = await apiClient.post<{ kind: DiagramKind; source: string; explanation: string; errors: { line: number; message: string }[] }>('/system-design/diagrams/propose', { kind: aiKind, description: aiText });
        add(r.kind, r.source, `AI draft: ${aiText.slice(0, 40)}`);
        setAiNote(`${r.explanation ? `${r.explanation} ` : ''}The draft was added as a new diagram. Edit it, then save.`);
      }
    } catch (e: any) {
      setAiError(e?.message || 'The AI draft could not be made.');
    } finally {
      setAiBusy(false);
    }
  };

  const kindInfo = current ? KINDS.find((k) => k.id === current.kind)! : null;

  return (
    <div className="space-y-6" data-testid="architecture-studio">
      {!hasProject && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <Info className="h-4 w-4" />Create a design project first, so your diagrams can be saved with it.
          <Button size="sm" onClick={onCreateProject}><Plus className="mr-1 h-4 w-4" />New project</Button>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="flex items-center gap-2 font-semibold text-slate-900"><Sparkles className="h-4 w-4 text-violet-600" />Start from a description</h3>
        <p className="mt-1 text-sm text-slate-600">Describe your application in plain language. The AI drafts a starting architecture (with its reasoning, trade-offs and bottlenecks) or a diagram. You review it before anything is used.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm" value={aiKind} onChange={(e) => setAiKind(e.target.value as any)} aria-label="What to draft">
            <option value="architecture">System architecture (for the canvas)</option>
            {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label} diagram</option>)}
          </select>
        </div>
        <textarea className="mt-2 block h-24 w-full rounded-lg border border-slate-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none" maxLength={3000} value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="A college canteen app where students pre-order food, pay online and get notified when the order is ready." aria-label="Describe the application" data-testid="studio-ai-text" />
        <div className="mt-2 flex items-center gap-2">
          <Button onClick={askAi} disabled={aiText.trim().length < 20 || aiBusy} isLoading={aiBusy} data-testid="studio-ai-run"><Sparkles className="mr-1.5 h-4 w-4" />Draft with AI</Button>
          <span className="text-xs text-slate-500">At least 20 characters.</span>
        </div>
        {aiError && <p className="mt-3 flex gap-2 rounded-lg bg-rose-50 p-2.5 text-sm text-rose-800" data-testid="studio-ai-error"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{aiError}</p>}
        {aiNote && <p className="mt-3 rounded-lg bg-slate-50 p-2.5 text-sm text-slate-700">{aiNote}</p>}
        {proposal && (
          <div className="mt-4 space-y-3 rounded-xl border border-violet-200 bg-violet-50/40 p-4 text-sm" data-testid="studio-proposal">
            <p className="text-xs text-slate-500">{proposal.note}</p>
            <div className="flex flex-wrap gap-1.5">
              {proposal.components.map((c) => <span key={c.id} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"><span className="font-medium">{c.name}</span> <span className="text-slate-500">{c.type.replace(/_/g, ' ').toLowerCase()}{c.tech_choice ? ` · ${c.tech_choice}` : ''}</span></span>)}
            </div>
            <ul className="space-y-1 text-xs text-slate-600">
              {proposal.connections.map((k) => <li key={k.id}>{proposal.components.find((c) => c.id === k.from)?.name} <ArrowRight className="inline h-3 w-3" /> {proposal.components.find((c) => c.id === k.to)?.name} <span className="text-slate-400">({k.protocol}{k.is_async ? ', async' : ''}{k.label ? `: ${k.label}` : ''})</span></li>)}
            </ul>
            {proposal.rationale && <p className="text-slate-700"><span className="font-semibold">Why this shape: </span>{proposal.rationale}</p>}
            {([['Trade-offs', proposal.tradeoffs], ['Bottlenecks', proposal.bottlenecks], ['When it grows', proposal.scaling], ['Assumptions', proposal.assumptions]] as const).map(([t, items]) => items.length ? (
              <div key={t}><p className="font-semibold text-slate-800">{t}</p><ul className="ml-4 list-disc text-slate-700">{items.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
            ) : null)}
            {proposal.dropped > 0 && <p className="text-xs text-slate-500">{proposal.dropped} item{proposal.dropped > 1 ? 's' : ''} from the AI draft used an unknown type or pointed at a missing component, so {proposal.dropped > 1 ? 'they were' : 'it was'} left out.</p>}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => onApplyArchitecture(proposal.components, proposal.connections)} data-testid="studio-apply">Open on the canvas</Button>
              <Button size="sm" variant="ghost" onClick={() => setProposal(null)}>Discard</Button>
            </div>
            <p className="text-xs text-slate-500">Opening it replaces what is on the Architecture Designer canvas until you save. Your saved design is unchanged until you press Save there.</p>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="mr-auto font-semibold text-slate-900">Diagrams</h3>
          {KINDS.map((k) => <Button key={k.id} size="sm" variant="outline" onClick={() => add(k.id)} data-testid={`studio-new-${k.id}`}><Plus className="mr-1 h-3.5 w-3.5" />{k.label}</Button>)}
          <Button size="sm" variant="outline" onClick={fromDatabase}><Database className="mr-1 h-3.5 w-3.5" />From my database design</Button>
        </div>
        {!diagrams.length ? (
          <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No diagrams in this design yet. Add one above: each starts from an example you can edit.</p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {diagrams.map((d) => <button key={d.id} type="button" onClick={() => setSelected(d.id)} className={cn('rounded-lg px-2.5 py-1 text-xs font-medium', d.id === current?.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')}>{d.title}</button>)}
            </div>
            {current && rendered && kindInfo && (
              <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-2">
                  <input className="h-9 w-full rounded-lg border border-slate-200 px-2.5 text-sm" value={current.title} maxLength={120} onChange={(e) => update({ title: e.target.value })} aria-label="Diagram title" />
                  <textarea className="block h-80 w-full rounded-lg border border-slate-200 bg-slate-950 p-2.5 font-mono text-xs leading-5 text-slate-100 focus:border-blue-400 focus:outline-none" spellCheck={false} maxLength={10_000} value={current.source} onChange={(e) => update({ source: e.target.value })} aria-label="Diagram text" data-testid="studio-source" />
                  <p className="text-[11px] leading-4 text-slate-500"><span className="font-semibold">{kindInfo.label}: </span>{kindInfo.help}</p>
                  {rendered.errors.length > 0 && (
                    <ul className="space-y-1 rounded-lg bg-amber-50 p-2 text-xs text-amber-900" data-testid="studio-errors">
                      {rendered.errors.slice(0, 8).map((e, i) => <li key={i}>Line {e.line}: {e.message}</li>)}
                    </ul>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={save} disabled={!hasProject || !dirty || saving} isLoading={saving} data-testid="studio-save"><Save className="mr-1 h-3.5 w-3.5" />{dirty ? 'Save diagrams' : 'Saved'}</Button>
                    <Button size="sm" variant="outline" onClick={exportSvg}><Download className="mr-1 h-3.5 w-3.5" />SVG</Button>
                    <Button size="sm" variant="outline" onClick={exportPng}><ImageIcon className="mr-1 h-3.5 w-3.5" />PNG</Button>
                    <Button size="sm" variant="ghost" onClick={() => { const rest = diagrams.filter((d) => d.id !== current.id); setDiagrams(rest); setSelected(rest[0]?.id || null); setDirty(true); }}><Trash2 className="mr-1 h-3.5 w-3.5" />Remove</Button>
                  </div>
                </div>
                <div className="min-w-0 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-2" data-testid="studio-preview">
                  {/* Every text in the SVG is escaped by the renderer. */}
                  <div dangerouslySetInnerHTML={{ __html: rendered.svg }} />
                  <p className="mt-1 text-[11px] text-slate-500">{rendered.nodes} {current.kind === 'sequence' ? 'participants' : current.kind === 'er' ? 'entities' : current.kind === 'class' ? 'classes' : 'nodes'}, {rendered.edges} {current.kind === 'sequence' ? 'messages' : 'connections'}</p>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
