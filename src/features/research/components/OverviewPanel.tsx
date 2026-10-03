import React from 'react';
import { ResearchProject, ResearchPaper, ResearchQuestion, ResearchGap, ResearchIdea, ResearchCitation } from '../types';
import { BookOpen, FileText, HelpCircle, AlertCircle, Lightbulb, BookmarkCheck, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

interface OverviewPanelProps {
  project: ResearchProject;
  papers: ResearchPaper[];
  questions: ResearchQuestion[];
  gaps: ResearchGap[];
  ideas: ResearchIdea[];
  citations: ResearchCitation[];
  onNavigateTab: (tab: string) => void;
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({
  project,
  papers,
  questions,
  gaps,
  ideas,
  citations,
  onNavigateTab,
}) => {
  const workflowStages = [
    { key: 'questions', label: '1. Question', count: questions.length, icon: HelpCircle },
    { key: 'papers', label: '2. Search & Papers', count: papers.length, icon: BookOpen },
    { key: 'gaps', label: '3. Identify Gaps', count: gaps.length, icon: AlertCircle },
    { key: 'ideas', label: '4. Develop Idea', count: ideas.length, icon: Lightbulb },
    { key: 'methodology', label: '5. Methodology', count: 1, icon: Layers },
    { key: 'literature-review', label: '6. Literature Review', count: 1, icon: FileText },
    { key: 'citations', label: '7. Citations', count: citations.length, icon: BookmarkCheck },
    { key: 'export', label: '8. Export', count: 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Project Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                {project.research_type.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-500 font-medium">{project.domain} · {project.branch}</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{project.title}</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            {project.status}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">Research Objective</div>
          <p className="text-sm text-slate-700 leading-relaxed">{project.objective}</p>
        </div>

        {project.research_question && (
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1">
            <div className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Core Research Question</div>
            <p className="text-sm font-semibold text-indigo-950">{project.research_question}</p>
          </div>
        )}
      </div>

      {/* Workflow Navigation Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">Academic Research Workflow</h3>
        <p className="text-xs text-slate-500">Click any stage to navigate directly to its workspace section:</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {workflowStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <button
                key={stage.key}
                onClick={() => onNavigateTab(stage.key)}
                className="p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-indigo-600 shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  {stage.count > 0 && (
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {stage.count}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {stage.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Papers Indexed</div>
          <div className="text-2xl font-black text-slate-900">{papers.length}</div>
          <p className="text-[11px] text-slate-400">Integrated with Document AI vector database</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identified Gaps</div>
          <div className="text-2xl font-black text-amber-600">{gaps.length}</div>
          <p className="text-[11px] text-slate-400">Empirically backed by paper limitations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bibliographic Citations</div>
          <div className="text-2xl font-black text-emerald-600">{citations.length}</div>
          <p className="text-[11px] text-slate-400">APA, IEEE & BibTeX export ready</p>
        </div>
      </div>
    </div>
  );
};
