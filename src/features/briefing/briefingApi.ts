import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';

export type BriefingKind = 'overdue' | 'due_soon' | 'start_prep' | 'study_task' | 'attendance' | 'revision' | 'foundation' | 'flashcards' | 'mistakes' | 'contest' | 'next_topic';

export interface BriefingItem {
  id: string;
  kind: BriefingKind;
  priority: 1 | 2 | 3;
  title: string;
  detail: string;
  source: string;
  route: string;
  url?: string;
  minutes: number;
  subject?: string;
  topic?: string;
}

export interface Briefing {
  date: string;
  items: BriefingItem[];
  handled: { id: string; title: string; action: 'done' | 'dismissed' | 'postponed' | 'accepted' }[];
  counts: { total: number; do_today: number; done: number; postponed: number; dismissed: number };
}

/** The student's UTC offset in minutes, so "today" is theirs. */
export const tzOffset = () => -new Date().getTimezoneOffset();
export const BRIEFING_KEY = ['briefing', 'me'];

export function useBriefing() {
  return useQuery({ queryKey: BRIEFING_KEY, queryFn: () => apiClient.get<Briefing>(`/briefing/me?tz=${tzOffset()}`) });
}

export function useBriefingActions() {
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: BRIEFING_KEY });
    qc.invalidateQueries({ queryKey: ['dashboard'] });
  };
  const onError = (e: any) => toast.error(e?.message || 'That did not work. Try again.');
  const act = useMutation({
    mutationFn: (v: { id: string; action: 'done' | 'dismissed' | 'postponed'; until?: string }) =>
      apiClient.post(`/briefing/me/items/${encodeURIComponent(v.id)}`, { action: v.action, until: v.until, tz: tzOffset() }),
    onSuccess: (_d, v) => {
      refresh();
      toast.success(v.action === 'done' ? 'Marked done' : v.action === 'postponed' ? 'Postponed' : 'Dismissed');
    },
    onError,
  });
  const plan = useMutation({
    mutationFn: (v: { id: string; title: string; minutes: number; date: string }) =>
      apiClient.post(`/briefing/me/items/${encodeURIComponent(v.id)}/plan`, { title: v.title, minutes: v.minutes, date: v.date, tz: tzOffset() }),
    onSuccess: () => {
      refresh();
      qc.invalidateQueries({ queryKey: ['study-plans'] });
      toast.success('Added to your study plan');
    },
    onError,
  });
  const undo = useMutation({ mutationFn: (id: string) => apiClient.delete(`/briefing/me/items/${encodeURIComponent(id)}`), onSuccess: refresh, onError });
  return { act, plan, undo };
}

export const addDays = (date: string, n: number) => new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
