// src/features/system-design/components/RequirementsWorkspace.tsx
// Guided Functional / Non-Functional Requirements Workspace & Mathematical Capacity Estimator

import * as React from 'react';
import {
  Calculator,
  Plus,
  Trash2,
  HelpCircle,
  Sparkles,
  Info,
  CheckCircle2,
  Shield,
  Clock,
  HardDrive,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import { CapacityCalculationInput, CapacityCalculation } from '../types/systemDesign';
import { toast } from 'sonner';

interface RequirementsWorkspaceProps {
  requirements: {
    functional: string[];
    non_functional: string[];
    assumptions: string[];
  };
  capacityEstimate?: CapacityCalculation;
  onChangeRequirements: (reqs: { functional: string[]; non_functional: string[]; assumptions: string[] }) => void;
  onSaveCapacityEstimate: (estimate: CapacityCalculation) => void;
  readOnly?: boolean;
}

export function RequirementsWorkspace({
  requirements,
  capacityEstimate,
  onChangeRequirements,
  onSaveCapacityEstimate,
  readOnly = false
}: RequirementsWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState<'requirements' | 'calculator'>('calculator');

  // Input states for capacity calculator
  const [inputs, setInputs] = React.useState<CapacityCalculationInput>(
    capacityEstimate?.inputs || {
      daily_active_users: 10000000,
      requests_per_user_per_day: 15,
      peak_traffic_factor: 2.5,
      read_percentage: 90,
      write_percentage: 10,
      average_read_payload_kb: 2,
      average_write_payload_kb: 10,
      retention_years: 5,
      replication_factor: 3
    }
  );

  const [calcResult, setCalcResult] = React.useState<CapacityCalculation | null>(
    capacityEstimate || null
  );
  const [calculating, setCalculating] = React.useState(false);

  // New requirement input draft states
  const [newFunc, setNewFunc] = React.useState('');
  const [newNonFunc, setNewNonFunc] = React.useState('');
  const [newAssumption, setNewAssumption] = React.useState('');

  const runCalculation = React.useCallback(async (customInputs?: CapacityCalculationInput) => {
    try {
      setCalculating(true);
      const targetInputs = customInputs || inputs;
      const res = await systemDesignApi.calculateCapacity(targetInputs);
      setCalcResult(res);
      onSaveCapacityEstimate(res);
    } catch (err: any) {
      toast.error('Calculation error: ' + err.message);
    } finally {
      setCalculating(false);
    }
  }, [inputs, onSaveCapacityEstimate]);

  React.useEffect(() => {
    if (!calcResult) {
      runCalculation();
    }
  }, [calcResult, runCalculation]);

  // Requirement Add/Remove Handlers
  const handleAddFunctional = () => {
    if (!newFunc.trim()) return;
    onChangeRequirements({
      ...requirements,
      functional: [...requirements.functional, newFunc.trim()]
    });
    setNewFunc('');
  };

  const handleRemoveFunctional = (idx: number) => {
    onChangeRequirements({
      ...requirements,
      functional: requirements.functional.filter((_, i) => i !== idx)
    });
  };

  const handleAddNonFunctional = () => {
    if (!newNonFunc.trim()) return;
    onChangeRequirements({
      ...requirements,
      non_functional: [...requirements.non_functional, newNonFunc.trim()]
    });
    setNewNonFunc('');
  };

  const handleRemoveNonFunctional = (idx: number) => {
    onChangeRequirements({
      ...requirements,
      non_functional: requirements.non_functional.filter((_, i) => i !== idx)
    });
  };

  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    onChangeRequirements({
      ...requirements,
      assumptions: [...requirements.assumptions, newAssumption.trim()]
    });
    setNewAssumption('');
  };

  const handleRemoveAssumption = (idx: number) => {
    onChangeRequirements({
      ...requirements,
      assumptions: requirements.assumptions.filter((_, i) => i !== idx)
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-800 bg-slate-900/60 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'calculator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Calculator className="w-4 h-4" />
          Mathematical Capacity Estimation Calculator
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'requirements'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          Functional & Non-Functional Specifications
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MATHEMATICAL CAPACITY ESTIMATION CALCULATOR */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                Workload & Scale Parameters
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust baseline traffic assumptions to recompute RPS and storage.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Daily Active Users (DAU): <span className="font-bold text-indigo-400">{inputs.daily_active_users.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="10000"
                  max="100000000"
                  step="50000"
                  value={inputs.daily_active_users}
                  disabled={readOnly}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setInputs(prev => ({ ...prev, daily_active_users: val }));
                    runCalculation({ ...inputs, daily_active_users: val });
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Requests/User/Day</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={inputs.requests_per_user_per_day}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 1;
                      setInputs(prev => ({ ...prev, requests_per_user_per_day: val }));
                      runCalculation({ ...inputs, requests_per_user_per_day: val });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Peak Factor (Multiplier)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="10.0"
                    value={inputs.peak_traffic_factor}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 2;
                      setInputs(prev => ({ ...prev, peak_traffic_factor: val }));
                      runCalculation({ ...inputs, peak_traffic_factor: val });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1 flex items-center justify-between">
                  <span>Read vs Write Ratio:</span>
                  <span className="font-bold text-indigo-400">{inputs.read_percentage}% Read / {100 - inputs.read_percentage}% Write</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={inputs.read_percentage}
                  disabled={readOnly}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setInputs(prev => ({ ...prev, read_percentage: val, write_percentage: 100 - val }));
                    runCalculation({ ...inputs, read_percentage: val, write_percentage: 100 - val });
                  }}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Avg Read Size (KB)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={inputs.average_read_payload_kb}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 1;
                      setInputs(prev => ({ ...prev, average_read_payload_kb: val }));
                      runCalculation({ ...inputs, average_read_payload_kb: val });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Avg Write Size (KB)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={inputs.average_write_payload_kb}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 5;
                      setInputs(prev => ({ ...prev, average_write_payload_kb: val }));
                      runCalculation({ ...inputs, average_write_payload_kb: val });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Retention Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={inputs.retention_years}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 5;
                      setInputs(prev => ({ ...prev, retention_years: val }));
                      runCalculation({ ...inputs, retention_years: val });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Replication Factor</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={inputs.replication_factor}
                    disabled={readOnly}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 3;
                      setInputs(prev => ({ ...prev, replication_factor: val }));
                      runCalculation({ ...inputs, replication_factor: val });
                    }}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <Button
                onClick={() => runCalculation()}
                disabled={calculating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs mt-2"
              >
                {calculating ? 'Recomputing...' : 'Recompute Capacity Metrics'}
              </Button>
            </div>
          </div>

          {/* Output Results Column */}
          <div className="lg:col-span-7 space-y-4">
            {calcResult ? (
              <>
                {/* Primary Metric Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-[11px] text-slate-400 font-medium">Average RPS</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {calcResult.results.average_rps.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">req / sec</div>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-indigo-500/40 rounded-xl bg-indigo-950/20">
                    <div className="text-[11px] text-indigo-300 font-medium">Peak RPS</div>
                    <div className="text-xl font-bold text-indigo-400 mt-1">
                      {calcResult.results.peak_rps.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-indigo-300/60 mt-0.5">{inputs.peak_traffic_factor}x multiplier</div>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
                    <div className="text-[11px] text-slate-400 font-medium">Daily Storage</div>
                    <div className="text-xl font-bold text-white mt-1">
                      {calcResult.results.daily_raw_storage_gb} GB
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">raw writes / day</div>
                  </div>

                  <div className="p-3.5 bg-slate-900 border border-emerald-500/40 rounded-xl bg-emerald-950/20">
                    <div className="text-[11px] text-emerald-300 font-medium">{inputs.retention_years}-Yr Storage</div>
                    <div className="text-xl font-bold text-emerald-400 mt-1">
                      {calcResult.results.total_retention_storage_tb} TB
                    </div>
                    <div className="text-[10px] text-emerald-300/60 mt-0.5">{inputs.replication_factor}x replicated</div>
                  </div>
                </div>

                {/* Throughput & Bandwidth Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    Throughput & Bandwidth Estimation
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Read RPS:</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">{calcResult.results.read_rps.toLocaleString()} RPS</div>
                      <div className="text-[10px] text-slate-500">Peak: {calcResult.results.peak_read_rps.toLocaleString()} RPS</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Write RPS:</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">{calcResult.results.write_rps.toLocaleString()} RPS</div>
                      <div className="text-[10px] text-slate-500">Peak: {calcResult.results.peak_write_rps.toLocaleString()} RPS</div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <div className="text-slate-400 text-[11px]">Peak Bandwidth:</div>
                      <div className="text-base font-bold text-slate-200 mt-0.5">{calcResult.results.peak_bandwidth_mbps} Mbps</div>
                      <div className="text-[10px] text-slate-500">Avg: {calcResult.results.average_bandwidth_mbps} Mbps</div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Formulas Used */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Info className="w-4 h-4 text-indigo-400" />
                    Transparent Mathematical Formulas
                  </h4>
                  <div className="space-y-1.5 text-xs font-mono">
                    {Object.entries(calcResult.formulas_used).map(([label, formula]) => (
                      <div key={label} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-300">
                        <span className="text-indigo-300">{label}:</span>
                        <span className="text-slate-400">{formula}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-slate-900 rounded-2xl border border-slate-800">
                Computing mathematical capacity estimates...
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. FUNCTIONAL & NON-FUNCTIONAL REQUIREMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Functional Requirements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Functional Requirements
                </h3>
                <span className="text-xs text-slate-400 font-mono">{requirements.functional.length}</span>
              </div>
              <ul className="mt-3.5 space-y-2 text-xs text-slate-300">
                {requirements.functional.map((req, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                    <span>{req}</span>
                    {!readOnly && (
                      <button onClick={() => handleRemoveFunctional(idx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {!readOnly && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Users can shorten URLs..."
                  value={newFunc}
                  onChange={(e) => setNewFunc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFunctional()}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                />
                <Button onClick={handleAddFunctional} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Non-Functional Requirements */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Non-Functional Requirements
                </h3>
                <span className="text-xs text-slate-400 font-mono">{requirements.non_functional.length}</span>
              </div>
              <ul className="mt-3.5 space-y-2 text-xs text-slate-300">
                {requirements.non_functional.map((nfr, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                    <span>{nfr}</span>
                    {!readOnly && (
                      <button onClick={() => handleRemoveNonFunctional(idx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {!readOnly && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 99.99% availability, p99 < 20ms..."
                  value={newNonFunc}
                  onChange={(e) => setNewNonFunc(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNonFunctional()}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                />
                <Button onClick={handleAddNonFunctional} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Assumptions & Constraints */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Assumptions & Constraints
                </h3>
                <span className="text-xs text-slate-400 font-mono">{requirements.assumptions.length}</span>
              </div>
              <ul className="mt-3.5 space-y-2 text-xs text-slate-300">
                {requirements.assumptions.map((asm, idx) => (
                  <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start justify-between gap-2">
                    <span>{asm}</span>
                    {!readOnly && (
                      <button onClick={() => handleRemoveAssumption(idx)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            {!readOnly && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 5-year retention, uncompressed..."
                  value={newAssumption}
                  onChange={(e) => setNewAssumption(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddAssumption()}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                />
                <Button onClick={handleAddAssumption} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs h-7">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
