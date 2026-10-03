import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi, NotesListResponse } from '../api/notesApi';
import { Note, NoteCardData, GenerateNotesRequest, FlashcardItem, QuizQuestionItem } from '../types/notes';
import { toast } from 'sonner';

export function useNotes(params?: {
  search?: string;
  source_type?: string;
  note_type?: string;
  is_favorite?: boolean;
  course_id?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<NotesListResponse>({
    queryKey: ['notes', params],
    queryFn: () => notesApi.getNotes(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useNote(noteId: string | undefined) {
  return useQuery<Note>({
    queryKey: ['note', noteId],
    queryFn: () => notesApi.getNote(noteId!),
    enabled: !!noteId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchNotes(query: string) {
  return useQuery<NoteCardData[]>({
    queryKey: ['notes-search', query],
    queryFn: () => notesApi.searchNotes(query),
    enabled: query.trim().length > 1,
    staleTime: 1000 * 30,
  });
}

export function useGenerateNotes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: GenerateNotesRequest) => notesApi.generateNote(req),
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(`Notes generated: "${newNote.title}"`, {
        description: 'Structured study material ready for review.',
      });
    },
    onError: (err: any) => {
      toast.error('Failed to generate notes', {
        description: err.message || 'Please check your inputs and try again.',
      });
    },
  });
}

export function useCreateManualNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { title: string; content: string; description?: string; tags?: string[] }) =>
      notesApi.createManualNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note created successfully');
    },
    onError: (err: any) => {
      toast.error('Failed to create note', {
        description: err.message || 'Please verify note content.',
      });
    },
  });
}

export function useUpdateNote(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      updates,
      changeSummary,
    }: {
      updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'is_favorite' | 'structured_data'>>;
      changeSummary?: string;
    }) => notesApi.updateNote(noteId, updates, changeSummary),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      toast.success('Note changes saved', {
        description: `Version ${updated.version} recorded.`,
      });
    },
    onError: (err: any) => {
      toast.error('Failed to save note', {
        description: err.message || 'Could not update note content.',
      });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notesApi.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
    onError: (err: any) => {
      toast.error('Failed to delete note', {
        description: err.message || 'Could not remove note.',
      });
    },
  });
}

export function useToggleFavoriteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notesApi.toggleFavorite(noteId),
    onSuccess: (data, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      if (data.is_favorite) {
        toast.success('Added to favorites');
      } else {
        toast.info('Removed from favorites');
      }
    },
    onError: (err: any) => {
      toast.error('Action failed', { description: err.message });
    },
  });
}

export function useRegenerateNote(noteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (style: string) => notesApi.regenerateNote(noteId, style),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      toast.success('Note regenerated with new style perspective');
    },
    onError: (err: any) => {
      toast.error('Failed to regenerate note', { description: err.message });
    },
  });
}

export function useNoteSummarize(noteId: string) {
  return useMutation({
    mutationFn: () => notesApi.summarizeNote(noteId),
    onError: (err: any) => {
      toast.error('Failed to summarize note', { description: err.message });
    },
  });
}

export function useNoteFlashcards(noteId: string) {
  return useMutation({
    mutationFn: () => notesApi.generateFlashcards(noteId),
    onError: (err: any) => {
      toast.error('Failed to generate flashcards', { description: err.message });
    },
  });
}

export function useNoteQuiz(noteId: string) {
  return useMutation({
    mutationFn: () => notesApi.generateQuiz(noteId),
    onError: (err: any) => {
      toast.error('Failed to generate quiz', { description: err.message });
    },
  });
}

export function useExplainSection(noteId: string) {
  return useMutation({
    mutationFn: (data: { sectionTitle: string; sectionText: string; instruction?: string }) =>
      notesApi.explainSection(noteId, data),
    onError: (err: any) => {
      toast.error('Explanation request failed', { description: err.message });
    },
  });
}
