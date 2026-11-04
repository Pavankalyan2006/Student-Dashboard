// src/features/system-design/components/AITutorDrawer.tsx
// Progressive AI System Design Assistant with 6 Specialized Coaching Modes

import * as React from 'react';
import {
  Sparkles,
  X,
  Send,
  HelpCircle,
  Lightbulb,
  Scale,
  ShieldCheck,
  UserCheck,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import { toast } from 'sonner';

interface AITutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentContext?: any;
}

type TutorMode = 'CONCEPT' | 'HINT' | 'REVIEW' | 'TRADEOFF' | 'INTERVIEWER' | 'SOLUTION';

export function AITutorDrawer({ isOpen, onClose, currentContext }: AITutorDrawerProps) {
  const [mode, setMode] = React.useState<TutorMode>('CONCEPT');
  const [prompt, setPrompt] = React.useState('');
  const [messages, setMessages] = React.useState<Array<{ sender: 'user' | 'assistant'; text: string; mode?: string }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am your Senior Distributed Systems Architect AI Tutor. Choose a coaching mode below or ask me any question about scalability, database partitioning, or trade-offs.',
      mode: 'CONCEPT'
    }
  ]);
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await systemDesignApi.queryAiAssistant(textToSend, mode, currentContext);
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: res.response,
          mode: res.mode
        }
      ]);
    } catch (err: any) {
      toast.error('AI assistant query failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const MODES: Array<{ mode: TutorMode; label: string; icon: any; placeholder: string }> = [
    { mode: 'CONCEPT', label: 'Concept Explain', icon: Lightbulb, placeholder: 'Ask about CAP Theorem, sharding, or replication...' },
    { mode: 'HINT', label: 'Small Hint', icon: HelpCircle, placeholder: 'Need a nudge without revealing the full solution?' },
    { mode: 'TRADEOFF', label: 'Trade-Offs', icon: Scale, placeholder: 'Compare SQL vs NoSQL, or 301 vs 302 redirects...' },
    { mode: 'REVIEW', label: 'Review Canvas', icon: ShieldCheck, placeholder: 'Review current architecture for bottlenecks...' },
    { mode: 'INTERVIEWER', label: 'Interviewer', icon: UserCheck, placeholder: 'Ask a tough Socratic interview follow-up...' },
    { mode: 'SOLUTION', label: 'Reference Pattern', icon: FileCode, placeholder: 'View standard web-scale architecture blueprint...' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">AI Architecture Tutor</h3>
            <p className="text-[10px] text-slate-400">Senior Distributed Systems Coach</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Selector Strip */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/40 grid grid-cols-3 gap-1 text-[11px]">
        {MODES.map(m => {
          const Icon = m.icon;
          const isSelected = mode === m.mode;
          return (
            <button
              key={m.mode}
              onClick={() => setMode(m.mode)}
              className={`p-1.5 rounded-lg border text-left transition-all flex items-center gap-1.5 truncate ${
                isSelected
                  ? 'bg-indigo-600 border-indigo-400 text-white font-semibold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl leading-relaxed whitespace-pre-wrap ${
              msg.sender === 'user'
                ? 'bg-indigo-600 text-white ml-6 font-medium shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-200 mr-4 shadow-lg'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="flex items-center justify-between mb-1.5 border-b border-slate-800 pb-1 text-[10px] text-indigo-400 font-mono">
                <span>AI Tutor Mode: {msg.mode || 'CONCEPT'}</span>
              </div>
            )}
            {msg.text}
          </div>
        ))}

        {loading && (
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 text-xs animate-pulse flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            Analyzing architecture trade-offs...
          </div>
        )}
      </div>

      {/* Input Composer */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={MODES.find(m => m.mode === mode)?.placeholder}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="text-[10px] text-slate-500 text-center">
          AI recommendations are advisory and do not overwrite your canvas directly.
        </div>
      </div>
    </div>
  );
}
