import * as React from 'react';
import { Send, StopCircle, Paperclip, Mic, Sparkles } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';

export function AIComposer({
  input,
  setInput,
  isGenerating,
  onSend,
  onStop,
  onSelectPrompt,
}: {
  input: string;
  setInput: (val: string) => void;
  isGenerating: boolean;
  onSend: (text?: string, mode?: string) => void;
  onStop: () => void;
  onSelectPrompt: (prompt: string) => void;
}) {
  const [selectedMode, setSelectedMode] = React.useState<string>('Auto');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend(input, selectedMode);
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSend(input, selectedMode);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success(`Attached "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      setInput(`${input ? input + ' ' : ''}[Attached document: ${file.name}]`);
    }
  };

  const suggestedPills = [
    'Explain binary search tree balancing',
    'Create an Operating Systems quiz',
    'Show me my weak DSA topics',
    'Generate a 7-day placement plan',
  ];

  const modes = ['Auto', 'Learning', 'Coding', 'Research', 'Project', 'Career'];

  return (
    <div className="border-t border-[#E4E7EC] bg-white p-3 space-y-2.5">
      {/* AI Mode Selector */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            AI Mode:
          </span>
          {modes.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMode(m)}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all shrink-0 cursor-pointer ${
                selectedMode === m
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <span className="hidden sm:inline-block text-[10px] text-slate-400 font-mono">
          {selectedMode === 'Auto' ? 'Master Orchestrator Active' : `${selectedMode} Specialist Mode`}
        </span>
      </div>

      {/* Quick suggestions if composer is empty */}
      {!input && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
            Prompts:
          </span>
          {suggestedPills.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelectPrompt(p)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors shrink-0 border border-slate-200 cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input container */}
      <div className="relative flex items-end gap-2 p-2 rounded-2xl border border-[#E4E7EC] bg-slate-50/70 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-inner">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about your B.Tech learning, algorithms, syllabus, or capstone..."
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
            title="Attach textbook, PDF, or code file"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Voice input button placeholder */}
          <button
            type="button"
            onClick={() => toast.info('Voice input module scheduled for Phase 11')}
            title="Voice input (Speech to Text)"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 cursor-pointer transition-colors"
          >
            <Mic className="h-4 w-4" />
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
        <span className="font-mono text-[10px]">Gemini 2.5 Flash · Safe Tool Execution</span>
      </div>
    </div>
  );
}
