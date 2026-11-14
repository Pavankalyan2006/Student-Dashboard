import * as React from 'react';
import { Calculator, Plus, Trash2, Save, Target, AlertTriangle, GraduationCap, Layers } from 'lucide-react';
import { PageContainer, PageHeader, PageSection, MetricCard, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { ProfileQuickPicks } from '../../profile/components/ProfileQuickPicks';
import { useProfileDefaults } from '../../profile/hooks/useProfileDefaults';
import { cn } from '../../../lib/utils';
import { GRADE_SCALES, summariseGrades, gradePoint, type AcademicRecord, type GradeScale } from '../../../../server/services/academicMath';
import { useAcademicRecord, newId } from '../useAcademicRecord';

const input = 'h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

export function GradesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { query, save } = useAcademicRecord();
  const defaults = useProfileDefaults();
  const [draft, setDraft] = React.useState<AcademicRecord | null>(null);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    if (query.data && !dirty) setDraft(query.data.record);
  }, [query.data, dirty]);

  const update = (fn: (r: AcademicRecord) => AcademicRecord) => {
    setDraft((r) => (r ? fn(r) : r));
    setDirty(true);
  };

  if (query.isLoading || (!draft && !query.isError)) return <PageContainer><LoadingState message="Loading your grades…" /></PageContainer>;
  if (query.isError || !draft) return <PageContainer><ErrorState message="Your grades could not be loaded." onRetry={() => query.refetch()} /></PageContainer>;

  // Numbers update live from the draft; they are the same calculations the server stores.
  const summary = summariseGrades(draft);
  const letters = draft.scale === 'POINTS' ? [] : Object.keys(GRADE_SCALES[draft.scale].grades);
  const sorted = [...draft.semesters].sort((a, b) => a.semester - b.semester);
  const nextSemester = sorted.length ? Math.max(...sorted.map((s) => s.semester)) + 1 : 1;
  const maxSgpa = 10;

  const addSemester = () =>
    update((r) => ({ ...r, semesters: [...r.semesters, { semester: Math.min(16, nextSemester), subjects: [{ id: newId(), name: '', credits: 3, grade: '' }] }] }));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Grades & CGPA"
        description="Enter your results from your college grade card. SGPA and CGPA are credit-weighted from what you enter, and the planner shows what you need to reach your target."
        icon={<Calculator className="h-6 w-6" />}
        actions={
          <Button className="gap-2" disabled={!dirty || save.isPending} onClick={() => save.mutate(draft, { onSuccess: () => setDirty(false) })} data-testid="grades-save">
            <Save className="h-4 w-4" /> {save.isPending ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" data-testid="grades-summary">
        <MetricCard label="CGPA" value={summary.cgpa ?? '—'} hint={summary.cgpa === null ? 'Add a graded subject' : `Over ${summary.credits_done} credits`} icon={<GraduationCap className="h-5 w-5" />} tone="brand" />
        <MetricCard label="Semesters graded" value={summary.semesters.filter((s) => s.sgpa !== null).length} hint={`of ${draft.total_semesters}`} icon={<Layers className="h-5 w-5" />} tone="info" />
        <MetricCard label="Latest SGPA" value={[...summary.semesters].reverse().find((s) => s.sgpa !== null)?.sgpa ?? '—'} icon={<Calculator className="h-5 w-5" />} tone="violet" />
        <MetricCard label="Backlogs" value={summary.backlogs.length} hint={summary.backlogs.length ? summary.backlogs.map((b) => b.name).slice(0, 2).join(', ') : 'None'} icon={<AlertTriangle className="h-5 w-5" />} tone={summary.backlogs.length ? 'warning' : 'success'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <label className="text-xs font-medium text-slate-600">
              Grade scale
              <select
                className={cn(input, 'mt-1 block w-64')}
                value={draft.scale}
                onChange={(e) => update((r) => ({ ...r, scale: e.target.value as GradeScale }))}
                data-testid="grades-scale"
              >
                <option value="O_10">{GRADE_SCALES.O_10.label}</option>
                <option value="AA_10">{GRADE_SCALES.AA_10.label}</option>
                <option value="POINTS">I'll type grade points (0–10)</option>
              </select>
            </label>
            <p className="max-w-sm text-[11px] text-slate-500">Pick the scale on your grade card. If your university uses a different one, choose grade points and type the number for each subject.</p>
          </div>

          {sorted.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
              <p className="text-sm text-slate-600">No semesters yet. Add your first semester's results to see your SGPA and CGPA.</p>
              <Button className="mt-3 gap-2" onClick={addSemester} data-testid="grades-add-semester-empty"><Plus className="h-4 w-4" /> Add semester</Button>
            </div>
          )}

          {sorted.map((sem) => {
            const s = summary.semesters.find((x) => x.semester === sem.semester);
            const setSem = (fn: (subjects: typeof sem.subjects) => typeof sem.subjects) =>
              update((r) => ({ ...r, semesters: r.semesters.map((x) => (x.semester === sem.semester ? { ...x, subjects: fn(x.subjects) } : x)) }));
            const isCurrent = defaults.semester === sem.semester;
            return (
              <section key={sem.semester} className="rounded-2xl border border-slate-200 bg-white p-4" data-testid="grades-semester">
                <header className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-slate-900">Semester {sem.semester}</h2>
                  {isCurrent && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">Current</span>}
                  <span className="ml-auto text-sm text-slate-600">
                    SGPA <strong className="text-slate-900" data-testid="grades-sgpa">{s?.sgpa ?? '—'}</strong> · {s?.credits ?? 0} credits
                  </span>
                  <button
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove semester ${sem.semester}`}
                    onClick={() => update((r) => ({ ...r, semesters: r.semesters.filter((x) => x.semester !== sem.semester) }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </header>
                <div className="space-y-2">
                  <div className="hidden grid-cols-[minmax(0,1fr)_5rem_7rem_2rem] gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:grid">
                    <span>Subject</span><span>Credits</span><span>Grade</span><span />
                  </div>
                  {sem.subjects.map((sub, i) => {
                    const bad = sub.grade && gradePoint(draft.scale, sub.grade) === null;
                    return (
                      <div key={sub.id} className="grid grid-cols-[minmax(0,1fr)_4.5rem_6rem_2rem] gap-2 sm:grid-cols-[minmax(0,1fr)_5rem_7rem_2rem]">
                        <input className={input} value={sub.name} placeholder={`Subject ${i + 1}`} aria-label="Subject name" onChange={(e) => setSem((xs) => xs.map((x) => (x.id === sub.id ? { ...x, name: e.target.value } : x)))} />
                        <input className={input} type="number" min={0} max={30} step={0.5} value={sub.credits} aria-label="Credits" onChange={(e) => setSem((xs) => xs.map((x) => (x.id === sub.id ? { ...x, credits: Number(e.target.value) } : x)))} />
                        {draft.scale === 'POINTS' ? (
                          <input className={cn(input, bad && 'border-rose-400')} type="number" min={0} max={10} step={0.1} value={sub.grade} placeholder="0–10" aria-label="Grade points" onChange={(e) => setSem((xs) => xs.map((x) => (x.id === sub.id ? { ...x, grade: e.target.value } : x)))} />
                        ) : (
                          <select className={cn(input, bad && 'border-rose-400')} value={letters.includes(sub.grade) ? sub.grade : ''} aria-label="Grade" onChange={(e) => setSem((xs) => xs.map((x) => (x.id === sub.id ? { ...x, grade: e.target.value } : x)))}>
                            <option value="">Awaited</option>
                            {letters.map((l) => (
                              <option key={l} value={l}>{l} ({GRADE_SCALES[draft.scale as Exclude<GradeScale, 'POINTS'>].grades[l]})</option>
                            ))}
                          </select>
                        )}
                        <button className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label="Remove subject" onClick={() => setSem((xs) => xs.filter((x) => x.id !== sub.id))}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSem((xs) => [...xs, { id: newId(), name: '', credits: 3, grade: '' }])}>
                    <Plus className="h-4 w-4" /> Add subject
                  </Button>
                  {isCurrent && (
                    <ProfileQuickPicks
                      label="Your subjects"
                      values={defaults.subjects.filter((n) => !sem.subjects.some((x) => x.name.toLowerCase() === n.toLowerCase()))}
                      onPick={(name) => setSem((xs) => [...xs.filter((x) => x.name || x.grade), { id: newId(), name, credits: 3, grade: '' }])}
                    />
                  )}
                </div>
              </section>
            );
          })}
          {sorted.length > 0 && sorted.length < 16 && (
            <Button variant="outline" className="gap-2" onClick={addSemester} data-testid="grades-add-semester"><Plus className="h-4 w-4" /> Add semester {nextSemester}</Button>
          )}
        </div>

        <aside className="space-y-4">
          <PageSection title="Target CGPA planner">
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <label className="flex-1 text-xs font-medium text-slate-600">
                  Target CGPA
                  <input className={cn(input, 'mt-1 w-full')} type="number" min={0} max={10} step={0.1} value={draft.target_cgpa ?? ''} placeholder="e.g. 8.5" onChange={(e) => update((r) => ({ ...r, target_cgpa: e.target.value === '' ? null : Number(e.target.value) }))} data-testid="grades-target" />
                </label>
                <label className="w-24 text-xs font-medium text-slate-600">
                  Semesters
                  <input className={cn(input, 'mt-1 w-full')} type="number" min={1} max={16} value={draft.total_semesters} onChange={(e) => update((r) => ({ ...r, total_semesters: Number(e.target.value) || 8 }))} />
                </label>
              </div>
              {summary.plan ? (
                <div className={cn('rounded-xl p-3', summary.plan.feasible ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900')} data-testid="grades-plan">
                  <p className="flex items-center gap-1.5 font-semibold"><Target className="h-4 w-4" /> Target {summary.plan.target}</p>
                  {summary.plan.already_met ? (
                    <p className="mt-1">You are already at or above it. Keep every remaining SGPA at {summary.plan.target} or more to stay there.</p>
                  ) : summary.plan.remaining_semesters === 0 ? (
                    <p className="mt-1">All semesters are graded, so your CGPA can no longer change.</p>
                  ) : summary.plan.feasible ? (
                    <p className="mt-1">Average an SGPA of <strong data-testid="grades-required">{summary.plan.required_sgpa}</strong> over the next {summary.plan.remaining_semesters} semester{summary.plan.remaining_semesters === 1 ? '' : 's'}.</p>
                  ) : (
                    <p className="mt-1">You would need an average SGPA of {summary.plan.required_sgpa}, which is above 10. Try a target you can reach, such as {Math.floor(((summary.cgpa! * summary.credits_done + 10 * summary.plan.remaining_credits) / (summary.credits_done + summary.plan.remaining_credits)) * 10) / 10}.</p>
                  )}
                  <p className="mt-2 text-[11px] opacity-80">Assumes about {summary.plan.remaining_credits} credits left, from your average credits per semester so far.</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Set a target and grade at least one semester to see the SGPA you need.</p>
              )}
            </div>
          </PageSection>

          {summary.semesters.some((s) => s.sgpa !== null) && (
            <PageSection title="SGPA by semester">
              <div className="flex h-32 items-end gap-2" data-testid="grades-trend">
                {summary.semesters.map((s) => (
                  <div key={s.semester} className="flex flex-1 flex-col items-center gap-1" title={`Semester ${s.semester}: ${s.sgpa ?? 'no grades'}`}>
                    <span className="text-[10px] tabular-nums text-slate-600">{s.sgpa ?? ''}</span>
                    <div className={cn('w-full rounded-t', s.backlogs ? 'bg-amber-400' : 'bg-blue-500')} style={{ height: `${Math.max(4, ((s.sgpa ?? 0) / maxSgpa) * 96)}px` }} />
                    <span className="text-[10px] text-slate-500">S{s.semester}</span>
                  </div>
                ))}
              </div>
            </PageSection>
          )}

          <button className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left text-sm hover:bg-slate-50" onClick={() => onNavigate('/attendance')}>
            <span className="font-medium text-slate-900">Attendance</span>
            <span className="block text-xs text-slate-500">Track each subject against your college's minimum.</span>
          </button>
        </aside>
      </div>
    </PageContainer>
  );
}

export default GradesPage;
