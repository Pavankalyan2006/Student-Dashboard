import * as React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  SlidersHorizontal,
} from 'lucide-react';
import { useDSAVisualizerStore, PlaybackSpeed } from '../stores/dsaVisualizerStore';
import { Button } from '../../../components/ui/button';

interface VisualizationControlsProps {
  onOpenCustomInput?: () => void;
  onOpenComparison?: () => void;
}

export const VisualizationControls: React.FC<VisualizationControlsProps> = ({
  onOpenCustomInput,
  onOpenComparison,
}) => {
  const {
    session,
    currentStepIndex,
    isPlaying,
    playbackSpeed,
    togglePlayPause,
    nextStep,
    prevStep,
    restart,
    setPlaybackSpeed,
  } = useDSAVisualizerStore();

  const totalSteps = session?.steps?.length || 0;
  const isStart = currentStepIndex === 0;
  const isEnd = currentStepIndex >= totalSteps - 1;

  // Auto-play interval timer
  React.useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(300, Math.round(1200 / playbackSpeed));
    const timer = setInterval(() => {
      nextStep();
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, nextStep]);

  // Global Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea/monaco editor
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.monaco-editor')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        restart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, nextStep, prevStep, restart]);

  const speedOptions: PlaybackSpeed[] = [0.25, 0.5, 1, 1.5, 2];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-b-2xl">
      {/* Left: Input & Comparison tools */}
      <div className="flex items-center gap-2">
        {onOpenCustomInput && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCustomInput}
            className="text-xs h-8 gap-1.5 font-medium border-slate-200 dark:border-slate-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Custom Input</span>
          </Button>
        )}
        {onOpenComparison && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenComparison}
            className="text-xs h-8 gap-1.5 font-medium border-slate-200 dark:border-slate-700"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
          </Button>
        )}
      </div>

      {/* Center: Playback Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={restart}
          title="Restart (R)"
          className="h-9 w-9 p-0 rounded-lg text-slate-600 dark:text-slate-300"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={prevStep}
          disabled={isStart}
          title="Previous Step (Left Arrow)"
          className="h-9 w-9 p-0 rounded-lg text-slate-600 dark:text-slate-300"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          size="sm"
          onClick={togglePlayPause}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          className={`h-9 px-4 rounded-lg font-semibold gap-1.5 transition-all ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span className="text-xs">{isPlaying ? 'Pause' : isEnd ? 'Replay' : 'Play'}</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={nextStep}
          disabled={isEnd}
          title="Next Step (Right Arrow)"
          className="h-9 w-9 p-0 rounded-lg text-slate-600 dark:text-slate-300"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Right: Speed Toggle */}
      <div className="flex items-center gap-1">
        <span className="text-[11px] font-mono text-slate-400 mr-1 hidden md:inline">Speed:</span>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              type="button"
              onClick={() => setPlaybackSpeed(speed)}
              className={`px-2 py-1 text-[11px] font-mono font-medium rounded-md transition-all ${
                playbackSpeed === speed
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
