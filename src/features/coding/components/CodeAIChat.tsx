import React, { useState, useRef, useEffect } from 'react';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import { codingApi } from '../api/codingApi';
import {
  Sparkles,
  Send,
  HelpCircle,
  Bug,
  Lightbulb,
  Zap,
  CheckCircle,
  Copy,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'student' | 'ai';
  text: string;
  codeSnippet?: string;
  timestamp: string;
}

export const CodeAIChat: React.FC<{ problemContext?: any }> = ({ problemContext }) => {
  const sourceCode = useCodingEditorStore((s) => s.sourceCode);
  const setSourceCode = useCodingEditorStore((s) => s.setSourceCode);
  const language = useCodingEditorStore((s) => s.language);
  const result = useCodingEditorStore((s) => s.executionResult);
  const stdin = useCodingEditorStore((s) => s.stdin);
  const toggleAiPanel = useCodingEditorStore((s) => s.toggleAiPanel);
  const openDiffModal = useCodingEditorStore((s) => s.openDiffModal);

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello! I'm your **B.Tech AI Coding Assistant**. I have live context of your **${language}** editor workspace.

Ask me anything about your code, or select an action below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'student',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const lower = userText.toLowerCase();

      // Quick routing to specialized endpoints
      if (lower.includes('debug') || lower.includes('error') || lower.includes('fix')) {
        const debugRes = await codingApi.aiDebug({
          language,
          source_code: sourceCode,
          error: result?.stderr || userText,
          stdout: result?.stdout,
          stdin,
          problem_statement: problemContext?.description,
        });

        const reply = `### Bug Diagnosis: ${debugRes.problem}

**Root Cause:**
${debugRes.cause}

**Explanation:**
${debugRes.explanation}

**Suggested Resolution:**
${debugRes.suggested_fix}

\`\`\`${language}
${debugRes.corrected_code}
\`\`\``;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            codeSnippet: debugRes.corrected_code,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (lower.includes('explain')) {
        const exp = await codingApi.aiExplain({
          language,
          source_code: sourceCode,
          level: 'intermediate',
        });

        const reply = `### Code Analysis & Explanation

${exp.overview}

#### Algorithmic Steps:
${exp.step_by_step.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

#### Complexity Bounds:
- **Time Complexity:** ${exp.time_complexity}
- **Space Complexity:** ${exp.space_complexity}

#### Key Invariants & Suggestions:
${exp.suggestions.map((s) => `- ${s}`).join('\n')}`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (lower.includes('hint')) {
        const hintRes = await codingApi.aiHint({
          problem_id: problemContext?.id,
          level: 1,
          current_code: sourceCode,
        });

        const reply = `### 💡 Problem Hint (Level ${hintRes.level} of ${hintRes.total_hints})

${hintRes.hint}

*Notice: Solution is deliberately withheld to stimulate active problem-solving.*`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (lower.includes('test case') || lower.includes('test cases')) {
        const tcs = await codingApi.aiTestCases({
          language,
          source_code: sourceCode,
          problem_statement: problemContext?.description,
        });

        const reply = `### Generated Boundary & Edge Test Cases

${tcs
  .map(
    (tc, i) => `#### Test Case ${i + 1} (${tc.type.toUpperCase()})
- **Input:** \`${tc.input}\`
- **Expected:** \`${tc.expected}\`
- *Rationale:* ${tc.explanation}`
  )
  .join('\n\n')}`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else if (lower.includes('refactor') || lower.includes('optimize')) {
        const ref = await codingApi.aiRefactor({
          language,
          source_code: sourceCode,
          instruction: userText,
        });

        const reply = `### Refactoring Recommendation

**Rationale:**
${ref.reason}

**Key Improvements:**
${ref.changes.map((c) => `- ${c}`).join('\n')}

\`\`\`${language}
${ref.suggested_code}
\`\`\``;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            codeSnippet: ref.suggested_code,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Fallback code generation / conversational inquiry
        const gen = await codingApi.aiGenerate({
          prompt: userText,
          language,
        });

        const reply = `${gen.explanation}

\`\`\`${language}
${gen.code}
\`\`\`

**Complexity:** ${gen.complexity}`;

        setMessages((prev) => [
          ...prev,
          {
            id: `ai_${Date.now()}`,
            sender: 'ai',
            text: reply,
            codeSnippet: gen.code,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      toast.error('AI request failed. Please check network.');
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `⚠️ **Error:** Unable to process AI coding request: ${err.message || 'Service temporarily unavailable.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewInDiff = (snippet: string) => {
    openDiffModal({
      title: 'Review AI Suggested Code',
      originalCode: sourceCode,
      suggestedCode: snippet,
      rationale: 'Review changes before replacing current code in Monaco editor.',
      onApply: () => {
        setSourceCode(snippet);
        toast.success('Code updated in editor');
      },
    });
  };

  const handleDirectInsert = (snippet: string) => {
    if (window.confirm('Replace current editor code with this snippet?')) {
      setSourceCode(snippet);
      toast.success('Code inserted into editor');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">AI Coding Assistant</h3>
            <span className="text-[10px] text-slate-500 font-mono">Workspace Context Active ({language})</span>
          </div>
        </div>

        <button
          onClick={toggleAiPanel}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          title="Close AI Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto text-[11px] no-scrollbar">
        <button
          onClick={() => handleSend('Explain this code')}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 font-medium whitespace-nowrap shadow-xs transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-blue-500" />
          <span>Explain</span>
        </button>

        <button
          onClick={() => handleSend('Debug this error')}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 font-medium whitespace-nowrap shadow-xs transition-colors"
        >
          <Bug className="w-3 h-3 text-rose-500" />
          <span>Debug</span>
        </button>

        <button
          onClick={() => handleSend('Give me a hint')}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 font-medium whitespace-nowrap shadow-xs transition-colors"
        >
          <Lightbulb className="w-3 h-3 text-amber-500" />
          <span>Hint</span>
        </button>

        <button
          onClick={() => handleSend('Generate test cases')}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 font-medium whitespace-nowrap shadow-xs transition-colors"
        >
          <CheckCircle className="w-3 h-3 text-emerald-500" />
          <span>Test Cases</span>
        </button>

        <button
          onClick={() => handleSend('Optimize this code')}
          disabled={loading}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 font-medium whitespace-nowrap shadow-xs transition-colors"
        >
          <Zap className="w-3 h-3 text-purple-500" />
          <span>Optimize</span>
        </button>
      </div>

      {/* Messages stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'student' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] p-3 rounded-xl text-xs ${
                m.sender === 'student'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs'
              }`}
            >
              <div className="prose dark:prose-invert prose-xs max-w-none leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {m.text}
                </ReactMarkdown>
              </div>

              {/* Action Buttons for AI generated snippets */}
              {m.codeSnippet && m.sender === 'ai' && (
                <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleReviewInDiff(m.codeSnippet!)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold transition-colors"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Review in Diff</span>
                  </button>

                  <button
                    onClick={() => handleDirectInsert(m.codeSnippet!)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded text-[11px] font-medium transition-colors"
                  >
                    <span>Insert</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(m.codeSnippet!);
                      toast.success('Code copied');
                    }}
                    className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded"
                    title="Copy Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <span
                className={`block text-[9px] mt-1.5 ${
                  m.sender === 'student' ? 'text-blue-100 text-right' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-500">
            <RefreshCw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
            <span>AI analyzing current code & formulating guidance...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="p-2.5 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            placeholder="Ask about syntax, errors, or algorithms..."
            className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || loading}
            className="p-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
