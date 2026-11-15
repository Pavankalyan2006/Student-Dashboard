import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useResearchIdeas, useGenerateIdeas } from '../hooks/useResearch';
import { researchApi } from '../api/researchApi';
import { IdeaMilestone, NoveltyCheck, ResearchIdea } from '../types';
import { Lightbulb, Sparkles, RefreshCw, Plus, Trash2, Search, ChevronDown, ChevronUp, ExternalLink, AlertTriangle, Save } from 'lucide-react';

interface IdeasPanelProps {
  projectId: string;
}

const STATUS_LABEL: Record<string, string> = { DRAFT: 'Draft', DEVELOPING: 'Developing', READY_FOR_GUIDE: 'Ready for guide' };
const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const inputCls = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200';
const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1';

/** Phase 6 Research Idea Lab: AI or hand-written ideas, a workspace for each, and an overlap check against real papers. */
export const IdeasPanel: React.FC<IdeasPanelProps> = ({ projectId }) => {
  const { data: ideas = [], isLoading } = useResearchIdeas(projectId);
  const generateMutation = useGenerateIdeas(projectId);
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [showNew, setShowNew] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ['research-ideas', projectId] });
  const create = useMutation({
    mutationFn: () => researchApi.addIdea(projectId, { title: newTitle, problem: newProblem, motivation: '', proposed_approach: '' }),
    onSuccess: (idea) => {
      refresh();
      setNewTitle('');
      setNewProblem('');
      setShowNew(false);
      setOpenId(idea.id);
      toast.success('Idea added');
    },
    onError: (e: any) => toast.error(e.message || 'Could not add the idea'),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Idea Lab</h2>
          <p className="text-xs text-slate-500">
            Write or generate ideas, develop each one in its workspace, and check how much it overlaps with published papers.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowNew((v) => !v)}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> New idea
          </button>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {generateMutation.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Suggest ideas with AI
          </button>
        </div>
      </div>

      {showNew && (
        <form
          className="bg-white rounded-2xl p-5 border border-slate-200 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (newTitle.trim()) create.mutate();
          }}
        >
          <div>
            <label className={labelCls} htmlFor="new-idea-title">Idea title</label>
            <input id="new-idea-title" className={inputCls} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} maxLength={300} placeholder="What do you want to build or study?" />
          </div>
          <div>
            <label className={labelCls} htmlFor="new-idea-problem">Problem</label>
            <textarea id="new-idea-problem" className={inputCls} rows={2} value={newProblem} onChange={(e) => setNewProblem(e.target.value)} placeholder="What problem does it address?" />
          </div>
          <button type="submit" disabled={!newTitle.trim() || create.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">
            {create.isPending ? 'Adding…' : 'Add idea'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Loading ideas...</div>
      ) : ideas.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Lightbulb className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No ideas yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Add your own idea, or ask the AI for suggestions based on the papers and gaps in this project.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} open={openId === idea.id} onToggle={() => setOpenId(openId === idea.id ? null : idea.id)} onChanged={refresh} />
          ))}
        </div>
      )}
    </div>
  );
};

const IdeaCard: React.FC<{ idea: ResearchIdea; open: boolean; onToggle: () => void; onChanged: () => void }> = ({ idea, open, onToggle, onChanged }) => {
  const latest = idea.novelty_checks?.[0];
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 shadow-2xs">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{STATUS_LABEL[idea.workspace_status || 'DRAFT']}</span>
            {idea.generated_by === 'AI_MODEL' && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-50 text-violet-700">Suggested by AI</span>}
          </div>
          <h3 className="text-base font-bold text-slate-900">{idea.title}</h3>
          {idea.problem && <p className="text-xs text-slate-600">{idea.problem}</p>}
        </div>
        <button onClick={onToggle} aria-expanded={open} className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />} {open ? 'Close workspace' : 'Open workspace'}
        </button>
      </div>
      {!open && latest && (
        <p className="text-xs text-slate-500">Last overlap check {new Date(latest.checked_at).toLocaleDateString()}: {latest.summary}</p>
      )}
      {open && <IdeaWorkspace idea={idea} onChanged={onChanged} />}
    </div>
  );
};

const IdeaWorkspace: React.FC<{ idea: ResearchIdea; onChanged: () => void }> = ({ idea, onChanged }) => {
  const [form, setForm] = useState({
    title: idea.title,
    problem: idea.problem || '',
    motivation: idea.motivation || '',
    proposed_approach: idea.proposed_approach || '',
    hypothesis: idea.hypothesis || '',
    research_questions: (idea.research_questions || []).join('\n'),
    evaluation_metrics: (idea.evaluation_metrics || []).join('\n'),
    dataset_possibilities: idea.dataset_possibilities || '',
    evaluation_approach: idea.evaluation_approach || '',
    expected_contribution: idea.expected_contribution || '',
    outline: idea.outline || '',
    workspace_status: idea.workspace_status || 'DRAFT',
  });
  const [timeline, setTimeline] = useState<IdeaMilestone[]>(idea.timeline || []);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  const save = useMutation({
    mutationFn: () =>
      researchApi.updateIdea(idea.id, {
        ...form,
        research_questions: lines(form.research_questions),
        evaluation_metrics: lines(form.evaluation_metrics),
        timeline: timeline.filter((m) => m.title.trim()),
      } as any),
    onSuccess: () => {
      onChanged();
      toast.success('Idea saved');
    },
    onError: (e: any) => toast.error(e.message || 'Could not save the idea'),
  });
  const remove = useMutation({
    mutationFn: () => researchApi.deleteIdea(idea.id),
    onSuccess: () => {
      onChanged();
      toast.success('Idea deleted');
    },
    onError: (e: any) => toast.error(e.message || 'Could not delete the idea'),
  });
  const novelty = useMutation({
    mutationFn: () => researchApi.noveltyCheck(idea.id),
    onSuccess: () => onChanged(),
    onError: (e: any) => toast.error(e.message || 'The overlap check failed'),
  });
  const check: NoveltyCheck | undefined = novelty.data || idea.novelty_checks?.[0];

  const field = (k: keyof typeof form, label: string, rows = 2, hint?: string) => (
    <div>
      <label className={labelCls} htmlFor={`${idea.id}-${k}`}>{label}</label>
      <textarea id={`${idea.id}-${k}`} className={inputCls} rows={rows} value={form[k]} onChange={set(k)} placeholder={hint} />
    </div>
  );

  return (
    <div className="space-y-5 border-t border-slate-100 pt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor={`${idea.id}-title`}>Title</label>
          <input id={`${idea.id}-title`} className={inputCls} value={form.title} onChange={set('title')} maxLength={300} />
        </div>
        <div>
          <label className={labelCls} htmlFor={`${idea.id}-status`}>Stage</label>
          <select id={`${idea.id}-status`} className={inputCls} value={form.workspace_status} onChange={set('workspace_status')}>
            {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        {field('problem', 'Problem')}
        {field('motivation', 'Motivation')}
        {field('proposed_approach', 'Proposed approach', 3)}
        {field('hypothesis', 'Hypothesis', 3, 'If … then … because …')}
        {field('research_questions', 'Research questions (one per line)', 3)}
        {field('evaluation_metrics', 'Evaluation metrics (one per line)', 3, 'e.g. F1 score on the held-out set')}
        {field('dataset_possibilities', 'Datasets', 2, 'Name the datasets you plan to use, with links if you have them')}
        {field('evaluation_approach', 'Evaluation plan')}
      </div>
      {field('expected_contribution', 'Expected contribution')}

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className={labelCls}>Timeline (your own dates)</span>
          <button
            type="button"
            onClick={() => setTimeline([...timeline, { id: `ms_new${timeline.length}`, title: '', done: false }])}
            className="text-xs font-bold text-indigo-700 hover:underline inline-flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add milestone
          </button>
        </div>
        {timeline.length === 0 ? (
          <p className="text-xs text-slate-400">No milestones yet.</p>
        ) : (
          <ul className="space-y-2">
            {timeline.map((m, i) => (
              <li key={m.id} className="flex flex-wrap items-center gap-2">
                <input type="checkbox" aria-label={`Milestone ${i + 1} done`} checked={m.done} onChange={(e) => setTimeline(timeline.map((x, j) => (j === i ? { ...x, done: e.target.checked } : x)))} />
                <input aria-label={`Milestone ${i + 1} title`} className={`${inputCls} flex-1 min-w-[160px]`} value={m.title} onChange={(e) => setTimeline(timeline.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="Milestone" />
                <input aria-label={`Milestone ${i + 1} date`} type="date" className={`${inputCls} w-40`} value={m.target_date || ''} onChange={(e) => setTimeline(timeline.map((x, j) => (j === i ? { ...x, target_date: e.target.value || undefined } : x)))} />
                <button type="button" aria-label={`Remove milestone ${i + 1}`} onClick={() => setTimeline(timeline.filter((_, j) => j !== i))} className="p-1.5 text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {field('outline', 'Outline (proposal or report sections)', 6, '1. Introduction\n2. Related work\n3. Method\n…')}

      <div className="flex flex-wrap gap-2">
        <button onClick={() => save.mutate()} disabled={save.isPending || !form.title.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">
          <Save className="w-3.5 h-3.5" /> {save.isPending ? 'Saving…' : 'Save idea'}
        </button>
        <button onClick={() => novelty.mutate()} disabled={novelty.isPending} className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-bold disabled:opacity-50">
          {novelty.isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Check overlap with published papers
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this idea?')) remove.mutate();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
      <p className="text-[11px] text-slate-400">The overlap check uses the saved idea, so save your changes first.</p>

      {check && <NoveltyResult check={check} />}
    </div>
  );
};

const LEVEL_CLS = { HIGH: 'bg-rose-50 text-rose-700', MEDIUM: 'bg-amber-50 text-amber-700', LOW: 'bg-emerald-50 text-emerald-700' };

const NoveltyResult: React.FC<{ check: NoveltyCheck }> = ({ check }) => (
  <section aria-label="Overlap check result" className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
    <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      <p>{check.disclaimer}</p>
    </div>
    <p className="text-sm font-semibold text-slate-800">{check.summary}</p>
    <p className="text-[11px] text-slate-500">
      Checked {new Date(check.checked_at).toLocaleString()} · searched OpenAlex for “{check.query}” · {check.papers_checked} papers compared · key terms: {check.idea_terms.join(', ')}
    </p>
    <ul className="space-y-2">
      {check.matches.map((m, i) => (
        <li key={i} className="bg-white rounded-lg border border-slate-200 p-3 text-xs space-y-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-slate-900">{m.title}</span>
            <span className={`shrink-0 px-2 py-0.5 rounded font-bold ${LEVEL_CLS[m.overlap_level]}`}>{m.overlap_score}% of key terms</span>
          </div>
          <p className="text-slate-500">
            {[m.authors.slice(0, 3).join(', ') + (m.authors.length > 3 ? ' et al.' : ''), m.venue, m.publication_year || ''].filter(Boolean).join(' · ')}
            {' · '}
            {m.found_in === 'PROJECT' ? 'saved in this project' : 'found on OpenAlex'}
          </p>
          {m.matched_terms.length > 0 && <p className="text-slate-600">Shared terms: {m.matched_terms.join(', ')}</p>}
          {(m.url || m.doi) && (
            <a href={m.url || `https://doi.org/${m.doi}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-700 hover:underline">
              Open paper <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </li>
      ))}
    </ul>
  </section>
);
