import * as React from 'react';
import { Files, UploadCloud } from 'lucide-react';
import { Button } from '../../../components/ui/button';

export interface DocumentEmptyStateProps {
  onUploadClick: () => void;
  isFilterActive?: boolean;
  onClearFilters?: () => void;
}

export function DocumentEmptyState({
  onUploadClick,
  isFilterActive,
  onClearFilters,
}: DocumentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-300 bg-white">
      <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
        <Files className="h-6 w-6" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900">
        {isFilterActive ? 'No matching documents found' : 'No documents yet'}
      </h3>
      <p className="text-xs text-slate-600 mt-1 max-w-sm">
        {isFilterActive
          ? 'Try adjusting your search terms or filter selections.'
          : 'Upload your textbooks, lecture notes, syllabus guides, or research papers to unlock grounded AI study tools.'}
      </p>

      <div className="mt-4 flex items-center gap-2">
        {isFilterActive && onClearFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear Filters
          </Button>
        )}
        <Button
          size="sm"
          onClick={onUploadClick}
          className="gap-1.5 bg-blue-600 hover:bg-blue-700"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </div>
    </div>
  );
}
