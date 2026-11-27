import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import type { TaskBoard, Timetable } from '../../../server/services/plannerService';

const TT_KEY = ['planner', 'timetable'];
const BOARD_KEY = ['planner', 'tasks'];

/**
 * Saves optimistically: the page updates at once and the server's validated copy replaces it when it answers.
 * If the save fails, the previous version comes back and the student sees why.
 */
function useOptimisticSave<T>(key: string[], path: string, label: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (next: T) => apiClient.put<T>(path, next),
    onMutate: async (next: T) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<T>(key);
      qc.setQueryData(key, next);
      return { prev };
    },
    onError: (e: any, _next, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      toast.error(e?.message || `Your ${label} could not be saved.`);
    },
    onSuccess: (saved) => qc.setQueryData(key, saved),
  });
}

export function useTimetable() {
  const query = useQuery({ queryKey: TT_KEY, queryFn: () => apiClient.get<Timetable>('/timetable/me'), staleTime: 30_000 });
  const save = useOptimisticSave<Timetable>(TT_KEY, '/timetable/me', 'timetable');
  return { query, save };
}

export function useTaskBoard() {
  const query = useQuery({ queryKey: BOARD_KEY, queryFn: () => apiClient.get<TaskBoard>('/tasks/me'), staleTime: 30_000 });
  const save = useOptimisticSave<TaskBoard>(BOARD_KEY, '/tasks/me', 'task board');
  return { query, save };
}

export const newPlannerId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
