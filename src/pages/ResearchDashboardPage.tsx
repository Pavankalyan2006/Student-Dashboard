import React from 'react';
import { useNavigate } from '../lib/router';
import { useResearchProjects } from '../features/research/hooks/useResearch';
import {
  BookOpen,
  Plus,
  Search,
  FileText,
  Lightbulb,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
  HelpCircle,
  AlertCircle,
  FileCheck2,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const ResearchDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useResearchProjects();

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl hero-brand p-8 text-white">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Academic Research Workspace
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Research Assistant
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Explore papers, understand research, identify gaps, and build your research work with AI. Grounded in peer-reviewed literature, reproducible methodologies, and verified citations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/research/create')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Start Research
            </button>
            <button
              onClick={() => {
                if (projects.length > 0) navigate(`/research/${projects[0].id}/papers`);
                else navigate('/research/create');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
              Find Papers
            </button>
            <button
              onClick={() => {
                if (projects.length > 0) navigate(`/research/${projects[0].id}/literature-review`);
                else navigate('/research/create');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              Literature Review
            </button>
            <button
              onClick={() => {
                if (projects.length > 0) navigate(`/research/${projects[0].id}/ideas`);
                else navigate('/research/create');
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-xl border border-white/20 backdrop-blur-xs transition-colors cursor-pointer"
            >
              <Lightbulb className="w-4 h-4" />
              Generate Research Ideas
            </button>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute right-0 top-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active Research Projects & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Research Projects</h2>
              <p className="text-xs text-slate-500">Active investigations, theses, and literature reviews</p>
            </div>
            <button
              onClick={() => navigate('/research/create')}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              Loading research projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">No Research Projects Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Start your first academic investigation, search peer-reviewed literature, and synthesize findings with AI assistance.
                </p>
              </div>
              <button
                onClick={() => navigate('/research/create')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Create Research Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/research/${p.id}`)}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                        {p.research_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.objective}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{p.domain}</span>
                    <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Open Workspace <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Research Workflow Guide */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Standard Academic Workflow</h3>
            <p className="text-xs text-slate-500">
              The platform guides your academic work through verifiable stages:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-indigo-600">1. Inquiry</div>
                <p className="text-slate-500 text-[11px]">Define question & search open-access papers</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-indigo-600">2. Extraction</div>
                <p className="text-slate-500 text-[11px]">Analyze methodology, datasets, and bounds</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-indigo-600">3. Gaps & Ideas</div>
                <p className="text-slate-500 text-[11px]">Empirical gap detection & methodology design</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-indigo-600">4. Review & Cite</div>
                <p className="text-slate-500 text-[11px]">Draft review with IEEE / APA bibliography</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: research shortcuts */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Research Capabilities</h3>
            <div className="space-y-2 text-xs">
              <div
                onClick={() => {
                  if (projects[0]) navigate(`/research/${projects[0].id}/papers`);
                  else navigate('/research/create');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Saved Papers Library</div>
                    <div className="text-slate-500 text-[11px]">Indexed with Document AI/RAG</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => {
                  if (projects[0]) navigate(`/research/${projects[0].id}/gaps`);
                  else navigate('/research/create');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Research Gap Analysis</div>
                    <div className="text-slate-500 text-[11px]">Evidence-grounded boundary checks</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>

              <div
                onClick={() => {
                  if (projects[0]) navigate(`/research/${projects[0].id}/citations`);
                  else navigate('/research/create');
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-800">Citation & BibTeX Hub</div>
                    <div className="text-slate-500 text-[11px]">APA, IEEE, MLA & BibTeX export</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
