import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '../../api/client';
import type { AcademicRecord, GradeSummary } from '../../../server/services/academicMath';

export interface AcademicView {
  record: AcademicRecord;
  grades: GradeSummary;
  attendance: { id: string; percent: number | null; can_miss: number; must_attend: number | null; safe: boolean }[];
}

const KEY = ['academics', 'me'];

/** The student's own grades and attendance, saved on the server. */
export function useAcademicRecord() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: KEY, queryFn: () => apiClient.get<AcademicView>('/academics/me'), staleTime: 30_000 });

  const save = useMutation({
    mutationFn: (record: AcademicRecord) => apiClient.put<AcademicView>('/academics/me', record),
    onSuccess: (view) => {
      qc.setQueryData(KEY, view);
      toast.success('Saved');
    },
    onError: (e: any) => toast.error(e?.message || 'Could not save.'),
  });

  const mark = useMutation({
    mutationFn: ({ subjectId, present }: { subjectId: string; present: boolean }) =>
      apiClient.post<AcademicView>(`/academics/me/attendance/${encodeURIComponent(subjectId)}/mark`, { present }),
    onSuccess: (view) => qc.setQueryData(KEY, view),
    onError: (e: any) => toast.error(e?.message || 'Could not update attendance.'),
  });

  return { query, save, mark };
}

export const newId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
