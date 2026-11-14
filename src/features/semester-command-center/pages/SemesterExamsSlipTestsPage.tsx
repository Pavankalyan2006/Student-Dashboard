// src/features/semester-command-center/pages/SemesterExamsSlipTestsPage.tsx
// Dedicated Slip Tests, Minor Examinations & End-Semester Readiness (Section 14, 16, 17)

import * as React from 'react';
import {
  FileCheck,
  Award,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  BookOpen,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
} from 'lucide-react';
import { PageContainer, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { SemesterCommandCenterLayout } from '../components/SemesterCommandCenterLayout';
import { semesterCommandCenterApi } from '../../../api/semesterCommandCenterApi';
import {
  SlipTest,
  MinorExam,
  EndSemReadiness,
  AcademicSemesterConfig,
} from '../../../types/semesterCommandCenter';
import { toast } from 'sonner';

interface SemesterExamsSlipTestsPageProps {
  initialTab?: 'slip-tests' | 'minors' | 'end-sem';
  onNavigate?: (path: string) => void;
}

export function SemesterExamsSlipTestsPage({
  initialTab = 'slip-tests',
  onNavigate,
}: SemesterExamsSlipTestsPageProps) {
  const [activeTab, setActiveTab] = React.useState<'slip-tests' | 'minors' | 'end-sem'>(initialTab);
  const [slipTests, setSlipTests] = React.useState<SlipTest[]>([]);
  const [minorExams, setMinorExams] = React.useState<MinorExam[]>([]);
  const [endSemReadiness, setEndSemReadiness] = React.useState<EndSemReadiness[]>([]);
  const [config, setConfig] = React.useState<AcademicSemesterConfig | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);

  // Record Score Modal State
  const [recordingTest, setRecordingTest] = React.useState<SlipTest | null>(null);
  const [recordScore, setRecordScore] = React.useState<number>(15);
  const [recordWeakTopics, setRecordWeakTopics] = React.useState<string>('3NF Decomposition Proof, BCNF checking');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [overviewData, tests, minors, readiness] = await Promise.all([
        semesterCommandCenterApi.getOverview(),
        semesterCommandCenterApi.getSlipTests(),
        semesterCommandCenterApi.getMinorExams(),
        semesterCommandCenterApi.getEndSemReadiness(),
      ]);
      setConfig(overviewData.config);
      setSlipTests(tests);
      setMinorExams(minors);
      setEndSemReadiness(readiness);
    } catch (err: any) {
      toast.error('Failed to load examination engines: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRecordScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingTest) return;

    try {
      const weakList = recordWeakTopics.split(',').map((s) => s.trim()).filter(Boolean);
      await semesterCommandCenterApi.recordSlipTestScore(recordingTest.id, recordScore, weakList);
      toast.success('Slip test score recorded! Progress and revision stream updated.');
      setRecordingTest(null);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to record score: ' + err.message);
    }
  };

  if (loading && slipTests.length === 0) {
    return (
      <PageContainer>
        <LoadingState message="Loading examination command engines..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SemesterCommandCenterLayout
        currentTab={activeTab === 'end-sem' ? 'end-sem' : 'slip-tests'}
        config={config}
        onNavigate={onNavigate}
      >
        <div className="space-y-6">
          {/* Sub-Tabs Switcher */}
          <div className="flex border-b border-slate-200 gap-6 overflow-x-auto [&>button]:shrink-0 [&>button]:whitespace-nowrap">
            <button
              onClick={() => setActiveTab('slip-tests')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'slip-tests'
                  ? 'border-indigo-500 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              Slip Tests Management ({slipTests.length})
            </button>

            <button
              onClick={() => setActiveTab('minors')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'minors'
                  ? 'border-indigo-500 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Minor Examinations (Minor 1 & 2)
            </button>

            <button
              onClick={() => setActiveTab('end-sem')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'end-sem'
                  ? 'border-indigo-500 text-indigo-600 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              End-Semester Readiness Engine
            </button>
          </div>

          {/* TAB 1: SLIP TESTS (Section 14) */}
          {activeTab === 'slip-tests' && (
            <div className="space-y-6">
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Upcoming & Completed Slip Tests</h3>
                  <p className="text-xs text-slate-500">
                    Generates customized revision checklists and practice tasks before each test, recording weak topics post-test.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slipTests.map((test) => {
                  const isCompleted = test.status === 'COMPLETED';
                  return (
                    <div
                      key={test.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-mono text-indigo-600 uppercase font-semibold">
                              {test.subject_name}
                            </span>
                            <h4 className="text-base font-bold text-slate-900 mt-0.5">{test.title}</h4>
                          </div>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              isCompleted
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-amber-50 text-amber-600 border border-amber-200'
                            }`}
                          >
                            {test.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            {test.date}
                          </span>
                          <span>•</span>
                          <span>Duration: {test.duration_minutes} mins</span>
                          <span>•</span>
                          <span>Total Marks: {test.marks}</span>
                        </div>

                        {/* Covered Topics */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {test.topics.map((t, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Prep Plan Checklist */}
                        {test.preparation_plan && !isCompleted && (
                          <div className="mt-3.5 p-3 bg-white rounded-lg border border-indigo-200 space-y-2">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" /> AI Revision Checklist:
                            </span>
                            <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                              {test.preparation_plan.revision_list.map((r, idx) => (
                                <li key={idx}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Recorded Score & Weak Topics */}
                        {isCompleted && test.score !== undefined && (
                          <div className="mt-3.5 p-3 bg-white rounded-lg border border-emerald-200 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">Recorded Score:</span>
                              <span className="text-emerald-600 font-bold font-mono">
                                {test.score} / {test.marks} marks ({Math.round((test.score / test.marks) * 100)}%)
                              </span>
                            </div>
                            {test.weak_topics && test.weak_topics.length > 0 && (
                              <p className="text-slate-500 text-[11px]">
                                Weak Topics: <strong className="text-amber-700">{test.weak_topics.join(', ')}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-slate-200 flex justify-end">
                        {!isCompleted ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setRecordingTest(test);
                              setRecordScore(Math.round(test.marks * 0.8));
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                          >
                            Record Test Score
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onNavigate && onNavigate('/semester-command-center/daily-plan')}
                            className="text-xs border-slate-200 text-slate-700"
                          >
                            View Recovery Plan
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MINOR EXAMINATIONS (Section 16) */}
          {activeTab === 'minors' && (
            <div className="space-y-6">
              {minorExams.map((minor) => (
                <div key={minor.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{minor.title}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-200 font-semibold">
                          {minor.minor_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Schedule: {minor.start_date} to {minor.end_date} • Focus Mode: {minor.focus_mode}
                      </p>
                    </div>

                    <div className="text-right">
                      {minor.preparation_days_left > 0 ? (
                        <span className="text-base font-bold text-amber-600 font-mono">
                          {minor.preparation_days_left} Days Until Exam
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-mono">Completed / Evaluated</span>
                      )}
                    </div>
                  </div>

                  {/* Subject Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {minor.subjects.map((sub, idx) => (
                      <div key={idx} className="p-3.5 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{sub.subject_name}</span>
                          <span className="text-slate-500 font-mono">{sub.exam_date}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Units Covered: {sub.units_covered.join(', ')}</span>
                          <span>Remaining: {sub.syllabus_remaining_percent}%</span>
                        </div>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-slate-500">
                            Mock Test: {sub.mock_test_done ? '✓ Completed' : 'Pending'}
                          </span>
                          <button
                            onClick={() => onNavigate && onNavigate('/exams')}
                            className="text-[11px] text-indigo-600 hover:text-indigo-700 underline"
                          >
                            Launch Mock Test →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: END-SEMESTER READINESS (Section 17) */}
          {activeTab === 'end-sem' && (
            <div className="space-y-6">
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">End-Semester University Readiness Engine</h3>
                  <p className="text-xs text-slate-500">
                    Comprehensive multi-factor readiness index evaluating remaining units, revision coverage, and past question mastery.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onNavigate && onNavigate('/exams')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs"
                >
                  <Award className="w-3.5 h-3.5 mr-1" />
                  Full Mock Exam Center
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {endSemReadiness.map((item) => (
                  <div key={item.subject_id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-slate-900">{item.subject_name}</h4>
                            <span className="text-[10px] font-mono text-slate-500">{item.subject_code}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Exam Date: <strong className="text-slate-800">{item.exam_date}</strong> (in{' '}
                            <strong className="text-amber-600">{item.days_remaining} days</strong>)
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-extrabold text-emerald-600 font-mono">
                            {item.readiness_percent}%
                          </div>
                          <div className="text-[10px] text-slate-500">Readiness</div>
                        </div>
                      </div>

                      {/* Progress Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200 text-center text-xs">
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <div className="font-bold text-slate-900">
                            {item.completed_units}/{item.total_units}
                          </div>
                          <div className="text-[10px] text-slate-500">Units Done</div>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <div className="font-bold text-slate-900">{item.revised_units} Units</div>
                          <div className="text-[10px] text-slate-500">Revised</div>
                        </div>
                        <div className="p-2 bg-white rounded border border-slate-200">
                          <div className="font-bold text-slate-900">
                            {item.mock_tests_completed}/{item.mock_tests_target}
                          </div>
                          <div className="text-[10px] text-slate-500">Mocks Taken</div>
                        </div>
                      </div>
                    </div>

                    {/* Weak vs Strong Topics */}
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                          Strong Topics:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.strong_topics.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">
                          Weak Topics (Focus Area):
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.weak_topics.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Recommended End-Sem Prep Stream */}
                    <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
                        End-Sem Execution Stream:
                      </span>
                      <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                        {item.end_sem_prep_stream.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL: RECORD SLIP TEST SCORE */}
        {recordingTest && (
          <div className="fixed inset-0 z-50 bg-slate-50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Record Score: {recordingTest.title}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecordingTest(null)}
                  className="border-slate-200 text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </Button>
              </div>

              <form onSubmit={handleRecordScoreSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Marks Obtained (out of {recordingTest.marks})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={recordingTest.marks}
                    required
                    value={recordScore}
                    onChange={(e) => setRecordScore(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Incorrect Concepts / Weak Topics (Comma-separated)
                  </label>
                  <textarea
                    rows={3}
                    value={recordWeakTopics}
                    onChange={(e) => setRecordWeakTopics(e.target.value)}
                    placeholder="e.g. BCNF validation, Canonical Cover algorithm"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    The Academic Recovery Engine automatically schedules targeted revision if score falls below 60%.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-end">
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs">
                    Save Test Results
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </SemesterCommandCenterLayout>
    </PageContainer>
  );
}
