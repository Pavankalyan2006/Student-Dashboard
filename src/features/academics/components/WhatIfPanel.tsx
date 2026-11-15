import * as React from 'react';
import { FlaskConical, RotateCcw, ArrowRight } from 'lucide-react';
import { PageSection } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { GRADE_SCALES, whatIfCgpa, type AcademicRecord, type GradeScale } from '../../../../server/services/academicMath';

const input = 'h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:border-blue-400 focus:outline-none';

/**
 * Try grades without saving: change any subject's grade, or add a future semester's SGPA, and see the CGPA it
 * would give. Uses only the grades the student entered; nothing here is stored.
 */
export function WhatIfPanel({ record }: { record: AcademicRecord }) {
  const sems = [...record.semesters].sort((a, b) => a.semester - b.semester);
  // Start on the latest semester with an awaited grade, else the latest one.
  const initial = [...sems].reverse().find((s) => s.subjects.some((x) => !x.grade))?.semester ?? sems[sems.length - 1]?.semester ?? null;
  const [semester, setSemester] = React.useState<number | null>(initial);
  const [overrides, setOverrides] = React.useState<Record<string, string>>({});
  const [extraOn, setExtraOn] = React.useState(false);
  const [extraSgpa, setExtraSgpa] = React.useState(8);
  const [extraCredits, setExtraCredits] = React.useState(20);

  if (!sems.length) return null;
  const letters = record.scale === 'POINTS' ? [] : Object.keys(GRADE_SCALES[record.scale as Exclude<GradeScale, 'POINTS'>].grades);
  const sem = sems.find((s) => s.semester === semester) || sems[sems.length - 1];
  const r = whatIfCgpa(record, overrides, extraOn ? { sgpa: extraSgpa, credits: extraCredits } : null);
  const changed = Object.keys(overrides).length > 0 || extraOn;
  const semRow = r.semesters.find((s) => s.semester === sem.semester);

  return (
    <PageSection title="What-if simulator">
      <div className="space-y-3 text-sm" data-testid="grades-whatif">
        <p className="text-xs text-slate-500">Try different grades or a future semester. Nothing here is saved.</p>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600" htmlFor="whatif-sem">Semester</label>
          <select id="whatif-sem" className={input} value={sem.semester} onChange={(e) => setSemester(Number(e.target.value))}>
            {sems.map((s) => <option key={s.semester} value={s.semester}>Semester {s.semester}</option>)}
          </select>
          <span className="ml-auto text-xs text-slate-500">SGPA {semRow?.sgpa ?? '—'}</span>
        </div>
        <ul className="space-y-1.5">
          {sem.subjects.map((x, i) => {
            const val = overrides[x.id] ?? x.grade;
            const set = (g: string) => setOverrides((o) => {
              const next = { ...o };
              if (g === x.grade) delete next[x.id];
              else next[x.id] = g;
              return next;
            });
            return (
              <li key={x.id} className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-xs text-slate-700" title={x.name}>{x.name || `Subject ${i + 1}`}</span>
                {record.scale === 'POINTS' ? (
                  <input className={cn(input, 'w-20', overrides[x.id] !== undefined && 'border-blue-400 bg-blue-50')} type="number" min={0} max={10} step={0.1} value={val} aria-label={`What-if grade for ${x.name || `subject ${i + 1}`}`} onChange={(e) => set(e.target.value)} />
                ) : (
                  <select className={cn(input, 'w-24', overrides[x.id] !== undefined && 'border-blue-400 bg-blue-50')} value={letters.includes(val) ? val : ''} aria-label={`What-if grade for ${x.name || `subject ${i + 1}`}`} onChange={(e) => set(e.target.value)}>
                    <option value="">Awaited</option>
                    {letters.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                )}
              </li>
            );
          })}
        </ul>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input type="checkbox" checked={extraOn} onChange={(e) => setExtraOn(e.target.checked)} /> Add a future semester
        </label>
        {extraOn && (
          <div className="flex gap-2">
            <label className="flex-1 text-xs text-slate-600">SGPA<input className={cn(input, 'mt-1 w-full')} type="number" min={0} max={10} step={0.1} value={extraSgpa} onChange={(e) => setExtraSgpa(Number(e.target.value))} /></label>
            <label className="flex-1 text-xs text-slate-600">Credits<input className={cn(input, 'mt-1 w-full')} type="number" min={1} max={60} value={extraCredits} onChange={(e) => setExtraCredits(Number(e.target.value))} /></label>
          </div>
        )}
        <div className={cn('flex items-center gap-2 rounded-xl p-3', r.delta && r.delta < 0 ? 'bg-amber-50' : 'bg-blue-50')} data-testid="whatif-result">
          <span className="text-xs text-slate-600">CGPA</span>
          <strong className="text-slate-900">{r.current_cgpa ?? '—'}</strong>
          <ArrowRight className="h-4 w-4 text-slate-400" />
          <strong className="text-lg text-slate-900" data-testid="whatif-projected">{r.projected_cgpa ?? '—'}</strong>
          {r.delta !== null && changed && <span className={cn('text-xs font-semibold', r.delta >= 0 ? 'text-emerald-700' : 'text-amber-700')}>{r.delta >= 0 ? '+' : ''}{r.delta}</span>}
          <FlaskConical className="ml-auto h-4 w-4 text-slate-400" />
        </div>
        {changed && (
          <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => { setOverrides({}); setExtraOn(false); }}><RotateCcw className="h-3.5 w-3.5" /> Reset</Button>
        )}
      </div>
    </PageSection>
  );
}
