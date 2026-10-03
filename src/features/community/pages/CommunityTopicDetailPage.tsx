import * as React from 'react';
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Share2,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  CommunityTopic,
  CommunityQuestion,
  CommunityDiscussion,
  CommunityResource,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function CommunityTopicDetailPage({
  topicId,
  onNavigate,
}: {
  topicId: string;
  onNavigate: (path: string) => void;
}) {
  const [topic, setTopic] = React.useState<CommunityTopic | null>(null);
  const [questions, setQuestions] = React.useState<CommunityQuestion[]>([]);
  const [discussions, setDiscussions] = React.useState<CommunityDiscussion[]>([]);
  const [resources, setResources] = React.useState<CommunityResource[]>([]);
  const [isFollowed, setIsFollowed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'questions' | 'discussions' | 'resources'>('questions');

  React.useEffect(() => {
    loadTopicData();
  }, [topicId]);

  const loadTopicData = async () => {
    try {
      setLoading(true);
      const [tData, qData, dData, rData, fData] = await Promise.all([
        communityProfileApi.getTopic(topicId),
        communityProfileApi.getQuestions({ topicId }),
        communityProfileApi.getDiscussions(),
        communityProfileApi.getResources(topicId),
        communityProfileApi.getFollowedTopics(),
      ]);
      setTopic(tData);
      setQuestions(qData);
      setDiscussions(dData.filter((d) => d.category.toLowerCase().includes(tData.slug) || tData.slug.includes(d.category.toLowerCase())));
      setResources(rData);
      setIsFollowed(fData.includes(topicId));
    } catch {
      toast.error('Failed to load topic details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    try {
      if (isFollowed) {
        await communityProfileApi.unfollowTopic(topicId);
        setIsFollowed(false);
        toast.success(`Unfollowed ${topic?.name}`);
      } else {
        await communityProfileApi.followTopic(topicId);
        setIsFollowed(true);
        toast.success(`Followed ${topic?.name}!`);
      }
    } catch {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 rounded" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!topic) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <button
        onClick={() => onNavigate('/community')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Community Hub</span>
      </button>

      <div className="bg-white rounded-3xl border border-[#E4E7EC] p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Academic Topic
            </span>
            <h1 className="text-2xl font-bold text-[#101828]">{topic.name}</h1>
            <p className="text-xs text-[#475467] leading-relaxed max-w-2xl">{topic.description}</p>
          </div>

          <button
            onClick={handleToggleFollow}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer self-start sm:self-auto ${
              isFollowed
                ? 'bg-blue-50 border border-blue-200 text-[#2563EB] hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
            }`}
          >
            {isFollowed ? 'Following Topic' : '+ Follow Topic'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E7EC] pb-2">
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'questions' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Questions ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('discussions')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'discussions' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Discussions ({discussions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            activeTab === 'resources' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#475467] hover:bg-slate-100'
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Resources ({resources.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'questions' && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs divide-y divide-slate-100">
          {questions.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#667085]">No questions under this topic yet.</p>
          ) : (
            questions.map((q) => (
              <div
                key={q.id}
                onClick={() => onNavigate(`/community/questions/${q.id}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer space-y-1"
              >
                <h4 className="text-xs font-bold text-[#101828] hover:text-[#2563EB]">{q.title}</h4>
                <p className="text-[11px] text-[#475467] line-clamp-1">{q.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs divide-y divide-slate-100">
          {discussions.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#667085]">No discussions under this topic yet.</p>
          ) : (
            discussions.map((d) => (
              <div
                key={d.id}
                onClick={() => onNavigate(`/community/discussions/${d.id}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer space-y-1"
              >
                <h4 className="text-xs font-bold text-[#101828] hover:text-[#2563EB]">{d.title}</h4>
                <p className="text-[11px] text-[#475467] line-clamp-1">{d.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs divide-y divide-slate-100">
          {resources.length === 0 ? (
            <p className="p-8 text-center text-xs text-[#667085]">No shared resources under this topic yet.</p>
          ) : (
            resources.map((r) => (
              <div
                key={r.id}
                onClick={() => window.open(r.url, '_blank')}
                className="p-4 hover:bg-slate-50 cursor-pointer space-y-1"
              >
                <span className="text-[10px] font-mono uppercase text-[#2563EB] font-semibold">{r.category}</span>
                <h4 className="text-xs font-bold text-[#101828]">{r.title}</h4>
                <p className="text-[11px] text-[#667085] line-clamp-1">{r.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
