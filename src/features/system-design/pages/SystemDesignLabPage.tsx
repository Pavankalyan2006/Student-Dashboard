// src/features/system-design/pages/SystemDesignLabPage.tsx
// Complete System Design Lab with Requirements Decomposition, Scale Estimation, Visual Component Topology, and Tradeoff Analysis

import * as React from 'react';
import {
  Network,
  Sparkles,
  Server,
  Database,
  Layers,
  HardDrive,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Shuffle,
  Zap,
} from 'lucide-react';
import { PageContainer, PageHeader, LoadingState, EmptyState } from '../../../components/layout/PageComponents';
import { Button } from '../../../components/ui/button';
import { learningModulesApi } from '../../../api/learningModulesApi';
import { SystemDesignProblem, SystemDesignEntity, SystemDesignComponent } from '../../../types/learningModules';
import { toast } from 'sonner';

interface SystemDesignLabPageProps {
  onNavigate?: (path: string) => void;
}

export function SystemDesignLabPage({ onNavigate }: SystemDesignLabPageProps) {
  const [problems, setProblems] = React.useState<SystemDesignProblem[]>([]);
  const [designs, setDesigns] = React.useState<SystemDesignEntity[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedProblem, setSelectedProblem] = React.useState<SystemDesignProblem | null>(null);
  const [activeTab, setActiveTab] = React.useState<'architecture' | 'requirements' | 'problems' | 'tradeoffs'>('architecture');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedProblems, fetchedDesigns] = await Promise.all([
        learningModulesApi.systemDesign.getProblems(),
        learningModulesApi.systemDesign.getDesigns(),
      ]);
      setProblems(fetchedProblems);
      setDesigns(fetchedDesigns);
      if (fetchedProblems.length > 0 && !selectedProblem) {
        setSelectedProblem(fetchedProblems[0]);
      }
    } catch (err: any) {
      toast.error('Failed to load system design problems: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedProblem]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="System Design Lab" description="Loading distributed systems architectures..." />
        <LoadingState message="SystemDesignAgent analyzing microservices scalability and SPOF..." />
      </PageContainer>
    );
  }

  const architecture = selectedProblem?.sample_architecture;

  return (
    <PageContainer>
      <PageHeader
        title="System Design Lab"
        description="Design distributed, scalable engineering architectures. Evaluate scale estimation, caching tiers, database replication, and SPOFs without dogmatic claims."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Network className="w-3.5 h-3.5 text-indigo-600" />
            SystemDesignAgent Active
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedProblem?.id}
              onChange={(e) => {
                const found = problems.find((p) => p.id === e.target.value);
                if (found) setSelectedProblem(found);
              }}
              className="px-3 py-1.5 text-xs font-semibold border border-[#D0D5DD] rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {problems.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Problem Title & Scale Estimation Header */}
      {selectedProblem && (
        <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    selectedProblem.difficulty === 'ADVANCED'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                >
                  {selectedProblem.difficulty}
                </span>
                <h2 className="text-lg font-bold text-[#101828]">{selectedProblem.title}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => toast.success('Architecture diagram exported to personal knowledge base!')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analyze Tradeoffs
              </Button>
            </div>
          </div>

          {/* Scale Estimation Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-[11px] font-semibold text-[#475467]">Daily Active Users</span>
              <p className="text-sm font-bold text-[#101828] mt-0.5">
                {selectedProblem.scale_estimation.daily_active_users}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-[11px] font-semibold text-[#475467]">Read / Write Ratio</span>
              <p className="text-sm font-bold text-blue-600 mt-0.5">
                {selectedProblem.scale_estimation.read_write_ratio}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-[11px] font-semibold text-[#475467]">Storage Growth</span>
              <p className="text-sm font-bold text-purple-600 mt-0.5">
                {selectedProblem.scale_estimation.storage_per_year}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <span className="text-[11px] font-semibold text-[#475467]">Peak Bandwidth</span>
              <p className="text-sm font-bold text-emerald-600 mt-0.5">
                {selectedProblem.scale_estimation.bandwidth}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'architecture' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Visual Architecture Topology
        </button>
        <button
          onClick={() => setActiveTab('requirements')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'requirements' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Requirements Specification
        </button>
        <button
          onClick={() => setActiveTab('tradeoffs')}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'tradeoffs' ? 'bg-[#101828] text-white' : 'text-[#475467] hover:bg-gray-100'
          }`}
        >
          Architectural Tradeoffs & SPOFs
        </button>
      </div>

      {/* Tab 1: Visual Architecture Topology */}
      {activeTab === 'architecture' && architecture && (
        <div className="space-y-6">
          {/* Component Graph Grid */}
          <div className="p-6 rounded-2xl border border-[#E4E7EC] bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Microservices & Infrastructure Tiers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {architecture.components.map((comp) => (
                <div
                  key={comp.id}
                  className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {comp.type}
                    </span>
                    <span className="text-[11px] font-mono text-gray-500 font-semibold">{comp.tech_choice}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#101828]">{comp.name}</h4>
                  <p className="text-xs text-[#475467] leading-relaxed">{comp.description}</p>
                </div>
              ))}
            </div>

            {/* Inter-Service Connections */}
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <h4 className="text-xs font-bold text-[#344054] uppercase tracking-wider">
                Network Transport & Inter-Service Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {architecture.connections.map((conn, cIdx) => (
                  <div key={cIdx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-blue-600 bg-white px-2 py-0.5 rounded border">
                      {conn.protocol}
                    </span>
                    <span className="text-[#344054]">{conn.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Requirements Specification */}
      {activeTab === 'requirements' && selectedProblem && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Functional Requirements
            </h3>
            <ul className="space-y-2 pl-2">
              {selectedProblem.functional_requirements.map((req, idx) => (
                <li key={idx} className="text-xs text-[#344054] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-[#E4E7EC] bg-white shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Non-Functional Requirements (SLOs / SLAs)
            </h3>
            <ul className="space-y-2 pl-2">
              {selectedProblem.non_functional_requirements.map((req, idx) => (
                <li key={idx} className="text-xs text-[#344054] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 3: Tradeoffs */}
      {activeTab === 'tradeoffs' && architecture && (
        <div className="space-y-4">
          <div className="p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
            <h3 className="text-sm font-bold text-indigo-950 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-indigo-600" />
              Architectural Tradeoff Decisions (CAP & Latency vs Consistency)
            </h3>
            <ul className="space-y-2 pl-2">
              {architecture.tradeoffs.map((tradeoff, idx) => (
                <li key={idx} className="text-xs text-indigo-900 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-3">
            <h3 className="text-sm font-bold text-rose-950 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Identified Bottlenecks & Failure Modes (SPOFs)
            </h3>
            <ul className="space-y-2 pl-2">
              {architecture.bottlenecks.map((bottleneck, idx) => (
                <li key={idx} className="text-xs text-rose-900 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                  <span>{bottleneck}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
