import React from 'react';
import { Project } from '../types/project';
import {
  FolderKanban,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  Clock,
} from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string, tab?: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpen }) => {
  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900';
      case 'PLANNING':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900';
      case 'ON_HOLD':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const formattedDate = new Date(project.updated_at || project.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-600/50 dark:hover:border-blue-500/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {project.domain}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Project Title */}
        <h3
          onClick={() => onOpen(project.id, 'overview')}
          className="font-bold text-slate-900 dark:text-slate-100 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 cursor-pointer transition-colors line-clamp-1 mb-1.5"
        >
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {project.description || project.problem_statement || 'No description provided.'}
        </p>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Calculated Progress</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
              {project.progress_percentage}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, project.progress_percentage))}%` }}
            />
          </div>
        </div>

        {/* Tags / Type */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            {project.project_type.replace('_', ' ')}
          </span>
          {project.tags?.slice(0, 2).map((t, idx) => (
            <span key={idx} className="text-[10px] text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
              #{t}
            </span>
          ))}
        </div>
      </div>

      {/* Footer & Quick Actions */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formattedDate}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onOpen(project.id, 'documentation')}
            title="Generate Documentation"
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpen(project.id, 'ai')}
            title="Ask AI Project Mentor"
            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpen(project.id, 'overview')}
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Open</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
