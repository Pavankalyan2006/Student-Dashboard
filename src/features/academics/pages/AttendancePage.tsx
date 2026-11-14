import * as React from 'react';
import { CalendarCheck, Plus, Trash2, Check, X, ShieldCheck, ShieldAlert, Pencil } from 'lucide-react';
import { PageContainer, PageHeader, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { ProfileQuickPicks } from '../../profile/components/ProfileQuickPicks';
import { useProfileDefaults } from '../../profile/hooks/useProfileDefaults';
import { cn } from '../../../lib/utils';
import { attendanceStatus, type AcademicRecord } from '../../../../server/services/academicMath';
import { useAcademicRecord, newId } from '../useAcademicRecord';

const input = 'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

export function AttendancePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { query, save, mark } = useAcademicRecord();
  const defaults = useProfileDefaults();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState<AcademicRecord | null>(null);

  const record = editing ? draft : query.data?.record;
  if (query.isLoading) return <PageContainer><LoadingState message="Loading your attendance…" /></PageContainer>;
  if (query.isError || !record) return <PageContainer><ErrorState message="Your attendance could not be loaded." onRetry={() => query.refetch()} /></PageContainer>;

  const req = record.attendance.required_percent;
  const rows = record.attendance.subjects.map((s) => ({ ...s, ...attendanceStatus(s.attended, s.total, req) }));
  const attended = rows.reduce((a, s) => a + s.attended, 0);
  const total = rows.reduce((a, s) => a + s.total, 0);
  const overall = attendanceStatus(attended, total, req);
  const atRisk = rows.filter((s) => !s.safe);

  const startEdit = () => {
    setDraft(structuredClone(query.data!.record));
    setEditing(true);
  };
  const setSubjects = (fn: (xs: AcademicRecord['attendance']['subjects']) => AcademicRecord['attendance']['subjects']) =>
    setDraft((d) => (d ? { ...d, attendance: { ...d.attendance, subjects: fn(d.attendance.subjects) } } : d));
  const addSubject = (name = '') => {
    if (!editing) {
      const base = structuredClone(query.data!.record);
      base.attendance.subjects.push({ id: newId(), name, attended: 0, total: 0 });
      setDraft(base);
      setEditing(true);
    } else setSubjects((xs) => [...xs, { id: newId(), name, attended: 0, total: 0 }]);
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Attendance"
        description="Mark each class as you go. You'll see how many classes you can still miss, or how many you must attend in a row, to stay above your college's minimum."
        icon={<CalendarCheck className="h-6 w-6" />}
        actions={
          editing ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={() => save.mutate(draft!, { onSuccess: () => setEditing(false) })} disabled={save.isPending} data-testid="attendance-save">
                {save.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          ) : (
            <Button variant="outline" className="gap-2" onClick={startEdit} data-testid="attendance-edit"><Pencil className="h-4 w-4" /> Edit subjects</Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard label="Overall" value={overall.percent === null ? '—' : `${overall.percent}%`} hint={`${attended} of ${total} classes`} icon={<CalendarCheck className="h-5 w-5" />} tone="brand" />
        <MetricCard label="Subjects below the minimum" value={atRisk.length} hint={atRisk.length ? atRisk.map((s) => s.name).slice(0, 2).join(', ') : 'All safe'} icon={atRisk.length ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />} tone={atRisk.length ? 'warning' : 'success'} />
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <label className="text-sm font-medium text-slate-600" htmlFor="att-req">College minimum</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              id="att-req"
              className={cn(input, 'w-20')}
              type="number"
              min={1}
              max={100}
              value={req}
              disabled={!editing}
              onChange={(e) => setDraft((d) => (d ? { ...d, attendance: { ...d.attendance, required_percent: Number(e.target.value) || 75 } } : d))}
            />
            <span className="text-sm text-slate-600">%</span>
          </div>
          {!editing && <p className="mt-1 text-[11px] text-slate-500">Most colleges require 75%. Change it under Edit subjects.</p>}
        </div>
      </div>

      {rows.length === 0 && !editing ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm text-slate-600">Add your subjects, then tap Present or Absent after each class.</p>
          <Button className="mt-3 gap-2" onClick={() => addSubject()} data-testid="attendance-add-empty"><Plus className="h-4 w-4" /> Add subject</Button>
          <ProfileQuickPicks className="justify-center" label="Your subjects" values={defaults.subjects} onPick={(n) => addSubject(n)} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="attendance-list">
          {rows.map((s) => (
            <article key={s.id} className={cn('rounded-2xl border bg-white p-4', s.safe ? 'border-slate-200' : 'border-amber-300')} data-testid="attendance-subject">
              {editing ? (
                <div className="space-y-2">
                  <input className={cn(input, 'w-full')} value={s.name} placeholder="Subject" aria-label="Subject name" onChange={(e) => setSubjects((xs) => xs.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))} />
                  <div className="flex items-center gap-2 text-sm">
                    <input className={cn(input, 'w-20')} type="number" min={0} value={s.attended} aria-label="Classes attended" onChange={(e) => setSubjects((xs) => xs.map((x) => (x.id === s.id ? { ...x, attended: Number(e.target.value) } : x)))} />
                    <span className="text-slate-500">attended of</span>
                    <input className={cn(input, 'w-20')} type="number" min={0} value={s.total} aria-label="Classes held" onChange={(e) => setSubjects((xs) => xs.map((x) => (x.id === s.id ? { ...x, total: Number(e.target.value) } : x)))} />
                    <button className="ml-auto rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove subject" onClick={() => setSubjects((xs) => xs.filter((x) => x.id !== s.id))}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-slate-900">{s.name}</h2>
                    <span className={cn('text-lg font-bold tabular-nums', s.safe ? 'text-emerald-600' : 'text-amber-600')} data-testid="attendance-percent">{s.percent === null ? '—' : `${s.percent}%`}</span>
                  </div>
                  <p className="text-xs text-slate-500">{s.attended} of {s.total} classes</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className={cn('h-2 rounded-full', s.safe ? 'bg-emerald-500' : 'bg-amber-500')} style={{ width: `${Math.min(100, s.percent ?? 0)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-700" data-testid="attendance-advice">
                    {s.total === 0
                      ? 'No classes marked yet.'
                      : s.safe
                        ? s.can_miss > 0
                          ? `You can miss ${s.can_miss} more class${s.can_miss === 1 ? '' : 'es'} and stay at ${req}% or above.`
                          : `Right at the limit: don't miss the next class.`
                        : Number.isFinite(s.must_attend)
                          ? `Attend the next ${s.must_attend} class${s.must_attend === 1 ? '' : 'es'} in a row to get back to ${req}%.`
                          : `${req}% can no longer be reached for this subject.`}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 gap-1" disabled={mark.isPending} onClick={() => mark.mutate({ subjectId: s.id, present: true })} data-testid="attendance-present"><Check className="h-4 w-4" /> Present</Button>
                    <Button size="sm" variant="outline" className="flex-1 gap-1" disabled={mark.isPending} onClick={() => mark.mutate({ subjectId: s.id, present: false })} data-testid="attendance-absent"><X className="h-4 w-4" /> Absent</Button>
                  </div>
                </>
              )}
            </article>
          ))}
          {editing && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 p-4">
              <Button variant="outline" className="gap-2" onClick={() => addSubject()}><Plus className="h-4 w-4" /> Add subject</Button>
              <ProfileQuickPicks
                label="Your subjects"
                values={defaults.subjects.filter((n) => !record.attendance.subjects.some((x) => x.name.toLowerCase() === n.toLowerCase()))}
                onPick={(n) => addSubject(n)}
              />
            </div>
          )}
        </div>
      )}

      <button className="text-sm text-blue-600 hover:underline" onClick={() => onNavigate('/grades')}>Grades & CGPA →</button>
    </PageContainer>
  );
}

export default AttendancePage;
