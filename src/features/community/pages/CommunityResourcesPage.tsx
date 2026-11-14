import * as React from 'react';
import {
  ArrowLeft,
  Share2,
  ExternalLink,
  Plus,
  Search,
  BookOpen,
  FileText,
  Github,
  GraduationCap,
  ThumbsUp,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { CommunityResource } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function CommunityResourcesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [resources, setResources] = React.useState<CommunityResource[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);

  // Form
  const [title, setTitle] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [category, setCategory] = React.useState('DOCUMENTATION');
  const [desc, setDesc] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');

  const handleUpvoteResource = async (resId: string) => {
    try {
      await communityProfileApi.upvoteResource(resId);
      setResources((prev) =>
        prev.map((r) => (r.id === resId ? { ...r, upvotes: (r.upvotes || 0) + 1 } : r))
      );
      toast.success('Resource upvoted!');
    } catch {
      toast.error('Failed to upvote resource');
    }
  };

  React.useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getResources();
      setResources(data);
    } catch {
      toast.error('Failed to load shared resources');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    try {
      new URL(url);
    } catch {
      toast.error('Please enter a valid URL (including https://)');
      return;
    }

    try {
      setSubmitting(true);
      const created = await communityProfileApi.createResource({
        title: title.trim(),
        url: url.trim(),
        category: category as any,
        description: desc.trim(),
      });
      setResources((prev) => [created, ...prev]);
      setShowModal(false);
      setTitle('');
      setUrl('');
      setDesc('');
      toast.success('Resource shared with the community!');
    } catch {
      toast.error('Failed to share resource');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = resources.filter((r) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      r.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      r.resource_type?.toLowerCase() === selectedCategory.toLowerCase();
    if (!matchesCat) return false;
    if (!search.trim()) return true;
    return (
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/community')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Shared Learning Resources</h1>
            <p className="text-xs text-slate-500">
              Curated documentation, open repositories, and verified technical tutorials recommended by students.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Share Resource</span>
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources by title or description..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Resources' },
            { id: 'DOCUMENTATION', label: 'Documentation' },
            { id: 'ARTICLE', label: 'Articles & Blogs' },
            { id: 'GITHUB_REPO', label: 'GitHub Repos' },
            { id: 'RESEARCH_PAPER', label: 'Research Papers' },
            { id: 'TUTORIAL', label: 'Interactive Tutorials' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          No shared resources match your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-all"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {r.category}
                </span>
                <h3 className="text-xs font-bold text-slate-900 leading-snug">{r.title}</h3>
                {r.description && (
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpvoteResource(r.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>{r.upvotes || 0}</span>
                  </button>
                  <span className="text-slate-500 truncate max-w-[120px]">by {r.author_name}</span>
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-semibold text-blue-600 hover:underline shrink-0"
                >
                  <span>Open</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Share a Learning Resource</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. OSDev Wiki & Architecture Guide"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resource URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://wiki.osdev.org"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="DOCUMENTATION">Documentation</option>
                  <option value="ARTICLE">Article / Blog</option>
                  <option value="GITHUB_REPO">GitHub Repository</option>
                  <option value="RESEARCH_PAPER">Research Paper</option>
                  <option value="TUTORIAL">Interactive Tutorial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief note on why this resource was helpful..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Sharing...' : 'Share Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
