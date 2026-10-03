import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';

interface GraphVisualizerProps {
  step: VisualizationStep;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ step }) => {
  const nodes: string[] = step.state?.nodes || ['A', 'B', 'C', 'D', 'E', 'F'];
  const adj: Record<string, string[]> = step.state?.adj || {
    A: ['B', 'C'],
    B: ['A', 'D', 'E'],
    C: ['A', 'F'],
    D: ['B'],
    E: ['B', 'F'],
    F: ['C', 'E'],
  };
  const visited: string[] = step.state?.visited || [];
  const queue: string[] = step.state?.queue || [];
  const callStack: string[] = step.state?.callStack || [];
  const current: string = step.state?.current || (step.pointers?.current as string);
  const activeEdge: [string, string] | undefined = step.state?.activeEdge;
  const traversalOrder: string[] = step.state?.traversalOrder || [];

  // Compute circular or fixed coordinates for graph nodes
  const nodeCoords = React.useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {};
    const count = nodes.length;
    const cx = 250;
    const cy = 140;
    const r = 100;

    nodes.forEach((node, idx) => {
      const angle = (idx / count) * 2 * Math.PI - Math.PI / 2;
      coords[node] = {
        x: Math.round(cx + r * Math.cos(angle)),
        y: Math.round(cy + r * Math.sin(angle)),
      };
    });

    return coords;
  }, [nodes]);

  // Extract unique edges
  const edges = React.useMemo(() => {
    const unique = new Set<string>();
    const edgeList: { u: string; v: string; isActive: boolean }[] = [];

    Object.entries(adj).forEach(([u, neighbors]) => {
      neighbors.forEach((v) => {
        const key = [u, v].sort().join('-');
        if (!unique.has(key)) {
          unique.add(key);
          const isActive =
            activeEdge &&
            ((activeEdge[0] === u && activeEdge[1] === v) ||
              (activeEdge[0] === v && activeEdge[1] === u));
          edgeList.push({ u, v, isActive: !!isActive });
        }
      });
    });

    return edgeList;
  }, [adj, activeEdge]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] p-6 space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full max-w-3xl">
        {/* SVG Graph View */}
        <div className="relative w-full max-w-[500px] h-[280px] bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <svg viewBox="0 0 500 280" className="w-full h-full">
            {/* Edges */}
            {edges.map(({ u, v, isActive }) => {
              const p1 = nodeCoords[u];
              const p2 = nodeCoords[v];
              if (!p1 || !p2) return null;

              return (
                <line
                  key={`${u}-${v}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="currentColor"
                  strokeWidth={isActive ? '4' : '2'}
                  className={`transition-all duration-300 ${
                    isActive
                      ? 'text-blue-500 stroke-blue-500 animate-pulse'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              );
            })}

            {/* Vertices */}
            {nodes.map((node) => {
              const pos = nodeCoords[node];
              if (!pos) return null;

              const isCurrent = current === node;
              const isVisited = visited.includes(node);

              return (
                <g key={node} className="transition-all duration-300">
                  {isCurrent && (
                    <circle cx={pos.x} cy={pos.y} r="26" className="animate-ping opacity-35 fill-blue-400" />
                  )}

                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="20"
                    strokeWidth="2.5"
                    className={`transition-all duration-300 shadow-sm ${
                      isCurrent
                        ? 'fill-blue-600 stroke-blue-700 text-white'
                        : isVisited
                        ? 'fill-emerald-500 stroke-emerald-600 text-white'
                        : 'fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600 text-slate-800 dark:text-slate-100'
                    }`}
                  />

                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    className="text-sm font-mono font-bold select-none fill-current pointer-events-none"
                  >
                    {node}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Traversal State Side Panel (Queue or Call Stack) */}
        <div className="flex flex-col gap-3 min-w-[200px] w-full lg:w-60">
          {queue.length > 0 || (step.variables && 'queue' in step.variables) ? (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                BFS Queue (FIFO)
              </span>
              <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                {queue.length === 0 ? (
                  <span className="text-xs font-mono text-slate-400">Empty</span>
                ) : (
                  queue.map((qNode, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                    >
                      {qNode}
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {callStack.length > 0 || (step.variables && 'callStack' in step.variables) ? (
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-2">
                DFS Call Stack (LIFO)
              </span>
              <div className="flex flex-col-reverse gap-1 min-h-[32px]">
                {callStack.length === 0 ? (
                  <span className="text-xs font-mono text-slate-400">Empty</span>
                ) : (
                  callStack.map((cNode, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 rounded text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between"
                    >
                      <span>DFS({cNode})</span>
                      <span className="text-[10px] text-slate-400">depth {idx + 1}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {/* Visited Vertices Tracker */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Visited Order ({visited.length}/{nodes.length})
            </span>
            <div className="flex flex-wrap gap-1 items-center">
              {visited.length === 0 ? (
                <span className="text-xs font-mono text-slate-400">None</span>
              ) : (
                visited.map((vNode, idx) => (
                  <span
                    key={idx}
                    className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                  >
                    {vNode}
                  </span>
                ))
              )}
            </div>
          </div>
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
