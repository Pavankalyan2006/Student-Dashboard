import * as React from 'react';
import {
  ArrowLeft,
  Bookmark,
  Search,
  ExternalLink,
  Trash2,
  Tag,
  BookOpen,
  FileText,
  Files,
  GraduationCap,
  Code2,
  Hammer,
  Users,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import { UnifiedBookmark } from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function ProfileBookmarksPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [bookmarks, setBookmarks] = React.useState<UnifiedBookmark[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('ALL');

  React.useEffect(() => {
    loadBookmarks();
  }, [selectedCategory]);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const data = await communityProfileApi.getBookmarks(selectedCategory);
      setBookmarks(data);
    } catch {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await communityProfileApi.deleteBookmark(id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      toast.success('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const filtered = bookmarks.filter((b) => {
    if (!search.trim()) return true;
    return (
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.label && b.label.toLowerCase().includes(search.toLowerCase())) ||
      (b.notes && b.notes.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'COURSE': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'NOTE': return <FileText className="h-4 w-4 text-emerald-600" />;
      case 'DOCUMENT': return <Files className="h-4 w-4 text-amber-600" />;
      case 'RESEARCH_PAPER': return <GraduationCap className="h-4 w-4 text-purple-600" />;
      case 'CODING_PROBLEM':
      case 'DSA_PROBLEM': return <Code2 className="h-4 w-4 text-cyan-600" />;
      case 'PROJECT': return <Hammer className="h-4 w-4 text-indigo-600" />;
      case 'COMMUNITY_POST': return <Users className="h-4 w-4 text-rose-600" />;
      default: return <Bookmark className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/profile')}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Saved Bookmarks</h1>
            <p className="text-xs text-slate-500">
              Unified student bookmarks across courses, research papers, coding exercises, and community posts.
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          {bookmarks.length} Bookmarks Saved
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks by title, personal note, or tag..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'COURSES', 'NOTES', 'DOCUMENTS', 'RESEARCH', 'CODING', 'PROJECTS', 'COMMUNITY'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Bookmarks' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bookmarks Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
          <Bookmark className="h-8 w-8 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700">No bookmarks found</p>
          <p className="text-[11px] text-slate-500">
            Bookmark items while studying courses, reading documents, or browsing community questions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100">
                      {getResourceIcon(item.resource_type || item.entity_type || item.category || 'ITEM')}
                    </div>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {(item.resource_type || item.entity_type || item.category || 'ITEM').replace(/_/g, ' ')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Remove bookmark"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="text-xs font-bold text-slate-900 leading-snug">{item.title}</h3>

                {item.notes && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {item.label ? (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    <Tag className="h-2.5 w-2.5" />
                    <span>{item.label}</span>
                  </span>
                ) : (
                  <span />
                )}

                <button
                  onClick={() => onNavigate(item.url)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  <span>Open Resource</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
