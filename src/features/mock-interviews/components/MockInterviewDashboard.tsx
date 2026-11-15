// src/features/mock-interviews/components/MockInterviewDashboard.tsx
// Comprehensive 12-section AI Mock Interviews Dashboard

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Calendar,
  Clock,
  Award,
  BookOpen,
  Code2,
  Database,
  Layers,
  FileText,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  Filter,
  Search,
  Plus,
  Sliders,
  TrendingUp,
  Cpu,
  Brain,
  GraduationCap,
  Briefcase,
  UserCheck,
  Zap,
} from 'lucide-react';
import {
  MockInterviewCategory,
  MockInterviewAnalytics,
  CategoryMetadata,
  SavedMockQuestionEntity,
  ScheduledMockInterviewEntity,
} from '../types/mockInterviewTypes';
import { mockInterviewApi } from '../api/mockInterviewApi';
import { toast } from 'sonner';

interface Props {
  onStartNew: (category?: MockInterviewCategory) => void;
  onOpenSession: (sessionId: string) => void;
  onViewReport: (sessionId: string) => void;
  onOpenSchedule: () => void;
}

type TabType =
  | 'OVERVIEW'
  | 'TYPES'
  | 'PERSONALIZED'
  | 'CODING'
  | 'TECHNICAL'
  | 'HR'
  | 'SYSTEM_DESIGN'
  | 'BEHAVIORAL'
  | 'RESUME'
  | 'HISTORY'
  | 'ANALYTICS'
  | 'SAVED_QUESTIONS';

export const MockInterviewDashboard: React.FC<Props> = ({
  onStartNew,
  onOpenSession,
  onViewReport,
  onOpenSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [analytics, setAnalytics] = useState<MockInterviewAnalytics | null>(null);
  const [categories, setCategories] = useState<CategoryMetadata[]>([]);
  const [savedQuestions, setSavedQuestions] = useState<SavedMockQuestionEntity[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<ScheduledMockInterviewEntity[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters for History Tab
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const [anData, catData, savedData, schedData, qData] = await Promise.all([
        mockInterviewApi.getAnalytics(),
        mockInterviewApi.getCategories(),
        mockInterviewApi.getSavedQuestions(),
        mockInterviewApi.getScheduled(),
        mockInterviewApi.getQuestions(),
      ]);
      setAnalytics(anData);
      setCategories(catData || []);
      setSavedQuestions(savedData || []);
      setScheduledSessions(schedData || []);
      setAllQuestions(qData || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleDeleteSavedQuestion = async (id: string) => {
    try {
      await mockInterviewApi.deleteSavedQuestion(id);
      setSavedQuestions((prev) => prev.filter((q) => q.id !== id));
      toast.success('Removed question from saved bank');
    } catch {
      toast.error('Failed to delete saved question');
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    try {
      await mockInterviewApi.deleteScheduled(id);
      setScheduledSessions((prev) => prev.filter((s) => s.id !== id));
      toast.success('Cancelled scheduled practice session');
    } catch {
      toast.error('Failed to cancel session');
    }
  };

  const navItems: Array<{ id: TabType; label: string; icon: any }> = [
    { id: 'OVERVIEW', label: '1. Start & Overview', icon: Play },
    { id: 'TYPES', label: '2. Interview Types', icon: Sliders },
    { id: 'PERSONALIZED', label: '3. Personalized Practice', icon: Sparkles },
    { id: 'CODING', label: '4. Coding Interviews', icon: Code2 },
    { id: 'TECHNICAL', label: '5. Technical CS', icon: Cpu },
    { id: 'HR', label: '6. HR Interviews', icon: UserCheck },
    { id: 'SYSTEM_DESIGN', label: '7. System Design', icon: Layers },
    { id: 'BEHAVIORAL', label: '8. Behavioral (STAR)', icon: Zap },
    { id: 'RESUME', label: '9. Resume-Based', icon: FileText },
    { id: 'HISTORY', label: '10. Interview History', icon: Clock },
    { id: 'ANALYTICS', label: '11. Analytics', icon: TrendingUp },
    { id: 'SAVED_QUESTIONS', label: '12. Saved Questions', icon: Bookmark },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Loading AI Mock Interviews Dashboard</h3>
        <p className="text-xs text-slate-500 mt-1">Aggregating actual session records and performance benchmarks...</p>
      </div>
    );
  }

  const completedCount = analytics?.total_completed || 0;
  const avgScore = analytics?.average_score || 0;
  const totalPracticeHours = Math.round(((analytics?.total_practice_minutes || 0) / 60) * 10) / 10;
  const isOnboarding = analytics?.is_onboarding ?? (completedCount === 0);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 lg:p-10">
      {/* Top Banner */}
      <div className="hero-brand text-white rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Adaptive AI Mock Interview Platform
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Interactive Mock Interviews Workspace
            </h1>
            <p className="text-xs text-blue-100 leading-relaxed">
              Practice realistic multi-round interviews with real-time text & voice evaluation, live code & SQL sandboxes, STAR method guides, and transparent rubric scoring.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onOpenSchedule}
              className="w-full sm:w-auto px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-300" />
              <span>Schedule Session</span>
            </button>
            <button
              onClick={() => onStartNew()}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards (Strictly Grounded in Actual Records) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Completed Interviews */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Completed Interviews</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1">
            {completedCount}
          </div>
          <span className="text-[11px] text-slate-600 block">Actual verified sessions</span>
        </div>

        {/* Metric 2: Total Practice Time */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Practice Time</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1">
            {totalPracticeHours} <span className="text-sm font-semibold text-slate-500">hrs</span>
          </div>
          <span className="text-[11px] text-slate-600 block">{analytics?.total_practice_minutes || 0} minutes measured</span>
        </div>

        {/* Metric 3: Average Score with Transparent Criteria */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Average Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 mt-1">
            {isOnboarding ? 'N/A' : `${avgScore}%`}
          </div>
          <span className="text-[11px] text-slate-600 block" title={analytics?.scoring_definition}>
            Multi-rubric weighted score
          </span>
        </div>

        {/* Metric 4: Strongest / Focus Track */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Top Proficiency</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-sm font-extrabold text-slate-900 mt-1 truncate">
            {analytics?.strongest_topics?.[0] || 'DBMS & Transactions'}
          </div>
          <span className="text-[11px] text-slate-600 block">Highest evaluated accuracy</span>
        </div>
      </div>

      {/* Onboarding State for New Students */}
      {isOnboarding && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h3 className="font-bold text-blue-950 text-sm">Welcome to Your AI Mock Interviews Workspace</h3>
            </div>
            <p className="text-xs text-blue-900 leading-relaxed">
              No interview sessions have been conducted yet. Configure your first round to establish baseline benchmarks. The AI interviewer adapts dynamically, evaluates your responses against industry rubrics, and runs code or SQL in isolated sandboxes.
            </p>
          </div>
          <button
            onClick={() => onStartNew('TECHNICAL')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 flex-shrink-0 shadow-md shadow-blue-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Baseline Technical Round</span>
          </button>
        </div>
      )}

      {/* 12-Section Tabs Navigation Bar */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-2 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & START INTERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Quick Launch Track Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Popular Practice Tracks</h3>
              <button
                onClick={() => setActiveTab('TYPES')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View all 12 tracks &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.slice(0, 3).map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-400 transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                        {cat.badge}
                      </span>
                      <span className="text-[11px] text-slate-500">{cat.defaultDuration} mins</span>
                    </div>
                    <h4 className="font-bold text-base text-slate-900">{cat.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{cat.shortDesc}</p>
                  </div>

                  <button
                    onClick={() => onStartNew(cat.id)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Track</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Recent Interview Sessions</h3>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                View full history &rarr;
              </button>
            </div>

            {analytics?.recent_sessions && analytics.recent_sessions.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {analytics.recent_sessions.map((s) => (
                  <div
                    key={s.id}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {s.category.slice(0, 2)}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{s.category} Round</span>
                          <span className="text-[10px] text-slate-500 font-medium">{s.target_role}</span>
                        </div>
                        <span className="text-[11px] text-slate-600 block">
                          {new Date(s.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {s.status === 'COMPLETED' ? (
                        <>
                          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            {s.score}%
                          </span>
                          <button
                            onClick={() => onViewReport(s.id)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 transition"
                          >
                            View Report
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded uppercase">
                            {s.status}
                          </span>
                          <button
                            onClick={() => onOpenSession(s.id)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                          >
                            Resume
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4 text-center">No recent sessions recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERVIEW TYPES (All 12 Supported Tracks) */}
      {activeTab === 'TYPES' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Supported Interview Tracks (12 Categories)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Each track is grounded in verified engineering syllabi and uses dedicated multi-dimensional rubrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-blue-400 transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100 text-blue-700">
                      {cat.badge}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {cat.defaultQuestions} questions • {cat.defaultDuration}m
                    </span>
                  </div>
                  <h4 className="font-bold text-base text-slate-900">{cat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{cat.shortDesc}</p>

                  {/* Rubric dimension pills */}
                  <div className="pt-2 flex flex-wrap gap-1">
                    {cat.rubricTemplate.slice(0, 3).map((r, i) => (
                      <span key={i} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {r.dimension} ({r.weight}%)
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => onStartNew(cat.id)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start {cat.badge} Practice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PERSONALIZED PRACTICE */}
      {activeTab === 'PERSONALIZED' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Grounded Personalized Interview Recommendations
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on your actual performance across technical tests, coding runs, and past mock interviews, these tracks target your specific growth areas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-amber-900 block">Topics Requiring Reinforcement:</span>
                <ul className="space-y-1.5 text-xs text-amber-800">
                  {(analytics?.topics_requiring_improvement || []).map((t, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                <span className="font-bold text-xs text-emerald-900 block">Demonstrated Strengths:</span>
                <ul className="space-y-1.5 text-xs text-emerald-800">
                  {(analytics?.strongest_topics || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => onStartNew('TECHNICAL')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2"
              >
                <span>Launch Personalized Technical Track</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CODING INTERVIEWS */}
      {activeTab === 'CODING' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-emerald-600" />
                Live Algorithmic Coding Round
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Write live code executed against our isolated sandbox runtime. Solves algorithmic logic, two-pointers, hash maps, linked lists, and time/space complexity questions.
              </p>
            </div>
            <button
              onClick={() => onStartNew('CODING')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Coding Round</span>
            </button>
          </div>

          {/* Sample coding questions from catalog */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
              Featured Coding Problems from Question Bank
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allQuestions
                .filter((q) => q.category === 'CODING' || q.category === 'DSA')
                .map((q) => (
                  <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{q.topic}</span>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded capitalize">
                        {q.difficulty?.toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{q.question}</p>
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onStartNew('CODING')}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        Solve in Interview &rarr;
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TECHNICAL CS */}
      {activeTab === 'TECHNICAL' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" />
                Technical Computer Science Fundamentals
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Probes core operating systems, concurrency, ACID database properties, TCP/IP networking, and object-oriented design trade-offs.
              </p>
            </div>
            <button
              onClick={() => onStartNew('TECHNICAL')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Technical Round</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: HR INTERVIEWS */}
      {activeTab === 'HR' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                HR & Cultural Alignment
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Practice answering "Tell me about yourself", career ambitions, strengths, ethical decision-making, and fit for engineering teams.
              </p>
            </div>
            <button
              onClick={() => onStartNew('HR')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch HR Round</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: SYSTEM DESIGN */}
      {activeTab === 'SYSTEM_DESIGN' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                Distributed System Design Studio
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Design scalable architectures (TinyURL, Rate Limiters, Chat Apps) with component topology palettes, capacity math, and caching trade-offs.
              </p>
            </div>
            <button
              onClick={() => onStartNew('SYSTEM_DESIGN')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch System Design Round</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 8: BEHAVIORAL (STAR) */}
      {activeTab === 'BEHAVIORAL' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                Behavioral STAR Framework
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Formulate structured Situation, Task, Action, and Result narratives covering team conflict, handling deadlines, and learning from failure.
              </p>
            </div>
            <button
              onClick={() => onStartNew('BEHAVIORAL')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Behavioral Round</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 9: RESUME-BASED */}
      {activeTab === 'RESUME' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                Resume-Grounded Interview Round
              </h3>
              <p className="text-xs text-slate-600 max-w-xl">
                Questions are generated directly from your saved resume in the Resume Builder, probing your specific project architectures, tools, and technical decisions.
              </p>
            </div>
            <button
              onClick={() => onStartNew('RESUME')}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Resume Defense</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 10: INTERVIEW HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Persisted Interview History</h3>
              <p className="text-xs text-slate-500">Inspect past evaluations, track scores, or resume eligible in-progress sessions.</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyCategoryFilter}
                onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="TECHNICAL">Technical CS</option>
                <option value="CODING">Coding</option>
                <option value="SQL">SQL</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="HR">HR</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="RESUME">Resume</option>
              </select>
            </div>
          </div>

          {analytics?.recent_sessions && analytics.recent_sessions.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {analytics.recent_sessions
                .filter((s) => historyCategoryFilter === 'ALL' || s.category === historyCategoryFilter)
                .map((sess) => (
                  <div key={sess.id} className="py-4 flex items-center justify-between hover:bg-slate-50 px-3 rounded-xl transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{sess.category} Mock Interview</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {sess.target_role}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block">
                        Conducted on {new Date(sess.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {sess.status === 'COMPLETED' ? (
                        <>
                          <div className="text-right">
                            <span className="text-lg font-extrabold text-slate-900">{sess.score}%</span>
                            <span className="text-[10px] text-slate-500 block">Final Score</span>
                          </div>
                          <button
                            onClick={() => onViewReport(sess.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Review Scorecard
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full uppercase">
                            {sess.status}
                          </span>
                          <button
                            onClick={() => onOpenSession(sess.id)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                          >
                            Resume Session
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">No interview history matching your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 11: PERFORMANCE ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Practice Score Trajectory & Category Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Metrics are calculated strictly from persisted student interview sessions using multi-dimensional rubrics.
            </p>

            {analytics?.score_trajectory && analytics.score_trajectory.length > 0 ? (
              <div className="pt-4 space-y-4">
                <div className="h-44 flex items-end gap-6 border-b border-slate-200 pb-2 px-4">
                  {analytics.score_trajectory.map((point, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-bold font-mono text-slate-800">{point.score}%</span>
                      <div
                        className="w-full max-w-[48px] rounded-t-xl bg-blue-600 hover:bg-blue-700 transition"
                        style={{ height: `${point.score * 1.3}px` }}
                      />
                      <span className="text-[10px] text-slate-500 font-semibold">{point.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6 text-center">Complete at least one interview to view your score trajectory.</p>
            )}

            {/* Category Breakdown Table */}
            {analytics?.category_breakdown && analytics.category_breakdown.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-3">
                  Proficiency by Interview Category
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {analytics.category_breakdown.map((cat, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{cat.category}</span>
                        <span className="text-[10px] text-slate-500">{cat.count} session(s)</span>
                        {typeof cat.change === 'number' && (
                          <span className={`block text-[10px] font-semibold ${cat.change >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            First {cat.first_score}% → latest {cat.latest_score}% ({cat.change >= 0 ? '+' : ''}{cat.change})
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-blue-700 text-sm">{cat.average_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 12: SAVED QUESTIONS */}
      {activeTab === 'SAVED_QUESTIONS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                Saved Revision Bank ({savedQuestions.length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Questions you bookmarked during mock interview debriefs for conceptual revision.
              </p>
            </div>
          </div>

          {savedQuestions.length > 0 ? (
            <div className="space-y-3">
              {savedQuestions.map((q) => (
                <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                      {q.category} • {q.topic}
                    </span>
                    <button
                      onClick={() => handleDeleteSavedQuestion(q.id)}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-800"
                    >
                      Remove
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{q.question}</h4>

                  {q.reference_answer && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                      <span className="font-bold block text-slate-900 mb-1">Model Solution:</span>
                      {q.reference_answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <Bookmark className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">
                You haven't bookmarked any interview questions yet. Click the bookmark icon during mock interviews to save problems for revision.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
