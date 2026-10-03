import React, { useEffect, useState } from 'react';
import { careerApi, CareerRole, CareerRoadmap, CareerRecommendationResult } from '../api/careerApi';
import { skillsApi, StudentSkill } from '../../skills/api/skillsApi';
import {
  Compass,
  Target,
  Layers,
  Award,
  BookOpen,
  FolderGit2,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const CareerDashboardPage: React.FC<CareerDashboardPageProps> = ({ onNavigate }) => {
  const [recommendations, setRecommendations] = useState<CareerRecommendationResult | null>(null);
  const [roadmaps, setRoadmaps] = useState<CareerRoadmap[]>([]);
  const [studentSkills, setStudentSkills] = useState<StudentSkill[]>([]);
  const [allRoles, setAllRoles] = useState<CareerRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingRoleId, setGeneratingRoleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [recs, rdmList, skills, roles] = await Promise.all([
          careerApi.getRecommendations(),
          careerApi.listRoadmaps(),
          skillsApi.getProfile(),
          careerApi.listRoles(),
        ]);
        setRecommendations(recs);
        setRoadmaps(rdmList);
        setStudentSkills(skills);
        setAllRoles(roles);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load career dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-purple-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Analyzing career alignments and skill profiles...</p>
      </div>
    );
  }

  const activeRoadmap = roadmaps[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Career Assistant
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Explore roles, understand skill requirements and build a personalized learning roadmap.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/career/explore')}
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <Layers className="h-3.5 w-3.5" />
            Compare Roles
          </button>
          <button
            onClick={() => onNavigate('/career/skill-gap')}
            className="px-3.5 py-2 rounded-lg border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 flex items-center gap-1.5 transition"
          >
            <Target className="h-3.5 w-3.5" />
            Skill Gap Analysis
          </button>
          <button
            onClick={() => onNavigate('/career/roadmap')}
            className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Compass className="h-3.5 w-3.5" />
            My Roadmap
          </button>
        </div>
      </div>

      {/* Transparent AI Recommendation Explanation */}
      {recommendations && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                Transparent Platform Alignment
              </h3>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5 leading-relaxed">
                {recommendations.explanation}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 italic shrink-0">
            {recommendations.disclaimer}
          </span>
        </div>
      )}

      {/* Suggested Roles Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600" />
            Suggested Engineering Roles
          </h2>
          <button
            onClick={() => onNavigate('/career/explore')}
            className="text-xs text-purple-600 hover:underline font-semibold flex items-center gap-1"
          >
            View all {allRoles.length} roles <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations?.potentially_relevant_roles.map((match) => (
            <div
              key={match.role_id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {match.role_name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                    {match.match_percentage}% Skill Overlap
                  </span>
                </div>

                {/* Match Reasons */}
                <div className="space-y-1">
                  {match.match_reasons.map((r, i) => (
                    <p key={i} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                      <span className="text-purple-600 font-bold">•</span>
                      {r}
                    </p>
                  ))}
                </div>

                {/* Matching Skills */}
                <div>
                  <span className="text-[10px] font-semibold text-emerald-600 block mb-1">
                    Matching Evidence:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {match.top_matching_skills.slice(0, 4).map((sk, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Skills to develop */}
                {match.skills_to_develop.length > 0 && (
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">
                      Skills to Develop:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {match.skills_to_develop.slice(0, 3).map((sk, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px]"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`/career/role/${match.role_id}`)}
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 flex items-center gap-1"
                >
                  Explore Role <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  disabled={generatingRoleId === match.role_id}
                  onClick={async () => {
                    try {
                      setGeneratingRoleId(match.role_id);
                      await careerApi.generateRoadmap(match.role_id);
                      toast.success(`Generated roadmap for ${match.role_name}`);
                      onNavigate('/career/roadmap');
                    } catch {
                      toast.error('Failed to generate roadmap');
                    } finally {
                      setGeneratingRoleId(null);
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50"
                >
                  {generatingRoleId === match.role_id ? 'Generating...' : 'Start Roadmap'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Active Learning Roadmap & Verified Skills Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Roadmap Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Compass className="h-4 w-4 text-purple-600" />
                Active Learning Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                {activeRoadmap ? activeRoadmap.title : 'No active roadmap yet'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/career/roadmap')}
              className="text-xs text-purple-600 hover:underline font-semibold"
            >
              Open Full Roadmap
            </button>
          </div>

          {activeRoadmap ? (
            <div className="space-y-3">
              {activeRoadmap.steps.slice(0, 4).map((step, idx) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        step.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : step.status === 'IN_PROGRESS'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {step.status === 'COMPLETED' ? '✓' : idx + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white block">
                        {step.title}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {step.estimated_effort} • Type: {step.source_type}
                      </span>
                    </div>
                  </div>
                  {step.url && (
                    <button
                      onClick={() => onNavigate(step.url!)}
                      className="text-blue-600 hover:underline text-[11px] font-medium"
                    >
                      Go to module →
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p className="text-xs mb-3">Select a role above to generate your customized step-by-step roadmap.</p>
              <button
                onClick={() => onNavigate('/career/explore')}
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold"
              >
                Explore Roles
              </button>
            </div>
          )}
        </div>

        {/* Current Skills Matrix */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                Verified Student Skills ({studentSkills.length})
              </h3>
              <p className="text-xs text-slate-500">
                Backed by real course progress, projects, coding, and assessments
              </p>
            </div>
            <button
              onClick={() => onNavigate('/skills')}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              View Skills Profile
            </button>
          </div>

          <div className="space-y-2">
            {studentSkills.map((sk) => (
              <div
                key={sk.id}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white block">
                    {sk.skill_name}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {sk.category.toLowerCase().replace('_', ' ')} • {sk.evidence_count} evidence item{sk.evidence_count === 1 ? '' : 's'}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    sk.confidence === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50'
                      : sk.confidence === 'STRONG_EVIDENCE'
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50'
                  }`}
                >
                  {sk.confidence.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
