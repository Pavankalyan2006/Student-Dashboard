import * as React from 'react';
import { Algorithm, VisualizationSession } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import { AlgorithmVisualizer } from '../components/AlgorithmVisualizer';
import { DSAAITutor } from '../components/DSAAITutor';
import { useDSAVisualizerStore } from '../stores/dsaVisualizerStore';
import { ArrowLeft, Sparkles, Code2, Bot } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface DSAVisualizePageProps {
  algorithmId: string;
  onNavigate?: (path: string) => void;
}

export const DSAVisualizePage: React.FC<DSAVisualizePageProps> = ({
  algorithmId,
  onNavigate,
}) => {
  const [algorithm, setAlgorithm] = React.useState<Algorithm | null>(null);
  const [initialSession, setInitialSession] = React.useState<VisualizationSession | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { aiDrawerOpen, setAiDrawerOpen, currentStepIndex, session } = useDSAVisualizerStore();

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      dsaApi.getAlgorithm(algorithmId),
      dsaApi.visualizeAlgorithm(algorithmId),
    ])
      .then(([algoRes, sessionRes]) => {
        setAlgorithm(algoRes);
        setInitialSession(sessionRes);
      })
      .catch((err) => {
        console.error('Failed to load visualizer:', err);
      })
      .finally(() => setLoading(false));
  }, [algorithmId]);

  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-[400px] bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!algorithm || !initialSession) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold">Algorithm Visualizer Unavailable</h2>
        <p className="text-sm text-slate-500">
          The requested algorithm visualizer could not be initialized.
        </p>
        <Button onClick={() => navigate('/dsa')}>Return to DSA Lab</Button>
      </div>
    );
  }

  const activeStep = session?.steps?.[currentStepIndex] || initialSession.steps[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in relative">
      {/* Top back bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dsa')}
            className="h-9 w-9 p-0 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-slate-500 font-mono truncate max-w-md">
            DSA / Visualize / {algorithm.name}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dsa/tutor/${algorithm.id}`)}
            className="gap-1.5 text-xs h-9 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950 font-semibold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>AI Tutor Page</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dsa/problem/${algorithm.id}`)}
            className="gap-1.5 text-xs h-9 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold shadow-xs"
          >
            <Code2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Solve Problem</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiDrawerOpen(!aiDrawerOpen)}
            className="gap-1.5 text-xs h-9 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-semibold shadow-xs"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-500" />
            <span>{aiDrawerOpen ? 'Close Drawer' : 'Quick AI Drawer'}</span>
          </Button>
        </div>
      </div>

      {/* Visualizer Container */}
      <AlgorithmVisualizer
        algorithm={algorithm}
        initialSession={initialSession}
        onOpenAiTutor={() => setAiDrawerOpen(true)}
      />

      {/* AI Tutor Drawer */}
      <DSAAITutor
        algorithm={algorithm}
        currentStep={activeStep}
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        onNavigateToFullPage={() => navigate(`/dsa/tutor/${algorithm.id}`)}
      />
    </div>
  );
};
