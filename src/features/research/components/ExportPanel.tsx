import React, { useState } from 'react';
import { researchApi } from '../api/researchApi';
import { Download, FileText, CheckCircle2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ExportPanelProps {
  projectId: string;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ projectId }) => {
  const [exportType, setExportType] = useState<'proposal' | 'evidence_matrix' | 'bibtex'>('proposal');
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFetchPreview = async () => {
    setIsLoading(true);
    try {
      const res = await researchApi.exportResearch(projectId, exportType, 'markdown');
      setPreviewContent(res.content);
    } catch (err: any) {
      toast.error('Failed to load export preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!previewContent) return;
    const ext = exportType === 'bibtex' ? 'bib' : 'md';
    const mime = exportType === 'bibtex' ? 'text/plain' : 'text/markdown';
    const blob = new Blob([previewContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research_${exportType}_${projectId}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded successfully');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Export Hub</h2>
          <p className="text-xs text-slate-500">
            Export academic proposals, evidence matrices, and bibliography files formatted for submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={exportType}
            onChange={(e) => {
              setExportType(e.target.value as any);
              setPreviewContent('');
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="proposal">Formal Research Proposal (Markdown)</option>
            <option value="evidence_matrix">Structured Evidence Matrix (Markdown)</option>
            <option value="bibtex">Bibliography File (.bib)</option>
          </select>

          <button
            onClick={handleFetchPreview}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            {isLoading ? 'Generating Preview...' : 'Generate Preview'}
          </button>
        </div>
      </div>

      {previewContent ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Document Preview ({exportType.replace('_', ' ')})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Content
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-[500px] overflow-y-auto leading-relaxed select-all">
            {previewContent}
          </pre>
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">Ready to Compile Export</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Select the desired document format above and click "Generate Preview" to review and download.
          </p>
        </div>
      )}
    </div>
  );
};
