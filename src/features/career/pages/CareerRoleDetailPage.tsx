import React, { useEffect, useState } from 'react';
import { careerApi, CareerRole } from '../api/careerApi';
import {
  Compass,
  ChevronLeft,
  Sparkles,
  BookOpen,
  FolderGit2,
  Code2,
  HelpCircle,
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerRoleDetailPageProps {
  roleId: string;
  onNavigate: (path: string) => void;
}

export const CareerRoleDetailPage: React.FC<CareerRoleDetailPageProps> = ({ roleId, onNavigate }) => {
  const [role, setRole] = useState<CareerRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        const data = await careerApi.getRole(roleId);
        setRole(data);
      } catch (err: any) {
        toast.error('Failed to load role details');
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [roleId]);

  if (isLoading || !role) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading career role profile...</p>
      </div>
    );
  }

  const handleStartRoadmap = async () => {
    try {
      setIsGenerating(true);
      await careerApi.generateRoadmap(role.id);
      toast.success(`Generated ${role.name} learning roadmap`);
      onNavigate('/career/roadmap');
    } catch {
      toast.error('Failed to generate roadmap');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/career/explore')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {role.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                {role.industry}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified curricular standard • Reviewed {role.source_metadata?.last_reviewed}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate(`/career/skill-gap?role_id=${role.id}`)}
            className="px-3.5 py-2 rounded-lg border border-purple-200 dark:border-purple-900 text-purple-600 text-xs font-semibold hover:bg-purple-50 flex items-center gap-1.5"
          >
            <Target className="h-3.5 w-3.5" />
            Check My Skill Gaps
          </button>
          <button
            disabled={isGenerating}
            onClick={handleStartRoadmap}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Compass className="h-3.5 w-3.5" />
            {isGenerating ? 'Generating Roadmap...' : 'Generate Learning Roadmap'}
          </button>
        </div>
      </div>

      {/* Role Overview */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">Role Overview</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {role.description}
        </p>
        {role.source_metadata?.disclaimer && (
          <p className="text-[11px] text-slate-400 italic pt-1">
            {role.source_metadata.disclaimer}
          </p>
        )}
      </div>

      {/* Grid: Skills & Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-purple-600" />
            Core Competencies & Requirements
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {role.skills.map((sk, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-medium border border-purple-100 dark:border-purple-900/30"
              >
                {sk}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Wrench className="h-4 w-4 text-blue-600" />
            Recommended Developer Tools
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {role.recommended_tools.map((t, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interview & Coding Focus */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-emerald-600" />
            Coding & Algorithmic Expectations
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {role.coding_topics.map((ct, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                {ct}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            Technical Interview Topics
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
            {role.interview_topics.map((it, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                {it}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Typical Learning Path */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Typical Undergraduate Learning Progression
        </h3>
        <div className="space-y-2.5">
          {role.typical_learning_path.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-xs">
              <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
