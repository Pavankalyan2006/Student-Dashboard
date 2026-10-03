import * as React from 'react';
import {
  ArrowLeft,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Users,
  Search,
  ThumbsUp,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { CommunityDiscussion } from '../../../../server/models/communityProfileProgressTypes';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';

export function CommunityDiscussionsPage({
  initialDiscussionId,
  autoOpenCreate = false,
  onNavigate,
}: {
  initialDiscussionId?: string;
  autoOpenCreate?: boolean;
  onNavigate: (path: string) => void;
}) {
  const { student } = useAuth();
  const [discussions, setDiscussions] = React.useState<CommunityDiscussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = React.useState<CommunityDiscussion | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(autoOpenCreate);

  // Create form
  const [newTitle, setNewTitle] = React.useState('');
  const [newContent, setNewContent] = React.useState('');
  const [newCategory, setNewCategory] = React.useState('AI/ML');
  const [creating, setCreating] = React.useState(false);

  // Reply state
  const [replyText, setReplyText] = React.useState('');
  const [replying, setReplying] = React.useState(false);

  const handleUpvoteDiscussion = async (e: React.MouseEvent, discId: string) => {
    e.stopPropagation();
    try {
      await communityProfileApi.upvoteDiscussion(discId);
      setDiscussions((prev) =>
        prev.map((d) => (d.id === discId ? { ...d, upvotes: ((d as any).upvotes || 0) + 1 } : d))
      );
      if (selectedDiscussion && selectedDiscussion.id === discId) {
        setSelectedDiscussion((prev) =>
          prev ? { ...prev, upvotes: ((prev as any).upvotes || 0) + 1 } : prev
        );
      }
      toast.success('Discussion upvoted!');
    } catch {
      toast.error('Failed to upvote discussion');
    }
  };

  React.useEffect(() => {
    loadDiscussions();
  }, [selectedCategory]);

  React.useEffect(() => {
    if (initialDiscussionId) {
      loadSingleDiscussion(initialDiscussionId);
    } else {
      setSelectedDiscussion(null);
    }
  }, [initialDiscussionId]);

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getDiscussions(
        selectedCategory === 'ALL' ? undefined : selectedCategory
      );
      setDiscussions(data);
    } catch {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const loadSingleDiscussion = async (id: string) => {
    try {
      const d = await communityProfileApi.getDiscussion(id);
      setSelectedDiscussion(d);
    } catch {
      toast.error('Discussion thread not found');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setCreating(true);
      const created = await communityProfileApi.createDiscussion({
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory as any,
      });
      setDiscussions((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewContent('');
      toast.success('Discussion thread started!');
    } catch {
      toast.error('Failed to create discussion');
    } finally {
      setCreating(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiscussion || !replyText.trim()) return;

    try {
      setReplying(true);
      const reply = await communityProfileApi.addDiscussionReply(selectedDiscussion.id, replyText.trim());
      setSelectedDiscussion({
        ...selectedDiscussion,
        replies: [...(selectedDiscussion.replies || []), reply],
        reply_count: (selectedDiscussion.reply_count || selectedDiscussion.replies_count || 0) + 1,
        replies_count: (selectedDiscussion.replies_count || selectedDiscussion.reply_count || 0) + 1,
      });
      setReplyText('');
      toast.success('Reply submitted');
    } catch {
      toast.error('Failed to submit reply');
    } finally {
      setReplying(false);
    }
  };

  // If a single discussion is viewed:
  if (selectedDiscussion) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => {
            setSelectedDiscussion(null);
            onNavigate('/community/discussions');
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Discussions</span>
        </button>

        <div className="bg-white rounded-3xl border border-[#E4E7EC] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
              {selectedDiscussion.category}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleUpvoteDiscussion(e, selectedDiscussion.id)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{(selectedDiscussion as any).upvotes || 0} Upvotes</span>
              </button>
              <span className="text-[11px] text-[#667085]">
                {new Date(selectedDiscussion.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#101828] leading-tight">
            {selectedDiscussion.title}
          </h1>

          <p className="text-xs font-semibold text-slate-800">
            Started by <span className="text-[#2563EB]">{selectedDiscussion.author_name}</span>
          </p>

          <p className="text-xs text-[#344054] leading-relaxed pt-2 border-t border-slate-100 whitespace-pre-line">
            {selectedDiscussion.content}
          </p>
        </div>

        {/* Replies List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#101828]">
            {selectedDiscussion.replies?.length || 0} Replies
          </h2>

          <div className="space-y-3">
            {selectedDiscussion.replies?.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-[#E4E7EC] p-4 shadow-2xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-900">{r.author_name}</span>
                  <span className="text-slate-400">
                    {new Date(r.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-xs text-[#344054] leading-relaxed whitespace-pre-line">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reply Box */}
        <div className="bg-white rounded-2xl border border-[#E4E7EC] p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-[#101828]">Join the Discussion</h3>
          <form onSubmit={handlePostReply} className="space-y-2">
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Share your perspective, research citation, or technical counterexample..."
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={replying || !replyText.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{replying ? 'Posting...' : 'Post Reply'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const filtered = discussions.filter((d) => {
    if (!search.trim()) return true;
    return (
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.content.toLowerCase().includes(search.toLowerCase())
    );
  });

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
            <h1 className="text-xl font-bold text-[#101828]">Community Technical Discussions</h1>
            <p className="text-xs text-[#667085]">
              Peer discussions on AI architectures, distributed systems, placements, and open engineering challenges.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Start Discussion</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search discussions by topic, question, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          'ALL',
          'AI/ML',
          'Programming',
          'DSA',
          'Web Development',
          'Cloud',
          'Cybersecurity',
          'Research',
          'Projects',
          'Placements',
          'General Learning',
        ].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-white border border-[#E4E7EC] text-[#475467] hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL' ? 'All Categories' : cat}
          </button>
        ))}
        </div>
      </div>

      {/* Discussions Grid */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#667085]">Loading discussions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#667085]">No discussions in this category yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <div
                key={d.id}
                onClick={() => onNavigate(`/community/discussions/${d.id}`)}
                className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {d.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleUpvoteDiscussion(e, d.id)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#2563EB] bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="h-3 w-3" />
                      <span>{(d as any).upvotes || 0}</span>
                    </button>
                    <span className="text-[11px] font-semibold text-[#475467] bg-slate-100 px-2 py-0.5 rounded">
                      {d.reply_count || d.replies_count || 0} replies
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors">
                  {d.title}
                </h3>

                <p className="text-xs text-[#475467] line-clamp-2 leading-relaxed">
                  {d.content}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#667085] pt-1">
                  <span>Author: {d.author_name}</span>
                  <span>{new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Discussion Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#101828]">Start a Discussion</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Best practices for memory-efficient attention in PyTorch"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="AI/ML">AI/ML</option>
                  <option value="Programming">Programming</option>
                  <option value="DSA">DSA</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Cloud">Cloud</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Research">Research</option>
                  <option value="Projects">Projects</option>
                  <option value="Placements">Placements</option>
                  <option value="General Learning">General Learning</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Content</label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Describe the context, technical questions, or debate topic..."
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 text-xs text-[#475467] hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
