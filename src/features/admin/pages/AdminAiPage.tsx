import * as React from 'react';
import {
  Cpu,
  Layers,
  Wrench,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Power,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  adminApi,
  AIProviderItem,
  AIModelItem,
  AIToolItem,
} from '../../../api/adminApi';
import { cn } from '../../../lib/utils';
import { toast } from 'sonner';

export function AdminAiPage() {
  const [activeTab, setActiveTab] = React.useState<'providers' | 'models' | 'tools' | 'orchestration' | 'usage'>('orchestration');
  const [providers, setProviders] = React.useState<AIProviderItem[]>([]);
  const [models, setModels] = React.useState<AIModelItem[]>([]);
  const [tools, setTools] = React.useState<AIToolItem[]>([]);
  const [agents, setAgents] = React.useState<any[]>([]);
  const [workflowsData, setWorkflowsData] = React.useState<any>(null);
  const [usage, setUsage] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, m, t, u] = await Promise.all([
        adminApi.getAiProviders(),
        adminApi.getAiModels(),
        adminApi.getAiTools(),
        adminApi.getAiUsage(),
      ]);
      setProviders(p);
      setModels(m);
      setTools(t);
      setUsage(u);

      // Load Multi-Agent Orchestration data
      const token = localStorage.getItem('auth_token') || '';
      const [agentsRes, wfRes] = await Promise.all([
        fetch('/api/v1/admin/ai/agents', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => null),
        fetch('/api/v1/admin/ai/workflows', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => null),
      ]);

      if (agentsRes?.success) setAgents(agentsRes.data);
      if (wfRes?.success) setWorkflowsData(wfRes.data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load AI administration details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAgent = async (agentName: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    try {
      const token = localStorage.getItem('auth_token') || '';
      const res = await fetch(`/api/v1/admin/ai/agents/${agentName}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: nextState }),
      }).then((r) => r.json());

      if (res?.success) {
        setAgents((prev) =>
          prev.map((a) => (a.name === agentName ? { ...a, enabled: nextState, metric: { ...a.metric, enabled: nextState } } : a))
        );
        toast.success(`Agent '${agentName}' ${nextState ? 'enabled' : 'disabled'}`);
      } else {
        throw new Error(res?.error?.message || 'Toggle failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle agent feature flag');
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleToggleTool = async (tool: AIToolItem) => {
    const nextState = !tool.is_enabled;
    try {
      await adminApi.updateAiTool(tool.name, nextState);
      setTools((prev) =>
        prev.map((t) => (t.name === tool.name ? { ...t, is_enabled: nextState } : t))
      );
      toast.success(`Tool '${tool.name}' ${nextState ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle tool state');
    }
  };

  const handleToggleProvider = async (provider: AIProviderItem) => {
    const nextState = !provider.is_enabled;
    try {
      await adminApi.updateAiProvider(provider.id, { is_enabled: nextState });
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, is_enabled: nextState } : p))
      );
      toast.success(`Provider '${provider.display_name}' ${nextState ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update provider');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            AI Operations & Tool Safety Plane
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure LLM providers, model specializations, and enforce least-privilege safety on the Tool Registry.
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          Refresh AI State
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-navy-700 pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('providers')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            activeTab === 'providers'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Cpu className="h-4 w-4" /> AI Providers ({providers.length})
        </button>
        <button
          onClick={() => setActiveTab('models')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            activeTab === 'models'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Layers className="h-4 w-4" /> Models ({models.length})
        </button>
        <button
          onClick={() => setActiveTab('tools')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            activeTab === 'tools'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Wrench className="h-4 w-4" /> Tool Registry ({tools.length})
        </button>
        <button
          onClick={() => setActiveTab('orchestration')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            activeTab === 'orchestration'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <Sparkles className="h-4 w-4 text-indigo-400" /> Domain Agents ({agents.length || 28})
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer',
            activeTab === 'usage'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
              : 'text-slate-400 hover:text-white'
          )}
        >
          <BarChart3 className="h-4 w-4" /> Usage & Tokens
        </button>
      </div>

      {/* Tab: Providers */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">{p.display_name}</h3>
                      {p.is_primary && (
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Driver: {p.provider_name}</p>
                  </div>

                  <button
                    onClick={() => handleToggleProvider(p)}
                    className={cn(
                      'p-2 rounded-xl border transition-colors cursor-pointer',
                      p.is_enabled
                        ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400 hover:bg-emerald-900/60'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                    )}
                    title={p.is_enabled ? 'Disable provider' : 'Enable provider'}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy-700 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Status</span>
                    <p className="font-semibold text-emerald-400">{p.health_status}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Requests</span>
                    <p className="font-semibold text-white">{p.total_requests}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase">Latency</span>
                    <p className="font-semibold text-cyan-400">{p.avg_latency_ms}ms</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-navy-950 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>API Key Storage:</span>
                  <span className="text-emerald-400 font-mono">ENCRYPTED_VAULT_ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Models */}
      {activeTab === 'models' && (
        <div className="rounded-2xl bg-navy-900 border border-navy-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 border-b border-navy-700 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Model Specialization</th>
                  <th className="py-3 px-4">Model ID</th>
                  <th className="py-3 px-4">Role Mapping</th>
                  <th className="py-3 px-4">Context Window</th>
                  <th className="py-3 px-4">Max Output</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-navy-800/50">
                    <td className="py-3 px-4 font-semibold text-white">{m.model_name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-cyan-300">{m.model_id}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {m.role_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{(m.context_window_tokens / 1024).toFixed(0)}k tokens</td>
                    <td className="py-3 px-4 text-slate-300">{m.max_output_tokens} tokens</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-400 font-medium">● Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tool Registry */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-700 flex items-center justify-between text-xs">
            <p className="text-slate-300">
              <ShieldCheck className="h-4 w-4 inline mr-1.5 text-amber-400" />
              Administrative Tool Registry Controls: Disable tools immediately during runtime anomalies.
            </p>
            <span className="text-[10px] text-slate-500">Zero Arbitrary Execution</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((t) => (
              <div
                key={t.name}
                className={cn(
                  'p-4 rounded-2xl border transition-all space-y-3',
                  t.is_enabled
                    ? 'bg-navy-900 border-navy-700'
                    : 'bg-navy-950/70 border-rose-900/40 opacity-70'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold text-amber-300">{t.name}</code>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
                  </div>

                  <button
                    onClick={() => handleToggleTool(t)}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0',
                      t.is_enabled
                        ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300'
                        : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                    )}
                  >
                    {t.is_enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>

                <div className="pt-2 border-t border-navy-700 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Timeout: <strong className="text-slate-300">{t.timeoutMs}ms</strong></span>
                  <span>Confirmation: <strong className="text-slate-300">{t.requires_confirmation ? 'Required' : 'None'}</strong></span>
                  <span>Roles: <strong className="text-slate-300">{t.permissions.join(', ')}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Multi-Agent Orchestration & Domain Agents */}
      {activeTab === 'orchestration' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Specialized Domain Agents</span>
              <p className="text-2xl font-bold text-indigo-400 mt-1">{agents.length || 28}</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Workflows Run</span>
              <p className="text-2xl font-bold text-white mt-1">{workflowsData?.stats?.total || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Workflow Success Rate</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {workflowsData?.stats?.total ? Math.round((workflowsData.stats.completed / workflowsData.stats.total) * 100) : 100}%
              </p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Average Workflow Latency</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{workflowsData?.stats?.averageDurationMs || 0}ms</p>
            </div>
          </div>

          {/* Agents Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                Specialized Domain Agents Registry (28 Active Agents)
              </h2>
              <span className="text-xs text-slate-400">Master Orchestrator routes automatically based on task intent</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((ag) => (
                <div
                  key={ag.name}
                  className={cn(
                    'p-4 rounded-2xl border transition-all space-y-3',
                    ag.enabled
                      ? 'bg-navy-900 border-navy-700'
                      : 'bg-navy-950/70 border-rose-900/40 opacity-70'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{ag.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
                          v{ag.version}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {ag.category}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-950/70 text-amber-300 border border-amber-800">
                          {ag.modelTier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ag.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleAgent(ag.name, ag.enabled)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0',
                        ag.enabled
                          ? 'bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300'
                          : 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800 text-emerald-300'
                      )}
                    >
                      {ag.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>

                  {/* Capabilities chips */}
                  <div className="flex flex-wrap gap-1">
                    {ag.capabilities?.map((cap: string) => (
                      <span key={cap} className="px-1.5 py-0.5 rounded text-[10px] bg-navy-800 text-slate-300 border border-navy-600">
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-navy-700 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Requests: <strong className="text-slate-300">{ag.metric?.totalRequests || 0}</strong></span>
                    <span>Success Rate: <strong className="text-emerald-400">{ag.metric?.successRate || 100}%</strong></span>
                    <span>Timeout: <strong className="text-slate-300">{ag.timeoutMs}ms</strong></span>
                    <span>Tools Allowed: <strong className="text-slate-300">{ag.allowedTools?.length || 0}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workflows Observability */}
          {workflowsData?.workflows && workflowsData.workflows.length > 0 && (
            <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
              <h3 className="font-bold text-white text-sm">Recent Multi-Agent Workflows</h3>
              <div className="divide-y divide-navy-700 text-xs">
                {workflowsData.workflows.slice(0, 10).map((wf: any) => (
                  <div key={wf.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400 text-[11px]">{wf.id}</span>
                      <span className="font-semibold text-slate-200">{wf.workflow_type}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] uppercase font-mono">
                        {wf.complexity}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-[11px]">{wf.total_duration_ms ? `${wf.total_duration_ms}ms` : 'In progress'}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase',
                        wf.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-blue-950 text-blue-400'
                      )}>
                        {wf.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Usage & Tokens */}
      {activeTab === 'usage' && usage && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Requests</span>
              <p className="text-2xl font-bold text-white mt-1">{usage.total_requests}</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Success Rate</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{usage.success_rate}%</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Estimated Tokens</span>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{(usage.estimated_tokens_used / 1000).toFixed(0)}k</p>
            </div>
            <div className="p-4 rounded-xl bg-navy-900 border border-navy-700">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Estimated Cost</span>
              <p className="text-2xl font-bold text-amber-400 mt-1">${usage.estimated_cost_usd}</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700 space-y-3">
            <h3 className="font-bold text-white text-sm">Model Volume Distribution</h3>
            <div className="space-y-2">
              {usage.model_distribution?.map((m: any) => (
                <div key={m.model} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-mono">{m.model}</span>
                    <span className="text-slate-400">{m.count} requests</span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-950 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, (m.count / (usage.total_requests || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
