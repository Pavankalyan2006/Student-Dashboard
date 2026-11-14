import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, Terminal, ExternalLink, Printer } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

interface NoteViewerProps {
  content: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

export function NoteViewer({ content, onNavigate, className = '' }: NoteViewerProps) {
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    copyText(code);
    setCopiedCodeId(id);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`note-reader-content ${className}`}>
      {/* Print action toolbar button */}
      <div className="flex justify-end mb-4 print:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="h-8 text-xs text-[#475467] flex items-center gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / PDF Export
        </Button>
      </div>

      <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:text-[#101828] prose-p:text-[#344054] prose-p:leading-relaxed prose-li:text-[#344054] prose-strong:text-[#101828] prose-code:font-mono prose-code:text-[#2563EB] prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h2({ children, ...props }) {
              const text = String(children);
              const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return (
                <h2 id={id} className="text-xl font-bold text-[#101828] border-b border-[#E4E7EC] pb-2 mt-8 mb-4 scroll-mt-20" {...props}>
                  {children}
                </h2>
              );
            },
            h3({ children, ...props }) {
              const text = String(children);
              const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
              return (
                <h3 id={id} className="text-base font-semibold text-[#101828] mt-6 mb-3 scroll-mt-20" {...props}>
                  {children}
                </h3>
              );
            },
            h4({ children, ...props }) {
              return (
                <h4 className="text-sm font-semibold text-[#101828] mt-4 mb-2" {...props}>
                  {children}
                </h4>
              );
            },
            code({ node, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const codeString = String(children).replace(/\n$/, '');
              const isInline = !match && !codeString.includes('\n');

              if (isInline) {
                return (
                  <code className="text-xs font-mono text-[#091E42] bg-[#F2F4F7] px-1.5 py-0.5 rounded border border-[#E4E7EC]" {...props}>
                    {children}
                  </code>
                );
              }

              const language = match ? match[1] : 'text';
              const codeBlockId = `code_${Math.random().toString(36).substring(2, 7)}`;
              const isCopied = copiedCodeId === codeBlockId;

              return (
                <div className="relative my-4 rounded-lg overflow-hidden border border-[#D0D5DD] bg-[#1E293B] text-slate-100 shadow-xs">
                  {/* Code block header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#0F172A] border-b border-slate-700/60 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 uppercase font-medium">
                      <Terminal className="h-3.5 w-3.5 text-blue-400" />
                      {language}
                    </span>
                    <div className="flex items-center gap-2">
                      {onNavigate && ['cpp', 'c', 'java', 'python', 'javascript', 'sql'].includes(language.toLowerCase()) && (
                        <button
                          type="button"
                          onClick={() => onNavigate('/coding')}
                          className="hover:text-blue-300 transition-colors flex items-center gap-1 text-[11px]"
                          title="Open in Coding Lab"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Coding Lab
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyCode(codeString, codeBlockId)}
                        className="hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Code body */}
                  <pre className="p-4 text-xs font-mono overflow-x-auto leading-relaxed bg-[#1E293B] text-slate-100 m-0">
                    <code>{codeString}</code>
                  </pre>
                </div>
              );
            },
            blockquote({ children, ...props }) {
              return (
                <blockquote className="border-l-4 border-[#2563EB] bg-blue-50/40 p-3 my-4 rounded-r-lg text-xs text-[#344054] italic" {...props}>
                  {children}
                </blockquote>
              );
            },
            table({ children, ...props }) {
              return (
                <div className="overflow-x-auto my-4 rounded-lg border border-[#E4E7EC]">
                  <table className="w-full text-xs text-left border-collapse" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            th({ children, ...props }) {
              return (
                <th className="bg-[#F9FAFB] p-2.5 font-semibold text-[#101828] border-b border-[#E4E7EC]" {...props}>
                  {children}
                </th>
              );
            },
            td({ children, ...props }) {
              return (
                <td className="p-2.5 text-[#344054] border-b border-[#F2F4F7]" {...props}>
                  {children}
                </td>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
