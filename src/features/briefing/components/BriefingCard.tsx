import { Sunrise, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useBriefing } from '../briefingApi';
import { BriefingItemRow } from './BriefingItemRow';

/** Compact dashboard card: the top three briefing items, with a link to the full briefing. */
export function BriefingCard({ onNavigate }: { onNavigate: (path: string) => void }) {
  const q = useBriefing();
  if (q.isLoading || q.isError || !q.data) return null;
  const b = q.data;
  if (b.items.length === 0 && b.handled.length === 0) return null;
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5" data-testid="dashboard-briefing">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Sunrise className="h-5 w-5 text-amber-500" /> Today’s briefing
        </h2>
        <Button size="sm" variant="ghost" className="gap-1" onClick={() => onNavigate('/briefing')}>
          {b.items.length > 3 ? `All ${b.items.length}` : 'Open'} <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
      {b.items.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">Everything in today’s briefing is handled.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {b.items.slice(0, 3).map((i) => <BriefingItemRow key={i.id} item={i} date={b.date} onNavigate={onNavigate} compact />)}
        </ul>
      )}
    </section>
  );
}
