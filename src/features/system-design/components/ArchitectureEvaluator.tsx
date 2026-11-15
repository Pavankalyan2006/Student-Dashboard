// src/features/system-design/components/ArchitectureEvaluator.tsx
// Comprehensive Architecture Evaluation Engine with SPoF Detection & Weighted Rubric Breakdown

import * as React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Layers,
  Activity,
  Zap,
  Lock,
  LineChart,
  DollarSign,
  Play
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { systemDesignApi } from '../api/systemDesignApi';
import { SystemDesignProject, ChallengeSubmission } from '../types/systemDesign';
import { toast } from 'sonner';

interface ArchitectureEvaluatorProps {
  project: SystemDesignProject;
  challengeId?: string;
  unsaved?: boolean;
  onSubmissionComplete?: (submission: ChallengeSubmission) => void;
}

export function ArchitectureEvaluator({
  project,
  challengeId,
  onSubmissionComplete,
  unsaved = false
}: ArchitectureEvaluatorProps) {
  const [evaluating, setEvaluating] = React.useState(false);
  const [evaluation, setEvaluation] = React.useState<any | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const runEvaluation = React.useCallback(async () => {
    if (unsaved) return;
    try {
      setEvaluating(true);
      setError(null);
      const res = await systemDesignApi.evaluateArchitecture(project.id);
      setEvaluation(res);
    } catch (err: any) {
      setError(err?.message || 'The evaluation could not be run.');
    } finally {
      setEvaluating(false);
    }
  }, [project.id, unsaved]);

  React.useEffect(() => {
    runEvaluation();
  }, [runEvaluation]);

  if (unsaved) {
    return (
      <div className="p-12 text-center text-slate-300 bg-slate-900 border border-slate-800 rounded-2xl" data-testid="evaluation-unsaved">
        <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
        Save your design in the Architecture Designer first. The evaluation checks the saved design.
      </div>
    );
  }

  if (error && !evaluation) {
    return (
      <div className="p-12 text-center text-slate-300 bg-slate-900 border border-slate-800 rounded-2xl space-y-3" data-testid="evaluation-error">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
        <p>The evaluation could not be run: {error}</p>
        <button type="button" onClick={runEvaluation} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">Try again</button>
      </div>
    );
  }

  const handleSubmitChallenge = async () => {
    if (!challengeId) return;
    try {
      setEvaluating(true);
      const sub = await systemDesignApi.submitChallenge(challengeId, project.id);
      toast.success(`Submitted solution! Score: ${sub.score}% (${sub.passed ? 'PASSED' : 'REVISION NEEDED'})`);
      if (onSubmissionComplete) onSubmissionComplete(sub);
    } catch (err: any) {
      toast.error('Submission failed: ' + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  if (!evaluation) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        <ShieldCheck className="w-8 h-8 text-indigo-400 mx-auto mb-2 animate-pulse" />
        Running deterministic architecture validation...
      </div>
    );
  }

  const { score, passed, rubric_breakdown, structural_findings, ai_suggestions } = evaluation;

  return (
    <div className="space-y-6">
      {/* Overall Score Banner */}
      <div className={`p-6 rounded-2xl border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        passed
          ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border-emerald-500/40'
          : 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/40'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
              passed
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {passed ? 'Architecture Passed Rubric' : 'Revision Recommended'}
            </span>
            <span className="text-xs text-slate-400">
              {project.components.length} Components • {project.connections.length} Connections
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Design Evaluation Report</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Deterministic analysis of single points of failure, tier boundaries, and weighted rubric dimensions.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center p-3 bg-slate-950/70 border border-slate-800 rounded-xl min-w-[120px]">
            <div className="text-[11px] text-slate-400 font-medium">Overall Score</div>
            <div className={`text-3xl font-extrabold mt-0.5 ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
              {score}%
            </div>
            <div className="text-[10px] text-slate-500">{passed ? 'Pass (≥ 70%)' : 'Threshold 70%'}</div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={runEvaluation}
              disabled={evaluating}
              size="sm"
              variant="outline"
              className="border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white text-xs"
            >
              Re-evaluate
            </Button>
            {challengeId && (
              <Button
                onClick={handleSubmitChallenge}
                disabled={evaluating}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
              >
                Submit Solution
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Structural Findings (SPoFs, Disconnected Nodes) */}
      {(structural_findings.spofs?.length > 0 || structural_findings.disconnected_nodes?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {structural_findings.spofs?.length > 0 && (
            <div className="p-4 bg-red-950/20 border border-red-800/40 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Single Points of Failure ({structural_findings.spofs.length})
              </h4>
              <ul className="space-y-1 text-xs text-red-300">
                {structural_findings.spofs.map((spof: string, idx: number) => (
                  <li key={idx}>• {spof}</li>
                ))}
              </ul>
            </div>
          )}

          {structural_findings.disconnected_nodes?.length > 0 && (
            <div className="p-4 bg-amber-950/20 border border-amber-800/40 rounded-xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Disconnected Components ({structural_findings.disconnected_nodes.length})
              </h4>
              <ul className="space-y-1 text-xs text-amber-300">
                {structural_findings.disconnected_nodes.map((dn: string, idx: number) => (
                  <li key={idx}>• {dn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6 Rubric Categories Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Weighted Rubric Dimension Scores
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { key: 'scalability', name: 'Scalability', icon: Activity, data: rubric_breakdown.scalability },
            { key: 'reliability', name: 'Reliability & Fault Tolerance', icon: ShieldCheck, data: rubric_breakdown.reliability },
            { key: 'consistency', name: 'Data Consistency', icon: Zap, data: rubric_breakdown.consistency },
            { key: 'security', name: 'Security & Auth', icon: Lock, data: rubric_breakdown.security },
            { key: 'observability', name: 'Observability & Monitoring', icon: LineChart, data: rubric_breakdown.observability },
            { key: 'cost', name: 'Cost Awareness', icon: DollarSign, data: rubric_breakdown.cost }
          ].map(cat => {
            const Icon = cat.icon;
            const catScore = cat.data?.score || 50;
            return (
              <div key={cat.key} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-indigo-400" />
                    {cat.name}
                  </span>
                  <span className={`text-xs font-mono font-bold ${catScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {catScore}/100
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${catScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${catScore}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {cat.data?.feedback}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable AI Recommendations */}
      {ai_suggestions?.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Architectural Improvement Recommendations
          </h4>
          <div className="space-y-2 text-xs text-slate-300">
            {ai_suggestions.map((sug: string, idx: number) => (
              <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start gap-2.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>{sug}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
