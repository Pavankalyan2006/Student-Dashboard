import React from 'react';
import { useResearchIdeas, useGenerateIdeas } from '../hooks/useResearch';
import { ResearchIdea } from '../types';
import { Lightbulb, Sparkles, RefreshCw, Cpu, Layers, Database, ArrowRight } from 'lucide-react';

interface IdeasPanelProps {
  projectId: string;
}

export const IdeasPanel: React.FC<IdeasPanelProps> = ({ projectId }) => {
  const { data: ideas = [], isLoading } = useResearchIdeas(projectId);
  const generateMutation = useGenerateIdeas(projectId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Idea Generator</h2>
          <p className="text-xs text-slate-500">
            Formulate novel B.Tech research project ideas synthesizing literature gaps with your practical engineering skills.
          </p>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
        >
          {generateMutation.isPending ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          Generate Research Ideas
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading ideas...
        </div>
      ) : ideas.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Lightbulb className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Research Ideas Generated</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Generate Research Ideas" to synthesize actionable project ideas from current literature gaps.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 transition-all space-y-4 shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                  Proposed Research Project Idea
                </span>
                <h3 className="text-base font-bold text-slate-900">{idea.title}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Problem & Motivation
                  </div>
                  <p className="text-slate-800 leading-relaxed">{idea.problem}</p>
                  <p className="text-slate-600 mt-1 italic">{idea.motivation}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Proposed Method & Architecture
                  </div>
                  <p className="text-slate-800 leading-relaxed">{idea.proposed_approach}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-600 uppercase text-[10px]">Dataset Options</div>
                  <p className="text-slate-700">{idea.dataset_possibilities}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-600 uppercase text-[10px]">Evaluation Plan</div>
                  <p className="text-slate-700">{idea.evaluation_approach}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="font-bold text-slate-600 uppercase text-[10px]">Expected Contribution</div>
                  <p className="text-slate-700">{idea.expected_contribution}</p>
                </div>
              </div>

              {/* Technologies */}
              {idea.technologies && idea.technologies.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Tech Stack:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {idea.technologies.map((t, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
