import * as React from 'react';
import { Send, StopCircle, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { documentsApi } from '../../documents/api/documentsApi';

export function AIComposer({
  input,
  setInput,
  isGenerating,
  activeMode = 'EXPLAIN',
  onModeChange,
  onSend,
  onStop,
  onSelectPrompt,
  onAttachDocument,
}: {
  input: string;
  setInput: (val: string) => void;
  isGenerating: boolean;
  activeMode?: string;
  onModeChange?: (mode: string) => void;
  onSend: (text?: string, mode?: string) => void;
  onStop: () => void;
  onSelectPrompt: (prompt: string) => void;
  /** Called with the id of the uploaded document so it can be added to the tutor context. */
  onAttachDocument?: (documentId: string, name: string) => void;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState<string>(activeMode);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeMode) setSelectedMode(activeMode);
  }, [activeMode]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(input, selectedMode);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend(input, selectedMode);
    }
  };

  // Uploads the file to Documents and adds it to the tutor's context; nothing is claimed as
  // attached unless the upload succeeded.
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Could not read the file'));
        reader.readAsDataURL(file);
      });
      const doc = await documentsApi.uploadDocument({
        title: file.name,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        contentBase64: dataUrl,
      });
      onAttachDocument?.(doc.id, file.name);
      toast.success(`Uploaded "${file.name}" to Documents and added it to this chat's context`);
    } catch (err: any) {
      toast.error(`Could not attach "${file.name}": ${err?.message || 'upload failed'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const suggestedPills = [
    'Explain binary search tree balancing',
    'Derive Banker’s Safety Algorithm step-by-step',
    'Generate an Operating Systems exam revision quiz',
    'Help me debug this pointer segmentation fault',
  ];

  const modes = [
    { label: 'Explain', id: 'EXPLAIN' },
    { label: 'Step-by-Step', id: 'STEP_BY_STEP' },
    { label: 'Solve Problem', id: 'SOLVE' },
    { label: 'Exam Prep', id: 'EXAM_PREP' },
    { label: 'Coding Tutor', id: 'CODING' },
    { label: 'Interview', id: 'INTERVIEW' },
    { label: 'Revision', id: 'REVISION' },
  ];

  const handleModeSelect = (id: string) => {
    setSelectedMode(id);
    onModeChange?.(id);
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 space-y-2.5">
      {/* AI Mode Selector */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Teaching Mode:
          </span>
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeSelect(m.id)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedMode === m.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick suggestions if composer is empty */}
      {!input && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Quick Prompts:
          </span>
          {suggestedPills.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPrompt(p)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors shrink-0 border border-slate-200 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Message the AI tutor"
          placeholder="Ask your AI Tutor about engineering concepts, problem steps, exam preparation, or code debugging..."
          rows={2}
          className="w-full resize-none bg-transparent px-2 py-1 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.docx,.py,.ts,.cpp,.java"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label={isUploading ? 'Uploading attachment' : 'Attach study material, PDF, or code file'}
            title="Attach study material, PDF, or code file"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Send / Stop button */}
          {isGenerating ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onStop}
              className="h-8 w-8 text-rose-600 hover:bg-rose-50 border-rose-200 shrink-0"
              title="Stop Generation"
            >
              <StopCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ai"
              size="icon"
              disabled={!input.trim()}
              onClick={() => onSend(input, selectedMode)}
              className="h-8 w-8 shrink-0"
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span>Enter to send · Shift+Enter for new line</span>
        <span className="font-mono text-[10px]">Context-Aware · Real-Time Persistence</span>
      </div>
    </div>
  );
}
