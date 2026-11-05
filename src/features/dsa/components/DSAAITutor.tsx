import * as React from 'react';
import { Sparkles, Send, X, Bot, User, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Algorithm, VisualizationStep, DSAProblem } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';

interface DSAAITutorProps {
  algorithm?: Algorithm;
  problem?: DSAProblem;
  currentStep?: VisualizationStep;
  currentCode?: string;
  language?: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToFullPage?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const DSAAITutor: React.FC<DSAAITutorProps> = ({
  algorithm,
  problem,
  currentStep,
  currentCode,
  language = 'python',
  isOpen,
  onClose,
  onNavigateToFullPage,
}) => {
  const targetTitle = problem?.title || algorithm?.name || 'this algorithm';

  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I'm your AI DSA Tutor. I can help explain algorithmic invariants, Big-O derivations, or the step-by-step logic in **${targetTitle}**${
        problem?.difficulty ? ` (${problem.difficulty})` : ''
      }. What would you like to explore?`,
    },
  ]);
  const [inputVal, setInputVal] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([
    'Explain the optimal approach intuition',
    `Why is ${targetTitle} ${problem?.optimal_complexity?.time || algorithm?.time_complexity || 'O(N)'}?`,
    'Give me a progressive hint',
    'What are the critical edge cases to test?',
  ]);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When problem or algorithm changes, update initial greeting
  React.useEffect(() => {
    if (problem || algorithm) {
      const title = problem?.title || algorithm?.name || 'this problem';
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your AI DSA Tutor. I can help explain the optimal algorithmic pattern, corner cases, and Big-O derivation for **${title}**${
            problem?.difficulty ? ` (${problem.difficulty})` : ''
          }. What would you like to work through?`,
        },
      ]);
    }
  }, [problem?.id, algorithm?.id]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || inputVal.trim();
    if (!prompt || isLoading) return;

    const userMsg: Message = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await dsaApi.askAITutor({
        problem_id: problem?.id,
        algorithm_id: algorithm?.id,
        question: prompt,
        code: currentCode,
        language,
        step_number: currentStep?.step_number,
      });

      if (res?.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.message,
          },
        ]);
        if (res.suggestions && res.suggestions.length > 0) {
          setSuggestions(res.suggestions);
        }
      }
    } catch (err: any) {
      // Show the real failure (for example 503 when no AI model is configured) instead of a canned answer.
      const reason = err?.response?.data?.message || err?.message || 'The AI tutor is not available right now.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `**The AI tutor could not answer.** ${reason}`
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/30 dark:from-slate-900 dark:to-indigo-950/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>AI DSA Tutor</span>
              {problem?.difficulty && (
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {problem.difficulty}
                </span>
              )}
            </h3>
            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px] block">
              {targetTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onNavigateToFullPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToFullPage}
              className="h-8 px-2 text-xs text-indigo-600 dark:text-indigo-400 gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-950"
              title="Open full Ask AI DSA Tutor workspace page"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Page</span>
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-lg">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`p-3.5 rounded-2xl max-w-[88%] text-xs leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2.5 items-center text-xs text-indigo-600 dark:text-indigo-400 italic">
            <Bot className="w-4 h-4 animate-spin text-indigo-500" />
            AI DSA Tutor is formulating intuition and complexity analysis...
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Preset Prompt Suggestions */}
      <div className="p-3 bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
        {suggestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900"
      >
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={`Ask about ${targetTitle}...`}
          className="text-xs h-9 rounded-xl"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!inputVal.trim() || isLoading}
          className="h-9 w-9 p-0 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex-shrink-0 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
