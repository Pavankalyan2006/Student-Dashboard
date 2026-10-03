import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { dsaApi } from '../api/dsaApi';
import { AlgorithmComparisonDimension, Algorithm } from '../types/dsa';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AlgorithmComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAlgorithm: Algorithm;
}

export const AlgorithmComparisonModal: React.FC<AlgorithmComparisonModalProps> = ({
  isOpen,
  onClose,
  currentAlgorithm,
}) => {
  const [allAlgos, setAllAlgos] = React.useState<Algorithm[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([currentAlgorithm.id]);
  const [comparisons, setComparisons] = React.useState<AlgorithmComparisonDimension[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      dsaApi.getAlgorithms().then((algos) => {
        setAllAlgos(algos);
        // Find comparable algorithms in the same topic or related
        const related = algos.filter(
          (a) => a.id !== currentAlgorithm.id && a.topic_id === currentAlgorithm.topic_id
        );
        const initial = [currentAlgorithm.id, ...(related.length > 0 ? [related[0].id] : [])];
        setSelectedIds(initial);
      });
    }
  }, [isOpen, currentAlgorithm]);

  React.useEffect(() => {
    if (selectedIds.length > 0) {
      setIsLoading(true);
      dsaApi
        .compareAlgorithms(selectedIds)
        .then((res) => setComparisons(res))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    }
  }, [selectedIds]);

  const toggleAlgo = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Algorithm Comparison Matrix</DialogTitle>
          <DialogDescription>
            Compare runtime bounds, memory footprint, and engineering trade-offs side by side.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Select Algorithms Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Algorithms to Compare (up to 3):
            </span>
            <div className="flex flex-wrap gap-2">
              {allAlgos.map((algo) => {
                const isSelected = selectedIds.includes(algo.id);
                return (
                  <button
                    key={algo.id}
                    type="button"
                    onClick={() => toggleAlgo(algo.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {algo.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-400">
              Loading algorithm comparison...
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  <tr>
                    <th className="p-3">Metric</th>
                    {comparisons.map((c) => (
                      <th key={c.id} className="p-3 text-slate-900 dark:text-white font-bold">
                        {c.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 font-mono">Best Case</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {c.best_case}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 font-mono">Average Case</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="p-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {c.average_case}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 font-mono">Worst Case</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="p-3 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {c.worst_case}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500 font-mono">Space Complexity</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="p-3 font-mono">
                        {c.space_complexity}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Stability</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="p-3">
                        <div className="flex items-center gap-1.5">
                          {c.stable ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                          <span>{c.stable ? 'Stable' : 'Unstable'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">In-Place Memory</td>
                    {comparisons.map((c) => (
                      <td key={c.id} className="p-3">
                        <div className="flex items-center gap-1.5">
                          {c.in_place ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-400" />
                          )}
                          <span>{c.in_place ? 'In-Place' : 'Auxiliary Space'}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
