import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../api/client';
import { useLinkGitHubProject } from '../hooks/useGitHub';
import { Link as LinkIcon, X, Check, FolderGit2 } from 'lucide-react';
import { toast } from 'sonner';

interface RepoLinkProjectModalProps {
  repoId: string;
  repoName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RepoLinkProjectModal: React.FC<RepoLinkProjectModalProps> = ({
  repoId,
  repoName,
  isOpen,
  onClose,
}) => {
  const linkMutation = useLinkGitHubProject(repoId);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['student-projects'],
    queryFn: async () => {
      const res = await apiClient.get<any[]>('/projects');
      return res;
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const handleLink = async () => {
    if (!selectedProjectId) {
      toast.error('Select a student project to link');
      return;
    }

    try {
      await linkMutation.mutateAsync(selectedProjectId);
      onClose();
    } catch (err: any) {
      // toast in hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Link Repository to Project</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Link <strong className="text-slate-800">{repoName}</strong> with a Project Builder portfolio item. This allows architecture components, commits, and file evidence to substantiate project milestones.
        </p>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Project Builder Project
          </label>
          {isLoading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading student projects...</div>
          ) : projects.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">No projects found. Create one in Project Builder first.</div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose a project --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.domain})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleLink}
            disabled={!selectedProjectId || linkMutation.isPending}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {linkMutation.isPending ? 'Linking...' : 'Confirm Link'}
          </button>
        </div>
      </div>
    </div>
  );
};
