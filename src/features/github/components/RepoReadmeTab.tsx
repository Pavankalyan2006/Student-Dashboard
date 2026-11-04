import React, { useState } from 'react';
import { useGitHubReadme } from '../hooks/useGitHub';
import { FileText, Copy, Check, ExternalLink, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface RepoReadmeTabProps {
  repoId: string;
}

export const RepoReadmeTab: React.FC<RepoReadmeTabProps> = ({ repoId }) => {
  const { data: readme, isLoading, error, refetch } = useGitHubReadme(repoId);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!readme?.content) return;
    navigator.clipboard.writeText(readme.content);
    setCopied(true);
    toast.success('README markdown copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  // Safe markdown renderer for headings, code blocks, lists, quotes, inline code
  const renderSafeMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code blocks
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <div key={`code-${i}`} className="my-3 rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto text-xs font-mono text-emerald-400">
              <pre>{codeBlockContent.join('\n')}</pre>
            </div>
          );
          codeBlockContent = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      // Headings
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-2 mt-6 mb-3">
            {line.slice(2)}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-1.5 mt-5 mb-2.5">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-base font-bold text-slate-800 mt-4 mb-2">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-5 list-disc text-sm text-slate-700 my-1 leading-relaxed">
            {line.slice(2)}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-indigo-500 pl-4 py-1 my-3 bg-indigo-50/40 rounded-r text-sm text-slate-600 italic">
            {line.slice(2)}
          </blockquote>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-sm text-slate-700 my-1.5 leading-relaxed">
            {line}
          </p>
        );
      }
    }

    if (inCodeBlock && codeBlockContent.length > 0) {
      elements.push(
        <div key="code-end" className="my-3 rounded-xl bg-slate-950 p-4 border border-slate-800 overflow-x-auto text-xs font-mono text-emerald-400">
          <pre>{codeBlockContent.join('\n')}</pre>
        </div>
      );
    }

    return elements;
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Fetching repository README...</span>
      </div>
    );
  }

  if (error || !readme?.content) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
        <h4 className="text-base font-bold text-slate-800">README Not Available</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No README.md documentation file was found or accessible for this repository.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Readme Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-900">{readme.name}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
            {readme.path}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            {copied ? 'Copied' : 'Copy Markdown'}
          </button>
        </div>
      </div>

      {/* Readme Content Box */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-2xs font-sans prose max-w-none">
        {renderSafeMarkdown(readme.content)}
      </div>
    </div>
  );
};
