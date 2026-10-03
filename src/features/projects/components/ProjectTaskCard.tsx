import React from 'react';
import { ProjectTask, TaskStatus, TaskPriority } from '../types/project';
import {
  Code2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Clock4,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ProjectTaskCardProps {
  task: ProjectTask;
  projectId: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onOpenCodingLab: (projectId: string, moduleId?: string, taskId?: string) => void;
}

export const ProjectTaskCard: React.FC<ProjectTaskCardProps> = ({
  task,
  projectId,
  onStatusChange,
  onDelete,
  onOpenCodingLab,
}) => {
  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300';
      case 'LOW':
        return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (s: TaskStatus) => {
    switch (s) {
      case 'DONE':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'IN_PROGRESS':
        return <Clock4 className="w-3.5 h-3.5 text-blue-600" />;
      case 'BLOCKED':
        return <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs transition-all space-y-3">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
              {task.priority}
            </span>
            {task.depends_on_task_id && (
              <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-900 font-medium">
                Has Dependency
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
            {task.title}
          </h4>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {task.description || 'No detailed instructions provided.'}
      </p>

      {/* Footer Info & Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
        {/* Status Dropdown */}
        <div className="flex items-center gap-1.5">
          {getStatusIcon(task.status)}
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
            className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Action: Open in Coding Lab */}
        <button
          onClick={() => onOpenCodingLab(projectId, task.module_id, task.id)}
          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors border border-indigo-200 dark:border-indigo-900"
          title="Open Coding Lab with project & task context"
        >
          <Code2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Coding Lab</span>
        </button>
      </div>
    </div>
  );
};
