import * as React from 'react';
import { useDSAVisualizerStore } from '../stores/dsaVisualizerStore';

export const VisualizationTimeline: React.FC = () => {
  const { session, currentStepIndex, setCurrentStepIndex } = useDSAVisualizerStore();

  if (!session || !session.steps || session.steps.length === 0) return null;

  const currentStep = session.steps[currentStepIndex];
  const totalSteps = session.steps.length;
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-900/60 p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
      {/* Top Meta: Step Count & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
            {currentStep?.title || 'Execution Step'}
          </h4>
        </div>

        {currentStep?.complexity_info && (
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Time: <strong className="text-slate-700 dark:text-slate-200">{currentStep.complexity_info.time}</strong></span>
            <span>•</span>
            <span>Space: <strong className="text-slate-700 dark:text-slate-200">{currentStep.complexity_info.space}</strong></span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed min-h-[36px]">
        {currentStep?.description}
      </p>

      {/* Scrubber Range Slider */}
      <div className="relative flex items-center pt-1">
        <input
          type="range"
          min={0}
          max={totalSteps - 1}
          value={currentStepIndex}
          onChange={(e) => setCurrentStepIndex(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        />
      </div>

      {/* Step Markers / Tick row for small step counts */}
      {totalSteps <= 20 && (
        <div className="flex items-center justify-between px-1">
          {session.steps.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentStepIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentStepIndex
                  ? 'bg-blue-600 scale-150 ring-2 ring-blue-400'
                  : idx < currentStepIndex
                  ? 'bg-slate-400 dark:bg-slate-500'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
              title={`Jump to step ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
