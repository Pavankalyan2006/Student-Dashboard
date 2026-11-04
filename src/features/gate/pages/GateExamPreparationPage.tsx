// src/features/gate/pages/GateExamPreparationPage.tsx
// Master GATE Exam Preparation Page for the Assessment Category

import React, { useState, useEffect, useCallback } from 'react';
import {
  GatePaper,
  GateStudentProfile,
  GateSyllabusSection,
  GateSyllabusTopic,
  GateQuestion,
  GateMockTest,
  GateTestSession,
  GateTestResult,
  GateStudyTask,
  GateDashboardData,
  GateBookmark,
  TopicStatus,
  StudentConfidence
} from '../types/gateTypes';
import { gateApi } from '../api/gateApi';

import { GateDashboardView } from '../components/GateDashboardView';
import { GateSyllabusExplorer } from '../components/GateSyllabusExplorer';
import { GateQuestionBank } from '../components/GateQuestionBank';
import { GateMockTestsView } from '../components/GateMockTestsView';
import { GateTestResultView } from '../components/GateTestResultView';
import { GateStudyPlannerView } from '../components/GateStudyPlannerView';
import { GateRevisionView } from '../components/GateRevisionView';

import { GatePaperSelectorModal } from '../components/GatePaperSelectorModal';
import { GateQuestionPracticeModal } from '../components/GateQuestionPracticeModal';
import { GateTestEngineModal } from '../components/GateTestEngineModal';
import { GateAiTutorDrawer } from '../components/GateAiTutorDrawer';

import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Award,
  Calendar,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

type GateTab = 'dashboard' | 'syllabus' | 'questions' | 'mock-tests' | 'planner' | 'revision';

interface GateExamPreparationPageProps {
  onNavigate?: (path: string) => void;
  initialTab?: GateTab;
}

export const GateExamPreparationPage: React.FC<GateExamPreparationPageProps> = ({
  onNavigate,
  initialTab = 'dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<GateTab>(initialTab);
  const [loading, setLoading] = useState(true);

  // Core Data
  const [dashboardData, setDashboardData] = useState<GateDashboardData | null>(null);
  const [papers, setPapers] = useState<GatePaper[]>([]);
  const [profile, setProfile] = useState<GateStudentProfile | null>(null);
  const [syllabusSections, setSyllabusSections] = useState<GateSyllabusSection[]>([]);
  const [questions, setQuestions] = useState<GateQuestion[]>([]);
  const [mockTests, setMockTests] = useState<GateMockTest[]>([]);
  const [pastResults, setPastResults] = useState<GateTestResult[]>([]);
  const [studyTasks, setStudyTasks] = useState<GateStudyTask[]>([]);
  const [bookmarks, setBookmarks] = useState<(GateBookmark & { question: GateQuestion | null })[]>([]);

  // Modals & Active Workflows
  const [isPaperSelectorOpen, setIsPaperSelectorOpen] = useState(false);
  const [isAiTutorOpen, setIsAiTutorOpen] = useState(false);
  const [aiTopicContext, setAiTopicContext] = useState<string | undefined>();

  // Question Practice Modal
  const [activePracticeQuestion, setActivePracticeQuestion] = useState<GateQuestion | null>(null);

  // Mock Test Engine & Result View
  const [activeTest, setActiveTest] = useState<GateMockTest | null>(null);
  const [activeTestQuestions, setActiveTestQuestions] = useState<GateQuestion[]>([]);
  const [activeTestSession, setActiveTestSession] = useState<GateTestSession | null>(null);
  const [isTestEngineOpen, setIsTestEngineOpen] = useState(false);
  const [viewingResult, setViewingResult] = useState<GateTestResult | null>(null);

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dash, papersRes] = await Promise.all([
        gateApi.getDashboard(),
        gateApi.getPapers(),
      ]);

      setDashboardData(dash);
      setProfile(dash.profile);
      setPapers(papersRes);

      const paperCode = dash.profile?.target_paper || 'CS';

      const [syllabusRes, questionsRes, testsRes, resultsRes, tasksRes, bookmarksRes] = await Promise.all([
        gateApi.getSyllabus(paperCode),
        gateApi.getQuestions({ paper_code: paperCode }),
        gateApi.getMockTests(paperCode),
        gateApi.getTestResults(),
        gateApi.getStudyPlan(paperCode),
        gateApi.getBookmarks(),
      ]);

      setSyllabusSections(syllabusRes);
      setQuestions(questionsRes);
      setMockTests(testsRes);
      setPastResults(resultsRes);
      setStudyTasks(tasksRes);
      setBookmarks(bookmarksRes);
    } catch (err: any) {
      console.error('Error loading GATE data:', err);
      toast.error('Failed to load GATE preparation data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Profile / Target Paper Update
  const handleSaveProfile = async (updates: Partial<GateStudentProfile>) => {
    try {
      const updated = await gateApi.updateProfile(updates);
      setProfile(updated);
      toast.success(`Target paper set to ${updated.target_paper} (${updated.exam_cycle})`);
      await loadData();
    } catch (err) {
      toast.error('Failed to update target paper settings.');
    }
  };

  // Syllabus topic update
  const handleUpdateTopicStatus = async (
    topicId: string,
    data: {
      status?: TopicStatus;
      confidence?: StudentConfidence;
      revision_flag?: boolean;
      student_notes?: string;
    }
  ) => {
    try {
      await gateApi.updateTopicStatus({ topic_id: topicId, ...data });
      toast.success('Topic progress updated');
      // Refresh syllabus & dashboard
      const paperCode = profile?.target_paper || 'CS';
      const [sRes, dRes] = await Promise.all([
        gateApi.getSyllabus(paperCode),
        gateApi.getDashboard(),
      ]);
      setSyllabusSections(sRes);
      setDashboardData(dRes);
    } catch (err) {
      toast.error('Failed to update topic status');
    }
  };

  // Toggle study task completion
  const handleToggleStudyTask = async (taskId: string) => {
    try {
      const updated = await gateApi.toggleStudyTask(taskId);
      setStudyTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      // Refresh dashboard tasks
      const dash = await gateApi.getDashboard();
      setDashboardData(dash);
      toast.success(updated.is_completed ? 'Task completed! 🎯' : 'Task marked pending');
    } catch (err) {
      toast.error('Failed to toggle study task');
    }
  };

  // Add study task
  const handleAddStudyTask = async (task: Omit<GateStudyTask, 'id' | 'student_id' | 'is_completed'>) => {
    try {
      const created = await gateApi.addStudyTask(task);
      setStudyTasks((prev) => [created, ...prev]);
      const dash = await gateApi.getDashboard();
      setDashboardData(dash);
      toast.success('Study task scheduled!');
    } catch (err) {
      toast.error('Failed to create study task');
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (questionId: string) => {
    try {
      const res = await gateApi.toggleBookmark(questionId);
      toast.success(res.bookmarked ? 'Question bookmarked for revision' : 'Bookmark removed');
      const bRes = await gateApi.getBookmarks();
      setBookmarks(bRes);
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    }
  };

  // Start Mock Test
  const handleStartMockTest = async (test: GateMockTest) => {
    try {
      toast.info(`Preparing ${test.title}...`);
      const session = await gateApi.startMockTest(test.id);
      const testDetail = await gateApi.getMockTestById(test.id);
      const testQuestions = questions.filter((q) => testDetail.question_ids.includes(q.id));
      setActiveTest(testDetail);
      setActiveTestQuestions(testQuestions.length > 0 ? testQuestions : questions.slice(0, 5));
      setActiveTestSession(session);
      setIsTestEngineOpen(true);
    } catch (err: any) {
      toast.error('Failed to launch mock test: ' + (err.message || 'Server error'));
    }
  };

  // Test Finished
  const handleFinishTest = async (result: GateTestResult) => {
    setIsTestEngineOpen(false);
    setActiveTest(null);
    setActiveTestSession(null);
    setViewingResult(result);
    // Reload dashboard and results
    const [dRes, rRes] = await Promise.all([
      gateApi.getDashboard(),
      gateApi.getTestResults(),
    ]);
    setDashboardData(dRes);
    setPastResults(rRes);
    toast.success(`Mock test submitted! Score: ${result.total_score}/${result.max_score}`);
  };

  // Open Question Practice for a specific topic
  const handlePracticeTopic = (topicId: string) => {
    const matched = questions.find((q) => q.topic_id === topicId) || questions[0];
    if (matched) {
      setActivePracticeQuestion(matched);
    } else {
      setActiveTab('questions');
    }
  };

  // Ask AI about topic
  const handleAskAiTopic = (topic: GateSyllabusTopic) => {
    setAiTopicContext(`Topic: ${topic.title} (${topic.subject})`);
    setIsAiTutorOpen(true);
  };

  const bookmarkedSet = new Set(bookmarks.map((b) => b.question_id));

  return (
    <div className="min-h-screen bg-[#0A0D14] text-slate-100 flex flex-col">
      {/* Top Breadcrumb & Page Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb & Title */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span
                onClick={() => onNavigate && onNavigate('/dashboard')}
                className="hover:text-slate-200 cursor-pointer transition-colors"
              >
                Dashboard
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-400">Assessment</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-indigo-400 font-semibold flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                GATE Exam Preparation
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                GATE Exam Preparation
              </h1>
              {profile && (
                <button
                  onClick={() => setIsPaperSelectorOpen(true)}
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center gap-1.5"
                  title="Click to change target paper"
                >
                  <BookOpen className="w-3 h-3" />
                  GATE {profile.target_paper} ({profile.exam_cycle})
                  <span className="text-[10px] text-indigo-400 underline ml-0.5">Change</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setAiTopicContext(undefined);
                setIsAiTutorOpen(true);
              }}
              variant="outline"
              size="sm"
              className="bg-indigo-600/10 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/25 flex items-center gap-1.5 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Ask GateGuru AI
            </Button>
            <Button
              onClick={() => setIsPaperSelectorOpen(true)}
              variant="outline"
              size="sm"
              className="bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-medium"
            >
              Paper Settings
            </Button>
            <Button
              onClick={loadData}
              variant="ghost"
              size="sm"
              disabled={loading}
              className="text-slate-400 hover:text-white p-2"
              title="Refresh preparation metrics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar border-t border-slate-800/60 pt-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'syllabus', label: 'Syllabus Explorer', icon: BookOpen },
            { id: 'questions', label: 'Question Bank', icon: HelpCircle },
            { id: 'mock-tests', label: 'Mock Test Series', icon: Award },
            { id: 'planner', label: 'Study Planner', icon: Calendar },
            { id: 'revision', label: 'Revision & Weak Topics', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as GateTab);
                  if (viewingResult) setViewingResult(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && !dashboardData ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-400">Loading GATE Preparation Workspace...</p>
          </div>
        ) : viewingResult ? (
          <GateTestResultView
            result={viewingResult}
            onBackToTests={() => setViewingResult(null)}
            onPracticeMistakes={(topicIds) => {
              setViewingResult(null);
              setActiveTab('questions');
            }}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && dashboardData && (
              <GateDashboardView
                data={dashboardData}
                onNavigateTab={(tab) => setActiveTab(tab as GateTab)}
                onOpenPaperSelector={() => setIsPaperSelectorOpen(true)}
                onToggleTask={handleToggleStudyTask}
                onPracticeTopic={handlePracticeTopic}
              />
            )}

            {activeTab === 'syllabus' && (
              <GateSyllabusExplorer
                sections={syllabusSections}
                onUpdateTopicStatus={handleUpdateTopicStatus}
                onPracticeTopic={handlePracticeTopic}
                onAskAiTopic={handleAskAiTopic}
              />
            )}

            {activeTab === 'questions' && (
              <GateQuestionBank
                questions={questions}
                onOpenQuestionModal={(q) => setActivePracticeQuestion(q)}
                onToggleBookmark={handleToggleBookmark}
                bookmarkedIds={bookmarkedSet}
              />
            )}

            {activeTab === 'mock-tests' && (
              <GateMockTestsView
                tests={mockTests}
                pastResults={pastResults}
                onStartTest={handleStartMockTest}
                onViewResult={(res) => setViewingResult(res)}
              />
            )}

            {activeTab === 'planner' && (
              <GateStudyPlannerView
                tasks={studyTasks}
                onToggleTask={handleToggleStudyTask}
                onAddTask={handleAddStudyTask}
              />
            )}

            {activeTab === 'revision' && dashboardData && (
              <GateRevisionView
                weakTopics={dashboardData.weak_topics}
                bookmarks={bookmarks}
                onOpenQuestionModal={(q) => setActivePracticeQuestion(q)}
                onNavigateTab={(tab) => setActiveTab(tab as GateTab)}
                onPracticeTopic={handlePracticeTopic}
              />
            )}
          </>
        )}
      </main>

      {/* Target Paper & Exam Cycle Configuration Modal */}
      <GatePaperSelectorModal
        isOpen={isPaperSelectorOpen}
        onClose={() => setIsPaperSelectorOpen(false)}
        papers={papers}
        currentProfile={profile}
        onSave={handleSaveProfile}
      />

      {/* Interactive Question Practice Modal */}
      <GateQuestionPracticeModal
        question={activePracticeQuestion}
        isOpen={!!activePracticeQuestion}
        onClose={() => setActivePracticeQuestion(null)}
        onNextQuestion={() => {
          if (!activePracticeQuestion) return;
          const curIdx = questions.findIndex((q) => q.id === activePracticeQuestion.id);
          if (curIdx >= 0 && curIdx < questions.length - 1) {
            setActivePracticeQuestion(questions[curIdx + 1]);
          } else {
            toast.info('You reached the end of this question list!');
          }
        }}
        onAskAiTutor={(q) => {
          setActivePracticeQuestion(null);
          setAiTopicContext(`Question: ${q.question_statement} (${q.subject})`);
          setIsAiTutorOpen(true);
        }}
      />

      {/* Full Screen Exam Simulation Engine */}
      <GateTestEngineModal
        test={activeTest}
        questions={activeTestQuestions}
        session={activeTestSession}
        isOpen={isTestEngineOpen}
        onClose={() => {
          setIsTestEngineOpen(false);
          setActiveTest(null);
          setActiveTestSession(null);
        }}
        onFinishTest={handleFinishTest}
      />

      {/* Slide-out AI Tutor Drawer */}
      <GateAiTutorDrawer
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        profile={profile}
        initialTopicContext={aiTopicContext}
      />
    </div>
  );
};
