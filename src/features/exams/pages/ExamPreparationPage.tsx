// src/features/exams/pages/ExamPreparationPage.tsx
// Complete Exam Preparation Center with Syllabus Breakdown, Readiness Indicators, and Topic Recovery

import * as React from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Plus,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  FileCheck,
  RotateCcw,
  Target,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { ExamEntity, ExamCategory, ExamDifficulty } from '../../../types/learningModules';
import { toast } from 'sonner';

interface ExamPreparationPageProps {
  onNavigate?: (path: string) => void;
}

export function ExamPreparationPage({ onNavigate }: ExamPreparationPageProps) {
  const [exams, setExams] = React.useState<ExamEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'topics' | 'revision' | 'create'>('overview');
  const [selectedExamId, setSelectedExamId] = React.useState<string | null>(null);

  // New Exam Form State
  const [title, setTitle] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [category, setCategory] = React.useState<ExamCategory>('SEMESTER');
  const [difficulty, setDifficulty] = React.useState<ExamDifficulty>('HARD');
  const [examDate, setExamDate] = React.useState('');
  const [prepHours, setPrepHours] = React.useState(30);
  const [syllabus, setSyllabus] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const loadExams = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await learningModulesApi.exams.getExams();
      setExams(data);
      if (data.length > 0 && !selectedExamId) {
        setSelectedExamId(data[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load exams: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedExamId]);

  React.useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject) {
      toast.error('Please enter Exam Title and Subject');
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await learningModulesApi.exams.createExam({
        title,
        subject,
        category,
        difficulty,
        exam_date: examDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        available_prep_hours: Number(prepHours) || 30,
        syllabus: syllabus || 'Unit 1 Fundamentals, Unit 2 Architecture, Unit 3 Concurrency, Unit 4 Optimization',
      });
      toast.success('Exam target and adaptive topic breakdown created!');
      setTitle('');
      setSubject('');
      setSyllabus('');
      setSelectedExamId(created.id);
      setActiveTab('overview');
      loadExams();
    } catch (err: any) {
      toast.error('Failed to create exam: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  // Calculate days remaining
  const getDaysRemaining = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="Exam Preparation Center" description="Loading syllabus diagnostics and readiness scores..." />
        <LoadingState message="ExamPreparationAgent analyzing curriculum weightage..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Exam Preparation Center"
        description="Comprehensive curriculum revision, weightage breakdown, mock assessments, and weak topic recovery."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
            University Syllabus Aligned
          </span>
        }
        actions={
          <Button
            size="sm"
            onClick={() => setActiveTab(activeTab === 'create' ? 'overview' : 'create')}
            className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'create' ? 'Dashboard' : 'Register New Exam'}
          </Button>
        }
      />

      {/* Primary Exam Cards & Countdown */}
      {selectedExam && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#475467]">Countdown</p>
              <h3 className="text-2xl font-bold text-[#101828] mt-1">
                {getDaysRemaining(selectedExam.exam_date)} Days
              </h3>
              <p className="text-xs text-amber-600 mt-0.5">Date: {selectedExam.exam_date}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#475467]">Readiness Score</p>
              <h3 className="text-2xl font-bold text-[#101828] mt-1">{selectedExam.readiness_score}%</h3>
              <p className="text-xs text-emerald-600 mt-0.5">Evidence-based calculation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BarChart3 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#475467]">Syllabus Units</p>
              <h3 className="text-2xl font-bold text-[#101828] mt-1">{selectedExam.topics?.length || 0} Topics</h3>
              <p className="text-xs text-[#475467] mt-0.5">
                {selectedExam.topics?.filter((t) => t.confidence === 'WEAK').length || 0} need reinforcement
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#E4E7EC] bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#475467]">Mock Tests</p>
              <h3 className="text-2xl font-bold text-[#101828] mt-1">
                {selectedExam.last_mock_score ? `${selectedExam.last_mock_score}%` : 'Not Attempted'}
              </h3>
              <p className="text-xs text-[#027A48] mt-0.5">{selectedExam.mock_tests_count} practice drills taken</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'overview' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Exam Dashboard
        </button>
        <button
          onClick={() => setActiveTab('topics')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'topics' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Topics & Weightage
        </button>
        <button
          onClick={() => setActiveTab('revision')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'revision' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          48-Hour Recovery Plan
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'create' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          + Add Exam
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && selectedExam && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {selectedExam.subject} • {selectedExam.category}
                </span>
                <h2 className="text-xl font-bold text-[#101828] mt-1">{selectedExam.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => onNavigate?.(`/exams/${selectedExam.id}/mock-test`)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs"
                >
                  <Target className="w-3.5 h-3.5" />
                  Take Mock Exam
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onNavigate?.('/flashcards')}
                  className="gap-1 text-xs"
                >
                  Review Flashcards
                </Button>
              </div>
            </div>

            {/* Readiness progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#344054]">
                <span>Curriculum Readiness Indicator</span>
                <span>{selectedExam.readiness_score}% Readiness</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${selectedExam.readiness_score}%` }}
                />
              </div>
              <p className="text-[11px] text-[#475467] italic">
                Notice: Readiness scores indicate past quiz and practice performance. The platform does not guarantee examination grades.
              </p>
            </div>
          </div>

          {/* Weak Topics Diagnostic Banner */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">High-Yield Priority Concept Identified</h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Analysis of university past papers shows that <strong>Normalization (3NF / BCNF)</strong> carries ~25% weightage. Your current confidence in this topic is <em>DEVELOPING</em>.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                  onClick={() => onNavigate?.('/doubts')}
                >
                  Ask Doubt on Normalization
                </Button>
                <Button
                  size="sm"
                  className="text-xs bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setActiveTab('revision')}
                >
                  View Targeted Revision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Topics Breakdown */}
      {activeTab === 'topics' && selectedExam && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#101828]">Syllabus Topics & Mastery Rubric</h3>
          <div className="space-y-2">
            {selectedExam.topics?.map((topic) => (
              <div
                key={topic.id}
                className="p-3.5 rounded-xl border border-[#E4E7EC] bg-white flex items-center justify-between shadow-sm"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{topic.unit}</span>
                    <h4 className="text-sm font-semibold text-[#101828]">{topic.name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      ~{topic.weightage_percent}% Weightage
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#475467]">
                    <span>Status: {topic.status}</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        topic.confidence === 'STRONG'
                          ? 'text-emerald-600'
                          : topic.confidence === 'DEVELOPING'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {topic.confidence} Confidence
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => onNavigate?.('/quiz')} className="text-xs">
                    Practice Questions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Revision Plan */}
      {activeTab === 'revision' && (
        <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#101828] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            AI-Synthesized 48-Hour Final Revision Blueprint
          </h3>
          <p className="text-xs text-[#475467]">
            Structured chronological checkpoints focusing on high-weightage proofs, derivations, and active recall.
          </p>

          <div className="space-y-3">
            {[
              { time: 'Day -2 (Morning)', task: 'Lossless Join Decomposition proofs & BCNF check algorithms', dur: '3 Hours' },
              { time: 'Day -2 (Afternoon)', task: 'ACID transactions, 2-Phase Locking (2PL), and Cascadeless schedules', dur: '2.5 Hours' },
              { time: 'Day -1 (Morning)', task: 'B+ Tree insertion/deletion trace exercises (10-mark university question pattern)', dur: '3 Hours' },
              { time: 'Day -1 (Evening)', task: 'Formula sheet formula drill & quick memory flashcard review', dur: '1.5 Hours' },
            ].map((step, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-gray-50/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-600">{step.time}</span>
                  <p className="text-sm font-semibold text-[#101828] mt-0.5">{step.task}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded border">
                  {step.dur}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Create Exam Form */}
      {activeTab === 'create' && (
        <div className="p-6 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4 max-w-2xl">
          <h2 className="text-lg font-bold text-[#101828] flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Register University / Placement Exam Target
          </h2>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">Exam Title</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems End-Semester Final"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UNIVERSITY">University Exam</option>
                  <option value="SEMESTER">Semester Exam</option>
                  <option value="INTERNAL">Internal Assessment</option>
                  <option value="LAB">Lab Exam</option>
                  <option value="VIVA">Oral Viva</option>
                  <option value="PLACEMENT">Placement Technical</option>
                  <option value="CUSTOM">Custom Practice</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Exam Date</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Available Prep Hours</label>
                <input
                  type="number"
                  value={prepHours}
                  onChange={(e) => setPrepHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Syllabus Topics (Comma separated)
              </label>
              <textarea
                placeholder="Process Scheduling, Deadlocks & Banker's Algo, Virtual Memory & Paging, File Systems"
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[#D0D5DD] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab('overview')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#2563EB] text-white">
                {isSubmitting ? 'Analyzing Curriculum...' : 'Register Exam Target'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageContainer>
  );
}
