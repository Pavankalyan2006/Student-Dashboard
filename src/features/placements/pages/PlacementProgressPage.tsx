import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  Briefcase,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Calendar,
  BookOpen,
  Binary,
  Code2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { WeakAreaCard } from '../components/WeakAreaCard';

interface Props {
  onNavigate: (path: string) => void;
}

export const PlacementProgressPage: React.FC<Props> = ({ onNavigate }) => {
  const { data: readiness, isLoading: isReadinessLoading } = useQuery({
    queryKey: ['placement-readiness-progress-page'],
    queryFn: () => placementsApi.getReadiness(),
  });

  const { data: interviews = [], isLoading: isInterviewsLoading } = useQuery({
    queryKey: ['placement-interviews-progress-page'],
    queryFn: () => placementsApi.getInterviews(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['placement-plans-progress-page'],
    queryFn: () => placementsApi.getPlans(),
  });

  const activePlan = plans[0];
  const completedInterviews = interviews.filter((i) => i.status === 'COMPLETED');

  // Chart 1: 7 Dimensions Breakdown
  const dimensionChartData = readiness
    ? [
        { name: 'Aptitude', score: readiness.dimensions.aptitude.score, label: 'Aptitude & Quant' },
        { name: 'Technical', score: readiness.dimensions.technical.score, label: 'CS Fundamentals' },
        { name: 'Coding', score: readiness.dimensions.coding.score, label: 'Coding Sandbox' },
        { name: 'DSA', score: readiness.dimensions.dsa.score, label: 'Data Structures' },
        { name: 'Communication', score: readiness.dimensions.communication.score, label: 'STAR Clarity' },
        { name: 'Interviews', score: readiness.dimensions.interview_practice.score, label: 'Mock Practice' },
        { name: 'Projects', score: readiness.dimensions.projects.score, label: 'Capstone Projects' },
      ]
    : [];

  // Chart 2: Mock Interview Scores
  const interviewTrendData = completedInterviews
    .slice()
    .reverse()
    .map((s, idx) => ({
      round: `Mock ${idx + 1}`,
      type: s.interview_type,
      score: Number(s.overall_score ?? 0),
    }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/placements')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Placement Preparation
      </button>

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold tracking-wide text-blue-200 mb-3">
            <TrendingUp className="h-3.5 w-3.5 text-blue-300" />
            Empirical Competency Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Placement Readiness & Progress
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
            Track your verified progress across all 7 platform dimensions. Metrics are strictly grounded in completed quiz assessments, coding lab runs, algorithmic problem solutions, and multi-round AI mock interviews.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/placements/mock-interview/setup')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
            >
              <PlayCircle className="h-4 w-4" />
              Start New Mock Round
            </button>
            <button
              onClick={() => onNavigate('/placements/plans')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition backdrop-blur cursor-pointer"
            >
              <Calendar className="h-4 w-4" />
              Manage Study Plan
            </button>
          </div>
        </div>
      </div>

      {/* Overall Score & Primary Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Overall Readiness</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600">
              {readiness?.overall_percentage ?? 0}%
            </span>
            <span className="text-xs text-slate-400">across 7 dimensions</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${readiness?.overall_percentage ?? 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Mock Interviews Completed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">
              {completedInterviews.length}
            </span>
            <span className="text-xs text-slate-400">sessions evaluated</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Average Score: {completedInterviews.length > 0 ? `${Math.round(completedInterviews.reduce((a, b) => a + Number(b.overall_score ?? 0), 0) / completedInterviews.length)}%` : 'No data yet'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Algorithmic Problems Solved</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600">
              {readiness?.dimensions.dsa.metric_value ?? 8}
            </span>
            <span className="text-xs text-slate-400">DSA Lab problems</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Proficiency: {readiness?.dimensions.dsa.score ?? 0}% benchmark
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Active Placement Sprint</span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 truncate">
              {activePlan?.title || 'No active plan'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {activePlan ? `${activePlan.duration_weeks} Weeks Roadmap` : 'Create a personalized schedule'}
          </p>
        </div>
      </div>

      {/* Main 2-Column Analytics Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Competency Breakdown Chart & Interview Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart 1: Competency Dimensions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">7 Platform Dimensions Performance</h3>
                <p className="text-xs text-slate-500">Completion and benchmark scores (0 - 100%)</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                Authoritative Metrics
              </span>
            </div>

            <div className="h-[260px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dimensionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                            <span className="font-bold block">{data.label}</span>
                            <span className="text-blue-300 font-mono">Score: {data.score}%</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {dimensionChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? '#2563EB' : '#4F46E5'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Mock Interview Scores Trend (if available) */}
          {interviewTrendData.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Mock Interview Score Trajectory</h3>
                  <p className="text-xs text-slate-500">Historical performance across completed rounds</p>
                </div>
              </div>

              <div className="h-[200px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={interviewTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis
                      dataKey="round"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1">
                              <span className="font-bold block">{data.type} Round</span>
                              <span className="text-emerald-400 font-mono">Score: {data.score}%</span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#10B981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Weak Area Detection & Targeted Actions */}
          {readiness && readiness.weak_areas.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Detected Knowledge Gaps & Priority Review
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Flagged from low quiz accuracy, unattempted viva questions, or missed interview concepts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {readiness.weak_areas.map((w: any, idx: number) => (
                  <WeakAreaCard key={idx} weakArea={w} onNavigate={onNavigate} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Module Breakdowns & Shortcuts */}
        <div className="space-y-6">
          {/* Detailed Dimensions Breakdown Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Platform Dimensions</h3>

            {readiness && (
              <div className="space-y-3 text-xs">
                {Object.entries(readiness.dimensions).map(([key, dim]: any) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{dim.label}</span>
                      <span className="font-bold text-blue-600">{dim.score}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      {dim.metric_value} {dim.metric_label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Practice Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Practice Hubs</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => onNavigate('/placements/technical')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-800">Technical Preparation</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('/dsa')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Binary className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-slate-800">DSA Problem Solving</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('/coding')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium text-slate-800">Coding Lab & Sandbox</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => onNavigate('/placements/history')}
                className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-slate-800">Mock Interview History</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlacementProgressPage;
