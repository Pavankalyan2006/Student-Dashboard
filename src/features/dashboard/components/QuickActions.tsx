import * as React from 'react';
import { Bot, BookOpen, Binary, Code2, FileText, HelpCircle, Hammer, Sparkles, Files, GraduationCap } from 'lucide-react';

export function QuickActions({ onNavigate }: { onNavigate: (path: string) => void }) {
  const actions = [
    { label: 'Semester Command', icon: GraduationCap, path: '/semester-command-center', isAi: true },
    { label: 'Consult AI', icon: Bot, path: '/ai-agent', isAi: false },
    { label: 'Courses', icon: BookOpen, path: '/courses' },
    { label: 'Documents AI', icon: Files, path: '/documents' },
    { label: 'DSA Lab', icon: Binary, path: '/dsa' },
    { label: 'Coding Lab', icon: Code2, path: '/coding' },
    { label: 'Smart Notes', icon: FileText, path: '/notes' },
    { label: 'Adaptive Quiz', icon: HelpCircle, path: '/quiz' },
    { label: 'Project Builder', icon: Hammer, path: '/projects' },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.label}
            onClick={() => onNavigate(act.path)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-all shadow-2xs border ${
              act.isAi
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent hover:opacity-95'
                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${act.isAi ? 'text-white' : 'text-blue-600'}`} />
            <span>{act.label}</span>
          </button>
        );
      })}
    </div>
  );
}
