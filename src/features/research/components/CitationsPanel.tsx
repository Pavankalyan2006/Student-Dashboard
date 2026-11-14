import React, { useState } from 'react';
import { useResearchCitations } from '../hooks/useResearch';
import { researchApi } from '../api/researchApi';
import { CitationStyle } from '../types';
import { BookmarkCheck, Copy, Check, Download, FileText, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

interface CitationsPanelProps {
  projectId: string;
}

export const CitationsPanel: React.FC<CitationsPanelProps> = ({ projectId }) => {
  const { data: citations = [], isLoading } = useResearchCitations(projectId);
  const [activeStyle, setActiveStyle] = useState<CitationStyle>('APA');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    copyText(text);
    setCopiedId(id);
    toast.success('Citation copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadBibTeX = async () => {
    try {
      const bibtex = await researchApi.exportResearch(projectId, 'bibtex', 'text');
      const blob = new Blob([bibtex.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citations_${projectId}.bib`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('BibTeX file downloaded');
    } catch (err: any) {
      toast.error('Failed to export BibTeX');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Citation & Bibliography Management</h2>
          <p className="text-xs text-slate-500">
            Export structured references formatted to standard academic specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Style selector */}
          <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200">
            {(['APA', 'IEEE', 'MLA'] as CitationStyle[]).map((st) => (
              <button
                key={st}
                onClick={() => setActiveStyle(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeStyle === st
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleDownloadBibTeX}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export BibTeX (.bib)
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading citations...
        </div>
      ) : citations.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <BookmarkCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Citations Stored</h4>
          <p className="text-xs text-slate-500">Save research papers in the Papers tab to automatically generate citations.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {citations.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all space-y-3 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                      {c.citation_style} FORMAT
                    </span>
                    {c.metadata?.doi && (
                      <span className="text-[10px] font-mono text-slate-400">
                        https://doi.org/{c.metadata.doi}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-800 font-serif leading-relaxed select-all">
                    {c.formatted_citation}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(c.formatted_citation, c.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0 cursor-pointer"
                  title="Copy citation"
                >
                  {copiedId === c.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {c.bibtex && (
                <div className="pt-2 border-t border-slate-100">
                  <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700 overflow-x-auto select-all">
                    {c.bibtex}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
