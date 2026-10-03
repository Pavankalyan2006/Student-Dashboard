import React, { useEffect, useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { ResumeVersion } from '../types/resumeTypes';
import { X, History, RotateCcw, Clock, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeVersionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  onVersionRestored: () => void;
}

export const ResumeVersionDrawer: React.FC<ResumeVersionDrawerProps> = ({
  isOpen,
  onClose,
  resumeId,
  onVersionRestored,
}) => {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState<number | null>(null);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const list = await resumeApi.listVersions(resumeId);
      setVersions(list);
    } catch {
      // Ignored
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, resumeId]);

  if (!isOpen) return null;

  const handleCreateSnapshot = async () => {
    try {
      await resumeApi.createVersion(resumeId, 'Manual Snapshot');
      toast.success('Version snapshot saved');
      await fetchVersions();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create snapshot');
    }
  };

  const handleRestore = async (versionNumber: number) => {
    if (!window.confirm(`Restore Version ${versionNumber}? Your current state will be backed up automatically.`)) {
      return;
    }

    try {
      setIsRestoring(versionNumber);
      await resumeApi.restoreVersion(resumeId, versionNumber);
      toast.success(`Restored Version ${versionNumber}`);
      onVersionRestored();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to restore version');
    } finally {
      setIsRestoring(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="bg-white border-l border-slate-200 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Version History</h3>
              <p className="text-[11px] text-slate-500">Restore or review previous resume snapshots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
          <span className="text-xs text-slate-500">{versions.length} saved version{versions.length === 1 ? '' : 's'}</span>
          <button
            onClick={handleCreateSnapshot}
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold hover:bg-blue-100 flex items-center gap-1 shadow-2xs transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Save Snapshot Now
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading version history...</div>
          ) : versions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No saved versions yet. Click "Save Snapshot Now" to create one.
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50 shadow-2xs transition"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200">
                      v{ver.version_number}
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {ver.created_by}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestore(ver.version_number)}
                    disabled={isRestoring === ver.version_number}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 transition flex items-center gap-1 shadow-2xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(ver.created_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
