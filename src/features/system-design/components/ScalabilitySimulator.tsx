// src/features/system-design/components/ScalabilitySimulator.tsx
// Interactive Scalability & Failure Simulation Engine with 6 Educational Scenarios & Cloud Cost Estimator

import * as React from 'react';
import {
  Activity,
  Zap,
  Copy,
  Layers,
  ListOrdered,
  ShieldAlert,
  DollarSign,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import { SimulationType, SimulationResult } from '../types/systemDesign';
import { toast } from 'sonner';

export function ScalabilitySimulator() {
  const [activeSim, setActiveSim] = React.useState<SimulationType>('LOAD_BALANCING');
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<SimulationResult | null>(null);

  // Simulation Parameters States
  const [lbParams, setLbParams] = React.useState({
    incoming_rps: 12000,
    instances: 4,
    per_instance_capacity_rps: 2500,
    algorithm: 'ROUND_ROBIN'
  });

  const [cacheParams, setCacheParams] = React.useState({
    total_rps: 30000,
    cache_hit_ratio_percent: 85,
    cache_capacity_mb: 16384,
    eviction_policy: 'LRU'
  });

  const [replicaParams, setReplicaParams] = React.useState({
    total_rps: 20000,
    read_percentage: 90,
    replica_count: 3,
    primary_capacity_rps: 3000,
    replica_capacity_rps: 4000,
    replication_lag_ms: 45
  });

  const [scalingParams, setScalingParams] = React.useState({
    base_instances: 2,
    scale_target_utilization: 70,
    max_instances: 16,
    current_rps: 22000,
    per_instance_rps: 2000
  });

  const [queueParams, setQueueParams] = React.useState({
    job_arrival_rate_per_sec: 800,
    worker_count: 8,
    worker_processing_rate_per_sec: 75,
    simulation_duration_minutes: 15
  });

  const [availParams, setAvailParams] = React.useState({
    dns_availability: 0.9999,
    lb_availability: 0.999,
    app_availability: 0.995,
    db_availability: 0.999,
    cache_availability: 0.999,
    redundant_lb: true,
    redundant_app: true,
    db_has_replica: true
  });

  const [costParams, setCostParams] = React.useState({
    app_instances: 6,
    app_instance_cost_per_mo: 85,
    db_instances: 2,
    db_instance_cost_per_mo: 280,
    cache_instances: 2,
    cache_instance_cost_per_mo: 65,
    storage_tb: 8,
    storage_cost_per_tb_mo: 23,
    egress_bandwidth_gb: 25000,
    egress_cost_per_gb: 0.08
  });

  const handleRunSimulation = React.useCallback(async (simType = activeSim) => {
    try {
      setRunning(true);
      let p: any = {};
      if (simType === 'LOAD_BALANCING') p = lbParams;
      if (simType === 'CACHING') p = cacheParams;
      if (simType === 'READ_REPLICAS') p = replicaParams;
      if (simType === 'HORIZONTAL_SCALING') p = scalingParams;
      if (simType === 'QUEUE_PROCESSING') p = queueParams;
      if (simType === 'AVAILABILITY_ANALYSIS') p = availParams;
      if (simType === 'COST_ESTIMATION') p = costParams;

      const res = await systemDesignApi.runSimulation(simType, p);
      setResult(res);
    } catch (err: any) {
      toast.error('Simulation run failed: ' + err.message);
    } finally {
      setRunning(false);
    }
  }, [activeSim, lbParams, cacheParams, replicaParams, scalingParams, queueParams, availParams, costParams]);

  React.useEffect(() => {
    handleRunSimulation(activeSim);
  }, [activeSim, handleRunSimulation]);

  return (
    <div className="space-y-6">
      {/* Simulation Scenario Switcher Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { type: 'LOAD_BALANCING', name: 'Load Balancing', icon: Activity },
          { type: 'CACHING', name: 'Cache Tier', icon: Zap },
          { type: 'READ_REPLICAS', name: 'Read Replicas', icon: Copy },
          { type: 'HORIZONTAL_SCALING', name: 'Autoscaling', icon: Layers },
          { type: 'QUEUE_PROCESSING', name: 'Async Queues', icon: ListOrdered },
          { type: 'AVAILABILITY_ANALYSIS', name: 'Availability & SPoF', icon: ShieldAlert },
          { type: 'COST_ESTIMATION', name: 'Cloud Cost', icon: DollarSign }
        ].map(s => {
          const Icon = s.icon;
          const isSelected = activeSim === s.type;
          return (
            <button
              key={s.type}
              onClick={() => setActiveSim(s.type as SimulationType)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
              <div className="text-xs font-bold leading-tight">{s.name}</div>
            </button>
          );
        })}
      </div>

      {/* Main Simulation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Scenario Parameters</h3>
            <Button
              onClick={() => handleRunSimulation()}
              disabled={running}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7 px-3 flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              {running ? 'Running...' : 'Run Simulation'}
            </Button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Load Balancing Controls */}
            {activeSim === 'LOAD_BALANCING' && (
              <>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Incoming Traffic: <span className="text-indigo-400 font-bold">{lbParams.incoming_rps.toLocaleString()} RPS</span>
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="40000"
                    step="1000"
                    value={lbParams.incoming_rps}
                    onChange={(e) => setLbParams(p => ({ ...p, incoming_rps: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Instance Count</label>
                    <input
                      type="number"
                      min="1"
                      max="32"
                      value={lbParams.instances}
                      onChange={(e) => setLbParams(p => ({ ...p, instances: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Cap / Instance (RPS)</label>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={lbParams.per_instance_capacity_rps}
                      onChange={(e) => setLbParams(p => ({ ...p, per_instance_capacity_rps: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Caching Controls */}
            {activeSim === 'CACHING' && (
              <>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Cache Hit Ratio: <span className="text-indigo-400 font-bold">{cacheParams.cache_hit_ratio_percent}%</span>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="99"
                    value={cacheParams.cache_hit_ratio_percent}
                    onChange={(e) => setCacheParams(p => ({ ...p, cache_hit_ratio_percent: Number(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Incoming Read Queries (RPS)</label>
                  <input
                    type="number"
                    min="1000"
                    step="2000"
                    value={cacheParams.total_rps}
                    onChange={(e) => setCacheParams(p => ({ ...p, total_rps: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </>
            )}

            {/* Read Replicas Controls */}
            {activeSim === 'READ_REPLICAS' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Replica Count</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={replicaParams.replica_count}
                      onChange={(e) => setReplicaParams(p => ({ ...p, replica_count: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Read %</label>
                    <input
                      type="number"
                      min="50"
                      max="99"
                      value={replicaParams.read_percentage}
                      onChange={(e) => setReplicaParams(p => ({ ...p, read_percentage: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Replication Lag (ms)</label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    value={replicaParams.replication_lag_ms}
                    onChange={(e) => setReplicaParams(p => ({ ...p, replication_lag_ms: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </>
            )}

            {/* Horizontal Scaling Controls */}
            {activeSim === 'HORIZONTAL_SCALING' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Current Traffic (RPS)</label>
                    <input
                      type="number"
                      min="1000"
                      step="2000"
                      value={scalingParams.current_rps}
                      onChange={(e) => setScalingParams(p => ({ ...p, current_rps: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Max Instances Limit</label>
                    <input
                      type="number"
                      min="2"
                      max="64"
                      value={scalingParams.max_instances}
                      onChange={(e) => setScalingParams(p => ({ ...p, max_instances: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Queue Processing Controls */}
            {activeSim === 'QUEUE_PROCESSING' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Arrival Rate (jobs/s)</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={queueParams.job_arrival_rate_per_sec}
                    onChange={(e) => setQueueParams(p => ({ ...p, job_arrival_rate_per_sec: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Worker Count</label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    value={queueParams.worker_count}
                    onChange={(e) => setQueueParams(p => ({ ...p, worker_count: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>
            )}

            {/* Availability Analysis Controls */}
            {activeSim === 'AVAILABILITY_ANALYSIS' && (
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={availParams.redundant_lb}
                    onChange={(e) => setAvailParams(p => ({ ...p, redundant_lb: e.target.checked }))}
                    className="rounded text-indigo-600 bg-slate-950 border-slate-700"
                  />
                  <span>Redundant Load Balancers (Active-Passive)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={availParams.redundant_app}
                    onChange={(e) => setAvailParams(p => ({ ...p, redundant_app: e.target.checked }))}
                    className="rounded text-indigo-600 bg-slate-950 border-slate-700"
                  />
                  <span>Redundant App Cluster (N+2 instances)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={availParams.db_has_replica}
                    onChange={(e) => setAvailParams(p => ({ ...p, db_has_replica: e.target.checked }))}
                    className="rounded text-indigo-600 bg-slate-950 border-slate-700"
                  />
                  <span>Database Standby Failover Node</span>
                </label>
              </div>
            )}

            {/* Cloud Cost Controls */}
            {activeSim === 'COST_ESTIMATION' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">App Instances</label>
                  <input
                    type="number"
                    min="1"
                    value={costParams.app_instances}
                    onChange={(e) => setCostParams(p => ({ ...p, app_instances: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Storage (TB)</label>
                  <input
                    type="number"
                    min="1"
                    value={costParams.storage_tb}
                    onChange={(e) => setCostParams(p => ({ ...p, storage_tb: Number(e.target.value) }))}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results & Charts Column */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <>
              {/* Status Header Badge */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-full ${
                    result.status === 'STABLE'
                      ? 'bg-emerald-400 shadow-emerald-500/50 shadow-md'
                      : result.status === 'WARNING'
                      ? 'bg-amber-400 shadow-amber-500/50 shadow-md'
                      : 'bg-red-400 shadow-red-500/50 shadow-md animate-pulse'
                  }`} />
                  <span className="text-sm font-bold text-white">
                    System State: {result.status}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{result.simulation_type}</span>
              </div>

              {/* Concrete Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(result.metrics).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-[11px] text-slate-400 font-medium truncate">{key}</div>
                    <div className="text-base font-bold text-slate-100 mt-1 truncate">{String(val)}</div>
                  </div>
                ))}
              </div>

              {/* Simulation Step Points List */}
              {result.chart_data?.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Simulation Timeline / Breakdown Points
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    {result.chart_data.map((point, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-slate-300">
                        <span className="font-bold text-indigo-300">{point.time_or_step || point.component || point.category}:</span>
                        <span className="text-slate-400 text-right">
                          {Object.entries(point)
                            .filter(([k]) => !['time_or_step', 'component', 'category'].includes(k))
                            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                            .join(' | ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detected Bottlenecks */}
              {result.bottlenecks_detected?.length > 0 && (
                <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Bottlenecks Detected
                  </h4>
                  <ul className="space-y-1 text-xs text-red-300">
                    {result.bottlenecks_detected.map((b, i) => (
                      <li key={i}>• {b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations & Educational Disclaimer */}
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                <div className="font-bold text-indigo-300">Architectural Recommendations:</div>
                <ul className="space-y-1 text-slate-400">
                  {result.recommendations.map((r, i) => (
                    <li key={i}>✓ {r}</li>
                  ))}
                </ul>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 italic">
                  Note: {result.educational_disclaimer}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
              Running simulation model...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
