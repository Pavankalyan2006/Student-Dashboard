import React, { useEffect, useState } from 'react';
import { skillsApi, SkillGapAnalysisResult } from '../../skills/api/skillsApi';
import { careerApi, CareerRole } from '../api/careerApi';
import {
  Target,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  FolderGit2,
  Code2,
  ArrowRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface SkillGapPageProps {
  onNavigate: (path: string) => void;
  initialRoleId?: string;
}

export const SkillGapPage: React.FC<SkillGapPageProps> = ({ onNavigate, initialRoleId = 'role_sde' }) => {
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(initialRoleId);
  const [gaps, setGaps] = useState<SkillGapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (roleId: string) => {
    try {
      setIsLoading(true);
      const [allRoles, gapData] = await Promise.all([
        careerApi.listRoles(),
        skillsApi.getSkillGaps(roleId),
      ]);
      setRoles(allRoles);
      setGaps(gapData);
    } catch (err: any) {
      toast.error('Failed to load skill gap data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialRoleId && initialRoleId !== selectedRoleId) {
      setSelectedRoleId(initialRoleId);
    }
  }, [initialRoleId]);

  useEffect(() => {
    loadData(selectedRoleId);
  }, [selectedRoleId]);

  if (isLoading || !gaps) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Evaluating current evidence against role profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
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
              Skill Gap Analysis
            </h1>
            <p className="text-xs text-slate-500">
              Evidence-based comparison against industry role profiles.
            </p>
          </div>
        </div>

        {/* Role Selector & Actions */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Target Role:</label>
          <select
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button
            onClick={async () => {
              try {
                await careerApi.generateRoadmap(selectedRoleId);
                toast.success('Generated roadmap for this role');
                onNavigate('/career/roadmap');
              } catch {
                toast.error('Failed to generate roadmap');
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            Start Roadmap
          </button>
        </div>
      </div>

      {/* Respectful Policy Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 text-purple-800 dark:text-purple-300 text-xs flex items-start gap-3">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-purple-600" />
        <p className="leading-relaxed">{gaps.disclaimer}</p>
      </div>

      {/* Overview Stat Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Curriculum Alignment for {gaps.target_role}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {gaps.current_strengths.length} verified strengths • {gaps.skills_to_develop.length} areas to expand
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-bold text-purple-600 leading-none">
              {gaps.coverage_percentage}%
            </span>
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Evidence Coverage</span>
          </div>
        </div>
      </div>

      {/* Current Strengths */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Verified Strengths ({gaps.current_strengths.length})
        </h3>
        <p className="text-xs text-slate-500">
          Topics with robust evidence recorded in courses, projects, or lab problem-solving.
        </p>

        {gaps.current_strengths.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {gaps.current_strengths.map((str, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-950 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {str.skill}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {str.evidence_count} evidence records
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                  {str.evidence_state.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-3">No verified strengths yet for this role. Complete a course or project to record evidence.</div>
        )}
      </div>

      {/* Skills to Develop / Practice */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          Prioritized Skills to Develop ({gaps.skills_to_develop.length})
        </h3>
        <p className="text-xs text-slate-500">
          Direct learning and practice recommendations mapped to active platform resources.
        </p>

        <div className="space-y-3">
          {gaps.skills_to_develop.map((gap, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {gap.skill}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      gap.priority === 'HIGH'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : gap.priority === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {gap.priority} Priority
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Status: {gap.evidence_state.replace('_', ' ')}
                  </span>
                </div>
                {gap.recommended_learning_resource && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    Recommended: {gap.recommended_learning_resource.title} ({gap.recommended_learning_resource.type})
                  </p>
                )}
                {gap.recommended_practice && (
                  <p className="text-[11px] text-slate-500 italic">
                    {gap.recommended_practice}
                  </p>
                )}
              </div>

              <button
                onClick={() => onNavigate(`/skills/assessment?skill=${encodeURIComponent(gap.skill)}`)}
                className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold shrink-0"
              >
                Assess Skill
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
