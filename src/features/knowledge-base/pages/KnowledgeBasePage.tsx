// src/features/knowledge-base/pages/KnowledgeBasePage.tsx
// Master Coordinator for AI Knowledge Base & Document Repository

import React, { useState, useEffect } from 'react';

import {
  BookOpen,
  Folder,
  FileText,
  Search,
  HelpCircle,
  Sparkles,
  Bookmark,
  Link,
  Layers,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  MessageSquare,
} from 'lucide-react';
import { knowledgeBaseApi } from '../api/knowledgeBaseApi';
import { documentsApi } from '../../documents/api/documentsApi';
import {
  KnowledgeCollection,
  KnowledgeDashboardStats,
  KnowledgeBookmark,
  KnowledgeAnnotationNote,
  KnowledgeResource,
} from '../types/knowledgeBaseTypes';
import { DocumentCardData } from '../../documents/types/document';

// Child components
import { KnowledgeDashboardHeader } from '../components/KnowledgeDashboardHeader';
import { KnowledgeOnboardingView } from '../components/KnowledgeOnboardingView';
import { KnowledgeCollectionModal } from '../components/KnowledgeCollectionModal';
import { KnowledgeCollectionsGrid } from '../components/KnowledgeCollectionsGrid';
import { KnowledgeDocumentsView } from '../components/KnowledgeDocumentsView';
import { KnowledgeSemanticSearch } from '../components/KnowledgeSemanticSearch';
import { KnowledgeAiTutorQa } from '../components/KnowledgeAiTutorQa';
import { KnowledgeStudyMaterialModal } from '../components/KnowledgeStudyMaterialModal';
import { KnowledgeBookmarksNotesTab } from '../components/KnowledgeBookmarksNotesTab';
import { KnowledgeResourcesTab } from '../components/KnowledgeResourcesTab';
import { KnowledgeUploadModal } from '../components/KnowledgeUploadModal';

type ActiveTab =
  | 'OVERVIEW'
  | 'COLLECTIONS'
  | 'DOCUMENTS'
  | 'SEARCH'
  | 'QA'
  | 'STUDY_MATERIALS'
  | 'BOOKMARKS'
  | 'RESOURCES';

export interface KnowledgeBasePageProps {
  onNavigate?: (path: string) => void;
}

export const KnowledgeBasePage: React.FC<KnowledgeBasePageProps> = ({ onNavigate }) => {
  const getSearchParams = () =>
    new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

  const [searchParams, setSearchParams] = useState<URLSearchParams>(getSearchParams);

  // Navigation tab state
  const initialTab = (searchParams.get('tab')?.toUpperCase() as ActiveTab) || 'OVERVIEW';
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    [
      'OVERVIEW',
      'COLLECTIONS',
      'DOCUMENTS',
      'SEARCH',
      'QA',
      'STUDY_MATERIALS',
      'BOOKMARKS',
      'RESOURCES',
    ].includes(initialTab)
      ? initialTab
      : 'OVERVIEW'
  );

  // Data states
  const [stats, setStats] = useState<KnowledgeDashboardStats | null>(null);
  const [collections, setCollections] = useState<KnowledgeCollection[]>([]);
  const [documents, setDocuments] = useState<DocumentCardData[]>([]);
  const [bookmarks, setBookmarks] = useState<KnowledgeBookmark[]>([]);
  const [notes, setNotes] = useState<KnowledgeAnnotationNote[]>([]);
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected filters
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(
    searchParams.get('colId') || null
  );

  // Modals
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<KnowledgeCollection | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [versionUploadDoc, setVersionUploadDoc] = useState<DocumentCardData | null>(null);
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [studyModalDocId, setStudyModalDocId] = useState<string | undefined>(undefined);

  // Pre-filled QA params
  const [qaPrompt, setQaPrompt] = useState<string>('');
  const [qaDocId, setQaDocId] = useState<string | undefined>(undefined);

  // Sync tab with URL
  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    newParams.set('tab', tab.toLowerCase());
    setSearchParams(newParams);
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?${newParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, colsRes, docsRes, bmarksRes, notesRes, resRes] = await Promise.allSettled([
        knowledgeBaseApi.getDashboardStats(),
        knowledgeBaseApi.getCollections(),
        documentsApi.getDocuments({ limit: 100 }),
        knowledgeBaseApi.getBookmarks(),
        knowledgeBaseApi.getNotes(),
        knowledgeBaseApi.getResources(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (colsRes.status === 'fulfilled') setCollections(colsRes.value);
      if (docsRes.status === 'fulfilled') {
        const rawDocs = docsRes.value as any;
        setDocuments(rawDocs.documents || rawDocs.data || (Array.isArray(rawDocs) ? rawDocs : []));
      }
      if (bmarksRes.status === 'fulfilled') setBookmarks(bmarksRes.value);
      if (notesRes.status === 'fulfilled') setNotes(notesRes.value);
      if (resRes.status === 'fulfilled') setResources(resRes.value);
    } catch (err) {
      console.error('Failed to load knowledge base data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers for Collection Modal
  const handleSaveCollection = async (data: any) => {
    if (editingCollection) {
      await knowledgeBaseApi.updateCollection(editingCollection.id, data);
    } else {
      await knowledgeBaseApi.createCollection(data);
    }
    await loadAllData();
  };

  const handleDeleteCollection = async (col: KnowledgeCollection) => {
    if (window.confirm(`Are you sure you want to delete collection "${col.name}"?`)) {
      await knowledgeBaseApi.deleteCollection(col.id, false);
      if (selectedCollectionId === col.id) {
        setSelectedCollectionId(null);
      }
      await loadAllData();
    }
  };

  // Handlers for Documents
  const handleReindexDocument = async (doc: DocumentCardData) => {
    await knowledgeBaseApi.reindexDocument(doc.id);
    await loadAllData();
  };

  const handleAssignCollection = async (doc: DocumentCardData, colId: string) => {
    await knowledgeBaseApi.assignDocumentToCollection(colId, doc.id);
    await loadAllData();
  };

  const handleDeleteDocument = async (doc: DocumentCardData) => {
    if (window.confirm(`Are you sure you want to delete "${doc.title || doc.original_filename}"?`)) {
      await documentsApi.deleteDocument(doc.id);
      await loadAllData();
    }
  };

  // Triggers
  const handleTriggerAskAi = (doc?: DocumentCardData, initialQ?: string) => {
    setQaPrompt(initialQ || '');
    setQaDocId(doc?.id);
    switchTab('QA');
  };

  const handleTriggerStudyMaterial = (doc?: DocumentCardData) => {
    setStudyModalDocId(doc?.id);
    setIsStudyModalOpen(true);
  };

  const handleCreateResource = async (data: any) => {
    await knowledgeBaseApi.createResource(data);
    await loadAllData();
  };

  const handleDeleteResource = async (id: string) => {
    await knowledgeBaseApi.deleteResource(id);
    await loadAllData();
  };

  const handleDeleteBookmark = async (id: string) => {
    await knowledgeBaseApi.deleteBookmark(id);
    await loadAllData();
  };

  const handleDeleteNote = async (id: string) => {
    await knowledgeBaseApi.deleteNote(id);
    await loadAllData();
  };

  const isOnboarding = stats?.is_onboarding ?? (documents.length === 0 && collections.length === 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. Header with Stats & KPI Cards */}
      <KnowledgeDashboardHeader
        stats={stats}
        loading={loading}
        onOpenCreateCollection={() => {
          setEditingCollection(null);
          setIsCollectionModalOpen(true);
        }}
        onOpenUpload={() => {
          setVersionUploadDoc(null);
          setIsUploadModalOpen(true);
        }}
        onOpenAddResource={() => switchTab('RESOURCES')}
        onOpenAskAi={() => handleTriggerAskAi()}
        onOpenGenerateMaterial={() => handleTriggerStudyMaterial()}
      />

      {/* 2. Top-level Tab Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-md">
        <button
          onClick={() => switchTab('OVERVIEW')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => switchTab('COLLECTIONS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'COLLECTIONS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Folder className="w-3.5 h-3.5" />
          <span>Collections ({collections.length})</span>
        </button>

        <button
          onClick={() => switchTab('DOCUMENTS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'DOCUMENTS'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documents ({documents.length})</span>
        </button>

        <button
          onClick={() => switchTab('SEARCH')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'SEARCH'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Semantic Search</span>
        </button>

        <button
          onClick={() => switchTab('QA')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'QA'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Ask AI (Grounded QA)</span>
        </button>

        <button
          onClick={() => switchTab('STUDY_MATERIALS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'STUDY_MATERIALS'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Flashcards & Quizzes</span>
        </button>

        <button
          onClick={() => switchTab('BOOKMARKS')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'BOOKMARKS'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Bookmarks & Notes ({bookmarks.length + notes.length})</span>
        </button>

        <button
          onClick={() => switchTab('RESOURCES')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'RESOURCES'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Link className="w-3.5 h-3.5" />
          <span>External Resources ({resources.length})</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {isOnboarding ? (
            <KnowledgeOnboardingView
              onOpenCreateCollection={() => {
                setEditingCollection(null);
                setIsCollectionModalOpen(true);
              }}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenAskAi={() => handleTriggerAskAi()}
            />
          ) : (
            <div className="space-y-6">
              {/* Quick Actions and Collections Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Collections Grid */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Folder className="w-4 h-4 text-indigo-400" />
                      <span>Subject Folders & Collections</span>
                    </h3>
                    <button
                      onClick={() => switchTab('COLLECTIONS')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <span>View All ({collections.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <KnowledgeCollectionsGrid
                    collections={collections.slice(0, 6)}
                    selectedCollectionId={selectedCollectionId}
                    onSelectCollection={(col) => {
                      setSelectedCollectionId(col.id);
                      switchTab('DOCUMENTS');
                    }}
                    onEditCollection={(col) => {
                      setEditingCollection(col);
                      setIsCollectionModalOpen(true);
                    }}
                    onDeleteCollection={handleDeleteCollection}
                    onCreateCollection={() => {
                      setEditingCollection(null);
                      setIsCollectionModalOpen(true);
                    }}
                  />
                </div>

                {/* Right 1 Col: Quick Feature Shortcuts & Recent Documents */}
                <div className="space-y-4">
                  {/* AI Quick Prompts Card */}
                  <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 border border-indigo-500/20 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Sparkles className="w-4 h-4" />
                      <h4 className="text-sm font-bold">Ask AI Academic Tutor</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Have a doubt in your syllabus? Ask questions grounded in your uploaded lecture slides and reference books.
                    </p>
                    <button
                      onClick={() => handleTriggerAskAi()}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-indigo-600/20"
                    >
                      Launch AI Q&A Workspace →
                    </button>
                  </div>

                  {/* Study Deck Generator Card */}
                  <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/20 rounded-2xl p-5 shadow-lg space-y-3">
                    <div className="flex items-center gap-2 text-purple-300">
                      <BookOpen className="w-4 h-4" />
                      <h4 className="text-sm font-bold">Active Recall Flashcards</h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Turn dense textbooks and exam papers into spaced-repetition flashcard sets and interactive practice quizzes.
                    </p>
                    <button
                      onClick={() => handleTriggerStudyMaterial()}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-purple-600/20"
                    >
                      Generate Flashcards & Quiz →
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Documents Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span>Recent Academic Documents</span>
                  </h3>
                  <button
                    onClick={() => switchTab('DOCUMENTS')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                  >
                    <span>View All ({documents.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <KnowledgeDocumentsView
                  documents={documents.slice(0, 5)}
                  collections={collections}
                  selectedCollectionId={selectedCollectionId}
                  onSelectCollectionFilter={setSelectedCollectionId}
                  onAskAi={handleTriggerAskAi}
                  onGenerateStudyMaterial={handleTriggerStudyMaterial}
                  onReindex={handleReindexDocument}
                  onAssignCollection={handleAssignCollection}
                  onDeleteDocument={handleDeleteDocument}
                  onOpenUpload={() => {
                    setVersionUploadDoc(null);
                    setIsUploadModalOpen(true);
                  }}
                  onOpenDocument={(doc) =>
                    onNavigate ? onNavigate(`/documents/${doc.id}`) : window.location.assign(`/documents/${doc.id}`)
                  }
                  onUploadNewVersion={(doc) => {
                    setVersionUploadDoc(doc);
                    setIsUploadModalOpen(true);
                  }}
                />
              </div>

              {/* Course Knowledge Bases */}
              {stats?.course_knowledge_bases && stats.course_knowledge_bases.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-400" />
                      <span>Course Knowledge Bases</span>
                    </h3>
                    <span className="text-xs text-slate-500">
                      {stats.course_knowledge_bases.length} Academic Modules
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stats.course_knowledge_bases.map((ckb) => (
                      <div
                        key={ckb.code}
                        onClick={() => {
                          if (ckb.collection_id) setSelectedCollectionId(ckb.collection_id);
                          switchTab('DOCUMENTS');
                        }}
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-emerald-400">{ckb.code || 'COURSE'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                            {ckb.docCount} document{ckb.docCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition truncate">
                          {ckb.title}
                        </h4>
                        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                          <span>{ckb.collectionCount} collection{ckb.collectionCount === 1 ? '' : 's'}</span>
                          <span className="text-emerald-400 group-hover:translate-x-1 transition flex items-center gap-0.5">
                            Browse &rarr;
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Processing Queue & Document Status */}
              {stats?.processing_queue && stats.processing_queue.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Document Processing & Vector Ingestion Queue</span>
                    </h3>
                    <span className="text-xs text-amber-400 font-semibold">{stats.processing_queue.length} Tasks</span>
                  </div>
                  <div className="space-y-2">
                    {stats.processing_queue.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-white font-medium truncate">{q.title || q.original_filename}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              q.status === 'PROCESSING'
                                ? 'bg-indigo-500/10 text-indigo-400 animate-pulse border border-indigo-500/20'
                                : q.status === 'FAILED'
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {q.status}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(q.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2-Column: Recent Resources & Questions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {/* Left: Recent External Resources */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Link className="w-4 h-4 text-cyan-400" />
                      <span>Recently Saved Academic Resources</span>
                    </h3>
                    <button
                      onClick={() => switchTab('RESOURCES')}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                    >
                      <span>View All ({resources.length})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {stats?.recent_resources && stats.recent_resources.length > 0 ? (
                    <div className="space-y-2.5">
                      {stats.recent_resources.map((r) => (
                        <div
                          key={r.id}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="truncate flex-1">
                            <h5 className="font-semibold text-white truncate">{r.title}</h5>
                            <span className="text-[11px] text-slate-400">{r.type} • {r.description || 'General'}</span>
                          </div>
                          {r.url && (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-indigo-400 hover:text-indigo-300 shrink-0 font-medium"
                            >
                              Open Link &rarr;
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
                      No external URLs saved yet. Click "Add Resource" to save lecture videos or documentation.
                    </div>
                  )}
                </div>

                {/* Right: Recent Questions & Next Actions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span>Recent AI Inquiries & Suggestions</span>
                    </h3>
                    <button
                      onClick={() => switchTab('QA')}
                      className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
                    >
                      <span>Open Tutor &rarr;</span>
                    </button>
                  </div>

                  {stats?.recent_questions && stats.recent_questions.length > 0 ? (
                    <div className="space-y-2.5">
                      {stats.recent_questions.map((q) => (
                        <div
                          key={q.id}
                          onClick={() => handleTriggerAskAi(undefined, q.question)}
                          className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 cursor-pointer transition flex items-center justify-between gap-3 text-xs group"
                        >
                          <span className="text-slate-300 group-hover:text-white font-medium truncate flex-1">
                            "{q.question}"
                          </span>
                          <span className="text-[10px] text-purple-400 shrink-0">
                            Ask Again &rarr;
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                        <Lightbulb className="w-4 h-4" />
                        <span>Suggested Academic Actions</span>
                      </div>
                      <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                        <li>Upload your semester lecture notes (PDF, DOCX, Code)</li>
                        <li>Organize notes into course collections like DBMS or OS</li>
                        <li>Ask AI to synthesize complex topics with real page citations</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COLLECTIONS */}
      {activeTab === 'COLLECTIONS' && (
        <KnowledgeCollectionsGrid
          collections={collections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollection={(col) => {
            setSelectedCollectionId(col.id);
            switchTab('DOCUMENTS');
          }}
          onEditCollection={(col) => {
            setEditingCollection(col);
            setIsCollectionModalOpen(true);
          }}
          onDeleteCollection={handleDeleteCollection}
          onCreateCollection={() => {
            setEditingCollection(null);
            setIsCollectionModalOpen(true);
          }}
        />
      )}

      {/* TAB 3: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <KnowledgeDocumentsView
          documents={documents}
          collections={collections}
          selectedCollectionId={selectedCollectionId}
          onSelectCollectionFilter={setSelectedCollectionId}
          onAskAi={handleTriggerAskAi}
          onGenerateStudyMaterial={handleTriggerStudyMaterial}
          onReindex={handleReindexDocument}
          onAssignCollection={handleAssignCollection}
          onDeleteDocument={handleDeleteDocument}
          onOpenUpload={() => {
            setVersionUploadDoc(null);
            setIsUploadModalOpen(true);
          }}
          onOpenDocument={(doc) =>
            onNavigate ? onNavigate(`/documents/${doc.id}`) : window.location.assign(`/documents/${doc.id}`)
          }
          onUploadNewVersion={(doc) => {
            setVersionUploadDoc(doc);
            setIsUploadModalOpen(true);
          }}
        />
      )}

      {/* TAB 4: SEMANTIC SEARCH */}
      {activeTab === 'SEARCH' && (
        <KnowledgeSemanticSearch
          collections={collections}
          onAskAiWithContext={(q, docId) => handleTriggerAskAi(documents.find((d) => d.id === docId), q)}
        />
      )}

      {/* TAB 5: ASK AI (GROUNDED QA) */}
      {activeTab === 'QA' && (
        <KnowledgeAiTutorQa
          collections={collections}
          documents={documents}
          initialQuestion={qaPrompt}
          initialDocumentId={qaDocId}
          onOpenDocumentPage={(docId, pageNumber) =>
            onNavigate ? onNavigate(`/documents/${docId}/page/${pageNumber}`) : window.location.assign(`/documents/${docId}/page/${pageNumber}`)
          }
        />
      )}

      {/* TAB 6: FLASHCARDS & STUDY MATERIALS */}
      {activeTab === 'STUDY_MATERIALS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Generate Flashcard Decks & Practice Quizzes</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Select any uploaded document to automatically generate structured revision flashcards,
            multiple-choice quizzes with explanations, executive summaries, or formula cheat sheets.
          </p>
          <button
            onClick={() => handleTriggerStudyMaterial()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-purple-600/25"
          >
            Launch Study Deck Generator
          </button>
        </div>
      )}

      {/* TAB 7: BOOKMARKS & NOTES */}
      {activeTab === 'BOOKMARKS' && (
        <KnowledgeBookmarksNotesTab
          bookmarks={bookmarks}
          notes={notes}
          documents={documents}
          onDeleteBookmark={handleDeleteBookmark}
          onDeleteNote={handleDeleteNote}
        />
      )}

      {/* TAB 8: EXTERNAL RESOURCES */}
      {activeTab === 'RESOURCES' && (
        <KnowledgeResourcesTab
          resources={resources}
          collections={collections}
          onCreateResource={handleCreateResource}
          onDeleteResource={handleDeleteResource}
        />
      )}

      {/* MODAL 1: Create / Edit Collection */}
      <KnowledgeCollectionModal
        isOpen={isCollectionModalOpen}
        onClose={() => {
          setIsCollectionModalOpen(false);
          setEditingCollection(null);
        }}
        onSave={handleSaveCollection}
        editingCollection={editingCollection}
      />

      {/* MODAL 2: Upload Document */}
      <KnowledgeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setVersionUploadDoc(null);
        }}
        collections={collections}
        defaultCollectionId={selectedCollectionId}
        targetDocument={versionUploadDoc}
        onUploadSuccess={loadAllData}
      />

      {/* MODAL 3: Study Material Generator & Interactive Viewer */}
      <KnowledgeStudyMaterialModal
        isOpen={isStudyModalOpen}
        onClose={() => {
          setIsStudyModalOpen(false);
          setStudyModalDocId(undefined);
        }}
        documents={documents}
        initialDocumentId={studyModalDocId}
      />
    </div>
  );
};
