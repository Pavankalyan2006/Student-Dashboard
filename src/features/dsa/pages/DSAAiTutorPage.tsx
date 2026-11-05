import * as React from 'react';
import {
  Sparkles,
  Bot,
  User,
  Send,
  Play,
  Code2,
  ExternalLink,
  ArrowLeft,
  ChevronDown,
  Search,
  CheckCircle2,
  Clock,
  Cpu,
  HelpCircle,
  Lightbulb,
  FileCode2,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { ResilientCodeEditor as Editor } from '../../../components/code/ResilientCodeEditor';
import { dsaApi } from '../api/dsaApi';
import { DSAProblem, DSATopic } from '../types/dsa';
import { toast } from 'sonner';

interface DSAAiTutorPageProps {
  problemId?: string;
  onNavigate?: (path: string) => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const DSAAiTutorPage: React.FC<DSAAiTutorPageProps> = ({ problemId, onNavigate }) => {
  const [problems, setProblems] = React.useState<DSAProblem[]>([]);
  const [topics, setTopics] = React.useState<DSATopic[]>([]);
  const [selectedProblem, setSelectedProblem] = React.useState<DSAProblem | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Question Switcher Search State
  const [isSwitcherOpen, setIsSwitcherOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Active Problem Details Tabs
  const [activeTab, setActiveTab] = React.useState<'overview' | 'hints' | 'scratchpad'>('overview');

  // Code Scratchpad
  const [language, setLanguage] = React.useState<'python' | 'javascript' | 'cpp' | 'java'>('python');
  const [code, setCode] = React.useState<string>('');

  // AI Tutor Chat State
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([
    'Explain the optimal approach intuition',
    'Derive the Big-O time and space complexity',
    'Give me a progressive hint without spoiling the code',
    'What critical edge cases fail most often?',
  ]);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  // Load problem bank and topics
  React.useEffect(() => {
    setLoading(true);
    Promise.all([dsaApi.getProblems(), dsaApi.getTopics()])
      .then(([allProblems, allTopics]) => {
        setProblems(allProblems);
        setTopics(allTopics);

        // Find requested problem or default to first
        let current = allProblems[0];
        if (problemId) {
          const match = allProblems.find((p) => p.id === problemId || p.slug === problemId);
          if (match) current = match;
        }
        setSelectedProblem(current || null);
        if (current) {
          setCode(current.starter_code?.[language] || current.starter_code?.python || '');
          initGreeting(current);
        }
      })
      .catch((err) => {
        console.error('Failed to load DSA problems for tutor:', err);
        toast.error('Failed to load problem catalog');
      })
      .finally(() => setLoading(false));
  }, [problemId]);

  // When problem selection changes
  const handleSelectProblem = (prob: DSAProblem) => {
    setSelectedProblem(prob);
    setIsSwitcherOpen(false);
    setSearchQuery('');
    setCode(prob.starter_code?.[language] || prob.starter_code?.python || '');
    initGreeting(prob);
  };

  const initGreeting = (prob: DSAProblem) => {
    const time = prob.optimal_complexity?.time || 'O(N)';
    const space = prob.optimal_complexity?.space || 'O(1)';
    setMessages([
      {
        role: 'assistant',
        content: `👋 **Welcome to your personal AI DSA Tutor session!**\n\nI am calibrated for **${prob.title}** (${prob.difficulty}).\n\n- **Domain:** \`${prob.topic_id}\`\n- **Target Time Complexity:** \`${time}\`\n- **Target Space Complexity:** \`${space}\`\n\nAsk me about the core intuition, how to spot the algorithmic pattern, edge cases to consider, or paste your draft code for constructive review.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setSuggestions([
      'Explain the optimal approach intuition',
      `Why is ${prob.title} ${time}?`,
      'Give me a progressive hint without spoiling the solution',
      'What are the critical edge cases to test?',
      'Walk me through Example 1 step-by-step',
    ]);
  };

  // Update scratchpad code when language changes
  React.useEffect(() => {
    if (selectedProblem?.starter_code?.[language]) {
      setCode(selectedProblem.starter_code[language]);
    }
  }, [language, selectedProblem]);

  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputVal.trim();
    if (!prompt || isLoading || !selectedProblem) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsLoading(true);

    try {
      const res = await dsaApi.askAITutor({
        problem_id: selectedProblem.id,
        question: prompt,
        code: activeTab === 'scratchpad' ? code : undefined,
        language,
      });

      if (res?.message) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
          content: `**The AI tutor could not answer.** ${reason} The problem's own hints are still available in the hints panel.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter questions in the switcher
  const filteredProblems = React.useMemo(() => {
    if (!searchQuery.trim()) return problems;
    const q = searchQuery.toLowerCase();
    return problems.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.topic_id.toLowerCase().includes(q) ||
        p.difficulty.toLowerCase().includes(q)
    );
  }, [problems, searchQuery]);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'EASY':
      case 'BEGINNER':
        return 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'MEDIUM':
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'HARD':
      case 'ADVANCED':
        return 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px]">
          <div className="lg:col-span-6 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
          <div className="lg:col-span-6 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!selectedProblem) {
    return (
      <div className="p-12 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold">No Problem Selected</h2>
        <Button onClick={() => navigate('/dsa')}>Return to DSA Lab</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dsa')}
            className="h-10 w-10 p-0 rounded-2xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Question Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all text-left group"
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 block leading-none">
                  Active Question ({problems.length} in LeetCode 150)
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {selectedProblem.title}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-2 group-hover:text-slate-600" />
            </button>

            {/* Switcher Popover Menu */}
            {isSwitcherOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 sm:w-96 max-h-[460px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search from 150 questions..."
                      className="pl-8 text-xs h-8 rounded-xl"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[380px]">
                  {filteredProblems.map((prob) => {
                    const isCurrent = prob.id === selectedProblem.id;
                    return (
                      <button
                        key={prob.id}
                        type="button"
                        onClick={() => handleSelectProblem(prob)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                          isCurrent
                            ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs truncate block">{prob.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {prob.topic_id.replace('dsa_topic_', '').replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getDifficultyBadge(
                            prob.difficulty
                          )}`}
                        >
                          {prob.difficulty}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedProblem.editorial_url && (
            <a
              href={selectedProblem.editorial_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 hover:bg-amber-100 transition-colors shadow-xs h-9"
            >
              <ExternalLink className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>LeetCode Editorial</span>
            </a>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/dsa/visualize/${selectedProblem.algorithm_id || selectedProblem.id}`)
            }
            className="text-xs h-9 gap-1.5 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 rounded-xl font-semibold shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-indigo-500 fill-current" />
            <span>Launch Visualizer</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`/dsa/problem/${selectedProblem.id}`)}
            className="text-xs h-9 px-4 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Code Editor</span>
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Problem Details, Hints, and Scratchpad */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Problem Header Info Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                    selectedProblem.difficulty
                  )}`}
                >
                  {selectedProblem.difficulty}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {selectedProblem.topic_id.replace('dsa_topic_', '').replace(/_/g, ' ')}
                </span>
              </div>

              {/* Complexity Badges */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1 text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-blue-500" />
                  Time: <strong className="text-blue-600 dark:text-blue-400">{selectedProblem.optimal_complexity?.time || 'O(N)'}</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Cpu className="w-3.5 h-3.5 text-purple-500" />
                  Space: <strong className="text-purple-600 dark:text-purple-400">{selectedProblem.optimal_complexity?.space || 'O(1)'}</strong>
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {selectedProblem.title}
            </h1>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'overview'
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Problem Statement & Examples
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('hints')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === 'hints'
                    ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Hints ({selectedProblem.hints?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scratchpad')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                  activeTab === 'scratchpad'
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
                Code Scratchpad
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex-1 overflow-y-auto max-h-[560px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Description
                  </h3>
                  <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedProblem.description}
                  </div>
                </div>

                {/* Examples */}
                {selectedProblem.examples && selectedProblem.examples.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Sample Test Cases
                    </h3>
                    {selectedProblem.examples.map((ex, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 text-xs font-mono space-y-1.5"
                      >
                        <div className="text-slate-500 font-bold">Example {idx + 1}:</div>
                        <div>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">Input: </span>
                          <span className="text-slate-800 dark:text-slate-200">{ex.input}</span>
                        </div>
                        <div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Output: </span>
                          <span className="text-slate-800 dark:text-slate-200">{ex.output}</span>
                        </div>
                        {ex.explanation && (
                          <div className="pt-1 text-slate-500 text-[11px] font-sans">
                            <span className="font-semibold text-slate-600 dark:text-slate-400">Explanation: </span>
                            {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {selectedProblem.constraints && selectedProblem.constraints.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Constraints
                    </h3>
                    <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                      {selectedProblem.constraints.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    Hints are designed to give progressive clues without revealing the complete solution immediately. Read one hint at a time and attempt the problem before unlocking the next.
                  </p>
                </div>

                {selectedProblem.hints && selectedProblem.hints.length > 0 ? (
                  selectedProblem.hints.map((hint, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider font-mono">
                          Hint #{idx + 1}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSendMessage(`Can you explain Hint #${idx + 1}: "${hint}" in detail?`)}
                          className="h-7 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          Ask AI Tutor about this hint
                        </Button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {hint}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No hints recorded for this problem yet.</p>
                )}
              </div>
            )}

            {activeTab === 'scratchpad' && (
              <div className="space-y-3 flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Language:</span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="text-xs font-mono bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200"
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript (Node)</option>
                      <option value="cpp">C++ 20</option>
                      <option value="java">Java 21</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleSendMessage('Please review my current scratchpad code. Point out any logic errors, boundary misses, or Big-O bottlenecks.')}
                    className="text-xs h-8 px-3 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Review Code with AI</span>
                  </Button>
                </div>

                <div className="h-[360px] rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 shadow-inner">
                  <Editor
                    height="360px"
                    language={language === 'cpp' ? 'cpp' : language}
                    value={code}
                    onChange={(val) => setCode(val || '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      fontFamily: 'JetBrains Mono, Menlo, monospace',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      tabSize: 4,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI DSA Tutor Interactive Conversation */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
          {/* Tutor Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-violet-50/30 dark:from-slate-900 dark:via-indigo-950/20 dark:to-violet-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>AI DSA Tutor</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    Live Coach
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Step-by-step intuition, code reviews, and Big-O explanations.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => initGreeting(selectedProblem)}
              className="h-8 px-2.5 text-xs gap-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              title="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </Button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[500px]">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-3xl max-w-[88%] text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                  }`}
                >
                  {m.content}
                  <span
                    className={`block text-[10px] font-mono mt-2 ${
                      m.role === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center text-xs text-indigo-600 dark:text-indigo-400 italic">
                <Bot className="w-5 h-5 animate-spin text-indigo-500" />
                AI DSA Tutor is analyzing algorithmic invariants and compiling answer...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Preset Prompts Row */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
            {suggestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-[11px] px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5 bg-white dark:bg-slate-900"
          >
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Ask AI Tutor about ${selectedProblem.title}...`}
              className="text-xs h-11 rounded-2xl flex-1 px-4"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputVal.trim() || isLoading}
              className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold gap-2 shadow-sm"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
