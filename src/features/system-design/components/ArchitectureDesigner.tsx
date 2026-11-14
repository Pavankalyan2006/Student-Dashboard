// src/features/system-design/components/ArchitectureDesigner.tsx
// Visual Interactive Architecture Editor with 5-Category Component Palette,
// Directional Bezier Connections, Properties Inspector, Auto-Arrange, Undo/Redo & JSON/PNG Export

import * as React from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Download,
  Upload,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Zap,
  Archive,
  Search,
  Sparkles,
  Activity,
  Radio,
  Wifi,
  Bell,
  Clock,
  Globe,
  Smartphone,
  ShieldCheck,
  Cpu,
  GitFork,
  Shuffle,
  Lock,
  Table,
  ListOrdered,
  Cloud,
  Box,
  Grid,
  LineChart,
  FileText,
  Key,
  Gauge,
  RefreshCw,
  Users,
  Crown,
  Split,
  MapPin,
  Settings,
  X,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  ArchitectureComponent,
  ArchitectureConnection,
  ComponentCategory,
  ComponentType,
  ConnectionProtocol
} from '../types/systemDesign';
import { toast } from 'sonner';

export interface ArchitectureDesignerProps {
  components: ArchitectureComponent[];
  connections: ArchitectureConnection[];
  onChange: (components: ArchitectureComponent[], connections: ArchitectureConnection[]) => void;
  onSave?: () => void;
  readOnly?: boolean;
}

// 5-Category Component Palette Definitions
const PALETTE_DEFINITIONS: Array<{
  category: ComponentCategory;
  categoryLabel: string;
  items: Array<{
    type: ComponentType;
    name: string;
    defaultTech: string;
    icon: any;
    desc: string;
  }>;
}> = [
  {
    category: 'APPLICATION',
    categoryLabel: 'Application & Ingress',
    items: [
      { type: 'WEB_CLIENT', name: 'Web Client', defaultTech: 'React / Next.js', icon: Globe, desc: 'Web browser SPA' },
      { type: 'MOBILE_CLIENT', name: 'Mobile Client', defaultTech: 'iOS / Android', icon: Smartphone, desc: 'Mobile native client' },
      { type: 'API_GATEWAY', name: 'API Gateway', defaultTech: 'Kong / AWS API GW', icon: ShieldCheck, desc: 'Auth, rate limit & routing' },
      { type: 'LOAD_BALANCER', name: 'Load Balancer', defaultTech: 'Nginx / AWS ALB', icon: Shuffle, desc: 'L7 / L4 traffic distributor' },
      { type: 'REVERSE_PROXY', name: 'Reverse Proxy', defaultTech: 'HAProxy / Traefik', icon: GitFork, desc: 'Edge reverse proxy' },
      { type: 'APP_SERVER', name: 'Application Server', defaultTech: 'Node.js / Express', icon: Cpu, desc: 'Core business service' },
      { type: 'BACKEND_SERVICE', name: 'Microservice', defaultTech: 'Go / FastAPI', icon: Layers, desc: 'Domain microservice' },
      { type: 'AUTH_SERVICE', name: 'Auth & Identity', defaultTech: 'OAuth 2.0 / JWT', icon: Lock, desc: 'Session & identity' }
    ]
  },
  {
    category: 'STORAGE',
    categoryLabel: 'Storage & Data',
    items: [
      { type: 'SQL_DATABASE', name: 'SQL Database', defaultTech: 'PostgreSQL 16', icon: Database, desc: 'ACID relational store' },
      { type: 'NOSQL_DATABASE', name: 'NoSQL Database', defaultTech: 'MongoDB / DynamoDB', icon: Table, desc: 'Document / KV store' },
      { type: 'CACHE', name: 'In-Memory Cache', defaultTech: 'Redis 7.0 Cluster', icon: Zap, desc: 'Sub-ms cache tier' },
      { type: 'OBJECT_STORAGE', name: 'Object Storage', defaultTech: 'AWS S3 / GCS', icon: Archive, desc: 'Durable blob storage' },
      { type: 'SEARCH_INDEX', name: 'Search Engine', defaultTech: 'Elasticsearch', icon: Search, desc: 'Inverted index' },
      { type: 'VECTOR_DATABASE', name: 'Vector DB', defaultTech: 'Pinecone / pgvector', icon: Sparkles, desc: 'AI embeddings' }
    ]
  },
  {
    category: 'COMMUNICATION',
    categoryLabel: 'Communication & Async',
    items: [
      { type: 'MESSAGE_QUEUE', name: 'Message Queue', defaultTech: 'RabbitMQ / SQS', icon: ListOrdered, desc: 'Async task buffer' },
      { type: 'STREAMING_PLATFORM', name: 'Streaming Platform', defaultTech: 'Apache Kafka', icon: Activity, desc: 'Partitioned event log' },
      { type: 'EVENT_BUS', name: 'Event Bus', defaultTech: 'EventBridge', icon: Radio, desc: 'Pub/sub enterprise bus' },
      { type: 'WEBSOCKET_SERVICE', name: 'WebSocket Service', defaultTech: 'Socket.io / ws', icon: Wifi, desc: 'Real-time duplex' },
      { type: 'NOTIFICATION_SERVICE', name: 'Notification Service', defaultTech: 'FCM / Twilio', icon: Bell, desc: 'Push / SMS alerts' },
      { type: 'BACKGROUND_WORKER', name: 'Background Worker', defaultTech: 'Celery / BullMQ', icon: Clock, desc: 'Async task processor' }
    ]
  },
  {
    category: 'INFRASTRUCTURE',
    categoryLabel: 'Infrastructure & SecOps',
    items: [
      { type: 'CDN', name: 'CDN Edge', defaultTech: 'Cloudflare Edge', icon: Cloud, desc: 'Global edge cache' },
      { type: 'DNS', name: 'Route53 DNS', defaultTech: 'Anycast DNS', icon: Globe, desc: 'Latency geo-routing' },
      { type: 'CONTAINER_ORCHESTRATION', name: 'Kubernetes (K8s)', defaultTech: 'EKS / GKE', icon: Grid, desc: 'Container cluster' },
      { type: 'RATE_LIMITER', name: 'Rate Limiter', defaultTech: 'Redis Token Bucket', icon: Gauge, desc: 'Traffic throttle' },
      { type: 'FIREWALL', name: 'WAF Firewall', defaultTech: 'Cloudflare WAF', icon: ShieldAlert, desc: 'DDoS & security' },
      { type: 'MONITORING_SERVICE', name: 'Monitoring (Prometheus)', defaultTech: 'Prometheus + Grafana', icon: LineChart, desc: 'SLO telemetry' },
      { type: 'LOGGING_SERVICE', name: 'Centralized Logging', defaultTech: 'ELK Stack / Loki', icon: FileText, desc: 'Distributed logs' },
      { type: 'SECRETS_MANAGER', name: 'Secrets Vault', defaultTech: 'HashiCorp Vault', icon: Key, desc: 'KMS & credentials' }
    ]
  },
  {
    category: 'DISTRIBUTED',
    categoryLabel: 'Distributed Topology',
    items: [
      { type: 'PRIMARY_DB', name: 'Primary DB Node', defaultTech: 'Postgres Leader', icon: Database, desc: 'Write leader WAL' },
      { type: 'READ_REPLICA', name: 'Read Replica Node', defaultTech: 'Postgres Replica', icon: Copy, desc: 'Async read clone' },
      { type: 'SHARD', name: 'Database Shard', defaultTech: 'Hash Shard Partition', icon: Split, desc: 'Partitioned slice' },
      { type: 'LEADER', name: 'Consensus Leader', defaultTech: 'Raft Leader', icon: Crown, desc: 'Consensus coordinator' },
      { type: 'FOLLOWER', name: 'Consensus Follower', defaultTech: 'Raft Follower', icon: Users, desc: 'State replicator' },
      { type: 'REGIONAL_DEPLOYMENT', name: 'Multi-Region PoP', defaultTech: 'AWS Multi-Region VPC', icon: MapPin, desc: 'Secondary region' },
      { type: 'FAILOVER_COMPONENT', name: 'Failover Controller', defaultTech: 'Heartbeat Watchdog', icon: RefreshCw, desc: 'Auto-failover agent' }
    ]
  }
];

const PROTOCOLS: ConnectionProtocol[] = [
  'HTTP/REST',
  'HTTPS',
  'gRPC',
  'WebSocket',
  'TCP',
  'UDP',
  'Kafka',
  'AMQP',
  'SQL',
  'Redis/RESP',
  'GraphQL',
  'Replication_Log'
];

export function ArchitectureDesigner({
  components = [],
  connections = [],
  onChange,
  onSave,
  readOnly = false
}: ArchitectureDesignerProps) {
  // Canvas Viewport State
  const [scale, setScale] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = React.useState(false);
  const [startPan, setStartPan] = React.useState({ x: 0, y: 0 });

  // Selection & Inspector State
  const [selectedComponentId, setSelectedComponentId] = React.useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = React.useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = React.useState<string | null>(null);

  // Palette Active Tab
  const [activePaletteCat, setActivePaletteCat] = React.useState<ComponentCategory>('APPLICATION');

  // Dragging State
  const [draggingCompId, setDraggingCompId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  // History State for Undo/Redo
  const [history, setHistory] = React.useState<Array<{ components: ArchitectureComponent[]; connections: ArchitectureConnection[] }>>([]);
  const [historyIndex, setHistoryIndex] = React.useState(-1);

  // Push to history on significant state change
  const recordHistory = React.useCallback(
    (newComps: ArchitectureComponent[], newConns: ArchitectureConnection[]) => {
      const next = history.slice(0, historyIndex + 1);
      next.push({
        components: JSON.parse(JSON.stringify(newComps)),
        connections: JSON.parse(JSON.stringify(newConns))
      });
      if (next.length > 30) next.shift();
      setHistory(next);
      setHistoryIndex(next.length - 1);
    },
    [history, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const target = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(target.components, target.connections);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const target = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(target.components, target.connections);
    }
  };

  // Canvas Pan Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'diagram-canvas-root') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedComponentId(null);
      setSelectedConnectionId(null);
      setConnectingSourceId(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingCompId) {
      const updated = components.map(c => {
        if (c.id === draggingCompId) {
          const newX = Math.round((e.clientX - pan.x) / scale - dragOffset.x);
          const newY = Math.round((e.clientY - pan.y) / scale - dragOffset.y);
          return {
            ...c,
            position: { x: Math.max(20, newX), y: Math.max(20, newY) }
          };
        }
        return c;
      });
      onChange(updated, connections);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggingCompId) {
      setDraggingCompId(null);
      recordHistory(components, connections);
    }
  };

  // Add Component from Palette
  const handleAddComponent = (item: { type: ComponentType; name: string; defaultTech: string; desc: string }, cat: ComponentCategory) => {
    if (readOnly) return;
    const newId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const spawnX = Math.round(-pan.x / scale + 250 + Math.random() * 80);
    const spawnY = Math.round(-pan.y / scale + 150 + Math.random() * 80);

    const newComp: ArchitectureComponent = {
      id: newId,
      name: item.name,
      category: cat,
      type: item.type,
      tech_choice: item.defaultTech,
      description: item.desc,
      position: { x: Math.max(40, spawnX), y: Math.max(40, spawnY) },
      properties: { instances: 1, capacity_rps: 5000 }
    };

    const nextComps = [...components, newComp];
    onChange(nextComps, connections);
    recordHistory(nextComps, connections);
    setSelectedComponentId(newId);
    toast.success(`Added ${item.name}`);
  };

  // Node Click Handlers
  const handleComponentClick = (e: React.MouseEvent, compId: string) => {
    e.stopPropagation();
    if (connectingSourceId) {
      if (connectingSourceId === compId) {
        setConnectingSourceId(null);
        return;
      }
      // Create Connection
      const connId = `conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const sourceComp = components.find(c => c.id === connectingSourceId);
      const targetComp = components.find(c => c.id === compId);

      // Guess sensible default protocol
      let defaultProto: ConnectionProtocol = 'HTTP/REST';
      if (targetComp?.category === 'STORAGE') defaultProto = targetComp.type === 'CACHE' ? 'Redis/RESP' : 'SQL';
      if (targetComp?.category === 'COMMUNICATION') defaultProto = 'Kafka';
      if (sourceComp?.type === 'WEB_CLIENT' || sourceComp?.type === 'MOBILE_CLIENT') defaultProto = 'HTTPS';

      const newConnection: ArchitectureConnection = {
        id: connId,
        from: connectingSourceId,
        to: compId,
        protocol: defaultProto,
        label: `${defaultProto} requests`,
        direction: 'UNIDIRECTIONAL'
      };

      const nextConns = [...connections, newConnection];
      onChange(components, nextConns);
      recordHistory(components, nextConns);
      setConnectingSourceId(null);
      setSelectedConnectionId(connId);
      toast.success(`Connected ${sourceComp?.name} → ${targetComp?.name}`);
    } else {
      setSelectedComponentId(compId);
      setSelectedConnectionId(null);
    }
  };

  const handleStartDrag = (e: React.MouseEvent, comp: ArchitectureComponent) => {
    e.stopPropagation();
    if (readOnly) return;
    setDraggingCompId(comp.id);
    const mouseCanvasX = (e.clientX - pan.x) / scale;
    const mouseCanvasY = (e.clientY - pan.y) / scale;
    setDragOffset({
      x: mouseCanvasX - comp.position.x,
      y: mouseCanvasY - comp.position.y
    });
  };

  const handleDeleteSelected = () => {
    if (readOnly) return;
    if (selectedComponentId) {
      const nextComps = components.filter(c => c.id !== selectedComponentId);
      const nextConns = connections.filter(
        cn => cn.from !== selectedComponentId && cn.to !== selectedComponentId
      );
      onChange(nextComps, nextConns);
      recordHistory(nextComps, nextConns);
      setSelectedComponentId(null);
      toast.info('Component deleted');
    } else if (selectedConnectionId) {
      const nextConns = connections.filter(cn => cn.id !== selectedConnectionId);
      onChange(components, nextConns);
      recordHistory(components, nextConns);
      setSelectedConnectionId(null);
      toast.info('Connection deleted');
    }
  };

  const handleDuplicateSelected = () => {
    if (readOnly || !selectedComponentId) return;
    const target = components.find(c => c.id === selectedComponentId);
    if (!target) return;
    const newId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cloned: ArchitectureComponent = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      name: `${target.name} (Copy)`,
      position: { x: target.position.x + 40, y: target.position.y + 40 }
    };
    const nextComps = [...components, cloned];
    onChange(nextComps, connections);
    recordHistory(nextComps, connections);
    setSelectedComponentId(newId);
    toast.success(`Duplicated ${target.name}`);
  };

  // Auto-Arrange Layout (Left-to-Right 4 Tier Architecture)
  const handleAutoArrange = () => {
    if (readOnly || components.length === 0) return;
    const tiers: Record<string, ArchitectureComponent[]> = {
      tier1: [], // Clients & DNS & CDN
      tier2: [], // Ingress / LB / Gateway
      tier3: [], // App servers / Services
      tier4: []  // Storage / DB / Queues
    };

    components.forEach(c => {
      if (['WEB_CLIENT', 'MOBILE_CLIENT', 'DNS', 'CDN'].includes(c.type)) {
        tiers.tier1.push(c);
      } else if (['LOAD_BALANCER', 'REVERSE_PROXY', 'API_GATEWAY', 'FIREWALL'].includes(c.type)) {
        tiers.tier2.push(c);
      } else if (c.category === 'APPLICATION' || c.category === 'COMMUNICATION') {
        tiers.tier3.push(c);
      } else {
        tiers.tier4.push(c);
      }
    });

    const arranged: ArchitectureComponent[] = [];
    const tierX = [80, 320, 600, 920];

    [tiers.tier1, tiers.tier2, tiers.tier3, tiers.tier4].forEach((tierList, tIdx) => {
      tierList.forEach((comp, idx) => {
        arranged.push({
          ...comp,
          position: {
            x: tierX[tIdx],
            y: 100 + idx * 140
          }
        });
      });
    });

    onChange(arranged, connections);
    recordHistory(arranged, connections);
    toast.success('Architecture auto-arranged into 4-tier topology');
  };

  // JSON Export / Import
  const handleExportJson = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      components,
      connections
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `architecture_diagram_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported architecture JSON');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.components) && Array.isArray(parsed.connections)) {
          onChange(parsed.components, parsed.connections);
          recordHistory(parsed.components, parsed.connections);
          toast.success(`Imported ${parsed.components.length} components`);
        } else {
          toast.error('Invalid architecture file: missing components or connections array');
        }
      } catch (err: any) {
        toast.error('JSON parse error: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Selected Item for Properties Inspector
  const selectedComponent = components.find(c => c.id === selectedComponentId);
  const selectedConnection = connections.find(cn => cn.id === selectedConnectionId);

  // Structural Topology Warnings
  const connectedIds = React.useMemo(() => {
    const set = new Set<string>();
    connections.forEach(cn => {
      set.add(cn.from);
      set.add(cn.to);
    });
    return set;
  }, [connections]);

  const disconnectedCount = components.filter(c => !connectedIds.has(c.id)).length;

  return (
    <div className="flex h-[760px] bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative select-none">
      {/* ------------------------------------------------------------- */}
      {/* LEFT COMPONENT PALETTE */}
      {/* ------------------------------------------------------------- */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-20">
        <div className="p-3 border-b border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Component Palette</span>
          <p className="text-[11px] text-slate-500 mt-0.5">Click any node to spawn on canvas</p>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 p-1 gap-1 overflow-x-auto text-xs">
          {PALETTE_DEFINITIONS.map(p => (
            <button
              key={p.category}
              onClick={() => setActivePaletteCat(p.category)}
              className={`px-2 py-1.5 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                activePaletteCat === p.category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {p.category.slice(0, 4)}
            </button>
          ))}
        </div>

        {/* Category Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {PALETTE_DEFINITIONS.find(p => p.category === activePaletteCat)?.items.map(item => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.type}
                onClick={() => handleAddComponent(item, activePaletteCat)}
                disabled={readOnly}
                className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 transition-all group flex items-start gap-2.5"
              >
                <div className="p-1.5 rounded-md bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white transition-colors">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 truncate">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{item.defaultTech}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Connection Instructions */}
        <div className="p-2.5 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400">
          <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
            <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
            Connect Nodes
          </div>
          Click the <span className="text-indigo-400 font-mono text-[10px]">● Link</span> port on any node, then click target node.
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CANVAS MAIN AREA */}
      {/* ------------------------------------------------------------- */}
      <div
        id="diagram-canvas-root"
        className="flex-1 relative overflow-hidden bg-[#0A0D14] cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
      >
        {/* Floating Top Control Toolbar */}
        <div className="absolute top-3 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2 py-1.5 rounded-xl shadow-lg pointer-events-auto">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              title="Undo"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              title="Redo"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={() => setScale(s => Math.min(2, s + 0.1))}
              title="Zoom In"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300 px-1">{Math.round(scale * 100)}%</span>
            <button
              onClick={() => setScale(s => Math.max(0.4, s - 0.1))}
              title="Zoom Out"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setScale(1); setPan({ x: 0, y: 0 }); }}
              title="Fit to Center"
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={handleAutoArrange}
              disabled={readOnly}
              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 flex items-center gap-1.5"
            >
              <Grid className="w-3.5 h-3.5" />
              Auto-Arrange
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {disconnectedCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/70 border border-amber-600/60 rounded-xl text-amber-300 text-xs shadow-md">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{disconnectedCount} Disconnected Node{disconnectedCount > 1 ? 's' : ''}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-2 py-1.5 rounded-xl shadow-lg">
              <label className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer" title="Import Architecture JSON">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>
              <button
                onClick={handleExportJson}
                title="Export Architecture JSON"
                className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <Download className="w-4 h-4" />
              </button>
              {onSave && (
                <Button onClick={onSave} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3">
                  Save Design
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Connecting Active Notice Banner */}
        {connectingSourceId && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl flex items-center gap-2 animate-pulse">
            <Shuffle className="w-3.5 h-3.5" />
            <span>Select target component to complete connection...</span>
            <button onClick={() => setConnectingSourceId(null)} className="ml-1 hover:text-indigo-200">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* SVG Drawing Layer for Connections & Grid */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            </pattern>
            {/* Arrowhead Markers */}
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#818CF8" />
            </marker>
            <marker id="arrow-selected" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#38BDF8" />
            </marker>
          </defs>
          <rect x="-2000" y="-2000" width="8000" height="8000" fill="url(#arch-grid)" />

          {/* Render Connections as Bezier Curves */}
          {connections.map(conn => {
            const source = components.find(c => c.id === conn.from);
            const target = components.find(c => c.id === conn.to);
            if (!source || !target) return null;

            // Compute connection edge points
            const sx = source.position.x + 100;
            const sy = source.position.y + 40;
            const tx = target.position.x + 100;
            const ty = target.position.y + 40;

            const dx = tx - sx;
            const dy = ty - sy;
            const cx1 = sx + dx / 2;
            const cy1 = sy;
            const cx2 = sx + dx / 2;
            const cy2 = ty;

            const pathD = `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
            const isSelected = selectedConnectionId === conn.id;

            return (
              <g key={conn.id} className="pointer-events-auto cursor-pointer" onClick={() => { setSelectedConnectionId(conn.id); setSelectedComponentId(null); }}>
                {/* Thick invisible click boundary */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth="16" />
                {/* Visual Stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isSelected ? '#38BDF8' : '#6B66EC'}
                  strokeWidth={isSelected ? 3 : 2}
                  strokeDasharray={conn.is_async ? '6 4' : undefined}
                  markerEnd={isSelected ? 'url(#arrow-selected)' : 'url(#arrow)'}
                  className="transition-all"
                />
                {/* Connection Protocol Badge */}
                <foreignObject x={(sx + tx) / 2 - 45} y={(sy + ty) / 2 - 12} width="90" height="24">
                  <div className={`px-1.5 py-0.5 rounded text-[10px] font-mono text-center truncate shadow-md ${
                    isSelected ? 'bg-sky-500 text-white font-bold' : 'bg-slate-900 border border-indigo-500/50 text-indigo-300'
                  }`}>
                    {conn.protocol}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* HTML Node Layer for Components */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {components.map(comp => {
            const isSelected = selectedComponentId === comp.id;
            const isConnectSource = connectingSourceId === comp.id;
            const hasConnection = connectedIds.has(comp.id);

            return (
              <div
                key={comp.id}
                onMouseDown={(e) => handleStartDrag(e, comp)}
                onClick={(e) => handleComponentClick(e, comp.id)}
                style={{
                  transform: `translate(${comp.position.x}px, ${comp.position.y}px)`
                }}
                className={`absolute w-52 bg-slate-900/95 rounded-xl border backdrop-blur-md shadow-xl transition-all cursor-move pointer-events-auto group ${
                  isSelected
                    ? 'border-indigo-400 ring-2 ring-indigo-500/40 shadow-indigo-500/20'
                    : isConnectSource
                    ? 'border-sky-400 ring-2 ring-sky-500 animate-pulse'
                    : hasConnection
                    ? 'border-slate-700/80 hover:border-slate-500'
                    : 'border-amber-500/70 hover:border-amber-400'
                }`}
              >
                {/* Node Header */}
                <div className="p-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
                    <span className="text-xs font-bold text-slate-100 truncate">{comp.name}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {comp.category.slice(0, 4)}
                  </span>
                </div>

                {/* Node Body */}
                <div className="p-2.5 space-y-1">
                  <div className="text-[11px] font-mono text-indigo-400 truncate">
                    {comp.tech_choice || comp.type}
                  </div>
                  {comp.properties?.instances && (
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Instances:</span>
                      <span className="font-semibold text-slate-200">{comp.properties.instances}x</span>
                    </div>
                  )}
                  {comp.properties?.capacity_rps && (
                    <div className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Capacity:</span>
                      <span className="font-semibold text-slate-200">{comp.properties.capacity_rps.toLocaleString()} RPS</span>
                    </div>
                  )}
                </div>

                {/* Node Actions Footer */}
                <div className="px-2.5 py-1.5 bg-slate-950/60 rounded-b-xl border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConnectingSourceId(isConnectSource ? null : comp.id);
                    }}
                    title="Connect to another node"
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors flex items-center gap-1 ${
                      isConnectSource ? 'bg-sky-500 text-white' : 'text-indigo-400 hover:bg-indigo-950/60'
                    }`}
                  >
                    <Shuffle className="w-3 h-3" />
                    {isConnectSource ? 'Cancel' : 'Link'}
                  </button>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedComponentId(comp.id); handleDuplicateSelected(); }}
                      title="Duplicate"
                      className="p-1 text-slate-400 hover:text-white rounded"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedComponentId(comp.id); handleDeleteSelected(); }}
                      title="Delete"
                      className="p-1 text-red-400 hover:text-red-300 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT PROPERTIES INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      {(selectedComponent || selectedConnection) && (
        <div className="w-72 bg-slate-950 border-l border-slate-800 flex flex-col z-20 overflow-y-auto">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {selectedComponent ? 'Component Inspector' : 'Connection Inspector'}
              </span>
            </div>
            <button
              onClick={() => { setSelectedComponentId(null); setSelectedConnectionId(null); }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Component Properties Editor */}
          {selectedComponent && (
            <div className="p-3.5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Display Label</label>
                <input
                  type="text"
                  value={selectedComponent.name}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = components.map(c => c.id === selectedComponent.id ? { ...c, name: e.target.value } : c);
                    onChange(updated, connections);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Technology Choice</label>
                <input
                  type="text"
                  value={selectedComponent.tech_choice || ''}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = components.map(c => c.id === selectedComponent.id ? { ...c, tech_choice: e.target.value } : c);
                    onChange(updated, connections);
                  }}
                  placeholder="e.g. Redis Cluster, PostgreSQL, Go Gin"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Instances</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={selectedComponent.properties?.instances || 1}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updated = components.map(c => c.id === selectedComponent.id ? {
                        ...c,
                        properties: { ...c.properties, instances: Number(e.target.value) || 1 }
                      } : c);
                      onChange(updated, connections);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Capacity (RPS)</label>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={selectedComponent.properties?.capacity_rps || 5000}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updated = components.map(c => c.id === selectedComponent.id ? {
                        ...c,
                        properties: { ...c.properties, capacity_rps: Number(e.target.value) || 1000 }
                      } : c);
                      onChange(updated, connections);
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Description & Role</label>
                <textarea
                  rows={3}
                  value={selectedComponent.description}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = components.map(c => c.id === selectedComponent.id ? { ...c, description: e.target.value } : c);
                    onChange(updated, connections);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <Button
                  onClick={handleDuplicateSelected}
                  size="sm"
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 text-xs"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Duplicate
                </Button>
                <Button
                  onClick={handleDeleteSelected}
                  size="sm"
                  variant="danger"
                  className="flex-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                </Button>
              </div>
            </div>
          )}

          {/* Connection Properties Editor */}
          {selectedConnection && (
            <div className="p-3.5 space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Protocol / Communication</label>
                <select
                  value={selectedConnection.protocol}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = connections.map(cn => cn.id === selectedConnection.id ? {
                      ...cn,
                      protocol: e.target.value as ConnectionProtocol
                    } : cn);
                    onChange(components, updated);
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                >
                  {PROTOCOLS.map(proto => (
                    <option key={proto} value={proto}>{proto}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Label</label>
                <input
                  type="text"
                  value={selectedConnection.label || ''}
                  disabled={readOnly}
                  onChange={(e) => {
                    const updated = connections.map(cn => cn.id === selectedConnection.id ? {
                      ...cn,
                      label: e.target.value
                    } : cn);
                    onChange(components, updated);
                  }}
                  placeholder="e.g. Read miss fallback"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={selectedConnection.is_async || false}
                    disabled={readOnly}
                    onChange={(e) => {
                      const updated = connections.map(cn => cn.id === selectedConnection.id ? {
                        ...cn,
                        is_async: e.target.checked
                      } : cn);
                      onChange(components, updated);
                    }}
                    className="rounded text-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <span>Asynchronous communication (dashed line)</span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <Button
                  onClick={handleDeleteSelected}
                  size="sm"
                  variant="danger"
                  className="w-full text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Connection
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
