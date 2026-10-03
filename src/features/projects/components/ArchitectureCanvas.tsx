import React, { useState, useRef, useEffect } from 'react';
import {
  ProjectArchitecture,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureNodeType,
} from '../types/project';
import {
  Server,
  Database,
  Cpu,
  Globe,
  User,
  ExternalLink,
  HardDrive,
  Layers,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Link as LinkIcon,
} from 'lucide-react';

interface ArchitectureCanvasProps {
  architecture: ProjectArchitecture;
  onSave: (arch: Partial<ProjectArchitecture>) => Promise<any>;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  architecture,
  onSave,
}) => {
  const [nodes, setNodes] = useState<ArchitectureNode[]>(architecture.nodes || []);
  const [edges, setEdges] = useState<ArchitectureEdge[]>(architecture.edges || []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  // Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with prop updates
  useEffect(() => {
    setNodes(architecture.nodes || []);
    setEdges(architecture.edges || []);
  }, [architecture]);

  const getNodeIcon = (type: ArchitectureNodeType) => {
    switch (type) {
      case 'USER':
        return <User className="w-4 h-4 text-emerald-500" />;
      case 'FRONTEND':
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'BACKEND':
        return <Server className="w-4 h-4 text-purple-500" />;
      case 'DATABASE':
        return <Database className="w-4 h-4 text-amber-500" />;
      case 'AI':
        return <Cpu className="w-4 h-4 text-rose-500" />;
      case 'STORAGE':
        return <HardDrive className="w-4 h-4 text-cyan-500" />;
      case 'EXTERNAL_API':
        return <ExternalLink className="w-4 h-4 text-orange-500" />;
      default:
        return <Layers className="w-4 h-4 text-slate-500" />;
    }
  };

  const getNodeBorder = (type: ArchitectureNodeType) => {
    switch (type) {
      case 'USER':
        return 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20';
      case 'FRONTEND':
        return 'border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20';
      case 'BACKEND':
        return 'border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20';
      case 'DATABASE':
        return 'border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20';
      case 'AI':
        return 'border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20';
      case 'STORAGE':
        return 'border-cyan-200 dark:border-cyan-900 bg-cyan-50/50 dark:bg-cyan-950/20';
      case 'EXTERNAL_API':
        return 'border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20';
      default:
        return 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900';
    }
  };

  // Node Drag handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (isConnecting) {
      if (isConnecting !== nodeId) {
        // Create edge
        const newEdge: ArchitectureEdge = {
          id: `edge_${Date.now()}`,
          project_id: architecture.project_id,
          source_node: isConnecting,
          target_node: nodeId,
          label: 'Data Transfer',
        };
        const updatedEdges = [...edges, newEdge];
        setEdges(updatedEdges);
        onSave({ nodes, edges: updatedEdges });
      }
      setIsConnecting(null);
      return;
    }

    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !containerRef.current) return;

    setSelectedNodeId(nodeId);
    setDraggingNodeId(nodeId);

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    setDragOffset({
      x: mouseX - node.position.x,
      y: mouseY - node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / scale;
    const mouseY = (e.clientY - rect.top) / scale;

    const newX = Math.max(20, Math.min(1200, Math.round(mouseX - dragOffset.x)));
    const newY = Math.max(20, Math.min(700, Math.round(mouseY - dragOffset.y)));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n))
    );
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
      onSave({ nodes, edges });
    }
  };

  // Add node handler
  const handleAddNode = (type: ArchitectureNodeType) => {
    const newNode: ArchitectureNode = {
      id: `node_${Date.now()}`,
      project_id: architecture.project_id,
      name: `New ${type.charAt(0) + type.slice(1).toLowerCase()} Component`,
      type,
      description: 'Custom component purpose',
      position: { x: 150 + (nodes.length % 4) * 80, y: 150 + Math.floor(nodes.length / 4) * 80 },
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    onSave({ nodes: updatedNodes, edges });
  };

  // Delete selected node
  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = edges.filter(
      (e) => e.source_node !== nodeId && e.target_node !== nodeId
    );
    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNodeId(null);
    onSave({ nodes: updatedNodes, edges: updatedEdges });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col h-[650px] shadow-xs select-none">
      {/* Canvas Toolbar */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-1">Add:</span>
          {(['FRONTEND', 'BACKEND', 'DATABASE', 'AI', 'SERVICE', 'EXTERNAL_API'] as ArchitectureNodeType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => handleAddNode(type)}
                className="px-2 py-1 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {getNodeIcon(type)}
                <span>{type.charAt(0) + type.slice(1).toLowerCase()}</span>
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {isConnecting && (
            <span className="text-xs font-semibold text-purple-600 animate-pulse bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
              Click target node to connect edge...
            </span>
          )}

          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setScale((s) => Math.max(0.6, s - 0.1))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] px-1.5 font-mono text-slate-500">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setScale(1)}
              className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="flex-1 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 rounded-xl mt-3 border border-dashed border-slate-200 dark:border-slate-800"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        >
          {/* SVG Edges Layer */}
          <svg className="absolute inset-0 w-[1400px] h-[900px] pointer-events-none z-0">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon points="0 0, 8 4, 0 8" fill="#64748b" />
              </marker>
            </defs>

            {edges.map((edge) => {
              const source = nodes.find((n) => n.id === edge.source_node);
              const target = nodes.find((n) => n.id === edge.target_node);
              if (!source || !target) return null;

              // Compute center points of source and target cards
              const x1 = source.position.x + 85;
              const y1 = source.position.y + 40;
              const x2 = target.position.x + 85;
              const y2 = target.position.y + 40;

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    markerEnd="url(#arrowhead)"
                  />
                  {edge.label && (
                    <text
                      x={midX}
                      y={midY - 8}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="10"
                      fontWeight="600"
                      className="select-none bg-white font-mono"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes Layer */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                className={`absolute w-[180px] p-3 rounded-xl border shadow-xs cursor-move z-10 transition-shadow ${getNodeBorder(
                  node.type
                )} ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-md'
                    : 'hover:shadow-sm'
                }`}
                style={{
                  left: `${node.position.x}px`,
                  top: `${node.position.y}px`,
                }}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {getNodeIcon(node.type)}
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {node.name}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/70 dark:bg-slate-800/80 text-slate-500">
                    {node.type}
                  </span>
                </div>

                {/* Node Description */}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                  {node.description || 'Component node'}
                </p>

                {/* Node Action Buttons */}
                {isSelected && (
                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-200/50 dark:border-slate-800/50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsConnecting(node.id);
                      }}
                      className="text-[10px] font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
                      title="Connect edge to another node"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>Connect</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNode(node.id);
                      }}
                      className="text-[10px] text-rose-500 hover:text-rose-700 p-0.5 rounded cursor-pointer"
                      title="Delete Node"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
