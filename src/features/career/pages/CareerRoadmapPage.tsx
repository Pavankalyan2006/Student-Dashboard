import React, { useEffect, useState } from 'react';
import { careerApi, CareerRoadmap, CareerRole } from '../api/careerApi';
import {
  Compass,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  FolderGit2,
  Code2,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerRoadmapPageProps {
  onNavigate: (path: string) => void;
}

export const CareerRoadmapPage: React.FC<CareerRoadmapPageProps> = ({ onNavigate }) => {
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<CareerRoadmap | null>(null);
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoadmaps = async () => {
    try {
      setIsLoading(true);
      const [list, allRoles] = await Promise.all([
        careerApi.listRoadmaps(),
        careerApi.listRoles(),
      ]);
      setRoadmaps(list);
      setRoles(allRoles);
      if (list.length > 0) {
        setActiveRoadmap(list[0]);
      } else if (allRoles.length > 0) {
        // Auto-generate for SDE if none exists
        const generated = await careerApi.generateRoadmap(allRoles[0].id);
        setRoadmaps([generated]);
        setActiveRoadmap(generated);
      }
    } catch (err: any) {
      toast.error('Failed to load career roadmaps');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleStepStatusToggle = async (stepId: string, currentStatus: string) => {
    if (!activeRoadmap) return;
    const nextStatus = currentStatus === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      const updated = await careerApi.updateStepStatus(activeRoadmap.id, stepId, nextStatus as any);
      setActiveRoadmap(updated);
      setRoadmaps((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      toast.success(nextStatus === 'COMPLETED' ? 'Marked step completed' : 'Marked step in progress');
    } catch {
      toast.error('Failed to update step status');
    }
  };

  const handleCreateRoadmapForRole = async (roleId: string) => {
    try {
      const newRoadmap = await careerApi.generateRoadmap(roleId);
      setRoadmaps([newRoadmap, ...roadmaps]);
      setActiveRoadmap(newRoadmap);
      toast.success(`Generated roadmap for ${newRoadmap.title}`);
    } catch {
      toast.error('Failed to generate roadmap');
    }
  };

  if (isLoading || !activeRoadmap) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Personalizing learning progression...</p>
      </div>
    );
  }

  const completedCount = activeRoadmap.steps.filter((s) => s.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedCount / activeRoadmap.steps.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/career')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeRoadmap.title}
            </h1>
            <p className="text-xs text-slate-500">
              Personalized technical progression linking directly to platform courses, labs, and projects.
            </p>
          </div>
        </div>

        {/* Switch or Create Roadmap */}
        <div className="flex flex-wrap items-center gap-2">
          {roadmaps.length > 1 && (
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500 font-medium">Switch Roadmap:</label>
              <select
                value={activeRoadmap.id}
                onChange={(e) => {
                  const found = roadmaps.find((r) => r.id === e.target.value);
                  if (found) setActiveRoadmap(found);
                }}
                className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                {roadmaps.map((r) => (
                  <option key={r.id} value={r.id}>{r.title}</option>
                ))}
              </select>
            </div>
          )}

          <select
            onChange={(e) => {
              if (e.target.value) {
                handleCreateRoadmapForRole(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 text-xs rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold"
          >
            <option value="" disabled>+ New Role Roadmap</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Roadmap Progression: {completedCount} of {activeRoadmap.steps.length} stages completed
            </span>
          </div>
          <span className="text-sm font-bold text-purple-600">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Sequential Steps Timeline */}
      <div className="space-y-4">
        {activeRoadmap.steps.map((step, idx) => {
          const isDone = step.status === 'COMPLETED';
          const isInProgress = step.status === 'IN_PROGRESS';

          return (
            <div
              key={step.id}
              className={`p-5 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                isDone
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/50'
                  : isInProgress
                  ? 'bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-800 shadow-sm ring-1 ring-purple-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleStepStatusToggle(step.id, step.status)}
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs transition ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isInProgress
                      ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-2 border-purple-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                  title="Click to toggle stage completion"
                >
                  {isDone ? '✓' : idx + 1}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Stage {idx + 1}: {step.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {step.estimated_effort}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                    <span>Resource Type: <strong className="text-slate-700 dark:text-slate-300">{step.source_type}</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Link to real platform modules */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {step.url && (
                  <button
                    onClick={() => onNavigate(step.url!)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1.5 transition"
                  >
                    Open Platform Module
                    <ExternalLink className="h-3 w-3" />
                  </button>
                )}
                <button
                  onClick={() => handleStepStatusToggle(step.id, step.status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    isDone
                      ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isDone ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
