import * as React from 'react';
import { useDocuments, useFolders, useDocumentStats } from '../hooks/useDocuments';
import { DocumentCard } from '../components/DocumentCard';
import { DocumentListView } from '../components/DocumentListView';
import { DocumentEmptyState } from '../components/DocumentEmptyState';
import { DocumentUploader } from '../components/DocumentUploader';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { MoveToFolderModal } from '../components/MoveToFolderModal';
import { EditDocumentModal } from '../components/EditDocumentModal';
import { DocumentVersionsModal } from '../components/DocumentVersionsModal';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { LinkToLabModal } from '../components/LinkToLabModal';
import { PageContainer, PageHeader } from '../../../components/layout/PageComponents';
import { documentsApi } from '../api/documentsApi';
import {
  AIFetchDocumentResult,
  DocumentCardData,
  DocumentListParams,
  DOCUMENT_CATEGORIES,
  DocumentFolder,
} from '../types/document';
import {
  UploadCloud,
  Search,
  Plus,
  RefreshCw,
  Files,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  BookOpen,
  X,
  FileText,
  Folder,
  FolderPlus,
  LayoutGrid,
  List,
  HardDrive,
  Filter,
  Layers,
  ChevronRight,
  Trash2,
  FolderSymlink,
  Database,
  PieChart,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export interface DocumentsPageProps {
  onNavigate: (path: string) => void;
}

type ActiveTab = 'all' | 'folders' | 'recent' | 'favorites' | 'processing' | 'storage';

export function DocumentsPage({ onNavigate }: DocumentsPageProps) {
  // Navigation & Active View State
  const [activeTab, setActiveTab] = React.useState<ActiveTab>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [currentFolder, setCurrentFolder] = React.useState<DocumentFolder | null>(null);

  // Filters & Search
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [sort, setSort] = React.useState<DocumentListParams['sort']>('recent_upload');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Gemini AI Semantic Search State
  const [aiQuery, setAiQuery] = React.useState('');
  const [isAiLoading, setIsAiLoading] = React.useState(false);
  const [aiResult, setAiResult] = React.useState<AIFetchDocumentResult | null>(null);

  // Modals State
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false);
  const [moveModalDoc, setMoveModalDoc] = React.useState<DocumentCardData | null>(null);
  const [editModalDoc, setEditModalDoc] = React.useState<DocumentCardData | null>(null);
  const [versionsModalDoc, setVersionsModalDoc] = React.useState<DocumentCardData | null>(null);
  const [previewModalDoc, setPreviewModalDoc] = React.useState<DocumentCardData | null>(null);
  const [linkLabModalDoc, setLinkLabModalDoc] = React.useState<DocumentCardData | null>(null);

  // Hooks & Queries
  const { stats, refetch: refetchStats } = useDocumentStats();
  const { folders, isLoading: isFoldersLoading, deleteFolder } = useFolders();

  // Compute filter params for documents API
  const listParams: DocumentListParams = React.useMemo(() => {
    const params: DocumentListParams = {
      search: search.trim() || undefined,
      sort,
    };

    if (activeTab === 'recent') {
      params.filter = 'recent';
    } else if (activeTab === 'favorites') {
      params.filter = 'favorites';
    } else if (activeTab === 'processing') {
      params.filter = 'processing';
    }

    if (currentFolder) {
      params.folder_id = currentFolder.id;
    }

    if (selectedCategory !== 'all') {
      params.category = selectedCategory;
    }

    if (statusFilter !== 'all') {
      params.filter = statusFilter as any;
    }

    return params;
  }, [search, sort, activeTab, currentFolder, selectedCategory, statusFilter]);

  const {
    data,
    isLoading: isDocsLoading,
    toggleFavorite,
    deleteDocument,
    retryProcessing,
    indexInKnowledge,
    refetch: refetchDocs,
  } = useDocuments(listParams);

  const rawDocuments = data?.items || [];

  // Filter or show AI matched documents if AI search is active
  const displayedDocuments = aiResult ? aiResult.matching_documents : rawDocuments;

  // Gemini AI Search handler
  const handleAiSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = aiQuery.trim();
    if (!query) {
      toast.error('Please enter a topic or question to search with Gemini');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await documentsApi.aiFetchDocuments(query);
      setAiResult(res);
      toast.success('Gemini fetched relevant documents & synthesis');
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch documents with Gemini');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearAiSearch = () => {
    setAiResult(null);
    setAiQuery('');
  };

  // Download document handler
  const handleDownload = (documentId: string, filename: string) => {
    const downloadUrl = `/api/v1/documents/${documentId}/download`;
    const a = window.document.createElement('a');
    a.href = downloadUrl;
    a.download = filename || 'document';
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    toast.success(`Download started for ${filename}`);
  };

  // Handle folder deletion
  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the folder "${folderName}"? Documents inside will be kept safely in your unfiled collection.`
      )
    ) {
      return;
    }

    try {
      await deleteFolder({ folderId, actionOnDocuments: 'unfile' });
      if (currentFolder?.id === folderId) {
        setCurrentFolder(null);
      }
    } catch {
      // Handled by hook toast
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title="Documents"
        description="Centralized academic document vault. Store, organize into folders, preview, version, and learn with AI."
        badge={
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Academic Vault & DMS
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-1.5 text-xs text-slate-700 border-slate-200 hover:bg-slate-50"
            >
              <FolderPlus className="h-4 w-4 text-blue-600" />
              <span>New Folder</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsUploadModalOpen(true)}
              className="gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-xs shadow-xs"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Upload Document</span>
            </Button>
          </div>
        }
      />

      {/* Real Statistics Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {/* Total Documents */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Documents</span>
            <Files className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats?.total_documents ?? 0}</p>
          <span className="text-[10px] text-slate-400">In student repository</span>
        </div>

        {/* Total Folders */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">My Folders</span>
            <Folder className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats?.total_folders ?? folders.length}</p>
          <span className="text-[10px] text-slate-400">Curriculum subjects & labs</span>
        </div>

        {/* Recent Uploads (7 Days) */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Recent (7 Days)</span>
            <Clock className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats?.recent_uploads_count ?? 0}</p>
          <span className="text-[10px] text-slate-400">Recently uploaded</span>
        </div>

        {/* Awaiting Processing */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Processing</span>
            <RefreshCw className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">{stats?.documents_awaiting_processing ?? 0}</p>
          <span className="text-[10px] text-slate-400">Queued or chunking</span>
        </div>

        {/* Storage Quota Gauge */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Storage Used</span>
            <HardDrive className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-xl font-bold text-slate-900">
            {stats?.storage_used_mb ?? 0} <span className="text-xs font-normal text-slate-500">/ {stats?.storage_limit_mb ?? 500} MB</span>
          </p>
          {/* Real Storage Quota Gauge */}
          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mt-1.5">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all"
              style={{ width: `${Math.min(stats?.storage_usage_percentage ?? 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Gemini AI Smart Search / Fetch Bar */}
      <div className="mb-6 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-4 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                Gemini Semantic Document Search & Synthesis
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded-full font-medium">
                  gemini-flash-lite
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Ask a concept, theorem, or question to semantically fetch and synthesize answers across all your study materials.
              </p>
            </div>
          </div>
          {aiResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAiSearch}
              className="text-xs h-7 text-slate-600 gap-1 border-slate-200"
            >
              <X className="h-3 w-3" />
              <span>Reset Search</span>
            </Button>
          )}
        </div>

        <form onSubmit={handleAiSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-blue-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="e.g. Which document explains CPU scheduling? What are the Coffman deadlock conditions?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-blue-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <Button
            type="submit"
            size="sm"
            disabled={isAiLoading || !aiQuery.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 rounded-xl px-4 shrink-0 shadow-xs text-xs"
          >
            {isAiLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Fetching with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask Gemini</span>
              </>
            )}
          </Button>
        </form>

        {/* Gemini AI Grounded Answer Banner */}
        {aiResult && (
          <div className="mt-4 pt-4 border-t border-blue-100/80 animate-in fade-in duration-300">
            <div className="rounded-xl bg-white border border-blue-100 p-4 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Gemini Grounded Answer for: &ldquo;{aiResult.query}&rdquo;
                </span>
                <span className="text-[10px] text-slate-400">
                  {aiResult.matching_documents.length} source(s) identified
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line mb-3">
                {aiResult.answer}
              </p>

              {/* Citations */}
              {aiResult.citations && aiResult.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                    Source Citations:
                  </span>
                  {aiResult.citations.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => onNavigate(`/documents/${c.document_id}`)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <BookOpen className="h-3 w-3 text-slate-400" />
                      <span>{c.document_title}</span>
                      <span className="text-slate-400 font-mono text-[10px]">p.{c.page_number}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-2 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('all');
              setCurrentFolder(null);
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'all' && !currentFolder
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Files className="h-3.5 w-3.5" />
            <span>All Documents</span>
            <span className="text-[10px] opacity-80">({stats?.total_documents ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('folders')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'folders' || currentFolder
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Folder className="h-3.5 w-3.5" />
            <span>My Folders</span>
            <span className="text-[10px] opacity-80">({folders.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('recent');
              setCurrentFolder(null);
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'recent'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Recent</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('favorites');
              setCurrentFolder(null);
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'favorites'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Star className="h-3.5 w-3.5" />
            <span>Starred</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('processing');
              setCurrentFolder(null);
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'processing'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Processing Status</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('storage');
              setCurrentFolder(null);
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap',
              activeTab === 'storage'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <PieChart className="h-3.5 w-3.5" />
            <span>Storage Overview</span>
          </button>
        </div>

        {/* View mode toggle (Grid vs List) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-md text-xs transition-colors cursor-pointer',
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            )}
            title="Grid View"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-md text-xs transition-colors cursor-pointer',
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-700'
            )}
            title="List View"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Folder Breadcrumb when inside a folder */}
      {currentFolder && (
        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
          <button
            onClick={() => {
              setCurrentFolder(null);
              setActiveTab('folders');
            }}
            className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
          >
            Folders
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-blue-400" />
          <div className="flex items-center gap-2 flex-1">
            <div
              className="h-5 w-5 rounded-md flex items-center justify-center text-white"
              style={{ backgroundColor: currentFolder.color || '#2563EB' }}
            >
              <Folder className="h-3 w-3" />
            </div>
            <span className="text-xs font-bold text-slate-900">{currentFolder.name}</span>
            {currentFolder.description && (
              <span className="text-[11px] text-slate-500">· {currentFolder.description}</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentFolder(null)}
            className="h-7 text-xs text-blue-700"
          >
            Back to All Folders
          </Button>
        </div>
      )}

      {/* Storage Overview Tab Content */}
      {activeTab === 'storage' && (
        <div className="space-y-4 mb-6 animate-in fade-in">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-indigo-600" />
              Academic Storage Allocation & Quota Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Each student is allocated a 500 MB high-speed cloud storage quota for academic PDFs, laboratory manuals, textbooks, and assignment archives.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  {stats?.storage_used_mb ?? 0} MB used of {stats?.storage_limit_mb ?? 500} MB
                </span>
                <span className="font-bold text-indigo-600">{stats?.storage_usage_percentage ?? 0}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${Math.min(stats?.storage_usage_percentage ?? 0, 100)}%` }}
                />
              </div>
            </div>

            {/* Category Breakdown Table */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-700 mb-3">Storage Consumption by Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(stats?.category_breakdown || {}).map(([cat, count]) => (
                  <div
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveTab('all');
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{cat}</p>
                      <p className="text-[11px] text-slate-500">{count} document(s)</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Folders Tab Content */}
      {activeTab === 'folders' && !currentFolder && (
        <div className="space-y-4 mb-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Folders</h3>
              <p className="text-xs text-slate-500">
                Organize your course materials by semester, subject, or laboratory
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsCreateFolderOpen(true)}
              className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>Create Folder</span>
            </Button>
          </div>

          {isFoldersLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading your folders...</div>
          ) : folders.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-white space-y-3">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Folder className="h-6 w-6" />
              </div>
              <p className="text-xs font-semibold text-slate-900">No folders created yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Create folders like &ldquo;Operating Systems&rdquo;, &ldquo;Semester 4&rdquo;, or &ldquo;Software Testing&rdquo; to group your documents.
              </p>
              <Button
                size="sm"
                onClick={() => setIsCreateFolderOpen(true)}
                className="text-xs bg-blue-600 text-white gap-1.5"
              >
                <FolderPlus className="h-3.5 w-3.5" />
                <span>Create Your First Folder</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {folders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setCurrentFolder(f)}
                  className="group relative flex flex-col justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: f.color || '#2563EB' }}
                      >
                        <Folder className="h-5 w-5" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(f.id, f.name);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                        title="Delete Folder"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {f.name}
                    </h4>
                    {f.description && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {f.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{f.document_count || 0} document(s)</span>
                    <span className="text-blue-600 font-medium group-hover:underline flex items-center gap-1">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar for Documents */}
      {activeTab !== 'storage' && (!activeTab.includes('folders') || currentFolder) && (
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Quick search */}
            <div className="relative w-full sm:max-w-md">
              <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by title, subject, tags, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-2xs"
              />
            </div>

            {/* Filter selectors: Category, Sort */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="all">All Categories</option>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Sort selector */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-blue-600 shadow-2xs"
              >
                <option value="recent_upload">Recently uploaded</option>
                <option value="recent_open">Recently opened</option>
                <option value="name">Name (A-Z)</option>
                <option value="size">File size</option>
                <option value="status">Processing status</option>
              </select>
            </div>
          </div>

          {/* Quick Category Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap',
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              All Categories
            </button>
            {DOCUMENT_CATEGORIES.slice(0, 8).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap',
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Document Grid / List Content */}
      {activeTab !== 'storage' && (!activeTab.includes('folders') || currentFolder) && (
        <>
          {isDocsLoading ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-[#2563EB] mb-3" />
              <p className="text-xs font-medium text-[#475467]">Loading your study documents...</p>
            </div>
          ) : displayedDocuments.length === 0 ? (
            <DocumentEmptyState
              isFilterActive={Boolean(
                search || selectedCategory !== 'all' || activeTab !== 'all' || aiResult
              )}
              onClearFilters={() => {
                setSearch('');
                setSelectedCategory('all');
                setActiveTab('all');
                setAiResult(null);
                setAiQuery('');
              }}
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          ) : viewMode === 'list' ? (
            <DocumentListView
              documents={displayedDocuments}
              onOpen={(id) => onNavigate(`/documents/${id}`)}
              onPreview={(doc) => setPreviewModalDoc(doc)}
              onDownload={handleDownload}
              onAskAi={(id) => onNavigate(`/documents/${id}/chat`)}
              onGenerateSummary={(id) => onNavigate(`/documents/${id}/summary`)}
              onGenerateNotes={(id) => onNavigate(`/documents/${id}/notes`)}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteDocument}
              onOpenVersions={(doc) => setVersionsModalDoc(doc)}
              onOpenMove={(doc) => setMoveModalDoc(doc)}
              onOpenEdit={(doc) => setEditModalDoc(doc)}
              onIndexKnowledge={indexInKnowledge}
              onLinkLab={(doc) => setLinkLabModalDoc(doc)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedDocuments.map((doc) => (
                <div key={doc.id} className="relative">
                  {'relevance_score' in doc && (
                    <div className="absolute -top-2.5 right-3 z-10 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-semibold shadow-xs flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" />
                      <span>{(doc as any).relevance_score}% Match</span>
                    </div>
                  )}
                  <DocumentCard
                    document={doc}
                    onOpen={(id) => onNavigate(`/documents/${id}`)}
                    onAskAi={(id) => onNavigate(`/documents/${id}/chat`)}
                    onGenerateSummary={(id) => onNavigate(`/documents/${id}/summary`)}
                    onGenerateNotes={(id) => onNavigate(`/documents/${id}/notes`)}
                    onGenerateQuiz={(id) =>
                      onNavigate(
                        `/quiz/create?source_type=DOCUMENT&sourceId=${id}&topic=${encodeURIComponent(
                          doc.title
                        )}`
                      )
                    }
                    onToggleFavorite={toggleFavorite}
                    onDelete={deleteDocument}
                    onRetryProcessing={retryProcessing}
                    onPreview={(d) => setPreviewModalDoc(d)}
                    onDownload={handleDownload}
                    onOpenVersions={(d) => setVersionsModalDoc(d)}
                    onOpenMove={(d) => setMoveModalDoc(d)}
                    onOpenEdit={(d) => setEditModalDoc(d)}
                    onIndexKnowledge={indexInKnowledge}
                    onLinkLab={(d) => setLinkLabModalDoc(d)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Study Material</h3>
                  <p className="text-[11px] text-slate-500">
                    Add textbooks, lecture slides, lab manuals, and notes to your vault
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <DocumentUploader
              defaultFolderId={currentFolder?.id}
              onSuccess={() => {
                refetchDocs();
                refetchStats();
                setIsUploadModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreateFolderOpen}
        onClose={() => setIsCreateFolderOpen(false)}
        onSuccess={() => {
          refetchStats();
        }}
      />

      {/* Move To Folder Modal */}
      <MoveToFolderModal
        isOpen={Boolean(moveModalDoc)}
        onClose={() => setMoveModalDoc(null)}
        documentId={moveModalDoc?.id || ''}
        documentTitle={moveModalDoc?.title}
        currentFolderId={moveModalDoc?.folder_id}
        onSuccess={() => {
          refetchDocs();
          refetchStats();
        }}
      />

      {/* Edit Metadata Modal */}
      <EditDocumentModal
        isOpen={Boolean(editModalDoc)}
        onClose={() => setEditModalDoc(null)}
        document={editModalDoc}
        onSuccess={() => {
          refetchDocs();
        }}
      />

      {/* Document Versions Modal */}
      <DocumentVersionsModal
        isOpen={Boolean(versionsModalDoc)}
        onClose={() => setVersionsModalDoc(null)}
        document={versionsModalDoc}
        onSuccess={() => {
          refetchDocs();
          refetchStats();
        }}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={Boolean(previewModalDoc)}
        onClose={() => setPreviewModalDoc(null)}
        document={previewModalDoc}
        onDownload={handleDownload}
        onOpenWorkspace={(id) => onNavigate(`/documents/${id}`)}
        onOpenVersions={(d) => setVersionsModalDoc(d)}
        onOpenMove={(d) => setMoveModalDoc(d)}
        onOpenEdit={(d) => setEditModalDoc(d)}
      />

      {/* Link to Lab Modal */}
      <LinkToLabModal
        isOpen={Boolean(linkLabModalDoc)}
        onClose={() => setLinkLabModalDoc(null)}
        document={linkLabModalDoc}
        onSuccess={() => {
          refetchDocs();
        }}
      />
    </PageContainer>
  );
}
