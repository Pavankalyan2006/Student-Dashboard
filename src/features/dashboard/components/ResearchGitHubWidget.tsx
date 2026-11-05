import React from 'react';
import { useNavigate } from '../../../lib/router';
import { useResearchProjects } from '../../research/hooks/useResearch';
import { useGitHubStatus, useGitHubRepositories } from '../../github/hooks/useGitHub';
import {
  BookOpen,
  FolderGit2,
  Sparkles,
  ArrowRight,
  GitBranch,
  Layers,
  ChevronRight,
  Plus,
} from 'lucide-react';

export interface ResearchGitHubWidgetProps {
  onNavigate?: (path: string) => void;
}

export const ResearchGitHubWidget: React.FC<ResearchGitHubWidgetProps> = ({ onNavigate }) => {
  const routerNavigate = useNavigate();
  const navigate = onNavigate || routerNavigate;
  const { data: researchProjects = [] } = useResearchProjects();
  const { data: ghStatus } = useGitHubStatus();
  const { data: repos = [] } = useGitHubRepositories();

  const activeProject = researchProjects[0];
  const activeRepo = repos[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
      {/* Research Assistant Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-700">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">Research Assistant</span>
            </div>
            {activeProject && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold uppercase">
                {activeProject.research_type.replace('_', ' ')}
              </span>
            )}
          </div>

          {activeProject ? (
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 line-clamp-1">{activeProject.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{activeProject.objective}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">No Active Research Project</h4>
              <p className="text-xs text-slate-500">
                Explore papers, discover gaps, and build literature reviews with AI assistance.
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {activeProject ? (
            <button
              onClick={() => navigate(`/research/${activeProject.id}`)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Continue Research <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/research/create')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Start Research
            </button>
          )}

          <button
            onClick={() => navigate('/research')}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            All Projects ({researchProjects.length})
          </button>
        </div>
      </div>

      {/* GitHub Integration Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">GitHub Code Intelligence</span>
            </div>
            {ghStatus?.is_connected ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                Connected
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                Not Connected
              </span>
            )}
          </div>

          {activeRepo ? (
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 truncate">{activeRepo.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{activeRepo.description || 'No description'}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">No Repositories Linked</h4>
              <p className="text-xs text-slate-500">
                Connect GitHub to analyze architecture, detect secrets, and link code to Project Builder.
              </p>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {activeRepo ? (
            <button
              onClick={() => navigate(`/github/repo/${activeRepo.id}`)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Inspect Repository <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/github/connect')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              Connect GitHub <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => navigate('/github')}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            GitHub Hub
          </button>
        </div>
      </div>
    </div>
  );
};
