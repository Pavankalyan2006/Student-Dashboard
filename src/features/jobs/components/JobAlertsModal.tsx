// src/features/jobs/components/JobAlertsModal.tsx
// Modal for managing student job alert notifications

import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Trash2,
  Plus,
  CheckCircle2,
  Building2,
  Briefcase,
  Layers,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { StudentJobAlert, JobPrimaryCategory } from '../types/jobsTypes';
import { jobsApi } from '../api/jobsApi';

interface JobAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobAlertsModal: React.FC<JobAlertsModalProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<StudentJobAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // New alert form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<JobPrimaryCategory | 'ALL'>('ALL');
  const [keywords, setKeywords] = useState('');
  const [locations, setLocations] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [freshersOnly, setFreshersOnly] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getAlerts();
      setAlerts(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
      setIsCreating(false);
    }
  }, [isOpen]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const kwList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      const locList = locations
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      await jobsApi.saveAlert({
        title: title.trim(),
        category,
        subcategories: [],
        keywords: kwList,
        locations: locList,
        remote_only: remoteOnly,
        freshers_only: freshersOnly,
        is_active: true,
      });

      setTitle('');
      setKeywords('');
      setLocations('');
      setIsCreating(false);
      fetchAlerts();
    } catch {
      // handle error
    }
  };

  const handleDelete = async (id: string) => {
    await jobsApi.deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Custom Job Alerts</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive instant in-app notifications whenever matching government or private jobs are published
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {!isCreating && (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Active Alerts ({alerts.length})
              </span>
              <button
                type="button"
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Create New Alert
              </button>
            </div>
          )}

          {isCreating && (
            <form onSubmit={handleCreateAlert} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Configure New Opportunity Alert</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alert Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ISRO Scientist or Junior Backend Go Roles"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sector Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="ALL">All Sectors (Government + Private)</option>
                    <option value="GOVERNMENT">Government & PSUs Only</option>
                    <option value="PRIVATE">Private Tech & Startups Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SDE, Go, ISRO, UPSC, React"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Locations
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Hyderabad, Delhi"
                    value={locations}
                    onChange={(e) => setLocations(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => setRemoteOnly(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Remote Only</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={freshersOnly}
                      onChange={(e) => setFreshersOnly(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300">Freshers Eligible</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  Save Alert
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading alerts...</div>
          ) : alerts.length === 0 && !isCreating ? (
            <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active job alerts configured</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Create an alert to get notified the moment opportunities matching your target organizations or technologies appear.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</h5>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                      {alert.category}
                    </span>
                    {alert.freshers_only && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                        Freshers
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {alert.keywords.length > 0 && <span>Keywords: {alert.keywords.join(', ')}</span>}
                    {alert.locations.length > 0 && <span>| Locations: {alert.locations.join(', ')}</span>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(alert.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
