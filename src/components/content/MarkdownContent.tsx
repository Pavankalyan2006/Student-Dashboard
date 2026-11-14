import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { cn } from '../../lib/utils';

export function MarkdownContent({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed',
        'prose-headings:font-bold prose-headings:text-slate-900',
        'prose-h1:text-xl prose-h2:text-lg prose-h3:text-base',
        'prose-p:text-slate-700 prose-p:my-2',
        'prose-code:font-mono prose-code:text-blue-600 prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[11px]',
        'prose-pre:bg-navy-900 prose-pre:text-slate-100 prose-pre:p-3 prose-pre:rounded-lg',
        'prose-table:border-collapse prose-th:border prose-th:border-slate-200 prose-th:p-2 prose-th:bg-slate-50',
        'prose-td:border prose-td:border-slate-200 prose-td:p-2',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
