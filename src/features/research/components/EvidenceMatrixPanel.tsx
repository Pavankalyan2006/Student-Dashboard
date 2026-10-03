import React from 'react';
import { useEvidenceMatrix } from '../hooks/useResearch';
import { EvidenceMatrixRow } from '../types';
import { researchApi } from '../api/researchApi';
import { Table, Download, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface EvidenceMatrixPanelProps {
  projectId: string;
}

export const EvidenceMatrixPanel: React.FC<EvidenceMatrixPanelProps> = ({ projectId }) => {
  const { data: matrix = [], isLoading } = useEvidenceMatrix(projectId);

  const handleExport = async () => {
    try {
      const res = await researchApi.exportResearch(projectId, 'evidence_matrix', 'markdown');
      const blob = new Blob([res.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evidence_matrix_${projectId}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Evidence matrix exported');
    } catch (err: any) {
      toast.error('Failed to export matrix');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Structured Evidence Matrix</h2>
          <p className="text-xs text-slate-500">
            Traceable mapping linking research questions, methodology, datasets, and empirical findings.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Export Matrix (Markdown)
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading evidence matrix...
        </div>
      ) : matrix.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Table className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Evidence Matrix Generated</h4>
          <p className="text-xs text-slate-500">Add research papers to populate the empirical evidence matrix.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                  <th className="p-3.5">Paper / Year</th>
                  <th className="p-3.5">Inquiry Question</th>
                  <th className="p-3.5">Methodology</th>
                  <th className="p-3.5">Dataset</th>
                  <th className="p-3.5">Empirical Findings</th>
                  <th className="p-3.5">Limitations / Gap</th>
                  <th className="p-3.5">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {matrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold max-w-[160px]">
                      <div>{row.paper_title}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {row.authors} ({row.year})
                      </div>
                    </td>
                    <td className="p-3.5 text-indigo-900 font-medium max-w-[160px]">{row.research_question}</td>
                    <td className="p-3.5 max-w-[140px]">{row.method}</td>
                    <td className="p-3.5 max-w-[130px] font-mono text-[11px]">{row.dataset}</td>
                    <td className="p-3.5 max-w-[200px] text-slate-700">{row.findings}</td>
                    <td className="p-3.5 max-w-[180px] text-amber-900">{row.research_gap}</td>
                    <td className="p-3.5 font-mono text-[10px] text-slate-500 max-w-[120px] truncate">{row.evidence_source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
