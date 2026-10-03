import React, { useState } from 'react';
import { ProjectIdea } from '../types/project';
import { projectsApi } from '../api/projectsApi';
import {
  Sparkles,
  RefreshCw,
  X,
  Check,
  Layers,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIdea: (idea: ProjectIdea) => void;
  defaultDomain?: string;
}

export const ProjectIdeasModal: React.FC<ProjectIdeasModalProps> = ({
  isOpen,
  onClose,
  onSelectIdea,
  defaultDomain = 'AI/ML',
}) => {
  const [domain, setDomain] = useState(defaultDomain);
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const generated = await projectsApi.generateProjectIdeas({
        domain,
        difficulty,
        branch,
      });
      setIdeas(generated);
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate ideas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                AI B.Tech Project Idea Generator
              </h3>
              <p className="text-xs text-slate-500">
                Discover academically validated capstone and mini project concepts tailored to your branch
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs Bar */}
        <div className="p-5 bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[150px]">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
            >
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Data Science">Data Science & Analytics</option>
              <option value="Web Development">Full-Stack Web Development</option>
              <option value="Cyber Security">Cyber Security & Cryptography</option>
              <option value="Cloud Computing">Cloud Computing & DevOps</option>
              <option value="IoT">Internet of Things (IoT)</option>
              <option value="Blockchain">Blockchain & Web3</option>
              <option value="HealthTech">HealthTech & Biomedical</option>
              <option value="EdTech">EdTech & Adaptive Learning</option>
            </select>
          </div>

          <div className="w-[140px]">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 font-medium"
            >
              <option value="BEGINNER">Beginner (Mini Project)</option>
              <option value="INTERMEDIATE">Intermediate (Major Project)</option>
              <option value="ADVANCED">Advanced (Final Year / Research)</option>
            </select>
          </div>

          <div className="self-end pt-1">
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{ideas.length > 0 ? 'Generate More' : 'Generate Ideas'}</span>
            </button>
          </div>
        </div>

        {/* Ideas Result List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading && ideas.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mb-3" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Consulting AI Engineering Advisor...
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Formulating problem statements, architecture, and technology recommendations
              </p>
            </div>
          ) : ideas.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
              <BrainCircuit className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Ready to Generate Project Concepts
              </p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select your engineering domain and difficulty above, then click Generate Ideas.
              </p>
            </div>
          ) : (
            ideas.map((idea, idx) => (
              <div
                key={idx}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 rounded-2xl shadow-xs transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {idea.difficulty} • {idea.estimated_scope}
                    </span>
                    <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">
                      {idea.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      onSelectIdea(idea);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <span>Use Idea</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p>
                    <strong className="text-slate-900 dark:text-slate-200">Problem:</strong>{' '}
                    {idea.problem}
                  </p>
                  <p>
                    <strong className="text-slate-900 dark:text-slate-200">Solution:</strong>{' '}
                    {idea.solution}
                  </p>
                </div>

                {/* Key Features */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Key Features:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.features?.map((f, i) => (
                      <span
                        key={i}
                        className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md"
                      >
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
                  {idea.technologies?.map((t, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
