import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import { PlacementReadinessCard } from '../components/PlacementReadinessCard';
import { PlacementTopicCard } from '../components/PlacementTopicCard';
import { WeakAreaCard } from '../components/WeakAreaCard';
import {
  Briefcase,
  PlayCircle,
  Binary,
  BookOpen,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export const PlacementDashboardPage: React.FC<Props> = ({ onNavigate }) => {
  const { data: readiness, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['placement-readiness'],
    queryFn: () => placementsApi.getReadiness(),
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['placement-topics'],
    queryFn: () => placementsApi.getTopics(),
  });

  const { data: interviews = [] } = useQuery({
    queryKey: ['placement-interviews'],
    queryFn: () => placementsApi.getInterviews(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['placement-plans'],
    queryFn: () => placementsApi.getPlans(),
  });

  const activePlan = plans[0];

  const featuredTopics = topics.slice(0, 4);
  const completedInterviews = interviews.filter((i) => i.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold tracking-wide text-blue-200 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            AI Placement Preparation Coach
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Placement Preparation
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
            Prepare for aptitude, technical, coding, and interview rounds with AI. Practice realistic company simulations, build structured learning plans, and bridge knowledge gaps.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/placements/mock-interview/setup')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
            >
              <PlayCircle className="h-4 w-4" />
              Start Mock Interview
            </button>
            <button
              onClick={() => onNavigate('/placements/topics?cat=APTITUDE')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur"
            >
              <BookOpen className="h-4 w-4" />
              Practice Aptitude
            </button>
            <button
              onClick={() => onNavigate('/dsa')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur"
            >
              <Binary className="h-4 w-4" />
              Practice DSA & Coding
            </button>
            <button
              onClick={() => onNavigate('/placements/plans')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur"
            >
              <Calendar className="h-4 w-4" />
              Placement Plan
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Readiness + Active Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Placement Readiness (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {readiness ? (
            <PlacementReadinessCard readiness={readiness} onNavigate={onNavigate} />
          ) : (
            <div className="bg-white rounded-xl p-8 border border-slate-200 animate-pulse h-64" />
          )}

          {/* Weak Areas requiring attention */}
          {readiness && readiness.weak_areas.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 text-base">Identified Priority Review Areas</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grounded in recent quiz attempts, DSA problem milestones, and mock interview diagnostics.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {readiness.weak_areas.map((w: any, idx: number) => (
                  <WeakAreaCard key={idx} weakArea={w} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Action Hub & Plan (1 col) */}
        <div className="space-y-6">
          {/* Active Sprint Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Active Placement Sprint</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                ACTIVE
              </span>
            </div>

            {activePlan ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">{activePlan.title}</h4>
                <p className="text-xs text-slate-500">
                  Target Duration: {activePlan.duration_weeks} Weeks
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onNavigate('/placements/plans')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    View Weekly Tasks <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500">No active placement plan created yet.</p>
                <button
                  onClick={() => onNavigate('/placements/plans')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Generate AI Study Plan
                </button>
              </div>
            )}
          </div>

          {/* Recent Mock Interviews */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-purple-600" />
                <h3 className="font-semibold text-slate-900 text-sm">Recent Mock Interviews</h3>
              </div>
              <button
                onClick={() => onNavigate('/placements/history')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {interviews.length > 0 ? (
              <div className="space-y-2.5">
                {interviews.slice(0, 3).map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => onNavigate(
                      sess.status === 'COMPLETED'
                        ? `/placements/mock-interview/${sess.id}/result`
                        : `/placements/mock-interview/${sess.id}`
                    )}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-900">
                        {sess.interview_type} Interview
                      </span>
                      {sess.overall_score !== undefined && (
                        <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {sess.overall_score}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Status: {sess.status}</span>
                      <span>{new Date(sess.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-500 mb-2">No mock interviews taken yet.</p>
                <button
                  onClick={() => onNavigate('/placements/mock-interview/setup')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Start Your First Interview
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Preparation Topics */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Core Placement Topics</h3>
            <p className="text-xs text-slate-500">
              Concept breakdowns, mathematical formulas, and common interview questions.
            </p>
          </div>
          <button
            onClick={() => onNavigate('/placements/topics')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Explore All Topics <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTopics.map((t) => (
            <PlacementTopicCard
              key={t.id}
              topic={t}
              onSelect={(id) => onNavigate(`/placements/topic/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
