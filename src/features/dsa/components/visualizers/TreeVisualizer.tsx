import * as React from 'react';
import { VisualizationStep } from '../../types/dsa';

interface TreeVisualizerProps {
  step: VisualizationStep;
}

interface TreeNode {
  val: number;
  left?: TreeNode;
  right?: TreeNode;
}

interface PositionedNode {
  val: number;
  x: number;
  y: number;
  left?: PositionedNode;
  right?: PositionedNode;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ step }) => {
  const rootNode: TreeNode | undefined = step.state?.tree;
  const flatList: number[] = step.state?.flatList || [];
  const highlighted = step.highlighted_elements || [];
  const comparisons = step.comparisons || [];
  const pointers = step.pointers || {};

  // Compute positioned tree
  const positionedTree = React.useMemo(() => {
    if (!rootNode) return null;

    const width = 600;
    const height = 300;
    const levelHeight = 65;

    const layout = (
      node: TreeNode | undefined,
      depth: number,
      leftBound: number,
      rightBound: number
    ): PositionedNode | undefined => {
      if (!node) return undefined;
      const x = (leftBound + rightBound) / 2;
      const y = 40 + depth * levelHeight;

      return {
        val: node.val,
        x,
        y,
        left: layout(node.left, depth + 1, leftBound, x),
        right: layout(node.right, depth + 1, x, rightBound),
      };
    };

    return layout(rootNode, 0, 20, width - 20);
  }, [rootNode]);

  // Collect all edges and nodes for SVG rendering
  const { edges, nodes } = React.useMemo(() => {
    const edgeList: { x1: number; y1: number; x2: number; y2: number; id: string }[] = [];
    const nodeList: PositionedNode[] = [];

    const traverse = (n?: PositionedNode) => {
      if (!n) return;
      nodeList.push(n);

      if (n.left) {
        edgeList.push({ x1: n.x, y1: n.y, x2: n.left.x, y2: n.left.y, id: `${n.val}-${n.left.val}` });
        traverse(n.left);
      }
      if (n.right) {
        edgeList.push({ x1: n.x, y1: n.y, x2: n.right.x, y2: n.right.y, id: `${n.val}-${n.right.val}` });
        traverse(n.right);
      }
    };

    traverse(positionedTree || undefined);
    return { edges: edgeList, nodes: nodeList };
  }, [positionedTree]);

  const getNodeColor = (val: number) => {
    if (pointers.match === val) {
      return 'fill-emerald-500 stroke-emerald-600 text-white';
    }
    if (comparisons.includes(val)) {
      return 'fill-amber-400 stroke-amber-500 text-amber-950';
    }
    if (highlighted.includes(val) || pointers.current === val) {
      return 'fill-blue-600 stroke-blue-700 text-white';
    }
    return 'fill-white dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600 text-slate-800 dark:text-slate-100';
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[300px] p-6 space-y-4">
      {/* SVG Canvas for Tree */}
      <div className="relative w-full max-w-2xl overflow-x-auto bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 flex items-center justify-center">
        {!positionedTree ? (
          <div className="py-16 text-center text-sm font-mono text-slate-400">
            Tree is empty or initializing...
          </div>
        ) : (
          <svg viewBox="0 0 600 300" className="w-full max-w-[600px] h-[300px]">
            {/* Tree Edges */}
            {edges.map((e) => (
              <line
                key={e.id}
                x1={e.x1}
                y1={e.y1}
                x2={e.x2}
                y2={e.y2}
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-slate-300 dark:text-slate-700 transition-all duration-300"
              />
            ))}

            {/* Tree Nodes */}
            {nodes.map((n) => {
              const isCurrent = pointers.current === n.val;
              const isMatch = pointers.match === n.val;

              return (
                <g key={n.val} className="transition-all duration-300 cursor-pointer">
                  {/* Outer glow ring for active node */}
                  {(isCurrent || isMatch) && (
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="24"
                      className={`animate-ping opacity-30 ${isMatch ? 'fill-emerald-400' : 'fill-blue-400'}`}
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="19"
                    strokeWidth="2.5"
                    className={`${getNodeColor(n.val)} transition-all duration-300 shadow-md`}
                  />

                  {/* Node Label Value */}
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    className="text-xs font-mono font-bold select-none fill-current pointer-events-none"
                  >
                    {n.val}
                  </text>

                  {/* Pointer tag below node */}
                  {isCurrent && (
                    <text
                      x={n.x}
                      y={n.y + 32}
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-blue-600 dark:fill-blue-400 uppercase select-none"
                    >
                      CURRENT
                    </text>
                  )}
                  {isMatch && (
                    <text
                      x={n.x}
                      y={n.y + 32}
                      textAnchor="middle"
                      className="text-[10px] font-mono font-bold fill-emerald-600 dark:fill-emerald-400 uppercase select-none"
                    >
                      MATCH
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Flat List Invariant / Input Array */}
      {flatList.length > 0 && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span>Tree Nodes: [{flatList.join(', ')}]</span>
        </div>
      )}

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
