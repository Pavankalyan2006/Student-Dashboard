import React, { useState, useEffect } from 'react';
import { quizApi } from '../api/quizApi';
import { QuizSourceType, QuizDifficulty, QuestionType, GenerateQuizRequest } from '../types/quiz';
import { Button } from '../../../components/ui/button';
import {
  Sparkles,
  ArrowLeft,
  Compass,
  BookOpen,
  FileText,
  Layers,
  Code2,
  Cpu,
  Clock,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

interface QuizCreatePageProps {
  onNavigate?: (path: string) => void;
  search?: string;
}

export const QuizCreatePage: React.FC<QuizCreatePageProps> = ({ onNavigate, search = '' }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const searchParams = new URLSearchParams(search || (typeof window !== 'undefined' ? window.location.search : ''));

  // URL Query Parameters pre-fill
  const initialSourceType = (searchParams.get('source_type')?.toUpperCase() ||
    (searchParams.get('courseId') ? 'COURSE' :
     searchParams.get('noteId') ? 'NOTES' :
     searchParams.get('documentId') ? 'DOCUMENT' :
     searchParams.get('dsaTopic') ? 'DSA' : 'TOPIC')) as QuizSourceType;

  const [sourceType, setSourceType] = useState<QuizSourceType>(initialSourceType);
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [courseId, setCourseId] = useState(searchParams.get('courseId') || '');
  const [lessonId, setLessonId] = useState(searchParams.get('lessonId') || '');
  const [noteId, setNoteId] = useState(searchParams.get('noteId') || '');
  const [documentId, setDocumentId] = useState(searchParams.get('documentId') || '');
  const [dsaTopic, setDsaTopic] = useState(searchParams.get('dsaTopic') || 'Arrays & Strings');

  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    (searchParams.get('difficulty')?.toUpperCase() as QuizDifficulty) || 'MEDIUM'
  );
  const [questionType, setQuestionType] = useState<QuestionType | 'MIXED'>('MIXED');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(10);
  const [adaptiveMode, setAdaptiveMode] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState('');

  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (searchParams.get('topic')) {
      setTopic(searchParams.get('topic') || '');
    }
  }, [searchParams]);

  const sourceCards = [
    { type: 'TOPIC', label: 'Topic Practice', icon: Compass, desc: 'Target any B.Tech or engineering subject concept' },
    { type: 'COURSE', label: 'Course Syllabus', icon: BookOpen, desc: 'Assess mastery against enrolled course curriculum' },
    { type: 'NOTES', label: 'Study Notes', icon: FileText, desc: 'Generate questions directly from revision notes' },
    { type: 'DOCUMENT', label: 'Textbook / PDF RAG', icon: Layers, desc: 'Grounded retrieval with page citations' },
    { type: 'DSA', label: 'DSA Lab', icon: Code2, desc: 'Algorithms, time complexities, and data structures' },
    { type: 'MIXED', label: 'Mixed Curricula', icon: Cpu, desc: 'Cross-disciplinary comprehensive evaluation' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sourceType === 'TOPIC' && !topic.trim()) {
      toast.error('Please enter a topic name');
      return;
    }
    if (sourceType === 'COURSE' && !courseId.trim()) {
      toast.error('Please select or specify a Course ID');
      return;
    }
    if (sourceType === 'NOTES' && !noteId.trim()) {
      toast.error('Please select or specify a Note ID');
      return;
    }
    if (sourceType === 'DOCUMENT' && !documentId.trim()) {
      toast.error('Please select or specify a Document ID');
      return;
    }

    try {
      setGenerating(true);
      const request: GenerateQuizRequest = {
        source_type: sourceType,
        title: customTitle.trim() || undefined,
        topic: topic.trim() || undefined,
        course_id: courseId.trim() || undefined,
        lesson_id: lessonId.trim() || undefined,
        note_id: noteId.trim() || undefined,
        document_id: documentId.trim() || undefined,
        dsa_topic: dsaTopic.trim() || undefined,
        difficulty,
        question_type: questionType,
        question_count: questionCount,
        time_limit_seconds: timeLimitMinutes > 0 ? timeLimitMinutes * 60 : undefined,
        adaptive_mode: adaptiveMode,
      };

      const result = await quizApi.generateQuiz(request);
      toast.success('Assessment Generated Successfully!', {
        description: `Created ${result.questions.length} validated questions.`,
      });

      // Navigate directly into the Quiz Player
      navigate(`/quiz/${result.quiz.id}`);
    } catch (err: any) {
      toast.error('Failed to generate quiz', { description: err.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/quiz')}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4" />
          AI Assessment Configurator
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create AI Quiz & Practice Assessment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure source material, difficulty curves, question typologies, and adaptive behavior.
        </p>

        <form onSubmit={handleGenerate} className="mt-8 space-y-8">
          {/* 1. Knowledge Source Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
              1. Select Knowledge Source
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sourceCards.map((sc) => {
                const Icon = sc.icon;
                const isSelected = sourceType === sc.type;
                return (
                  <button
                    key={sc.type}
                    type="button"
                    onClick={() => setSourceType(sc.type as QuizSourceType)}
                    className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`} />
                      <div className="font-semibold text-sm">{sc.label}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {sc.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Specific Input Fields */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
            {sourceType === 'TOPIC' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic or Concept Name
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Binary Search Trees, Virtual Memory Paging, Deadlock Conditions"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}

            {sourceType === 'COURSE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course ID or Subject
                  </label>
                  <input
                    type="text"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    placeholder="e.g. crs_daa_01 (Design & Analysis of Algorithms)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specific Lesson ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={lessonId}
                    onChange={(e) => setLessonId(e.target.value)}
                    placeholder="e.g. lsn_daa_01"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {sourceType === 'NOTES' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note ID
                </label>
                <input
                  type="text"
                  value={noteId}
                  onChange={(e) => setNoteId(e.target.value)}
                  placeholder="e.g. note_os_virtual_mem (or select from your notes)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            )}

            {sourceType === 'DOCUMENT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document ID (PDF RAG)
                </label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="e.g. doc_os_silberschatz (uploaded document)"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  RAG will retrieve key concepts and anchor questions with exact page citations.
                </p>
              </div>
            )}

            {sourceType === 'DSA' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  DSA Topic Area
                </label>
                <select
                  value={dsaTopic}
                  onChange={(e) => setDsaTopic(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Arrays & Two Pointers">Arrays & Two Pointers</option>
                  <option value="Binary Search & Search Invariants">Binary Search & Invariants</option>
                  <option value="Binary Trees & AVL Balancing">Binary Trees & AVL Balancing</option>
                  <option value="Graphs, BFS & DFS">Graphs, BFS & DFS</option>
                  <option value="Dynamic Programming & Recurrences">Dynamic Programming & Recurrences</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Custom Assessment Title (Optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Leave blank for auto-generated educational title"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Difficulty & Question Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                2. Difficulty Level
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {(['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED'] as QuizDifficulty[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-1 text-xs rounded-lg border font-medium transition-all ${
                      difficulty === d
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {d[0] + d.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                3. Question Typology
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="MIXED">Mixed (MCQ, Multi-Select, T/F, Short Answer, Code)</option>
                <option value="MCQ">Multiple Choice Questions (Single Select)</option>
                <option value="MULTI_SELECT">Multiple Select (One or more correct)</option>
                <option value="TRUE_FALSE">True / False Invariants</option>
                <option value="SHORT_ANSWER">Short Answer / Asymptotic Notation</option>
                <option value="CODE_OUTPUT">Code Output Evaluation</option>
              </select>
            </div>
          </div>

          {/* 3. Question Count & Time Limit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                4. Number of Questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[5, 10, 15, 20, 25].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                      questionCount === count
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                5. Assessment Time Limit
              </label>
              <select
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={0}>Untimed (Practice Mode)</option>
                <option value={5}>5 Minutes (Speed Run)</option>
                <option value={10}>10 Minutes (Standard)</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes (Exam Simulation)</option>
              </select>
            </div>
          </div>

          {/* 4. Adaptive Difficulty Toggle */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start gap-3">
            <input
              type="checkbox"
              id="adaptiveToggle"
              checked={adaptiveMode}
              onChange={(e) => setAdaptiveMode(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="adaptiveToggle" className="cursor-pointer">
              <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-white">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                Enable Adaptive Assessment Engine
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Dynamically adjusts difficulty based on consecutive correct or incorrect answers. Tracks student cognitive streaks.
              </p>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/quiz')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="ai"
              disabled={generating}
              className="px-6 flex items-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Synthesizing & Validating...' : 'Generate & Launch Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
