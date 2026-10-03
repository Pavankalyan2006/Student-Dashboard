import React, { useEffect, useState } from 'react';
import { skillsApi, StudentSkill, Skill, SkillEvidence, SkillCategory } from '../api/skillsApi';
import {
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sparkles,
  BookOpen,
  FolderGit2,
  Code2,
  Search,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface SkillProfilePageProps {
  onNavigate: (path: string) => void;
}

export const SkillProfilePage: React.FC<SkillProfilePageProps> = ({ onNavigate }) => {
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [allCatalogSkills, setAllCatalogSkills] = useState<Skill[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<{
    skillName: string;
    items: SkillEvidence[];
  } | null>(null);
  const [declareModalOpen, setDeclareModalOpen] = useState(false);
  const [selectedCatalogSkillId, setSelectedCatalogSkillId] = useState('');
  const [selectedProficiency, setSelectedProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [profileSkills, catalog] = await Promise.all([
        skillsApi.getProfile(),
        skillsApi.listSkills(),
      ]);
      setSkills(profileSkills);
      setAllCatalogSkills(catalog);
    } catch {
      toast.error('Failed to load skill profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenEvidence = async (skill: StudentSkill) => {
    try {
      const evidenceList = await skillsApi.getEvidence(skill.skill_id);
      setSelectedEvidence({
        skillName: skill.skill_name,
        items: evidenceList,
      });
    } catch {
      toast.error('Failed to load evidence');
    }
  };

  const handleDeclareSkill = async () => {
    if (!selectedCatalogSkillId) {
      toast.error('Please select a skill from the catalogue');
      return;
    }
    try {
      await skillsApi.declareSkill(selectedCatalogSkillId, selectedProficiency);
      toast.success('Skill declared in profile');
      setDeclareModalOpen(false);
      loadData();
    } catch {
      toast.error('Failed to declare skill');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Sparkles className="h-8 w-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Loading verified skill profile...</p>
      </div>
    );
  }

  const filtered = skills.filter((s) => {
    const matchesCategory = filterCategory === 'ALL' || s.category === filterCategory;
    const matchesSearch =
      s.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Skill Profile & Evidence Matrix
            </h1>
            <p className="text-xs text-slate-500">
              Track verified competencies backed by platform courses, Project Builder code, DSA labs, and assessments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/skills/assessment')}
            className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Take Skill Assessment
          </button>
          <button
            onClick={() => setDeclareModalOpen(true)}
            className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Declare Skill
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills by name..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'PROGRAMMING', 'WEB', 'DATABASE', 'AI_ML', 'SOFTWARE_ENGINEERING', 'DEVOPS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Matrix Cards */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Search className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No skills match your filters</h3>
          <p className="text-xs text-slate-500">Try searching for a different skill name or reset category selection.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('ALL');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((sk) => (
            <div
              key={sk.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {sk.category.replace('_', ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      sk.confidence === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : sk.confidence === 'STRONG_EVIDENCE'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}
                  >
                    {sk.confidence.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {sk.skill_name}
                  </h3>
                  <span className="text-xs text-slate-500 capitalize">
                    Proficiency: {sk.proficiency.toLowerCase()}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Verifiable Evidence Records:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{sk.evidence_count}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEvidence(sk)}
                  className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                >
                  Inspect Evidence <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={() => onNavigate(`/skills/assessment?skill_id=${sk.skill_id}`)}
                  className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100"
                >
                  Assess
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Drawer / Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Evidence Audit: {selectedEvidence.skillName}
                </h3>
                <p className="text-xs text-slate-500">Verifiable records gathered from platform activities</p>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {selectedEvidence.items.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No specific evidence records logged yet.</p>
              ) : (
                selectedEvidence.items.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                        Source: {ev.source_type}
                      </span>
                      {ev.score !== undefined && (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Score: {ev.score}%
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {ev.description}
                    </p>
                    <span className="text-[10px] text-slate-400 block pt-1">
                      Recorded on {new Date(ev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Declare Skill Modal */}
      {declareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Declare Skill</h3>
              <button onClick={() => setDeclareModalOpen(false)}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Skill from Catalogue
                </label>
                <select
                  value={selectedCatalogSkillId}
                  onChange={(e) => setSelectedCatalogSkillId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="">-- Choose a skill --</option>
                  {allCatalogSkills.map((sk) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.name} ({sk.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Self-declared Proficiency
                </label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeclareModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareSkill}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Save to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
