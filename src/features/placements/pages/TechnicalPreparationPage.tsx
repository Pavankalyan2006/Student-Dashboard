import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  Code2,
  Database,
  Server,
  Network,
  Cpu,
  Boxes,
  Brain,
  Binary,
  Layers,
  Sparkles,
  BookOpen,
  HelpCircle,
  PlayCircle,
  FileText,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Search,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import type { PlacementTopic, PlacementQuestion, InterviewQuestion } from '../types/placement';

interface Props {
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

interface TechCategoryMeta {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  quizId?: string;
  courseId?: string;
  topicsCount: number;
}

const TECH_CATEGORIES: TechCategoryMeta[] = [
  {
    id: 'PROGRAMMING',
    name: 'Programming Fundamentals',
    icon: Code2,
    color: 'from-blue-600 to-indigo-600',
    description: 'Memory management, pointers, concurrency, compilation pipelines, and runtime paradigms.',
    quizId: 'quiz_prog_01',
    courseId: 'crs_prog_01',
    topicsCount: 12,
  },
  {
    id: 'DSA',
    name: 'Data Structures & Algorithms',
    icon: Binary,
    color: 'from-indigo-600 to-violet-600',
    description: 'Arrays, Trees, Graphs, DP, Heaps, and asymptotic complexity analysis.',
    quizId: 'quiz_dsa_01',
    courseId: 'crs_dsa_01',
    topicsCount: 18,
  },
  {
    id: 'DBMS',
    name: 'Database Management Systems',
    icon: Database,
    color: 'from-emerald-600 to-teal-600',
    description: 'ACID guarantees, indexing mechanics, isolation anomalies, normal forms, and transaction logging.',
    quizId: 'quiz_dbms_01',
    courseId: 'crs_db_04',
    topicsCount: 14,
  },
  {
    id: 'SQL',
    name: 'SQL & Query Optimization',
    icon: Layers,
    color: 'from-cyan-600 to-blue-600',
    description: 'Complex joins, window functions, CTEs, subquery flattening, and execution plans.',
    quizId: 'quiz_sql_01',
    courseId: 'crs_db_04',
    topicsCount: 10,
  },
  {
    id: 'OPERATING_SYSTEMS',
    name: 'Operating Systems',
    icon: Cpu,
    color: 'from-amber-600 to-orange-600',
    description: 'Process scheduling, virtual memory, paging, Coffman deadlock conditions, and synchronization.',
    quizId: 'quiz_os_01',
    courseId: 'crs_os_01',
    topicsCount: 15,
  },
  {
    id: 'COMPUTER_NETWORKS',
    name: 'Computer Networks',
    icon: Network,
    color: 'from-rose-600 to-pink-600',
    description: 'OSI/TCP-IP stacks, TCP 3-way handshake, sliding window, congestion control, and DNS/TLS.',
    quizId: 'quiz_cn_01',
    courseId: 'crs_cn_01',
    topicsCount: 12,
  },
  {
    id: 'OOP',
    name: 'Object-Oriented Programming',
    icon: Boxes,
    color: 'from-purple-600 to-indigo-600',
    description: 'SOLID design principles, polymorphism, encapsulation, composition over inheritance, and design patterns.',
    quizId: 'quiz_oop_01',
    courseId: 'crs_oop_01',
    topicsCount: 8,
  },
  {
    id: 'SOFTWARE_ENGINEERING',
    name: 'Software Engineering & Design',
    icon: Server,
    color: 'from-blue-600 to-cyan-600',
    description: 'System design, microservices vs monoliths, CI/CD, testing pyramid, and distributed patterns.',
    quizId: 'quiz_se_01',
    courseId: 'crs_se_01',
    topicsCount: 9,
  },
  {
    id: 'AI_ML',
    name: 'AI & Machine Learning Foundations',
    icon: Brain,
    color: 'from-fuchsia-600 to-purple-600',
    description: 'Gradient descent, neural nets, loss functions, overfitting mitigation, and transformers.',
    quizId: 'quiz_aiml_01',
    courseId: 'crs_aiml_01',
    topicsCount: 11,
  },
];

export const TechnicalPreparationPage: React.FC<Props> = ({ onNavigate, initialCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'DBMS'
  );
  const [activeTab, setActiveTab] = useState<'learn' | 'questions' | 'practice' | 'revision'>('learn');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Practice state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string | number>>({});
  const [practiceResults, setPracticeResults] = useState<Record<string, { is_correct: boolean; explanation: string }>>({});
  const [isExportingNotes, setIsExportingNotes] = useState(false);

  // Fetch topics for current category
  const { data: topics = [], isLoading: isTopicsLoading } = useQuery({
    queryKey: ['placement-tech-topics', selectedCategory],
    queryFn: () => placementsApi.getTopics(selectedCategory),
  });

  // Fetch interview questions
  const { data: interviewQuestions = [], isLoading: isQuestionsLoading } = useQuery({
    queryKey: ['placement-tech-iq', selectedCategory],
    queryFn: () => placementsApi.getInterviewQuestions(selectedCategory),
  });

  // Fetch practice questions
  const { data: practiceQuestions = [] } = useQuery({
    queryKey: ['placement-tech-practice', selectedCategory],
    queryFn: () => placementsApi.getQuestions(undefined, selectedCategory),
  });

  const activeCategoryMeta = TECH_CATEGORIES.find((c) => c.id === selectedCategory) || TECH_CATEGORIES[0];

  const handlePracticeSubmit = async (questionId: string, answer: string | number) => {
    try {
      const res = await placementsApi.practiceQuestion(questionId, answer);
      setPracticeResults((prev) => ({
        ...prev,
        [questionId]: { is_correct: res.is_correct, explanation: res.explanation },
      }));
      if (res.is_correct) {
        toast.success('Correct answer! Concept verified.');
      } else {
        toast.error('Incorrect. Review the explanation.');
      }
    } catch {
      toast.error('Failed to evaluate answer');
    }
  };

  const handleAskCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAskingAi(true);
    setAiAnswer(null);
    try {
      const res = await placementsApi.askCoach(aiPrompt, { topicId: topics[0]?.id });
      setAiAnswer(res.response);
    } catch {
      toast.error('Failed to get answer from AI Placement Coach');
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleExportRevisionNotes = async () => {
    setIsExportingNotes(true);
    try {
      const noteContent = `
# Core ${activeCategoryMeta.name} Placement Revision Cheatsheet
Category: ${selectedCategory}

## Key Topics & Architectural Invariants
${topics.map((t) => `- **${t.name}**: ${t.description}`).join('\n')}

## High-Frequency Interview Viva Points
${interviewQuestions.slice(0, 5).map((q, idx) => `### Q${idx + 1}: ${q.question}\n**Key Concept:** ${q.answer}`).join('\n\n')}

## Recommended Next Steps
- Take the ${activeCategoryMeta.name} Adaptive Quiz.
- Solve 5 related medium problems in the DSA / Coding Lab.
`;
      await placementsApi.exportNotes(`${activeCategoryMeta.name} Revision Cheatsheet`, noteContent, selectedCategory);
      toast.success('Successfully exported revision notes to your Notes Library!');
      onNavigate('/notes');
    } catch {
      toast.error('Could not export revision notes.');
    } finally {
      setIsExportingNotes(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="hero-brand rounded-2xl p-6 sm:p-8 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-semibold tracking-wide text-blue-200 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            Core Technical Placement Preparation
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Technical Subject Mastery
          </h1>
          <p className="text-sm text-blue-100/90 leading-relaxed mb-6">
            Master CS fundamentals tested in campus drives and top tech interviews: DBMS, OS, Computer Networks, OOP, DSA, and System Design. Learn key definitions, practice viva questions, and test your readiness with adaptive assessments.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('/placements/mock-interview/setup')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <PlayCircle className="h-4 w-4" />
              Start Technical Mock Round
            </button>
            <button
              onClick={() => onNavigate('/coding')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur cursor-pointer"
            >
              <Code2 className="h-4 w-4" />
              Open Coding Lab
            </button>
            <button
              onClick={() => onNavigate('/dsa')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all backdrop-blur cursor-pointer"
            >
              <Binary className="h-4 w-4" />
              DSA Lab & Visualizers
            </button>
          </div>
        </div>
      </div>

      {/* Category Selection Tabs Horizontal Scroll */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {TECH_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Overview & Action Deck */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <activeCategoryMeta.icon className="h-5 w-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">{activeCategoryMeta.name}</h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">{activeCategoryMeta.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeCategoryMeta.courseId && (
            <button
              onClick={() => onNavigate(`/courses/${activeCategoryMeta.courseId}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Full Course</span>
            </button>
          )}

          {activeCategoryMeta.quizId && (
            <button
              onClick={() => onNavigate(`/quiz/${activeCategoryMeta.quizId}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Domain Quiz</span>
            </button>
          )}

          <button
            onClick={handleExportRevisionNotes}
            disabled={isExportingNotes}
            className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{isExportingNotes ? 'Exporting...' : 'Export Revision Notes'}</span>
          </button>
        </div>
      </div>

      {/* Main 4-Tab Interface: Learn, Interview Questions, Practice, Revision */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2 [&>button]:shrink-0 [&>button]:whitespace-nowrap">
          {[
            { id: 'learn', label: '1. Learn & Concepts', icon: BookOpen },
            { id: 'questions', label: '2. Interview Viva Questions', icon: HelpCircle },
            { id: 'practice', label: '3. Practice & Self-Test', icon: CheckCircle2 },
            { id: 'revision', label: '4. Ask AI & Revision Cheatsheet', icon: Brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: LEARN & CONCEPTS */}
        {activeTab === 'learn' && (
          <div className="space-y-4">
            {isTopicsLoading ? (
              <div className="p-12 text-center text-xs text-slate-500">Loading concepts...</div>
            ) : topics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topics.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3 hover:border-blue-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {t.difficulty}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">#{t.order_index}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                    </div>

                    {t.concepts && t.concepts.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-700 block">Core Concepts:</span>
                        {t.concepts.slice(0, 2).map((c, i) => (
                          <div key={i} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                            <span className="font-semibold text-slate-800">{c.title}</span>
                            <p className="text-[11px] text-slate-500">{c.summary}</p>
                            {c.formula && (
                              <code className="block p-1 bg-white border border-slate-200 rounded font-mono text-[10px] text-indigo-700">
                                {c.formula}
                              </code>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        onClick={() => onNavigate(`/placements/topic/${t.id}`)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Deep Dive Topic</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onNavigate(`/quiz/create?topic=${encodeURIComponent(t.name)}`)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                      >
                        Quiz Me
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                No topic concepts available yet for {activeCategoryMeta.name}. Check back soon or select another category.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERVIEW QUESTIONS */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 border border-slate-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-700">
                Found {interviewQuestions.length} curated viva questions for {activeCategoryMeta.name}
              </span>
              <div className="relative w-64">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter interview questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              {interviewQuestions
                .filter((q) => !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((q, idx) => (
                  <div
                    key={q.id}
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{q.question}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {q.difficulty}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs space-y-1.5">
                      <span className="font-semibold text-slate-700 block">Expected Answer Structure:</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{q.answer}</p>
                    </div>

                    {q.expected_concepts && q.expected_concepts.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-semibold">Keywords to mention:</span>
                        {q.expected_concepts.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: PRACTICE & SELF-TEST */}
        {activeTab === 'practice' && (
          <div className="space-y-4">
            {practiceQuestions.length > 0 ? (
              <div className="space-y-4">
                {practiceQuestions.map((pq, idx) => {
                  const result = practiceResults[pq.id];
                  const currentAnswer = practiceAnswers[pq.id];
                  return (
                    <div
                      key={pq.id}
                      className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500">Problem {idx + 1}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {pq.difficulty}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm">{pq.question_text}</h4>

                      {/* Options if available */}
                      {pq.options && pq.options.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {pq.options.map((opt, i) => {
                            const isSelected = currentAnswer === opt;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() =>
                                  setPracticeAnswers((prev) => ({ ...prev, [pq.id]: opt }))
                                }
                                className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900'
                                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
                                }`}
                              >
                                <span className="font-bold mr-2 text-slate-400">
                                  {String.fromCharCode(65 + i)}.
                                </span>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Type your answer or numerical value..."
                          value={currentAnswer ?? ''}
                          onChange={(e) =>
                            setPracticeAnswers((prev) => ({ ...prev, [pq.id]: e.target.value }))
                          }
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                        />
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => handlePracticeSubmit(pq.id, currentAnswer)}
                          disabled={currentAnswer === undefined || currentAnswer === ''}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Check Answer
                        </button>
                      </div>

                      {result && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                            result.is_correct
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-rose-50 border-rose-200 text-rose-900'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold">
                            {result.is_correct ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-600" />
                            )}
                            <span>{result.is_correct ? 'Correct!' : 'Incorrect'}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{result.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-xs">
                No interactive practice questions loaded for this section yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ASK AI COACH & REVISION */}
        {activeTab === 'revision' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ask AI Coach Widget */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Sparkles className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">AI Placement Technical Coach</h3>
                  <p className="text-[11px] text-slate-500">Ask any conceptual doubt, edge case, or trade-off.</p>
                </div>
              </div>

              <form onSubmit={handleAskCoach} className="space-y-3">
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`Ask anything about ${activeCategoryMeta.name} (e.g. "Explain the difference between non-repeatable read and phantom read with an example")...`}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed"
                />
                <button
                  type="submit"
                  disabled={isAskingAi || !aiPrompt.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{isAskingAi ? 'Generating Technical Explanation...' : 'Ask AI Placement Coach'}</span>
                </button>
              </form>

              {aiAnswer && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                    AI Coach Answer:
                  </span>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-line text-[11px]">
                    {aiAnswer}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Revision Summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Practice Plan</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to practice
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-blue-900 block">1. Take Adaptive Technical Quiz</span>
                    <p className="text-[11px] text-blue-700">10 timed questions covering {activeCategoryMeta.name}.</p>
                  </div>
                  <button
                    onClick={() => onNavigate(`/quiz/${activeCategoryMeta.quizId || 'quiz_dbms_01'}`)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                  >
                    Start
                  </button>
                </div>

                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-indigo-900 block">2. Coding Sandbox Problem</span>
                    <p className="text-[11px] text-indigo-700">Implement system connection pooling logic.</p>
                  </div>
                  <button
                    onClick={() => onNavigate('/coding/editor?source=placement')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                  >
                    Code
                  </button>
                </div>

                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-purple-900 block">3. 30-Min AI Mock Interview</span>
                    <p className="text-[11px] text-purple-700">Multi-round technical viva with adaptive follow-ups.</p>
                  </div>
                  <button
                    onClick={() => onNavigate('/placements/mock-interview/setup')}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
                  >
                    Launch
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default TechnicalPreparationPage;
