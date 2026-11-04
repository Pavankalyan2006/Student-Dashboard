// src/features/system-design/components/SavedProjectsView.tsx
// Persistence & Project Management for Saved Architecture Designs and Versions

import * as React from 'react';
import {
  FolderGit2,
  Plus,
  Trash2,
  Copy,
  Clock,
  Layers,
  ArrowRight,
  GitBranch,
  Download,
  Upload,
  Calendar
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SystemDesignProject } from '../types/systemDesign';
import { toast } from 'sonner';

interface SavedProjectsViewProps {
  projects: SystemDesignProject[];
  currentProjectId?: string;
  onSelectProject: (project: SystemDesignProject) => void;
  onCreateNewProject: () => void;
  onDuplicateProject: (projectId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onCreateVersion: (projectId: string, note: string) => Promise<void>;
}

export function SavedProjectsView({
  projects,
  currentProjectId,
  onSelectProject,
  onCreateNewProject,
  onDuplicateProject,
  onDeleteProject,
  onCreateVersion
}: SavedProjectsViewProps) {
  const [versionNote, setVersionNote] = React.useState('');
  const [versioningProjId, setVersioningProjId] = React.useState<string | null>(null);

  const handleCreateVersion = async (projectId: string) => {
    if (!versionNote.trim()) {
      toast.warning('Please enter a note describing this version snapshot');
      return;
    }
    await onCreateVersion(projectId, versionNote.trim());
    setVersionNote('');
    setVersioningProjId(null);
    toast.success('Created new version snapshot');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-400" />
            Saved Architecture Projects & Versions
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            All system architecture designs, capacity models, database schemas, and version snapshots are persisted securely to your student account.
          </p>
        </div>

        <Button onClick={onCreateNewProject} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3">
          <Plus className="w-3.5 h-3.5 mr-1" /> New Architecture
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(proj => {
          const isCurrent = proj.id === currentProjectId;
          const versionCount = proj.versions?.length || 1;

          return (
            <div
              key={proj.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between shadow-lg ${
                isCurrent
                  ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/30'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800">
                    {proj.challenge_id ? 'Challenge Solution' : 'Custom Project'}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <GitBranch className="w-3 h-3" />
                    <span>v{versionCount}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <div>Components: <span className="text-slate-200 font-bold">{proj.components?.length || 0}</span></div>
                  <div>Connections: <span className="text-slate-200 font-bold">{proj.connections?.length || 0}</span></div>
                </div>

                {/* Version snapshot prompt */}
                {versioningProjId === proj.id && (
                  <div className="mt-3 p-3 bg-slate-950 rounded-lg border border-slate-700 space-y-2">
                    <input
                      type="text"
                      placeholder="Snapshot note (e.g. Added Redis tier)..."
                      value={versionNote}
                      onChange={(e) => setVersionNote(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                    />
                    <div className="flex justify-end gap-1.5">
                      <Button onClick={() => setVersioningProjId(null)} size="sm" variant="ghost" className="text-xs h-6 px-2">
                        Cancel
                      </Button>
                      <Button onClick={() => handleCreateVersion(proj.id)} size="sm" className="bg-indigo-600 text-xs h-6 px-2">
                        Save Snapshot
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setVersioningProjId(versioningProjId === proj.id ? null : proj.id)}
                    title="Snapshot Version"
                    className="p-1.5 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDuplicateProject(proj.id)}
                    title="Duplicate Project"
                    className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      title="Delete Project"
                      className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <Button
                  onClick={() => onSelectProject(proj)}
                  size="sm"
                  className={`text-xs h-7 px-3 ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'}`}
                >
                  {isCurrent ? 'Active Canvas' : 'Open in Canvas'}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
