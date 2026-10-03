import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { codingApi } from '../api/codingApi';
import { CodeExecution } from '../types/coding';
import { useCodingEditorStore } from '../stores/codingEditorStore';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  X,
  Cpu,
} from 'lucide-react';
import { toast } from 'sonner';

interface CodingHistoryProps {
  onClose?: () => void;
}

export const CodingHistory: React.FC<CodingHistoryProps> = ({ onClose }) => {
  const setSourceCode = useCodingEditorStore((s) => s.setSourceCode);
  const setLanguage = useCodingEditorStore((s) => s.setLanguage);

  const { data: executions = [], isLoading } = useQuery({
    queryKey: ['coding-executions-history'],
    queryFn: () => codingApi.getExecutions(30),
  });

  const handleRestore = (item: CodeExecution) => {
    setLanguage(item.language);
    setSourceCode(item.source_code_snapshot);
    toast.success('Restored code snapshot into editor');
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Execution History</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center p-6 text-slate-400 text-xs">Loading execution history...</div>
        ) : executions.length === 0 ? (
          <div className="text-center p-8 text-slate-400 text-xs">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p>No recent code executions recorded.</p>
            <p className="text-[11px] text-slate-500 mt-1">Run code in the editor to record execution checkpoints.</p>
          </div>
        ) : (
          executions.map((exec) => (
            <div
              key={exec.id}
              className="p-3 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {exec.status === 'SUCCESS' ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      SUCCESS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <XCircle className="w-3.5 h-3.5" />
                      {exec.status}
                    </span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span className="uppercase text-slate-600 dark:text-slate-300 font-mono">
                    {exec.language}
                  </span>
                </div>

                <button
                  onClick={() => handleRestore(exec)}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium transition-colors"
                  title="Restore this code snapshot"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                <span>{exec.execution_time_ms} ms</span>
                {exec.memory_kb && (
                  <span>{Math.round(exec.memory_kb / 1024)} MB</span>
                )}
                <span>Exit {exec.exit_code}</span>
                <span className="ml-auto text-[10px] text-slate-400">
                  {new Date(exec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              {exec.stdout && (
                <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded font-mono text-[10px] text-slate-600 dark:text-slate-400 max-h-16 overflow-y-auto whitespace-pre-wrap">
                  {exec.stdout.slice(0, 150)}
                  {exec.stdout.length > 150 && '...'}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
