import * as React from 'react';
import { Algorithm, VisualizationSession } from '../types/dsa';
import { useDSAVisualizerStore } from '../stores/dsaVisualizerStore';
import { VisualizationCanvas } from './VisualizationCanvas';
import { VisualizationTimeline } from './VisualizationTimeline';
import { VisualizationControls } from './VisualizationControls';
import { VisualizationLegend } from './VisualizationLegend';
import { PseudocodePanel } from './PseudocodePanel';
import { ComplexityPanel } from './ComplexityPanel';
import { CustomInputModal } from './CustomInputModal';
import { AlgorithmComparisonModal } from './AlgorithmComparisonModal';
import { dsaApi } from '../api/dsaApi';
import { Sparkles, BookOpen } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface AlgorithmVisualizerProps {
  algorithm: Algorithm;
  initialSession: VisualizationSession;
  onOpenAiTutor?: () => void;
}

export const AlgorithmVisualizer: React.FC<AlgorithmVisualizerProps> = ({
  algorithm,
  initialSession,
  onOpenAiTutor,
}) => {
  const {
    session,
    setSession,
    currentStepIndex,
    customInputModalOpen,
    setCustomInputModalOpen,
    comparisonModalOpen,
    setComparisonModalOpen,
  } = useDSAVisualizerStore();

  const [hasRecordedCompletion, setHasRecordedCompletion] = React.useState(false);

  // Initialize store with session
  React.useEffect(() => {
    if (initialSession) {
      setSession(initialSession);
      setHasRecordedCompletion(false);
    }
  }, [initialSession, setSession]);

  const activeSession = session || initialSession;
  const currentStep = activeSession?.steps?.[currentStepIndex];

  // Auto record completion when reaching last step
  React.useEffect(() => {
    if (
      activeSession &&
      activeSession.steps &&
      currentStepIndex >= activeSession.steps.length - 1 &&
      !hasRecordedCompletion
    ) {
      setHasRecordedCompletion(true);
      dsaApi.recordVisualizationComplete(algorithm.id).catch(() => {});
    }
  }, [currentStepIndex, activeSession, algorithm.id, hasRecordedCompletion]);

  if (!activeSession || !currentStep) {
    return (
      <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <span className="text-sm font-mono text-slate-400">Loading visualization engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {activeSession.visualization_type} VISUALIZER
            </span>
            <span className="text-xs font-mono text-slate-400">
              {activeSession.total_steps} Simulation States
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {algorithm.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAiTutor && (
            <Button
              onClick={onOpenAiTutor}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium text-xs h-9 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              Ask AI DSA Tutor
            </Button>
          )}
        </div>
      </div>

      {/* Main Interactive Stage Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Timeline Header */}
        <VisualizationTimeline />

        {/* Dynamic Canvas */}
        <div className="min-h-[300px] flex items-center justify-center bg-slate-50/40 dark:bg-slate-950/20 p-4">
          <VisualizationCanvas step={currentStep} type={activeSession.visualization_type} />
        </div>

        {/* Legend */}
        <VisualizationLegend />

        {/* Playback Controls Footer */}
        <VisualizationControls
          onOpenCustomInput={() => setCustomInputModalOpen(true)}
          onOpenComparison={() => setComparisonModalOpen(true)}
        />
      </div>

      {/* Synchronized Panels: Complexity & Pseudocode */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ComplexityPanel complexity={activeSession.complexity} />
        <PseudocodePanel
          pseudocode={activeSession.pseudocode}
          activeLine={currentStep.code_line}
        />
      </div>

      {/* Theory & Concept Explanation Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Algorithmic Concept & Invariant
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {algorithm.concept}
        </p>
      </div>

      {/* Modals */}
      <CustomInputModal
        algorithmId={algorithm.id}
        isOpen={customInputModalOpen}
        onClose={() => setCustomInputModalOpen(false)}
      />

      <AlgorithmComparisonModal
        currentAlgorithm={algorithm}
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
      />
    </div>
  );
};
