import React from 'react';
import { ExternalLink, BookOpen, GitBranch, FileCode, CheckCircle2, Bookmark } from 'lucide-react';
import { SourceProvenanceItem } from '../types';

interface SourceCitationBadgeProps {
  citationNumber: number;
  source?: SourceProvenanceItem;
  onClick?: () => void;
}

export const SourceCitationBadge: React.FC<SourceCitationBadgeProps> = ({
  citationNumber,
  source,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      title={source ? `${source.title} (${source.page_or_path || source.source_type})` : `Citation [${citationNumber}]`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold font-mono transition-colors shadow-xs"
    >
      <span>[{citationNumber}]</span>
      {source && (
        <span className="max-w-[120px] truncate text-[11px] font-normal text-indigo-900">
          {source.title}
        </span>
      )}
    </button>
  );
};
