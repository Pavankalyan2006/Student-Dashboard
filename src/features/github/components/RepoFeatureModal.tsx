import React, { useState } from 'react';
import { useToggleFeaturedRepo } from '../hooks/useGitHub';
import { Star, CheckCircle2, X, Sparkles, Layers, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RepoFeatureModalProps {
  repoId: string;
  repoName: string;
  isFeaturedInitial?: boolean;
  initialMetadata?: {
    role?: string;
    tech_stack?: string[];
    key_features?: string[];
    challenges_solved?: string;
    lessons_learned?: string;
    demo_url?: string;
    preview_image?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const RepoFeatureModal: React.FC<RepoFeatureModalProps> = ({
  repoId,
  repoName,
  isFeaturedInitial = false,
  initialMetadata,
  isOpen,
  onClose,
}) => {
  const [isFeatured, setIsFeatured] = useState(isFeaturedInitial);
  const [role, setRole] = useState(initialMetadata?.role || 'Lead Engineer');
  const [techStackInput, setTechStackInput] = useState(
    initialMetadata?.tech_stack ? initialMetadata.tech_stack.join(', ') : 'TypeScript, React, Node.js'
  );
  const [keyFeaturesInput, setKeyFeaturesInput] = useState(
    initialMetadata?.key_features
      ? initialMetadata.key_features.join('\n')
      : 'Real-time WebSocket streaming\nRole-based access control\nComprehensive test suite'
  );
  const [challengesSolved, setChallengesSolved] = useState(
    initialMetadata?.challenges_solved || 'Mitigated high latency queries via Redis caching layer.'
  );
  const [lessonsLearned, setLessonsLearned] = useState(
    initialMetadata?.lessons_learned || 'Implemented asynchronous job queues for lengthy tasks.'
  );
  const [demoUrl, setDemoUrl] = useState(initialMetadata?.demo_url || '');

  const toggleFeaturedMutation = useToggleFeaturedRepo(repoId);

  if (!isOpen) return null;

  const handleSave = async () => {
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const keyFeatures = keyFeaturesInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      await toggleFeaturedMutation.mutateAsync({
        is_featured: isFeatured,
        metadata: {
          role,
          tech_stack: techStack,
          key_features: keyFeatures,
          challenges_solved: challengesSolved,
          lessons_learned: lessonsLearned,
          demo_url: demoUrl,
        },
      });
      onClose();
    } catch (err: any) {
      toast.error('Failed to update portfolio status');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 hero-brand text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Star className="w-5 h-5 fill-amber-300 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Feature in Student Portfolio</h3>
              <p className="text-xs text-slate-300">{repoName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Toggle status */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-900">Feature on Profile & Portfolio</span>
              <p className="text-[11px] text-slate-500">Showcase this repository prominently to recruiters and mentors</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Your Role / Contribution
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Full-Stack Developer, API Designer"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Live Demo / Deployment URL
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.dev"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Technologies Used (Comma separated)
            </label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              placeholder="TypeScript, Python, FastAPI, Docker"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Key Features (One per line)
            </label>
            <textarea
              rows={3}
              value={keyFeaturesInput}
              onChange={(e) => setKeyFeaturesInput(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Engineering Challenge Solved
            </label>
            <textarea
              rows={2}
              value={challengesSolved}
              onChange={(e) => setChallengesSolved(e.target.value)}
              placeholder="Describe a key technical problem you tackled..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Lessons Learned
            </label>
            <input
              type="text"
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="Key technical insight gained..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={toggleFeaturedMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {toggleFeaturedMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Save Featured Project
          </button>
        </div>
      </div>
    </div>
  );
};
