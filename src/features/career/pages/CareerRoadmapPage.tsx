import React, { useEffect, useState } from 'react';
import { careerApi, CareerRoadmap, CareerRole } from '../api/careerApi';
import { Compass, ChevronLeft, Sparkles, CheckCircle2, Circle, ExternalLink, Plus, Trash2, Scale } from 'lucide-react';
import { toast } from 'sonner';

interface CareerRoadmapPageProps {
  onNavigate: (path: string) => void;
}

/**
 * Career roadmaps, one per career goal. A student can hold several goals, compare them and drop one. Progress counts
 * only steps backed by real activity (courses finished, problems solved, projects, mock interviews, skill evidence).
 * The student can still tick a step for their own tracking; that tick is shown but not counted.
 */
export const CareerRoadmapPage: React.FC<CareerRoadmapPageProps> = ({ onNavigate }) => {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const [list, allRoles] = await Promise.all([careerApi.listRoadmaps(), careerApi.listRoles()]);
      setRoadmaps(list);
      setRoles(allRoles);
      // A goal is the student's choice: nothing is generated for them.
      setActiveId((cur) => (cur && list.some((r) => r.id === cur) ? cur : list[0]?.id || null));
    } catch (err: any) {
      setLoadError(err?.message || 'Career roadmaps could not be loaded.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const active = roadmaps.find((r) => r.id === activeId) || null;
  const replace = (updated: CareerRoadmap) => setRoadmaps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

  const handleStepStatusToggle = async (stepId: string, currentStatus: string) => {
    if (!active) return;
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      replace(await careerApi.updateStepStatus(active.id, stepId, nextStatus as any));
    } catch {
      toast.error('Could not update the step');
    }
  };

  const handleAddGoal = async (roleId: string) => {
    if (roadmaps.some((r) => r.role_id === roleId)) {
      setActiveId(roadmaps.find((r) => r.role_id === roleId)!.id);
      return;
    }
    try {
      setBusy(true);
      const created = await careerApi.generateRoadmap(roleId);
      setRoadmaps((prev) => [created, ...prev]);
      setActiveId(created.id);
      toast.success(`Added the goal: ${created.title}`);
    } catch {
      toast.error('The roadmap could not be created');
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveGoal = async (id: string) => {
    try {
      await careerApi.deleteRoadmap(id);
      const rest = roadmaps.filter((r) => r.id !== id);
      setRoadmaps(rest);
      setActiveId(rest[0]?.id || null);
      toast.success('Goal removed');
    } catch {
      toast.error('The goal could not be removed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading your career roadmaps…</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="max-w-xl mx-auto mt-10 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-900">{loadError}</p>
        <button onClick={fetchRoadmaps} className="mt-3 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700">Try again</button>
      </div>
    );
  }

  const roleName = (id: string) => roles.find((r) => r.id === id)?.name || id;
  const available = roles.filter((r) => !roadmaps.some((m) => m.role_id === r.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/career')}
            aria-label="Back to Career"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Career Roadmaps</h1>
            <p className="text-xs text-slate-500">One roadmap per career goal, linked to the courses, labs, projects and interviews on this platform.</p>
          </div>
        </div>
        {roadmaps.length > 0 && available.length > 0 && (
          <select
            aria-label="Add a career goal"
            disabled={busy}
            onChange={(e) => {
              if (e.target.value) {
                handleAddGoal(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 text-xs rounded-lg border border-purple-300 bg-purple-50 text-purple-700 font-semibold"
          >
            <option value="" disabled>+ Add a career goal</option>
            {available.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )}
      </div>

      {roadmaps.length === 0 ? (
        <div className="space-y-4" data-testid="choose-goal">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900"><Compass className="h-5 w-5 text-purple-600" /><h2 className="text-base font-bold">Choose a career goal</h2></div>
            <p className="mt-1 text-xs text-slate-500">Pick one or more. Each gets its own roadmap. You can compare them and change your mind at any time.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((r) => (
              <button
                key={r.id}
                disabled={busy}
                onClick={() => handleAddGoal(r.id)}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-purple-300 hover:shadow-sm disabled:opacity-60"
              >
                <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{r.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="My career goals">
            {roadmaps.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={r.id === activeId}
                onClick={() => setActiveId(r.id)}
                className={`rounded-lg border px-3 py-2 text-left text-xs ${r.id === activeId ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
              >
                <span className="font-semibold">{roleName(r.role_id)}</span>
                <span className="ml-2 opacity-80">{r.verified_progress?.percent ?? 0}%</span>
              </button>
            ))}
          </div>

          {roadmaps.length >= 2 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4" data-testid="compare-goals">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-bold text-slate-900"><Scale className="h-4 w-4 text-slate-500" /> Compare my goals</p>
                <button className="text-xs font-semibold text-purple-700 hover:underline" onClick={() => onNavigate('/career/explore')}>Compare role requirements</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-500"><tr><th className="py-1 pr-3 font-medium">Goal</th><th className="py-1 pr-3 font-medium">Steps backed by activity</th><th className="py-1 pr-3 font-medium">Still to do</th><th className="py-1 font-medium">Next step</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {roadmaps.map((r) => {
                      const next = r.steps.find((s) => !s.evidence?.verified);
                      return (
                        <tr key={r.id}>
                          <td className="py-1.5 pr-3 font-semibold text-slate-800">{roleName(r.role_id)}</td>
                          <td className="py-1.5 pr-3">{r.verified_progress?.done ?? 0} of {r.verified_progress?.total ?? r.steps.length}</td>
                          <td className="py-1.5 pr-3">{(r.verified_progress?.total ?? r.steps.length) - (r.verified_progress?.done ?? 0)}</td>
                          <td className="py-1.5 text-slate-600">{next ? next.title : 'All done'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {active && <RoadmapDetail roadmap={active} onToggle={handleStepStatusToggle} onNavigate={onNavigate} onRemove={() => handleRemoveGoal(active.id)} />}
        </>
      )}
    </div>
  );
};

function RoadmapDetail({ roadmap, onToggle, onNavigate, onRemove }: { roadmap: CareerRoadmap; onToggle: (id: string, s: string) => void; onNavigate: (p: string) => void; onRemove: () => void }) {
  const vp = roadmap.verified_progress || { done: 0, total: roadmap.steps.length, percent: 0 };
  return (
    <>
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3" data-testid="roadmap-progress">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{roadmap.title}</h2>
          <button onClick={onRemove} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"><Trash2 className="h-3.5 w-3.5" /> Remove this goal</button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white">{vp.done} of {vp.total} steps backed by your activity</span>
          <span className="text-sm font-bold text-purple-600">{vp.percent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div className="bg-purple-600 h-2 rounded-full transition-all duration-500" style={{ width: `${vp.percent}%` }} />
        </div>
        <p className="text-[11px] text-slate-500">
          Progress counts finished courses, solved problems, projects, completed mock interviews and recorded skill evidence. Steps you tick yourself are shown as self-marked and do not change it.
        </p>
      </div>

      <div className="space-y-4">
        {roadmap.steps.map((step, idx) => {
          const verified = !!step.evidence?.verified;
          const selfMarked = step.status === 'COMPLETED';
          return (
            <div
              key={step.id}
              data-testid="roadmap-step"
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${verified ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
            >
              <div className="flex items-start gap-4">
                <span className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${verified ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {verified ? '✓' : idx + 1}
                </span>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step {idx + 1}: {step.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{step.description}</p>
                  {step.evidence && (
                    <p className={`flex items-center gap-1.5 text-[11px] font-medium ${verified ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {verified ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                      {verified ? 'Done: ' : 'Not yet: '}
                      {step.evidence.detail}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {step.url && (
                  <button onClick={() => onNavigate(step.url!)} className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5">
                    Open <ExternalLink className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => onToggle(step.id, step.status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border bg-transparent ${selfMarked ? 'border-emerald-200 text-emerald-700' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                  title="Your own tick. It does not change the progress above."
                >
                  {selfMarked ? 'Self-marked done' : <span className="inline-flex items-center gap-1"><Plus className="h-3 w-3" /> Mark for myself</span>}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
