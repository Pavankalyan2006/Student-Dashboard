import * as React from 'react';
import { DSATopic, Algorithm, DSAProblem } from '../types/dsa';
import { dsaApi } from '../api/dsaApi';
import {
  ArrowLeft,
  PlayCircle,
  Code2,
  FileText,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface DSATopicDetailPageProps {
  topicId: string;
  onNavigate?: (path: string) => void;
}

export const DSATopicDetailPage: React.FC<DSATopicDetailPageProps> = ({
  topicId,
  onNavigate,
}) => {
  const [topic, setTopic] = React.useState<DSATopic | null>(null);
  const [algorithms, setAlgorithms] = React.useState<Algorithm[]>([]);
  const [problems, setProblems] = React.useState<DSAProblem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      dsaApi.getTopic(topicId),
      dsaApi.getAlgorithms(topicId).catch(() => []),
      dsaApi.getProblems({ topic_id: topicId }).catch(() => []),
    ])
      .then(([topicRes, algosRes, probsRes]) => {
        setTopic(topicRes);
        setAlgorithms(algosRes);
        setProblems(probsRes);
      })
      .finally(() => setLoading(false));
  }, [topicId]);

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
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-12 text-center max-w-lg mx-auto space-y-4">
        <h2 className="text-xl font-bold">Topic Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested data structure or algorithm topic could not be found.
        </p>
        <Button onClick={() => navigate('/dsa/topics')}>Return to Topics</Button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Back button and navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dsa/topics')}
          className="h-9 w-9 p-0 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-xs text-slate-400 font-mono">
          DSA / Topics / {topic.name}
        </span>
      </div>

      {/* Main Topic Header Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {topic.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {topic.difficulty}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {topic.name}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {topic.description}
          </p>

          {topic.prerequisites && topic.prerequisites.length > 0 && (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Prerequisites:
              </span>
              <span>{topic.prerequisites.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Phase 5 Notes Generator & Phase 9 Quiz Integration Buttons */}
        <div className="flex flex-col gap-2.5 flex-shrink-0">
          <Button
            onClick={() => navigate(`/notes?topic=${encodeURIComponent(topic.name)}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs h-10 gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            Generate Study Notes
          </Button>
          <Button
            onClick={() =>
              navigate(
                `/quiz/create?source_type=DSA&dsaTopic=${encodeURIComponent(topic.name)}&topic=${encodeURIComponent(topic.name)}`
              )
            }
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs h-10 gap-2 shadow-xs"
          >
            <HelpCircle className="w-4 h-4" />
            Practice Topic Quiz
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/dsa/visualize/binary-search')}
            className="text-xs h-10 gap-2"
          >
            <PlayCircle className="w-4 h-4 text-blue-600" />
            Launch Visualizer Engine
          </Button>
        </div>
      </div>

      {/* Core Concepts */}
      {topic.concepts && topic.concepts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Core Theoretical Concepts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topic.concepts.map((concept, idx) => (
              <div
                key={idx}
                className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {concept}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Algorithms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <PlayCircle className="w-4 h-4 text-indigo-600" />
            Algorithms & Visualizers ({algorithms.length})
          </h2>
        </div>

        {algorithms.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No algorithms registered for this topic yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {algorithms.map((algo) => (
              <div
                key={algo.id}
                onClick={() => navigate(`/dsa/visualize/${algo.id}`)}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {algo.visualization_type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Time: {algo.time_complexity}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {algo.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{algo.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-slate-400 font-mono">
                    Space: {algo.space_complexity}
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Visualize Step-by-Step <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Practice Problems Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            Topic Practice Problems ({problems.length})
          </h2>
        </div>

        {problems.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No practice problems found for this topic.
          </div>
        ) : (
          <div className="space-y-3">
            {problems.map((prob) => (
              <div
                key={prob.id}
                onClick={() => navigate(`/dsa/problem/${prob.id}`)}
                className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-sm transition-all cursor-pointer group flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {prob.difficulty}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {prob.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{prob.description}</p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-8 ml-4 flex-shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-700"
                >
                  Code Now
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
