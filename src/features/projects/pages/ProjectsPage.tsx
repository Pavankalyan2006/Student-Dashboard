import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectIdeasModal } from '../components/ProjectIdeasModal';
import {
  FolderKanban,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ProjectsPageProps {
  onNavigate: (path: string) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', filterStatus, searchQuery],
    queryFn: () =>
      projectsApi.getProjects({
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        search: searchQuery || undefined,
      }),
  });

  const activeCount = projects.filter((p) => p.status === 'IN_PROGRESS').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;
  const planningCount = projects.filter((p) => p.status === 'PLANNING').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-[#2563EB] rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              My Projects
            </h1>
          </div>
          <p className="text-sm text-slate-500">
            Design, build and document your B.Tech projects with AI.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsIdeasModalOpen(true)}
            className="px-3.5 py-2 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Ideas Generator</span>
          </button>

          <button
            onClick={() => onNavigate('/projects/create')}
            className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Projects', count: projects.length },
            { id: 'IN_PROGRESS', label: 'Active', count: activeCount },
            { id: 'PLANNING', label: 'Planning', count: planningCount },
            { id: 'COMPLETED', label: 'Completed', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filterStatus === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, domain..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            No projects found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No projects matched "${searchQuery}". Try clearing your search.`
              : "You haven't initialized any engineering projects yet. Kickstart your capstone or mini-project with our step-by-step wizard or AI idea generator."}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setIsIdeasModalOpen(true)}
              className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Project Ideas</span>
            </button>
            <button
              onClick={() => onNavigate('/projects/create')}
              className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={(projectId, tab) => onNavigate(`/projects/${projectId}/${tab || 'overview'}`)}
            />
          ))}
        </div>
      )}

      {/* AI Ideas Modal */}
      <ProjectIdeasModal
        isOpen={isIdeasModalOpen}
        onClose={() => setIsIdeasModalOpen(false)}
        onSelectIdea={(idea) => {
          onNavigate(
            `/projects/create?idea=${encodeURIComponent(idea.title)}&domain=${encodeURIComponent(
              idea.problem ? idea.title : 'AI/ML'
            )}`
          );
        }}
      />
    </div>
  );
};
