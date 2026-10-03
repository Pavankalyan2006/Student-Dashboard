import React, { useState } from 'react';
import { useLiteratureReview, useGenerateLiteratureReview } from '../hooks/useResearch';
import { researchApi } from '../api/researchApi';
import { LiteratureReview } from '../types';
import { Sparkles, FileText, Save, Check, RefreshCw, Layers, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface LiteratureReviewPanelProps {
  projectId: string;
}

export const LiteratureReviewPanel: React.FC<LiteratureReviewPanelProps> = ({ projectId }) => {
  const { data: review, isLoading } = useLiteratureReview(projectId);
  const generateMutation = useGenerateLiteratureReview(projectId);

  const [organization, setOrganization] = useState<'thematic' | 'chronological' | 'methodological'>('thematic');
  const [isEditing, setIsEditing] = useState(false);
  const [editedFindings, setEditedFindings] = useState('');

  const handleGenerate = () => {
    generateMutation.mutate(organization);
  };

  const handleSave = async () => {
    if (!review) return;
    try {
      await researchApi.saveLiteratureReview(projectId, {
        ...review,
        synthesized_findings: editedFindings || review.synthesized_findings,
      });
      setIsEditing(false);
      toast.success('Literature review draft saved');
    } catch (err: any) {
      toast.error('Failed to save draft');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Literature Review Assistant</h2>
          <p className="text-xs text-slate-500">
            Synthesize peer-reviewed papers into structured thematic and methodological reviews with verified citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={organization}
            onChange={(e) => setOrganization(e.target.value as any)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="thematic">Thematic Organization</option>
            <option value="methodological">Methodological Organization</option>
            <option value="chronological">Chronological Organization</option>
          </select>

          <button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {generateMutation.isPending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {review ? 'Regenerate Review' : 'Generate Literature Review'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading literature review...
        </div>
      ) : !review ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Literature Review Generated</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Generate Literature Review" above to synthesize saved papers into chapter-ready outlines with traceable citations.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                {review.organization_style} Organization
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">{review.title}</h3>
            </div>

            <button
              onClick={() => {
                if (isEditing) handleSave();
                else {
                  setEditedFindings(review.synthesized_findings);
                  setIsEditing(true);
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {isEditing ? (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> Edit Synthesis
                </>
              )}
            </button>
          </div>

          {/* Table of Contents / Outline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Standard Academic Outline
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
              {review.outline.map((sec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span>{sec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Sections */}
          <div className="space-y-4">
            {review.sections.map((section, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{section.heading}</h4>
                  <div className="flex gap-1">
                    {section.citations.map((cite, cIdx) => (
                      <span
                        key={cIdx}
                        className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-mono rounded font-bold"
                      >
                        {cite}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>

          {/* Synthesized Findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Comprehensive Synthesized Findings
            </h4>
            {isEditing ? (
              <textarea
                rows={6}
                value={editedFindings}
                onChange={(e) => setEditedFindings(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                {review.synthesized_findings}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
