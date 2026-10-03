import * as React from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { dsaApi } from '../api/dsaApi';
import { toast } from 'sonner';

interface DSAHintsProps {
  problemId: string;
  totalHints?: number;
}

export const DSAHints: React.FC<DSAHintsProps> = ({ problemId, totalHints = 3 }) => {
  const [unlockedLevel, setUnlockedLevel] = React.useState<number>(0);
  const [hints, setHints] = React.useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(true);

  const unlockNextHint = async () => {
    const nextLevel = unlockedLevel + 1;
    if (nextLevel > totalHints) return;

    setIsLoading(true);
    try {
      const res = await dsaApi.getHints(problemId, nextLevel);
      setHints((prev) => ({ ...prev, [nextLevel]: res.hint }));
      setUnlockedLevel(nextLevel);
      toast.info(`Unlocked Hint #${nextLevel}`);
    } catch {
      toast.error('Unable to unlock hint at this time.');
    } finally {
      setIsLoading(false);
    }
  };

  const hintLabels: Record<number, string> = {
    1: 'Conceptual Direction',
    2: 'Data Structure & Technique',
    3: 'Algorithm / Pseudocode Clue',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Progressive Hints ({unlockedLevel}/{totalHints} Unlocked)
          </h4>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-2">
          {/* Unlocked Hints List */}
          <div className="space-y-2">
            {[1, 2, 3].map((lvl) => {
              const isUnlocked = unlockedLevel >= lvl;
              const hintText = hints[lvl];

              return (
                <div
                  key={lvl}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    isUnlocked
                      ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60 text-slate-800 dark:text-slate-200'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono mb-1">
                    <span className="font-bold text-[11px] text-amber-700 dark:text-amber-300">
                      Hint {lvl}: {hintLabels[lvl]}
                    </span>
                    {!isUnlocked && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                  {isUnlocked ? (
                    <p className="leading-relaxed mt-1 text-slate-700 dark:text-slate-300">
                      {hintText || 'Think about the invariant condition before each iteration.'}
                    </p>
                  ) : (
                    <p className="italic text-[11px]">
                      Unlock when you are stuck. Does not penalize your score.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unlock Button */}
          {unlockedLevel < totalHints && (
            <Button
              variant="outline"
              size="sm"
              onClick={unlockNextHint}
              disabled={isLoading}
              className="w-full text-xs h-8 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/50"
            >
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
              {isLoading ? 'Unlocking...' : `Unlock Hint #${unlockedLevel + 1}`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
