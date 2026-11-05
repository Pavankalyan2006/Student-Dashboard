import * as React from 'react';
import { Sparkles, ArrowRight, CornerDownLeft, Bot, HelpCircle, Calendar, Briefcase, Code, Brain } from 'lucide-react';
import { useUiStore } from '../../../store/uiStore';
import { onboardingApi } from '../../../api/onboardingApi';
import { StudentAIPersona } from '../../../../server/models/onboardingTypes';

export function DashboardAIHero({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [prompt, setPrompt] = React.useState('');
  const [persona, setPersona] = React.useState<StudentAIPersona | null>(null);
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);

  React.useEffect(() => {
    let mounted = true;
    onboardingApi.getAIPersona()
      .then((data) => {
        if (mounted && data) setPersona(data);
      })
      .catch((err) => {
        console.debug('No custom AI persona found or failed to load:', err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const finalPrompt = (customText || prompt).trim();
    if (!finalPrompt) {
      onNavigate('/ai-agent');
      return;
    }
    setAiInitialPrompt(finalPrompt);
    onNavigate('/ai-agent');
  };

  const quickPrompts = [
    { label: "Explain today's topic", prompt: "Explain Binary Search Trees and AVL balancing rotations for my DAA coursework with visual code examples.", icon: Bot },
    { label: "Create a quiz for me", prompt: "Generate a 5-question multiple choice quiz on Operating Systems Virtual Memory Paging with detailed explanations.", icon: HelpCircle },
    { label: "Create today's study plan", prompt: "Create a structured 2-hour study schedule covering DAA practice, ML loss functions, and project architecture.", icon: Calendar },
    { label: "Prepare me for placements", prompt: "Conduct a technical screening drill on binary tree traversals and dynamic programming memoization.", icon: Briefcase },
    { label: "Help me with my project", prompt: "Review my capstone architecture and recommend the database indexing strategy for high-throughput queries.", icon: Code },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B1530] via-[#101E42] to-[#1C2E5D] p-5 sm:p-6 text-white border border-[#1E2E55] shadow-lg">
      {/* Background ambient accents */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 rounded-full bg-gradient-to-br from-[#2563EB]/20 to-[#4F46E5]/30 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Header line */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold tracking-tight uppercase text-indigo-300">
              {persona?.agent_companion_name ? `${persona.agent_companion_name} · AI Companion` : 'B.Tech AI Learning Assistant'}
            </span>
            {persona?.pedagogical_tone && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-medium capitalize">
                {persona.pedagogical_tone.replace(/_/g, ' ').toLowerCase()}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
            Gemini &amp; Tool Registry Connected
          </span>
        </div>

        {/* Hero headline */}
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            What do you want to learn or accomplish today?
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Ask any engineering coursework question, generate targeted practice quizzes, or debug algorithms with real-time explanation.
          </p>
        </div>

        {/* Active AI Companion Focus Pill */}
        {persona?.primary_focus_directives && persona.primary_focus_directives.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 max-w-2xl">
            <Brain className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">
              <strong className="text-white font-medium">Personalized Focus:</strong> {persona.primary_focus_directives[0]}
            </span>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={(e) => handleSubmit(e)} className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Ask the AI tutor"
            placeholder="Ask AI: Explain AVL Tree rotations, debug my code, or generate a quiz..."
            className="w-full h-11 pl-4 pr-24 rounded-xl bg-white/10 text-xs sm:text-sm text-white placeholder:text-slate-400 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:bg-white/15 transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 h-8 px-3.5 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Ask AI</span>
            <CornerDownLeft className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Suggested Quick Prompt Capsules */}
        <div className="pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 mr-1 select-none">Quick Actions:</span>
            {quickPrompts.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(undefined, item.prompt)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-[11px] text-slate-200 font-medium transition-all hover:text-white cursor-pointer active:scale-95"
                >
                  <Icon className="h-3 w-3 text-[#38BDF8]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
