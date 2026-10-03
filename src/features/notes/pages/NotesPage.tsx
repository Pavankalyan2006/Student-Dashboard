import * as React from 'react';
import {
  FileText,
  Plus,
  Search,
  Sparkles,
  Star,
  BookOpen,
  Filter,
  Layers,
  HelpCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useNotes, useToggleFavoriteNote, useDeleteNote } from '../hooks/useNotes';
import { NoteCard } from '../components/NoteCard';
import { NotesGenerator } from '../components/NotesGenerator';
import { PageContainer, PageHeader, EmptyState, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { FlashcardDeck, QuizRunner } from '../components/NoteStudyTools';
import { notesApi } from '../api/notesApi';
import { FlashcardItem, QuizQuestionItem } from '../types/notes';
import { toast } from 'sonner';

interface NotesPageProps {
  onNavigate: (path: string) => void;
}

export function NotesPage({ onNavigate }: NotesPageProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState<string>('all');
  const [isGeneratorOpen, setIsGeneratorOpen] = React.useState(false);
  const [initialCourseId, setInitialCourseId] = React.useState<string | undefined>();
  const [initialLessonId, setInitialLessonId] = React.useState<string | undefined>();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const cId = params.get('course_id');
      const lId = params.get('lesson_id');
      if (cId || lId || window.location.pathname === '/notes/create') {
        if (cId) setInitialCourseId(cId);
        if (lId) setInitialLessonId(lId);
        setIsGeneratorOpen(true);
      }
    }
  }, []);

  // Quick review modal states
  const [activeFlashcards, setActiveFlashcards] = React.useState<{ title: string; cards: FlashcardItem[] } | null>(null);
  const [activeQuiz, setActiveQuiz] = React.useState<{ title: string; questions: QuizQuestionItem[] } | null>(null);
  const [isLoadingStudyTool, setIsLoadingStudyTool] = React.useState(false);

  const { data: notesData, isLoading, isError, error, refetch } = useNotes({
    search: searchQuery || undefined,
    note_type: activeFilter !== 'all' && activeFilter !== 'favorites' ? activeFilter : undefined,
    is_favorite: activeFilter === 'favorites' ? true : undefined,
    limit: 24,
  });

  const toggleFavoriteMutation = useToggleFavoriteNote();
  const deleteMutation = useDeleteNote();

  const handleOpenNote = (id: string) => {
    onNavigate(`/notes/${id}`);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavoriteMutation.mutate(id);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note and its version history?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleQuickFlashcards = async (noteId: string) => {
    setIsLoadingStudyTool(true);
    try {
      const cards = await notesApi.generateFlashcards(noteId);
      const note = await notesApi.getNote(noteId);
      setActiveFlashcards({ title: note.title, cards });
    } catch (err: any) {
      toast.error('Failed to load flashcards', { description: err.message });
    } finally {
      setIsLoadingStudyTool(false);
    }
  };

  const handleQuickQuiz = async (noteId: string) => {
    setIsLoadingStudyTool(true);
    try {
      const questions = await notesApi.generateQuiz(noteId);
      const note = await notesApi.getNote(noteId);
      setActiveQuiz({ title: note.title, questions });
    } catch (err: any) {
      toast.error('Failed to load quiz', { description: err.message });
    } finally {
      setIsLoadingStudyTool(false);
    }
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E4E7EC]">
        <div>
          <h1 className="text-2xl font-bold text-[#101828] tracking-tight">Smart Academic Notes</h1>
          <p className="text-xs text-[#475467] mt-1">
            Create, synthesize, and revise structured B.Tech learning material with KaTeX math & code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setIsGeneratorOpen(!isGeneratorOpen)}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs h-9 px-3.5 font-medium flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isGeneratorOpen ? 'Close Generator' : '+ Generate Notes'}
          </Button>
        </div>
      </div>

      {/* Quick Generator Tray */}
      {isGeneratorOpen && (
        <div className="my-6">
          <NotesGenerator
            initialCourseId={initialCourseId}
            initialLessonId={initialLessonId}
            initialSourceType={initialLessonId ? 'lesson' : initialCourseId ? 'course' : 'topic'}
            onGenerated={(newId) => {
              setIsGeneratorOpen(false);
              onNavigate(`/notes/${newId}`);
            }}
            onCancel={() => setIsGeneratorOpen(false)}
          />
        </div>
      )}

      {/* Active Modal/Drawer for Quick Flashcards or Quiz */}
      {activeFlashcards && (
        <div className="my-6">
          <FlashcardDeck
            cards={activeFlashcards.cards}
            title={activeFlashcards.title}
            onClose={() => setActiveFlashcards(null)}
          />
        </div>
      )}

      {activeQuiz && (
        <div className="my-6">
          <QuizRunner
            questions={activeQuiz.questions}
            title={activeQuiz.title}
            onClose={() => setActiveQuiz(null)}
          />
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="my-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by topic, keyword, or tag..."
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#D0D5DD] bg-white text-xs text-[#101828] placeholder-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition"
          />
        </div>

        {/* Filter Tabs (Anti-slop discipline) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Notes' },
            { id: 'favorites', label: '★ Favorites' },
            { id: 'STUDY_NOTES', label: 'Study' },
            { id: 'EXAM_NOTES', label: 'Exam' },
            { id: 'QUICK_REVISION', label: 'Revision' },
            { id: 'INTERVIEW_NOTES', label: 'Interview' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                activeFilter === tab.id
                  ? 'bg-[#101828] text-white shadow-xs'
                  : 'bg-white text-[#475467] hover:text-[#101828] hover:bg-slate-100 border border-[#E4E7EC]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content List */}
      {isLoading ? (
        <LoadingState message="Loading your notes repository..." />
      ) : isError ? (
        <ErrorState
          title="Failed to load notes"
          message={(error as any)?.message || 'Unable to retrieve notes from server.'}
          onRetry={() => refetch()}
        />
      ) : !notesData || notesData.items.length === 0 ? (
        <EmptyState
          title={searchQuery ? 'No notes matched your search' : 'No notes created yet'}
          description={
            searchQuery
              ? 'Try different search keywords or reset filters.'
              : 'Generate structured academic notes from any engineering topic, course syllabus, or uploaded document.'
          }
          actionText={searchQuery ? 'Clear Search' : '+ Generate Your First Note'}
          onAction={() => {
            if (searchQuery) setSearchQuery('');
            else setIsGeneratorOpen(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-[#475467]">
            <span>
              Showing <strong className="text-[#101828]">{notesData.items.length}</strong> of{' '}
              <strong className="text-[#101828]">{notesData.total}</strong> notes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notesData.items.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpen={handleOpenNote}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDeleteNote}
                onOpenFlashcards={handleQuickFlashcards}
                onOpenQuiz={handleQuickQuiz}
              />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
