import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';

interface HeapVisualizerProps {
  step: VisualizationStep;
}

export const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ step }) => {
  const heap: number[] = Array.isArray(step.state?.heap)
    ? step.state.heap
    : Array.isArray(step.state)
    ? step.state
    : [1, 3, 4, 10, 5];
  const type: 'min' | 'max' = step.state?.type || 'min';
  const highlighted = step.highlighted_elements || [];
  const swaps = step.swaps || null;
  const pointers = step.pointers || {};

  // Compute Tree Layout for complete binary tree up to 4 levels
  const treeNodes = React.useMemo(() => {
    const nodes: { idx: number; val: number; x: number; y: number; parentIdx: number | null }[] = [];
    const width = 560;
    const levelHeight = 60;

    for (let i = 0; i < heap.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, level) - 1);
      const totalInLevel = Math.pow(2, level);
      const x = ((posInLevel + 0.5) / totalInLevel) * width;
      const y = 35 + level * levelHeight;
      const parentIdx = i === 0 ? null : Math.floor((i - 1) / 2);

      nodes.push({ idx: i, val: heap[i], x, y, parentIdx });
    }
    return nodes;
  }, [heap]);

  const getNodeColor = (idx: number, val: number) => {
    if (swaps && (swaps[0] === idx || swaps[1] === idx)) {
      return 'fill-purple-500 stroke-purple-600 text-white';
    }
    if (highlighted.includes(idx) || highlighted.includes(val)) {
      return 'fill-blue-600 stroke-blue-700 text-white font-bold';
    }
    if (idx === 0) {
      return 'fill-emerald-500 stroke-emerald-600 text-white';
    }
    return 'fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600 text-slate-800 dark:text-slate-100';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] p-6 space-y-6">
      {/* Header Tag */}
      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 uppercase tracking-wide">
          {type.toUpperCase()} HEAP (Invariant: parent {type === 'min' ? '≤' : '≥'} child)
        </span>
      </div>

      {/* Tree Visualization Canvas */}
      <div className="relative w-full max-w-xl overflow-x-auto bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center">
        {heap.length === 0 ? (
          <div className="py-12 text-xs font-mono text-slate-400">Heap is empty</div>
        ) : (
          <svg viewBox="0 0 560 220" className="w-full max-w-[560px] h-[220px]">
            {/* Edges from Parent to Child */}
            {treeNodes.map((n) => {
              if (n.parentIdx === null) return null;
              const parent = treeNodes[n.parentIdx];
              if (!parent) return null;
              return (
                <line
                  key={`edge-${n.parentIdx}-${n.idx}`}
                  x1={parent.x}
                  y1={parent.y}
                  x2={n.x}
                  y2={n.y}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-300 dark:text-slate-700"
                />
              );
            })}

            {/* Tree Nodes */}
            {treeNodes.map((n) => {
              const isSwapped = swaps && (swaps[0] === n.idx || swaps[1] === n.idx);

              return (
                <g key={`node-${n.idx}`} className="transition-all duration-300">
                  {isSwapped && (
                    <circle cx={n.x} cy={n.y} r="22" className="animate-ping opacity-30 fill-purple-400" />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="18"
                    strokeWidth="2.5"
                    className={`${getNodeColor(n.idx, n.val)} transition-all duration-300 shadow-sm`}
                  />
                  <text
                    x={n.x}
                    y={n.y + 4}
                    textAnchor="middle"
                    className="text-xs font-mono font-bold select-none fill-current pointer-events-none"
                  >
                    {n.val}
                  </text>
                  <text
                    x={n.x}
                    y={n.y - 22}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500 select-none"
                  >
                    [{n.idx}]
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Underlying 1D Array View */}
      <div className="flex flex-col items-center space-y-1.5 w-full">
        <span className="text-[11px] font-mono text-slate-400">Contiguous Array Storage</span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {heap.map((val, idx) => {
            const isSwapped = swaps && (swaps[0] === idx || swaps[1] === idx);
            const isHighlighted = highlighted.includes(idx);
            const isRoot = idx === 0;

            return (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-mono font-bold border-2 transition-all duration-300 ${
                    isSwapped
                      ? 'bg-purple-500 text-white border-purple-600'
                      : isHighlighted
                      ? 'bg-blue-600 text-white border-blue-700'
                      : isRoot
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-400'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {val}
                </div>
                <span className="text-[9px] font-mono text-slate-400 mt-0.5">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Variables Readout Bar */}
      {step.variables && Object.keys(step.variables).length > 0 && (
        <div className="flex items-center gap-3 flex-wrap justify-center pt-1 text-xs">
          {Object.entries(step.variables).map(([k, v]) => (
            <div
              key={k}
              className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-mono"
            >
              <span className="text-slate-500">{k}:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {typeof v === 'object' ? JSON.stringify(v) : String(v)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
