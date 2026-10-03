import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDSAVisualizerStore } from '../stores/dsaVisualizerStore';
import { dsaApi } from '../api/dsaApi';
import { toast } from 'sonner';

interface CustomInputModalProps {
  algorithmId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomInputModal: React.FC<CustomInputModalProps> = ({
  algorithmId,
  isOpen,
  onClose,
}) => {
  const { session, setSession } = useDSAVisualizerStore();
  const [arrayStr, setArrayStr] = React.useState('5, 2, 9, 1, 7, 6');
  const [targetVal, setTargetVal] = React.useState('7');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let customPayload: any = {};

      if (session?.visualization_type === 'ARRAY' || session?.visualization_type === 'POINTERS') {
        const parsed = arrayStr
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n));

        if (parsed.length < 2) {
          toast.error('Please enter at least 2 numbers.');
          setIsLoading(false);
          return;
        }

        if (parsed.length > 25) {
          toast.error('Maximum 25 elements allowed for visual clarity.');
          setIsLoading(false);
          return;
        }

        if (algorithmId.includes('search')) {
          customPayload = { array: parsed, target: Number(targetVal) || parsed[0] };
        } else {
          customPayload = { array: parsed };
        }
      } else if (session?.visualization_type === 'TREE') {
        const parsed = arrayStr
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n));
        customPayload = { nodes: parsed, searchVal: Number(targetVal) || 7 };
      } else if (session?.visualization_type === 'HEAP') {
        const parsed = arrayStr
          .split(',')
          .map((s) => Number(s.trim()))
          .filter((n) => !isNaN(n));
        customPayload = { values: parsed, type: 'min' };
      } else if (session?.visualization_type === 'DP_TABLE') {
        customPayload = { n: Math.min(Math.max(Number(targetVal) || 6, 2), 10) };
      } else {
        customPayload = { array: [10, 20, 30] };
      }

      const newSession = await dsaApi.visualizeAlgorithm(algorithmId, customPayload);
      setSession(newSession);
      toast.success('Generated deterministic visualization steps for your custom input!');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate visualizer with custom input');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Custom Input</DialogTitle>
          <DialogDescription>
            Enter your own test dataset to simulate execution step-by-step.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {session?.visualization_type !== 'DP_TABLE' ? (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Input Array / Nodes (comma-separated, max 25)
              </label>
              <Input
                value={arrayStr}
                onChange={(e) => setArrayStr(e.target.value)}
                placeholder="e.g. 12, 3, 45, 7, 19"
                className="font-mono text-xs"
                required
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Fibonacci Number (N between 2 and 10)
              </label>
              <Input
                type="number"
                min={2}
                max={10}
                value={targetVal}
                onChange={(e) => setTargetVal(e.target.value)}
                className="font-mono text-xs"
                required
              />
            </div>
          )}

          {(algorithmId.includes('search') || session?.visualization_type === 'TREE') && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Search Target Value
              </label>
              <Input
                type="number"
                value={targetVal}
                onChange={(e) => setTargetVal(e.target.value)}
                placeholder="e.g. 7"
                className="font-mono text-xs"
                required
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isLoading ? 'Generating Steps...' : 'Simulate Algorithm'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
