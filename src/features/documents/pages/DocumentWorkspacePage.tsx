import * as React from 'react';
import { useDocument } from '../hooks/useDocument';
import { useDocumentStatus } from '../hooks/useDocumentStatus';
import { useDocumentViewerStore } from '../stores/documentViewerStore';
import { DocumentToolbar } from '../components/DocumentToolbar';
import { DocumentViewer } from '../components/DocumentViewer';
import { DocumentChat } from '../components/DocumentChat';
import { DocumentSummaryPanel } from '../components/DocumentSummaryPanel';
import { DocumentStatusBadge } from '../components/DocumentStatusBadge';
import { RefreshCw, AlertTriangle, FilePenLine, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { documentsApi } from '../api/documentsApi';
import { toast } from 'sonner';

export interface DocumentWorkspacePageProps {
  documentId: string;
  initialTab?: 'chat' | 'summary' | 'notes';
  initialPage?: number;
  onNavigate: (path: string) => void;
}

export function DocumentWorkspacePage({
  documentId,
  initialTab = 'chat',
  initialPage = 1,
  onNavigate,
}: DocumentWorkspacePageProps) {
  const { document, isLoading, isError, error, pages, refetchDocument } = useDocument(documentId);
  const { data: statusData } = useDocumentStatus(documentId);

  const {
    currentPage,
    rightPanel,
    selectedPages,
    setCurrentPage,
    setRightPanel,
  } = useDocumentViewerStore();

  const [mobileTab, setMobileTab] = React.useState<'viewer' | 'ai'>('viewer');

  // Sync initial tab and initial page
  React.useEffect(() => {
    if (initialTab) {
      setRightPanel(initialTab);
    }
  }, [initialTab, setRightPanel]);

  React.useEffect(() => {
    if (initialPage && initialPage > 0) {
      setCurrentPage(initialPage);
    }
  }, [initialPage, setCurrentPage]);

  // Check URL query param for ?page=X
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      if (pageParam) {
        const p = parseInt(pageParam, 10);
        if (!isNaN(p)) {
          setCurrentPage(p);
        }
      }
    }
  }, [setCurrentPage]);

  // If status changes to READY, refetch document
  React.useEffect(() => {
    if (statusData?.status === 'READY' && document?.status !== 'READY') {
      refetchDocument();
    }
  }, [statusData?.status, document?.status, refetchDocument]);

  const currentStatus = statusData?.status || document?.status || 'READY';

  const handleAskAboutPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setRightPanel('chat');
    setMobileTab('ai');
  };

  const handleSummarizePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    setRightPanel('summary');
    setMobileTab('ai');
  };

  const handleGenerateNotes = async (pageNumber?: number) => {
    try {
      const targetPage = pageNumber || currentPage;
      const note = await documentsApi.generateNotes(documentId, {
        start_page: targetPage,
        end_page: targetPage,
      });
      toast.success('Note generated in your Notes repository!');
      if (note?.id) {
        onNavigate(`/notes/${note.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate note');
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-semibold text-slate-700">Opening Document AI Workspace...</p>
        <p className="text-[11px] text-slate-400 mt-1">
          Loading vectorized pages and curriculum citations.
        </p>
      </div>
    );
  }

  if (isError || !document) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">Document Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          {(error as any)?.message ||
            'We could not locate this document. It may have been deleted or access is unauthorized.'}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('/documents')}
          className="mt-4"
        >
          Return to My Documents
        </Button>
      </div>
    );
  }

  const handleGenerateQuiz = () => {
    onNavigate(`/quiz/create?source_type=DOCUMENT&sourceId=${documentId}&topic=${encodeURIComponent(document.title)}`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white overflow-hidden">
      {/* Workspace Top Navigation Bar */}
      <DocumentToolbar
        title={document.title}
        onBack={() => onNavigate('/documents')}
        onGenerateQuiz={currentStatus === 'READY' ? handleGenerateQuiz : undefined}
      />

      {/* Processing Alert Banner if not yet READY */}
      {currentStatus !== 'READY' && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200 flex items-center justify-between text-xs text-blue-800">
          <div className="flex items-center gap-2">
            <DocumentStatusBadge status={currentStatus as any} />
            <span>
              {currentStatus === 'FAILED'
                ? 'Document extraction encountered an issue. You can retry processing.'
                : 'Document is currently being prepared for AI learning. Pages will appear dynamically.'}
            </span>
          </div>
          {currentStatus === 'FAILED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => documentsApi.retryProcessing(documentId).then(() => refetchDocument())}
              className="h-6 text-xs border-blue-300 text-blue-800 bg-white"
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex sm:hidden border-b border-slate-200 bg-slate-50 text-xs">
        <button
          onClick={() => setMobileTab('viewer')}
          className={`flex-1 py-2 font-medium text-center border-b-2 ${
            mobileTab === 'viewer'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-500'
          }`}
        >
          Document
        </button>
        <button
          onClick={() => setMobileTab('ai')}
          className={`flex-1 py-2 font-medium text-center border-b-2 ${
            mobileTab === 'ai'
              ? 'border-blue-600 text-blue-600 font-bold bg-white'
              : 'border-transparent text-slate-500'
          }`}
        >
          AI Assistant
        </button>
      </div>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Canvas: Document Viewer */}
        <div
          className={`flex-1 flex flex-col min-w-0 h-full ${
            mobileTab === 'ai' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          <DocumentViewer
            document={document}
            pages={pages}
            onAskAboutPage={handleAskAboutPage}
            onSummarizePage={handleSummarizePage}
            onGenerateNotesFromPage={handleGenerateNotes}
          />
        </div>

        {/* Right Panel: AI Assistant (Chat / Summary / Notes) */}
        <div
          className={`w-full sm:w-96 lg:w-[420px] shrink-0 h-full ${
            mobileTab === 'viewer' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {rightPanel === 'chat' && (
            <DocumentChat
              document={document}
              currentPage={currentPage}
              selectedPages={selectedPages}
              onNavigateToPage={(p) => setCurrentPage(p)}
              className="w-full h-full"
            />
          )}

          {rightPanel === 'summary' && (
            <DocumentSummaryPanel
              document={document}
              onSaveAsNote={(noteId) => onNavigate(`/notes/${noteId}`)}
              className="w-full h-full"
            />
          )}

          {rightPanel === 'notes' && (
            <div className="flex flex-col h-full w-full bg-white border-l border-slate-200 p-6 text-center justify-center">
              <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <FilePenLine className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Generate Structured Study Note</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Transform this document into an exam-oriented study note with KaTeX formulas, code
                blocks, and practice questions in your Notes repository.
              </p>
              <div className="mt-6 flex flex-col gap-2 max-w-xs mx-auto w-full">
                <Button
                  onClick={() => handleGenerateNotes(currentPage)}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  <FilePenLine className="h-4 w-4" />
                  <span>Generate from Page {currentPage}</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleGenerateNotes()}
                  className="border-slate-300 text-slate-700"
                >
                  Generate from Full Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
