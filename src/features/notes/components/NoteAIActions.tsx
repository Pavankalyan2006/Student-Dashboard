import * as React from 'react';
import {
  Sparkles,
  Bot,
  HelpCircle,
  Layers,
  FileText,
  RotateCw,
  Zap,
  MessageSquare,
  BookOpen,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Note, FlashcardItem, QuizQuestionItem } from '../types/notes';
import {
  useNoteSummarize,
  useNoteFlashcards,
  useNoteQuiz,
  useRegenerateNote,
  useExplainSection,
} from '../hooks/useNotes';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { useUiStore } from '../../../store/uiStore';
import { FlashcardDeck, QuizRunner } from './NoteStudyTools';

interface NoteAIActionsProps {
  note: Note;
  onNavigate?: (path: string) => void;
}

export function NoteAIActions({ note, onNavigate }: NoteAIActionsProps) {
  const setAiInitialPrompt = useUiStore((state) => state.setAiInitialPrompt);

  const [activeTab, setActiveTab] = React.useState<'actions' | 'flashcards' | 'quiz' | 'summary' | 'explain'>('actions');
  const [flashcards, setFlashcards] = React.useState<FlashcardItem[]>([]);
  const [quizQuestions, setQuizQuestions] = React.useState<QuizQuestionItem[]>([]);
  const [summaryData, setSummaryData] = React.useState<{ summary: string; key_takeaways: string[] } | null>(null);

  // Section explainer state
  const [sectionTitle, setSectionTitle] = React.useState('');
  const [sectionText, setSectionText] = React.useState('');
  const [explanationResult, setExplanationResult] = React.useState<string | null>(null);

  const summarizeMutation = useNoteSummarize(note.id);
  const flashcardsMutation = useNoteFlashcards(note.id);
  const quizMutation = useNoteQuiz(note.id);
  const regenerateMutation = useRegenerateNote(note.id);
  const explainMutation = useExplainSection(note.id);

  const handleSummarize = () => {
    summarizeMutation.mutate(undefined, {
      onSuccess: (data) => {
        setSummaryData(data);
        setActiveTab('summary');
      },
    });
  };

  const handleFlashcards = () => {
    flashcardsMutation.mutate(undefined, {
      onSuccess: (cards) => {
        setFlashcards(cards);
        setActiveTab('flashcards');
      },
    });
  };

  const handleQuiz = () => {
    quizMutation.mutate(undefined, {
      onSuccess: (questions) => {
        setQuizQuestions(questions);
        setActiveTab('quiz');
      },
    });
  };

  const handleRegenerate = (style: string) => {
    regenerateMutation.mutate(style);
  };

  const handleAskAIAgent = () => {
    const prompt = `I am studying my notes on "${note.title}".
Note ID: ${note.id}
Level: ${note.level}

Can you help me understand the core theoretical trade-offs and edge cases for this topic?`;
    setAiInitialPrompt(prompt);
    if (onNavigate) {
      onNavigate('/ai-agent');
    }
  };

  const handleExplainSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim() || !sectionText.trim()) return;

    explainMutation.mutate(
      {
        sectionTitle,
        sectionText,
        instruction: 'Explain this step-by-step with practical intuition and formulas',
      },
      {
        onSuccess: (data) => {
          setExplanationResult(data.explanation);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* Active Tab View for Study Tools */}
      {activeTab === 'flashcards' && (
        <FlashcardDeck
          cards={flashcards}
          title={note.title}
          onClose={() => setActiveTab('actions')}
        />
      )}

      {activeTab === 'quiz' && (
        <QuizRunner
          questions={quizQuestions}
          title={note.title}
          onClose={() => setActiveTab('actions')}
        />
      )}

      {activeTab === 'summary' && summaryData && (
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-xs font-semibold text-slate-900">Executive Summary</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('actions')}
              className="text-xs text-slate-400 hover:text-slate-900"
            >
              Back
            </button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <p className="text-xs text-slate-700 leading-relaxed bg-blue-50/50 p-3 rounded-lg border border-blue-100/60">
              {summaryData.summary}
            </p>
            <div>
              <h5 className="text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
                Key Takeaways:
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {summaryData.key_takeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'explain' && (
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200 py-3 px-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-xs font-semibold text-slate-900">Explain Concept Section</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('actions');
                setExplanationResult(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-900"
            >
              Back
            </button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {!explanationResult ? (
              <form onSubmit={handleExplainSection} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Section Heading
                  </label>
                  <input
                    type="text"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    placeholder="e.g. 2NF Partial Dependencies"
                    required
                    className="w-full h-8 px-2.5 rounded border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Excerpt / Concept Text
                  </label>
                  <textarea
                    rows={3}
                    value={sectionText}
                    onChange={(e) => setSectionText(e.target.value)}
                    placeholder="Paste the paragraph or formula you want explained..."
                    required
                    className="w-full p-2 rounded border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={explainMutation.isPending || !sectionTitle || !sectionText}
                    className="bg-blue-600 text-white text-xs h-8 px-3"
                  >
                    {explainMutation.isPending ? 'Explaining...' : 'Explain with AI'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-xs text-blue-900 leading-relaxed whitespace-pre-line">
                  {explanationResult}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExplanationResult(null)}
                  className="w-full text-xs text-slate-600"
                >
                  Explain Another Section
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main AI Actions Card */}
      {activeTab === 'actions' && (
        <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200 py-3 px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-xs font-semibold text-slate-900">
                AI Learning Assistant Actions
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Quick Study Generators */}
            <div className="space-y-2">
              <h5 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Study & Recall Tools
              </h5>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={handleFlashcards}
                  disabled={flashcardsMutation.isPending}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                    <Layers className="h-4 w-4 text-blue-600" />
                    <span>Generate Flashcards</span>
                  </div>
                  <span className="text-[11px] text-slate-600 group-hover:text-blue-600">
                    {flashcardsMutation.isPending ? 'Generating...' : 'Recall Deck →'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleQuiz}
                  disabled={quizMutation.isPending}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    <span>Generate Practice Quiz</span>
                  </div>
                  <span className="text-[11px] text-slate-600 group-hover:text-blue-600">
                    {quizMutation.isPending ? 'Generating...' : 'MCQs →'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={summarizeMutation.isPending}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span>Executive Summary</span>
                  </div>
                  <span className="text-[11px] text-slate-600 group-hover:text-blue-600">
                    {summarizeMutation.isPending ? 'Summarizing...' : 'Takeaways →'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('explain')}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 text-left transition group"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-900">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Explain Specific Section</span>
                  </div>
                  <span className="text-[11px] text-slate-600 group-hover:text-blue-600">
                    Interactive →
                  </span>
                </button>
              </div>
            </div>

            {/* AI Agent Deep Integration */}
            <div className="pt-3 border-t border-slate-100">
              <div className="p-3 bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-100 rounded-lg space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <span>Ask AI Learning Agent</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Bridge this note directly into your personal AI learning chat with full syllabus context.
                </p>
                <Button
                  size="sm"
                  onClick={handleAskAIAgent}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-7.5 font-medium flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Chat about this Note
                </Button>
              </div>
            </div>

            {/* Note Regeneration & Tuning */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h5 className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Refine Note Perspective
              </h5>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'simpler', label: 'Simpler Intuition' },
                  { id: 'more_detailed', label: 'More Detailed' },
                  { id: 'more_examples', label: 'More Examples' },
                  { id: 'more_exam_focused', label: 'Exam Focus' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    disabled={regenerateMutation.isPending}
                    onClick={() => handleRegenerate(s.id)}
                    className="p-1.5 text-[11px] text-slate-700 bg-slate-50 hover:bg-blue-50/60 hover:text-blue-600 rounded border border-slate-200 text-center transition"
                  >
                    {regenerateMutation.isPending ? 'Refining...' : s.label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
