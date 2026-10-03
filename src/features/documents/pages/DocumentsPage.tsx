import * as React from 'react';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentEmptyState } from '../components/DocumentEmptyState';
import { DocumentUploader } from '../components/DocumentUploader';
import { PageContainer, PageHeader } from '../../../components/layout/PageComponents';
import {
  UploadCloud,
  Search,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Files,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { DocumentListParams } from '../types/document';

export interface DocumentsPageProps {
  onNavigate: (path: string) => void;
}

export function DocumentsPage({ onNavigate }: DocumentsPageProps) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<DocumentListParams['filter']>('all');
  const [sort, setSort] = React.useState<DocumentListParams['sort']>('recent_upload');
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  const {
    data,
    isLoading,
    isError,
    toggleFavorite,
    deleteDocument,
    retryProcessing,
  } = useDocuments({
    search: search.trim() || undefined,
    filter,
    sort,
  });

  const documents = data?.items || [];

  const filterTabs = [
    { key: 'all', label: 'All' },
    { key: 'pdf', label: 'PDFs' },
    { key: 'document', label: 'Documents' },
    { key: 'favorites', label: 'Favorites' },
    { key: 'processing', label: 'Processing' },
    { key: 'ready', label: 'Ready' },
    { key: 'failed', label: 'Failed' },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="My Documents"
        description="Upload textbooks, notes, papers and study material and learn with AI."
        badge={
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Document AI Workspace
          </span>
        }
        actions={
          <Button
            size="sm"
            onClick={() => onNavigate('/documents/upload')}
            className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Document</span>
          </Button>
        }
      />

      {/* Search, Filter Tabs & Sort bar */}
      <div className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:max-w-md">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search documents by title, author, or tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#475467] font-medium shrink-0">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#D0D5DD] bg-white text-[#344054] focus:outline-none focus:border-[#2563EB]"
            >
              <option value="recent_upload">Recently uploaded</option>
              <option value="recent_open">Recently opened</option>
              <option value="name">Name (A-Z)</option>
              <option value="size">File size</option>
              <option value="status">Processing status</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap',
                filter === tab.key
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-white text-[#475467] border border-[#E4E7EC] hover:bg-slate-50 hover:text-[#101828]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid / List Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#2563EB] mb-3" />
          <p className="text-xs font-medium text-[#475467]">Loading your study documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <DocumentEmptyState
          isFilterActive={Boolean(search || filter !== 'all')}
          onClearFilters={() => {
            setSearch('');
            setFilter('all');
          }}
          onUploadClick={() => onNavigate('/documents/upload')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onOpen={(id) => onNavigate(`/documents/${id}`)}
              onAskAi={(id) => onNavigate(`/documents/${id}/chat`)}
              onGenerateSummary={(id) => onNavigate(`/documents/${id}/summary`)}
              onGenerateNotes={(id) => onNavigate(`/documents/${id}/notes`)}
              onGenerateQuiz={(id) =>
                onNavigate(
                  `/quiz/create?source_type=DOCUMENT&sourceId=${id}&topic=${encodeURIComponent(doc.title)}`
                )
              }
              onToggleFavorite={toggleFavorite}
              onDelete={deleteDocument}
              onRetryProcessing={retryProcessing}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
