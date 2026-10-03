import React, { useEffect, useState } from 'react';
import { careerApi, CareerRole } from '../api/careerApi';
import {
  Compass,
  Search,
  Layers,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  BookOpen,
  FolderGit2,
  Code2,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface CareerExplorePageProps {
  onNavigate: (path: string) => void;
}

export const CareerExplorePage: React.FC<CareerExplorePageProps> = ({ onNavigate }) => {
  const [roles, setRoles] = useState<CareerRole[]>([]);
  const [search, setSearch] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingRoleId, setGeneratingRoleId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true);
        const list = await careerApi.listRoles();
        setRoles(list);
      } catch (err: any) {
        toast.error('Failed to load roles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoles();
  }, []);

  const handleToggleCompare = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      if (selectedRoleIds.length >= 3) {
        toast.info('You can compare up to 3 roles at a time');
        return;
      }
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedRoleIds.length < 2) {
      toast.error('Select at least 2 roles to compare');
      return;
    }
    try {
      const comp = await careerApi.compareRoles(selectedRoleIds);
      setComparisonResult(comp);
      toast.success('Roles compared successfully');
    } catch {
      toast.error('Failed to compare roles');
    }
  };

  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.industry.toLowerCase().includes(search.toLowerCase()) ||
      r.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/career')}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Career Roles & Exploration
            </h1>
            <p className="text-xs text-slate-500">
              Explore technical disciplines and compare requirements side-by-side without subjective rankings.
            </p>
          </div>
        </div>

        {selectedRoleIds.length >= 2 && (
          <button
            onClick={handleRunComparison}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Layers className="h-3.5 w-3.5" />
            Compare {selectedRoleIds.length} Selected Roles
          </button>
        )}
      </div>

      {/* Comparison Drawer / Matrix if open */}
      {comparisonResult && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-purple-600" />
                Role Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">{comparisonResult.disclaimer}</p>
            </div>
            <button
              onClick={() => setComparisonResult(null)}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium"
            >
              Close Comparison
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonResult.roles.map((r: CareerRole) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-3"
              >
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{r.name}</h3>
                  <span className="text-[11px] text-slate-500">{r.industry}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Key Technical Topics:
                  </span>
                  <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    {r.technical_topics.slice(0, 4).map((t, idx) => (
                      <li key={idx} className="flex items-start gap-1 text-[11px]">
                        <span className="text-purple-600 font-bold">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Interview Focus:
                  </span>
                  <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    {r.interview_topics.slice(0, 3).map((it, idx) => (
                      <li key={idx} className="flex items-start gap-1 text-[11px]">
                        <span className="text-blue-600 font-bold">•</span>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate(`/career/role/${r.id}`)}
                  className="w-full py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  View Full Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input & Comparison Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles by title, skill, or industry..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredRoles.length} technical roles • {selectedRoleIds.length} selected for comparison
        </div>
      </div>

      {/* Role Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRoles.map((role) => {
          const isSelected = selectedRoleIds.includes(role.id);
          return (
            <div
              key={role.id}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition flex flex-col justify-between ${
                isSelected
                  ? 'border-purple-600 shadow-md ring-2 ring-purple-600/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {role.industry}
                  </span>
                  <button
                    onClick={() => handleToggleCompare(role.id)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      isSelected
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ Selected' : '+ Compare'}
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {role.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {role.description}
                </p>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {role.skills.slice(0, 4).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      {sk}
                    </span>
                  ))}
                  {role.skills.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{role.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onNavigate(`/career/role/${role.id}`)}
                  className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
                >
                  Role Overview <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  disabled={generatingRoleId === role.id}
                  onClick={async () => {
                    try {
                      setGeneratingRoleId(role.id);
                      await careerApi.generateRoadmap(role.id);
                      toast.success(`Generated roadmap for ${role.name}`);
                      onNavigate('/career/roadmap');
                    } catch {
                      toast.error('Failed to generate roadmap');
                    } finally {
                      setGeneratingRoleId(null);
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 disabled:opacity-50"
                >
                  {generatingRoleId === role.id ? 'Generating...' : 'Start Roadmap'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
