import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  X,
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  CheckCircle2,
  ListChecks,
  MessageSquare,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AICoachDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'USER' | 'AI'; text: string; recommendations?: string[] }>>([
    {
      sender: 'AI',
      text: 'Hello! I am your AI Placement Preparation Coach. Ask me to explain difficult aptitude formulas, conduct a quick technical concept drill, critique a STAR interview answer, or generate a revision checklist.',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');

  const askMutation = useMutation({
    mutationFn: (q: string) => placementsApi.askCoach(q),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: data.response,
          recommendations: data.recommendations,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: 'I encountered an issue processing your placement query. Please try again or rephrase your question.',
        },
      ]);
    },
  });

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim() || askMutation.isPending) return;
    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: 'USER', text: userMsg }]);
    setInputText('');
    askMutation.mutate(userMsg);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessages((prev) => [...prev, { sender: 'USER', text: prompt }]);
    askMutation.mutate(prompt);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">AI Placement Coach</h3>
              <p className="text-[10px] text-slate-500">Context-aware placement advisor & concept explainer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Prompt Suggestions */}
        <div className="p-3 border-b border-slate-100 bg-purple-50/30 flex gap-1.5 overflow-x-auto text-[11px] font-medium text-purple-800">
          <button
            onClick={() => handleQuickPrompt('Give me a 5-step checklist for Day 1 of campus placement season.')}
            className="px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-100/50 rounded-lg shrink-0 flex items-center gap-1"
          >
            <ListChecks className="h-3 w-3" />
            <span>Placement Checklist</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Explain Relative Speed in Time, Speed and Distance with a train crossing example.')}
            className="px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-100/50 rounded-lg shrink-0 flex items-center gap-1"
          >
            <BookOpen className="h-3 w-3" />
            <span>Relative Speed</span>
          </button>
          <button
            onClick={() => handleQuickPrompt('Conduct a quick 1-question technical drill on Database Indexing.')}
            className="px-2.5 py-1 bg-white border border-purple-200 hover:bg-purple-100/50 rounded-lg shrink-0 flex items-center gap-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Technical Drill</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 ${
                  m.sender === 'USER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.recommendations && m.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-1">
                    <span className="font-bold text-[10px] uppercase text-purple-700">Recommended Steps:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                      {m.recommendations.map((rec, rIdx) => (
                        <li key={rIdx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-500 rounded-2xl p-3 text-xs flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-spin" />
                <span>Coach is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask the placement coach..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || askMutation.isPending}
              className="p-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
