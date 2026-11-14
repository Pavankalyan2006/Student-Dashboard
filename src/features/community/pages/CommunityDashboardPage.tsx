import * as React from 'react';
import {
  Users,
  MessageSquare,
  HelpCircle,
  Hammer,
  Share2,
  Plus,
  Search,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  CommunityTopic,
  CommunityQuestion,
  CommunityDiscussion,
  CommunityProjectShowcase,
  CommunityResource,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function CommunityDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [topics, setTopics] = React.useState<CommunityTopic[]>([]);
  const [questions, setQuestions] = React.useState<CommunityQuestion[]>([]);
  const [discussions, setDiscussions] = React.useState<CommunityDiscussion[]>([]);
  const [projects, setProjects] = React.useState<CommunityProjectShowcase[]>([]);
  const [resources, setResources] = React.useState<CommunityResource[]>([]);
  const [followedTopicIds, setFollowedTopicIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    try {
      setLoading(true);
      const [tData, qData, dData, pData, rData, fData] = await Promise.all([
        communityProfileApi.getTopics(),
        communityProfileApi.getQuestions(),
        communityProfileApi.getDiscussions(),
        communityProfileApi.getProjects(),
        communityProfileApi.getResources(),
        communityProfileApi.getFollowedTopics(),
      ]);
      setTopics(tData);
      setQuestions(qData);
      setDiscussions(dData);
      setProjects(pData);
      setResources(rData);
      setFollowedTopicIds(fData);
    } catch {
      toast.error('Failed to load student community hub');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (topicId: string, isFollowed: boolean) => {
    try {
      if (isFollowed) {
        await communityProfileApi.unfollowTopic(topicId);
        setFollowedTopicIds((prev) => prev.filter((id) => id !== topicId));
        toast.success('Unfollowed topic');
      } else {
        await communityProfileApi.followTopic(topicId);
        setFollowedTopicIds((prev) => [...prev, topicId]);
        toast.success('Topic followed!');
      }
    } catch {
      toast.error('Failed to update topic follow status');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-96 bg-slate-200 rounded-2xl md:col-span-2" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Community Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
              Student-Only Peer Hub
            </span>
            <span className="text-xs text-slate-500">Strictly Moderated · Privacy Enforced</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            B.Tech Peer Learning Community
          </h1>
          <p className="text-xs text-slate-500">
            Collaborate on engineering projects, ask conceptual questions, discuss academic papers, and share open technical resources.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onNavigate('/community/questions?create=true')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-2xs cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ask Question</span>
          </button>

          <button
            onClick={() => onNavigate('/community/discussions?create=true')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Start Discussion</span>
          </button>
        </div>
      </div>

      {/* Search Hub */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchQuery.trim()) {
              onNavigate(`/community/questions?search=${encodeURIComponent(searchQuery.trim())}`);
            }
          }}
          placeholder="Search questions, discussions, or projects across the community (press Enter to explore)..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Followed Topics Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Academic & Technical Topics</span>
          <span className="text-[11px] text-slate-500">Follow topics to personalize your feed</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {topics.map((t) => {
            const isFollowed = followedTopicIds.includes(t.id);
            return (
              <div
                key={t.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                  isFollowed
                    ? 'bg-blue-50/70 border-blue-200 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <button
                  onClick={() => onNavigate(`/community/topics/${t.id}`)}
                  className="hover:underline cursor-pointer"
                >
                  {t.name}
                </button>
                <button
                  onClick={() => handleToggleFollow(t.id, isFollowed)}
                  className={`text-[10px] px-1.5 py-0.2 rounded font-semibold cursor-pointer ${
                    isFollowed
                      ? 'bg-blue-200 text-blue-900 hover:bg-red-100 hover:text-red-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-800'
                  }`}
                >
                  {isFollowed ? 'Following' : '+ Follow'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Feed (Left) & Side Panels (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Questions & Discussions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Q&A Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Questions</h2>
              </div>
              <button
                onClick={() => onNavigate('/community/questions')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                View all questions →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {questions
                .filter((q) => {
                  if (!searchQuery.trim()) return true;
                  const s = searchQuery.toLowerCase();
                  return q.title.toLowerCase().includes(s) || q.description.toLowerCase().includes(s);
                })
                .slice(0, 4)
                .map((q) => (
                <div
                  key={q.id}
                  onClick={() => onNavigate(`/community/questions/${q.id}`)}
                  className="py-3.5 hover:bg-slate-50/70 transition-colors cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {q.title}
                    </h3>
                    {q.is_accepted_answer && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] text-slate-500 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">{q.author_name}</span>
                      <span>·</span>
                      <span>{q.answer_count} answers</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {q.tags?.map((tag) => (
                        <span key={tag} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Discussions Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-violet-600" />
                <h2 className="text-sm font-bold text-slate-900">Trending Technical Discussions</h2>
              </div>
              <button
                onClick={() => onNavigate('/community/discussions')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                View all discussions →
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {discussions
                .filter((d) => {
                  if (!searchQuery.trim()) return true;
                  const s = searchQuery.toLowerCase();
                  return d.title.toLowerCase().includes(s) || d.content.toLowerCase().includes(s);
                })
                .slice(0, 3)
                .map((d) => (
                <div
                  key={d.id}
                  onClick={() => onNavigate(`/community/discussions/${d.id}`)}
                  className="py-3 hover:bg-slate-50/70 transition-colors cursor-pointer group space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.2 rounded">
                      {d.category}
                    </span>
                    <span className="text-[10px] text-slate-500">{d.reply_count} replies</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {d.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-1">{d.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Project Showcase & Shared Resources */}
        <div className="space-y-6">
          {/* Project Showcase */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hammer className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900">Project Showcase</h2>
              </div>
              <button
                onClick={() => onNavigate('/community/projects')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                All →
              </button>
            </div>

            <div className="space-y-3">
              {projects.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate(`/community/projects/${p.id}`)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group"
                >
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.technologies?.map((tech) => (
                      <span key={tech} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shared Learning Resources */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Shared Resources</h2>
              </div>
              <button
                onClick={() => onNavigate('/community/resources')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                All →
              </button>
            </div>

            <div className="space-y-2.5">
              {resources.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  onClick={() => window.open(r.url, '_blank')}
                  className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50/50 cursor-pointer space-y-1 transition-colors"
                >
                  <span className="text-[10px] font-mono uppercase text-blue-600 font-semibold">
                    {r.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 truncate">{r.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
