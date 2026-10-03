import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  BookOpen,
  HelpCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  topicId: string;
  onNavigate: (path: string) => void;
}

export const PlacementTopicDetailPage: React.FC<Props> = ({ topicId, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'concepts' | 'questions' | 'practice' | 'ai'>('concepts');
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Practice state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submittedResults, setSubmittedResults] = useState<Record<string, any>>({});

  // AI Tutor state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { data: topic, isLoading } = useQuery({
    queryKey: ['placement-topic', topicId],
    queryFn: () => placementsApi.getTopicById(topicId),
  });

  const { data: practiceQuestions = [] } = useQuery({
    queryKey: ['placement-practice-questions', topicId],
    queryFn: () => placementsApi.getQuestions(topicId),
  });

  if (isLoading || !topic) {
    return (
      <div className="max-w-5xl mx-auto py-12 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading topic details...</p>
      </div>
    );
  }

  const handlePracticeSubmit = async (qId: string) => {
    const answer = selectedAnswers[qId];
    if (!answer) {
      toast.error('Please select an option first');
      return;
    }
    try {
      const res = await placementsApi.practiceQuestion(qId, answer);
      setSubmittedResults((prev) => ({ ...prev, [qId]: res }));
      if (res.is_correct) {
        toast.success('Correct answer!');
      } else {
        toast.error('Incorrect. Review the detailed explanation.');
      }
    } catch {
      toast.error('Failed to submit answer');
    }
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt.trim();
    setAiPrompt('');
    setAiChat((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsAiLoading(true);

    try {
      const res = await placementsApi.askCoach(userMsg, { topicId: topic.id });
      setAiChat((prev) => [...prev, { role: 'assistant', text: res.response }]);
    } catch {
      toast.error('AI assistant error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportNotes = async () => {
    try {
      const summaryText = topic.concepts
        .map((c: any) => `### ${c.title}\n${c.summary}\n${c.formula ? `Formula: ${c.formula}\n` : ''}`)
        .join('\n');
      await placementsApi.exportNotes(topic.name, summaryText, topic.category);
      toast.success('Successfully exported revision notes to your Notes workspace!');
    } catch {
      toast.error('Failed to export notes');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Back button & Breadcrumb */}
      <button
        onClick={() => onNavigate('/placements/topics')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Placement Topics
      </button>

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
              {topic.category.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700">
              {topic.difficulty}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">{topic.name}</h1>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">{topic.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExportNotes}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            Export Notes
          </button>
          <button
            onClick={() => onNavigate('/placements/mock-interview/setup')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Practice Mock Interview
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'concepts', label: `Core Concepts (${topic.concepts.length})`, icon: BookOpen },
          { id: 'questions', label: `Interview Questions (${topic.common_questions.length})`, icon: HelpCircle },
          { id: 'practice', label: `Practice Questions (${practiceQuestions.length})`, icon: CheckCircle },
          { id: 'ai', label: 'Ask AI Tutor', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Concepts & Formulas */}
      {activeTab === 'concepts' && (
        <div className="space-y-4">
          {topic.concepts.map((concept: any, idx: number) => (
            <div key={concept.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <h3 className="font-semibold text-slate-900 text-base">{concept.title}</h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{concept.summary}</p>

              {concept.formula && (
                <div className="bg-blue-50/60 border border-blue-200/60 p-3 rounded-lg">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                    Key Formula / Rule
                  </span>
                  <code className="text-xs font-mono text-blue-900 font-semibold">{concept.formula}</code>
                </div>
              )}

              {concept.example && (
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Worked Example: </span>
                  {concept.example}
                </div>
              )}

              {concept.key_takeaway && (
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Takeaway: </span>
                  {concept.key_takeaway}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Common Interview Questions */}
      {activeTab === 'questions' && (
        <div className="space-y-3">
          {topic.common_questions.map((q: any) => {
            const isExpanded = expandedQuestion === q.id;
            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">{q.question}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {q.frequency && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {q.frequency}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-700 leading-relaxed">
                    <div className="font-semibold text-slate-900 mb-1">Recommended Interview Answer Outline:</div>
                    <p>{q.answer_outline}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Practice Questions */}
      {activeTab === 'practice' && (
        <div className="space-y-5">
          {practiceQuestions.map((q: any, idx: number) => {
            const result = submittedResults[q.id];
            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-semibold text-slate-900 text-sm">{q.question_text}</h4>
                  </div>
                </div>

                {/* Multiple choice options */}
                {q.options && (
                  <div className="space-y-2 pt-2">
                    {q.options.map((opt: string) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedAnswers[q.id] === opt
                            ? 'bg-blue-50 border-blue-500 font-semibold text-blue-900'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={selectedAnswers[q.id] === opt}
                          onChange={() => setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                          className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handlePracticeSubmit(q.id)}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                  >
                    Check Answer
                  </button>

                  {result && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {result.is_correct ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-600 flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> Correct: {result.correct_answer}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {result && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">Explanation: </span>
                    {result.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Ask AI Tutor */}
      {activeTab === 'ai' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">AI Placement Tutor: {topic.name}</h3>
            <p className="text-xs text-slate-500">
              Ask doubts, request code implementations, or get edge cases explained in detail.
            </p>
          </div>

          <div className="min-h-[220px] max-h-[380px] overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            {aiChat.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Ask a question about {topic.name} (e.g. "What are the deadlock avoidance algorithms?" or "Give me a practice numerical")
              </div>
            ) : (
              aiChat.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl text-xs ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white ml-12'
                      : 'bg-white text-slate-800 border border-slate-200 mr-12'
                  }`}
                >
                  <p className="font-bold mb-1 opacity-75">{msg.role === 'user' ? 'You' : 'AI Tutor'}</p>
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                </div>
              ))
            )}
            {isAiLoading && (
              <div className="p-3 bg-white text-slate-500 border border-slate-200 rounded-xl text-xs flex items-center gap-2 animate-pulse mr-12">
                <Sparkles className="h-4 w-4 text-blue-600 animate-spin" />
                Thinking through concepts...
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Ask a question about ${topic.name}...`}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <button
              onClick={handleAskAI}
              disabled={isAiLoading || !aiPrompt.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Ask
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
