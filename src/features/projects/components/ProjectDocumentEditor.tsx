import React, { useState, useEffect } from 'react';
import { ProjectDocument, ProjectDocumentType } from '../types/project';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import {
  Save,
  Sparkles,
  Download,
  Eye,
  Edit3,
  FileText,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectDocumentEditorProps {
  document?: ProjectDocument | null;
  selectedType: ProjectDocumentType;
  onSave: (doc: {
    id?: string;
    document_type: ProjectDocumentType;
    title: string;
    content: string;
    status: 'DRAFT' | 'REVIEW' | 'FINAL';
  }) => Promise<any>;
  onGenerateAI: (type: ProjectDocumentType, customInstructions?: string) => Promise<any>;
  isGenerating?: boolean;
}

export const ProjectDocumentEditor: React.FC<ProjectDocumentEditorProps> = ({
  document,
  selectedType,
  onSave,
  onGenerateAI,
  isGenerating = false,
}) => {
  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || '');
  const [status, setStatus] = useState<'DRAFT' | 'REVIEW' | 'FINAL'>(document?.status || 'DRAFT');
  const [mode, setMode] = useState<'edit' | 'preview'>('preview');
  const [isSaving, setIsSaving] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setStatus(document.status);
    } else {
      setTitle(`${selectedType.replace('_', ' ')} Document`);
      setContent('');
      setStatus('DRAFT');
    }
  }, [document, selectedType]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error('Document content cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        id: document?.id,
        document_type: selectedType,
        title: title || `${selectedType} Document`,
        content,
        status,
      });
      toast.success('Document saved successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'project-document'}.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded Markdown document');
  };

  const triggerGenerate = async () => {
    setShowAiModal(false);
    try {
      const generated = await onGenerateAI(selectedType, customInstructions);
      if (generated) {
        setTitle(generated.title);
        setContent(generated.content);
        setStatus(generated.status);
        setMode('preview');
        toast.success(`Generated ${selectedType.replace('_', ' ')} document!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate document');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col h-[750px] shadow-xs">
      {/* Editor Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full text-base font-bold text-slate-900 dark:text-slate-100 bg-transparent border-0 focus:outline-hidden focus:ring-0 px-0"
          />
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {selectedType.replace('_', ' ')}
            </span>
            {document?.version && (
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400 font-mono">
                v{document.version}
              </span>
            )}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5"
            >
              <option value="DRAFT">Draft</option>
              <option value="REVIEW">Under Review</option>
              <option value="FINAL">Final Sign-off</option>
            </select>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setMode('edit')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'edit'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                mode === 'preview'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* AI Generator Button */}
          <button
            onClick={() => setShowAiModal(true)}
            disabled={isGenerating}
            className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            )}
            <span>{content ? 'Regenerate with AI' : 'Generate with AI'}</span>
          </button>

          {/* Export Button */}
          {content && (
            <button
              onClick={handleExport}
              title="Download as Markdown"
              className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor Content Body */}
      <div className="flex-1 overflow-y-auto p-5">
        {mode === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your document content in Markdown (headings, lists, code blocks, tables)..."
            className="w-full h-full font-mono text-xs sm:text-sm bg-transparent border-0 focus:outline-hidden focus:ring-0 resize-none text-slate-800 dark:text-slate-200 leading-relaxed"
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            {content.trim() ? (
              <MarkdownContent content={content} />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
                  No Content Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Switch to Edit mode to write manually, or let our AI mentor generate a grounded draft
                  based on your actual project architecture and modules.
                </p>
                <button
                  onClick={() => setShowAiModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {selectedType.replace('_', ' ')} with AI</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Prompt Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Generate {selectedType.replace('_', ' ')}
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The AI will compile this document using your actual project objectives, modules, tech stack,
              and architecture. You can also provide special emphasis instructions below:
            </p>

            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g. Focus on IEEE format, emphasize low-latency inference, or provide extensive unit test tables..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-hidden"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={triggerGenerate}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
