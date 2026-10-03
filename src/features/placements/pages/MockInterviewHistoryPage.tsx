import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2,
  XCircle,
  PlayCircle,
  FileText,
  AlertCircle,
  RotateCcw,
  BarChart3,
  Briefcase,
  Building2,
} from 'lucide-react';
import { placementsApi } from '../api/placementsApi';
import type { MockInterviewSession } from '../types/placement';

interface Props {
  onNavigate?: (path: string) => void;
}

export const MockInterviewHistoryPage: React.FC<Props> = ({ onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const [sessions, setSessions] = useState<MockInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  useEffect(() => {
    async function loadSessions() {
      try {
        setLoading(true);
        const data = await placementsApi.getInterviewSessions();
        setSessions(data);
      } catch (err) {
        console.error('Failed to load interview sessions', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && s.interview_type !== typeFilter) return false;
    return true;
  });

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED');
  const averageScore = completedSessions.length > 0
    ? Math.round(
        completedSessions.reduce((acc, s) => acc + (s.feedback?.overall_score || 0), 0) /
          completedSessions.length
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate('/placements')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Placement Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0B1530] tracking-tight">
                Mock Interview History
              </h1>
              <p className="text-gray-600 mt-1">
                Review your past AI interview sessions, inspect performance evaluations, and track improvement over time.
              </p>
            </div>
            <button
              onClick={() => navigate('/placements/mock-interview/setup')}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              New Mock Interview
            </button>
          </div>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{sessions.length}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sessions</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{completedSessions.length}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Debriefs</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-gray-900">{averageScore}%</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Concept Coverage</div>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter By:</span>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ABANDONED">Abandoned</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Interview Types</option>
              <option value="TECHNICAL">Technical CS</option>
              <option value="CODING">Coding Lab</option>
              <option value="PROJECT">Project Defense</option>
              <option value="HR">HR & Cultural</option>
              <option value="BEHAVIORAL">Behavioral (STAR)</option>
              <option value="MIXED">Full Simulation</option>
            </select>
          </div>

          <div className="text-xs font-semibold text-gray-500">
            Showing <strong className="text-gray-900">{filteredSessions.length}</strong> of {sessions.length} sessions
          </div>
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="py-16 text-center text-gray-500 text-sm">Loading session history...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No mock interview sessions found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              You haven't conducted any mock interviews matching the selected filter criteria.
            </p>
            <button
              onClick={() => navigate('/placements/mock-interview/setup')}
              className="inline-flex items-center px-4 py-2 mt-4 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
            >
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map(session => {
              const isCompleted = session.status === 'COMPLETED';
              const isInProgress = session.status === 'IN_PROGRESS' || session.status === 'READY';
              const score = session.feedback?.overall_score;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 uppercase tracking-wider">
                        {session.interview_type}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isInProgress
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {session.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 font-medium capitalize">
                        • {session.difficulty.toLowerCase()} difficulty
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      {session.role ? (
                        <>
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>{session.role.name}</span>
                        </>
                      ) : (
                        <span>General Placement Interview</span>
                      )}
                      {session.company && (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {session.company.name}
                        </span>
                      )}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(session.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Target: {session.duration_minutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                        <span>{session.questions?.length || 0} questions addressed</span>
                      </div>
                    </div>

                    {session.feedback && session.feedback.topics_covered && session.feedback.topics_covered.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {session.feedback.topics_covered.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 md:border-l md:border-gray-100 md:pl-6 shrink-0 justify-between md:justify-end">
                    {score !== undefined && (
                      <div className="text-center">
                        <div className="text-2xl font-black text-gray-900">{score}%</div>
                        <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Score</div>
                      </div>
                    )}

                    <div>
                      {isCompleted ? (
                        <button
                          onClick={() => navigate(`/placements/mock-interview/${session.id}/result`)}
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5 mr-1.5" />
                          View Debrief
                        </button>
                      ) : isInProgress ? (
                        <button
                          onClick={() => navigate(`/placements/mock-interview/${session.id}`)}
                          className="inline-flex items-center px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition shadow-xs"
                        >
                          <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
                          Resume
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/placements/mock-interview/setup')}
                          className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                          Re-practice
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
