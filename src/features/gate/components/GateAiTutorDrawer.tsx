// src/features/gate/components/GateAiTutorDrawer.tsx
import React, { useState } from 'react';
import { GateStudentProfile } from '../types/gateTypes';
import { gateApi } from '../api/gateApi';
import {
  X,
  Sparkles,
  Send,
  BookOpen,
  Brain,
  HelpCircle,
  Lightbulb,
  FileQuestion,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

interface GateAiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: GateStudentProfile | null;
  initialTopicContext?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  formulas?: string[];
  follow_up_questions?: string[];
  timestamp: string;
}

export const GateAiTutorDrawer: React.FC<GateAiTutorDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  initialTopicContext,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am **GateGuru**, your dedicated AI Professor for **GATE ${profile?.target_paper || 'CS'} ${profile?.exam_cycle ? `(${profile.exam_cycle})` : ''}**.
      
I can assist you with:
- **Step-by-Step Mathematical Solvers**: Deriving formulas, recurrence relations, and numerical solutions.
- **Concept Deep-Dives**: Detailed explanations of virtual memory, graph algorithms, normalization, and packet routing.
- **Socratic Hints**: Giving hints without spoiling final answers.
- **Trap Analysis**: Identifying why certain options trigger negative marking.

How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'CONCEPT' | 'SOLVE' | 'HINT' | 'MISTAKE_ANALYSIS'>('CONCEPT');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await gateApi.queryAiTutor(prompt, mode, {
        topic_name: initialTopicContext,
        paper_code: profile?.target_paper,
      });

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: res.response,
        formulas: res.formulas,
        follow_up_questions: res.follow_up_questions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      toast.error('AI Tutor request failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Derive Effective Memory Access Time (EMAT) formula with 2-level paging',
    'Explain Master Theorem cases and compare with Akra-Bazzi',
    'How to calculate B+ Tree leaf node capacities and block I/O?',
    'What are the common traps in Stop-and-Wait vs Go-Back-N sliding window?',
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
              GateGuru AI Study Assistant
              <span className="px-1.5 py-0.5 rounded-sm text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                {profile?.target_paper || 'CS'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Context-Aware GATE Professor & Numerical Solver</p>
          </div>
        </div>

        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 text-xs overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0">Mode:</span>
        {[
          { id: 'CONCEPT', label: 'Concept' },
          { id: 'SOLVE', label: 'Step-by-Step' },
          { id: 'HINT', label: 'Socratic Hint' },
          { id: 'MISTAKE_ANALYSIS', label: 'Trap Analyzer' },
        ].map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as any)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors shrink-0 cursor-pointer ${
              mode === m.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white ml-8 shadow-xs'
                : 'bg-slate-950/80 border border-slate-800 text-slate-200 mr-4 font-sans'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>{msg.sender === 'user' ? 'You' : 'GateGuru Professor'}</span>
              <span>{msg.timestamp}</span>
            </div>

            <div className="text-xs leading-normal">{msg.text}</div>

            {/* Follow-up Question Suggestions */}
            {msg.follow_up_questions && msg.follow_up_questions.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 block">Suggested Follow-ups:</span>
                {msg.follow_up_questions.map((fq, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(fq)}
                    className="text-[11px] text-slate-300 hover:text-indigo-300 block text-left underline cursor-pointer"
                  >
                    • {fq}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            <span>GateGuru is analyzing derivation and formulas...</span>
          </div>
        )}

        {/* Quick Prompts on initial conversation */}
        {messages.length === 1 && (
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold text-slate-400 block">Sample GATE Questions & Derivations:</span>
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all text-xs"
              >
                {qp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-2">
        <div className="relative">
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask a technical concept, formula derivation, or past GATE problem..."
            className="w-full p-2.5 pr-10 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="absolute right-2.5 bottom-2.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Pro-tip: Press Enter to send, Shift+Enter for new line. Answers derived with KaTeX math rendering.
        </p>
      </div>
    </div>
  );
};
