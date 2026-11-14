import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  Briefcase,
  Layers,
  Code,
  Cpu,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { placementsApi } from '../api/placementsApi';
import type { PlacementCompany, CompanyPreparationProfile, PlacementRole } from '../types/placement';

interface Props {
  companyId?: string;
  onNavigate?: (path: string) => void;
}

export const PlacementCompaniesPage: React.FC<Props> = ({ companyId, onNavigate }) => {
  const navigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const [companies, setCompanies] = useState<PlacementCompany[]>([]);
  const [roles, setRoles] = useState<PlacementRole[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<PlacementCompany | null>(null);
  const [profile, setProfile] = useState<CompanyPreparationProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        setLoading(true);
        const [compList, roleList] = await Promise.all([
          placementsApi.getCompanies(),
          placementsApi.getRoles(),
        ]);
        setCompanies(compList);
        setRoles(roleList);

        if (companyId) {
          const target = compList.find(c => c.id === companyId || c.slug === companyId);
          if (target) {
            setSelectedCompany(target);
          }
        }
      } catch (err) {
        console.error('Failed to load companies/roles', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, [companyId]);

  useEffect(() => {
    if (!selectedCompany) {
      setProfile(null);
      return;
    }
    async function fetchProfile() {
      try {
        setLoadingProfile(true);
        const data = await placementsApi.getCompanyProfile(selectedCompany!.id, selectedRoleId || undefined);
        setProfile(data);
      } catch (err) {
        console.error('Failed to load company profile', err);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [selectedCompany, selectedRoleId]);

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate('/placements')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Placement Prep
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">
                Company-Specific Preparation
              </h1>
              <p className="text-gray-600 mt-1">
                Study commonly reported hiring rounds, interview topics, and practice questions for top tech recruiters.
              </p>
            </div>
            <button
              onClick={() => navigate('/placements/mock-interview/setup')}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Mock Interview
            </button>
          </div>
        </div>

        {/* Verified Disclaimer Notice */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3.5 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Important hiring notice:</span> Hiring processes, round counts, and question patterns vary across roles, recruitment cycles, seniority levels, and campus vs. off-campus drives. Prep summaries reflect verified publicly aggregated interview reports and are not guaranteed future rounds.
          </div>
        </div>

        {/* Main Grid: Company Selector & Detailed Profile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Company List Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200/80 p-5 shadow-sm space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500 text-sm">Loading companies...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No companies match your query.</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredCompanies.map(comp => {
                  const isSelected = selectedCompany?.id === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => {
                        setSelectedCompany(comp);
                        navigate(`/placements/company/${comp.id}`);
                      }}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {comp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{comp.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{comp.description}</p>
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-4 h-4 shrink-0 transition-transform ${
                          isSelected ? 'text-blue-600 translate-x-0.5' : 'text-gray-400 group-hover:text-gray-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Company Profile Details */}
          <div className="lg:col-span-8 space-y-6">
            {!selectedCompany ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800">Select a Company</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Choose a tech organization from the list on the left to inspect its interview stages, core preparation topics, and role tracks.
                </p>
              </div>
            ) : (
              <>
                {/* Header Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-blue-500/20">
                        {selectedCompany.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-navy-900">{selectedCompany.name}</h2>
                          {selectedCompany.website && (
                            <a
                              href={selectedCompany.website}
                              target="_blank"
                              rel="noreferrer"
                              className="text-gray-400 hover:text-blue-600 transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-0.5">{selectedCompany.description}</p>
                      </div>
                    </div>

                    {/* Role Filter Selector */}
                    <div className="flex items-center space-x-2">
                      <label htmlFor="role-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Role:
                      </label>
                      <select
                        id="role-select"
                        value={selectedRoleId}
                        onChange={e => setSelectedRoleId(e.target.value)}
                        className="text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="">All Tech Roles</option>
                        {roles.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Overview Text */}
                  {loadingProfile ? (
                    <div className="py-8 text-center text-sm text-gray-500">Loading interview profile...</div>
                  ) : profile ? (
                    <div className="mt-6 space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                          Recruitment Overview
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50/60 p-4 rounded-xl border border-gray-100">
                          {profile.overview}
                        </p>
                      </div>

                      {/* Reported Hiring Stages */}
                      {profile.reported_rounds && profile.reported_rounds.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                            Reported Hiring Stages
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {profile.reported_rounds.map((rnd: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-xs relative overflow-hidden"
                              >
                                <div className="absolute top-2 right-2 text-2xl font-black text-gray-100 select-none">
                                  0{idx + 1}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mb-1">
                                  Round {idx + 1}
                                </span>
                                <h5 className="font-semibold text-gray-900 text-sm">{rnd.round_name || rnd.name}</h5>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rnd.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preparation Topics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* Coding Focus */}
                        <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4">
                          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-3">
                            <Code className="w-4 h-4 text-emerald-600" />
                            <span>DSA & Coding</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.coding_topics?.map((topic: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs bg-white text-emerald-900 border border-emerald-200 font-medium px-2 py-0.5 rounded-md"
                              >
                                {topic}
                              </span>
                            )) || <span className="text-xs text-emerald-600">None specified</span>}
                          </div>
                        </div>

                        {/* Technical Core */}
                        <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-4">
                          <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm mb-3">
                            <Cpu className="w-4 h-4 text-blue-600" />
                            <span>CS Fundamentals</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.technical_topics?.map((topic: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs bg-white text-blue-900 border border-blue-200 font-medium px-2 py-0.5 rounded-md"
                              >
                                {topic}
                              </span>
                            )) || <span className="text-xs text-blue-600">None specified</span>}
                          </div>
                        </div>

                        {/* HR / Culture */}
                        <div className="bg-purple-50/50 border border-purple-200/80 rounded-xl p-4">
                          <div className="flex items-center space-x-2 text-purple-800 font-bold text-sm mb-3">
                            <UserCheck className="w-4 h-4 text-purple-600" />
                            <span>HR & Leadership</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.hr_topics?.map((topic: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs bg-white text-purple-900 border border-purple-200 font-medium px-2 py-0.5 rounded-md"
                              >
                                {topic}
                              </span>
                            )) || <span className="text-xs text-purple-600">None specified</span>}
                          </div>
                        </div>
                      </div>

                      {/* Source Metadata & Verification Stamp */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 gap-2">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-blue-600" />
                          <span>
                            Source:{' '}
                            <strong className="text-gray-700">
                              {(profile.source_metadata as any)?.source_name || 'Engineering & Campus Hiring Reports'}
                            </strong>
                          </span>
                        </div>
                        {profile.last_verified_at && (
                          <div>Last verified: {new Date(profile.last_verified_at).toLocaleDateString()}</div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => navigate(`/placements/mock-interview/setup?companyId=${selectedCompany.id}`)}
                          className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow hover:bg-blue-700 transition"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Simulate {selectedCompany.name} Interview
                        </button>
                        <button
                          onClick={() => navigate('/placements/technical')}
                          className="inline-flex items-center px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Study CS Topics
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-gray-500">
                      No preparation profile available for this company yet.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
