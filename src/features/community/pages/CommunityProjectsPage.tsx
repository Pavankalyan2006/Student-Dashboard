import * as React from 'react';
import {
  ArrowLeft,
  Hammer,
  Github,
  ExternalLink,
  Plus,
  Share2,
  Sparkles,
  Search,
  ThumbsUp,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { CommunityProjectShowcase } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function CommunityProjectsPage({
  initialProjectId,
  onNavigate,
}: {
  initialProjectId?: string;
  onNavigate: (path: string) => void;
}) {
  const [projects, setProjects] = React.useState<CommunityProjectShowcase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);

  // Form
  const [title, setTitle] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [techText, setTechText] = React.useState('Go, Raft, Distributed Systems');
  const [githubUrl, setGithubUrl] = React.useState('https://github.com/pavan-btech/distributed-kv');
  const [submitting, setSubmitting] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const handleUpvoteProject = async (projectId: string) => {
    try {
      await communityProfileApi.upvoteProject(projectId);
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p))
      );
      toast.success('Project upvoted!');
    } catch {
      toast.error('Failed to upvote project');
    }
  };

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getProjects();
      setProjects(data);
    } catch {
      toast.error('Failed to load project showcases');
    } finally {
      setLoading(false);
    }
  };

  const handleShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    try {
      setSubmitting(true);
      const created = await communityProfileApi.createProjectShowcase({
        project_id: 'prj_showcase_' + Date.now(),
        title: title.trim(),
        description: desc.trim(),
        technologies: techText.split(',').map((t) => t.trim()).filter(Boolean),
        github_url: githubUrl.trim() || undefined,
      });
      setProjects((prev) => [created, ...prev]);
      setShowModal(false);
      setTitle('');
      setDesc('');
      toast.success('Project published to student showcase!');
    } catch {
      toast.error('Failed to publish project showcase');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/community')}
            className="p-2 text-[#475467] hover:text-[#101828] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#101828]">Student Project Showcase</h1>
            <p className="text-xs text-[#667085]">
              Explore open engineering projects, capstone systems, and open-source repos created by peers.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Showcase a Project</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student projects by title, description, or tech stack..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#667085] bg-white rounded-2xl border border-[#E4E7EC] space-y-2">
          <Hammer className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">No showcased projects yet</p>
          <p className="text-[11px] text-slate-500">
            Publish your Project Builder work to receive feedback and find collaborators.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects
            .filter((p) => {
              if (!search.trim()) return true;
              const q = search.toLowerCase();
              return (
                p.title.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.technologies?.some((t) => t.toLowerCase().includes(q))
              );
            })
            .map((p) => {
              const isTarget = initialProjectId && (p.id === initialProjectId || p.project_id === initialProjectId);
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-2xl border p-6 shadow-2xs flex flex-col justify-between space-y-4 transition-all ${
                    isTarget ? 'border-2 border-blue-500 ring-2 ring-blue-100' : 'border-[#E4E7EC] hover:border-blue-300'
                  }`}
                >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Community Showcase
                  </span>
                  <span className="text-[11px] text-[#667085]">{p.author_name}</span>
                </div>

                <h3 className="text-sm font-bold text-[#101828] leading-tight">{p.title}</h3>
                <p className="text-xs text-[#475467] leading-relaxed">{p.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.technologies?.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleUpvoteProject(p.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-[#2563EB] bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{p.upvotes || 0}</span>
                  </button>

                  {p.github_url && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#101828] hover:text-[#2563EB] transition-colors"
                    >
                      <Github className="h-3.5 w-3.5" />
                      <span>Repo</span>
                    </a>
                  )}
                </div>

                <span className="text-[10px] text-[#667085]">
                  {new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
              );
            })}
        </div>
      )}

      {/* Showcase Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#101828]">Showcase Engineering Project</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleShowcase} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Key-Value Store"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Description</label>
                <textarea
                  rows={3}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Explain system architecture, consensus protocol, or performance metrics..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Technologies (comma separated)
                </label>
                <input
                  type="text"
                  value={techText}
                  onChange={(e) => setTechText(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Public GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-[#475467] hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Publishing...' : 'Publish Showcase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
