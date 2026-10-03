import * as React from 'react';
import {
  ArrowLeft,
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  Bookmark,
  AlertTriangle,
  Sparkles,
  Tag,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  CommunityQuestion,
  CommunityTopic,
} from '../../../../server/models/communityProfileProgressTypes';
import { toast } from 'sonner';

export function CommunityQuestionsPage({
  initialTopicId,
  initialSearch = '',
  autoOpenCreate = false,
  onNavigate,
}: {
  initialTopicId?: string;
  initialSearch?: string;
  autoOpenCreate?: boolean;
  onNavigate: (path: string) => void;
}) {
  const [questions, setQuestions] = React.useState<CommunityQuestion[]>([]);
  const [topics, setTopics] = React.useState<CommunityTopic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState(initialSearch);
  const [selectedTopic, setSelectedTopic] = React.useState(initialTopicId || 'ALL');
  const [showCreateModal, setShowCreateModal] = React.useState(autoOpenCreate);

  React.useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // New question form state
  const [newTitle, setNewTitle] = React.useState('');
  const [newDescription, setNewDescription] = React.useState('');
  const [newTopicId, setNewTopicId] = React.useState('top_dsa');
  const [newTagsText, setNewTagsText] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // AI Assistance state
  const [aiLoading, setAiLoading] = React.useState(false);
  const [aiFeedback, setAiFeedback] = React.useState<{
    clarity_feedback: string;
    suggested_tags: string[];
    suggested_resources: string[];
    summary: string;
  } | null>(null);

  React.useEffect(() => {
    loadQuestions();
  }, [selectedTopic]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const [qData, tData] = await Promise.all([
        communityProfileApi.getQuestions({
          topicId: selectedTopic === 'ALL' ? undefined : selectedTopic,
        }),
        communityProfileApi.getTopics(),
      ]);
      setQuestions(qData);
      setTopics(tData);
    } catch {
      toast.error('Failed to load community questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGetAiAssistance = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error('Enter a title and description before requesting AI feedback');
      return;
    }

    try {
      setAiLoading(true);
      const res = await communityProfileApi.getAiAssistance({
        title: newTitle,
        description: newDescription,
        topic_id: newTopicId,
      });
      setAiFeedback(res);
      toast.success('AI feedback generated. Review before posting.');
    } catch {
      toast.error('AI assistant temporarily unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiTags = (tag: string) => {
    const existing = newTagsText ? newTagsText.split(',').map((t) => t.trim()) : [];
    if (!existing.includes(tag)) {
      setNewTagsText([...existing, tag].join(', '));
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) {
      toast.error('Title and description are required');
      return;
    }

    try {
      setSubmitting(true);
      const tags = newTagsText.split(',').map((t) => t.trim()).filter(Boolean);
      const created = await communityProfileApi.createQuestion({
        title: newTitle.trim(),
        description: newDescription.trim(),
        topic_id: newTopicId,
        tags,
      });
      setQuestions((prev) => [created, ...prev]);
      setShowCreateModal(false);
      setNewTitle('');
      setNewDescription('');
      setNewTagsText('');
      setAiFeedback(null);
      toast.success('Question submitted to the community!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit question');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = questions.filter((q) => {
    if (!search.trim()) return true;
    return (
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
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
            <h1 className="text-xl font-bold text-[#101828]">Student Questions & Answers</h1>
            <p className="text-xs text-[#667085]">
              Get peer answers on engineering problems, debugging roadblocks, and conceptual proofs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Ask a Question</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by topic, algorithm, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <option value="ALL">All Academic Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#667085] animate-pulse">
            Loading questions...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#667085] space-y-2">
            <HelpCircle className="h-8 w-8 mx-auto text-slate-300" />
            <p className="font-semibold text-slate-700">No questions found</p>
            <p className="text-[11px] text-slate-500">
              Be the first to post a question on this topic!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((q) => (
              <div
                key={q.id}
                onClick={() => onNavigate(`/community/questions/${q.id}`)}
                className="p-5 hover:bg-slate-50/70 transition-colors cursor-pointer group space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-sm font-bold text-[#101828] group-hover:text-[#2563EB] transition-colors leading-snug">
                    {q.title}
                  </h3>

                  <div className="flex items-center gap-2 shrink-0">
                    {q.is_accepted_answer && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Accepted Answer</span>
                      </span>
                    )}
                    <span className="text-[11px] font-semibold text-[#475467] bg-slate-100 px-2 py-0.5 rounded">
                      {q.answer_count} {q.answer_count === 1 ? 'answer' : 'answers'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#475467] line-clamp-2 leading-relaxed">
                  {q.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-[#667085]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{q.author_name}</span>
                    <span>·</span>
                    <span>
                      {new Date(q.created_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {q.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.2 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ask Question Modal with AI Advisory Assistance */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E4E7EC] p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#101828]">Ask a Community Question</h2>
                <p className="text-xs text-[#667085]">
                  Use markdown, code blocks, or math formulas. Review before posting.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Question Title (clear and specific)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Why does AVL Tree rotation maintain O(log N) balance after deletion?"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">Topic</label>
                  <select
                    value={newTopicId}
                    onChange={(e) => setNewTopicId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D0D5DD] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#344054] mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newTagsText}
                    onChange={(e) => setNewTagsText(e.target.value)}
                    placeholder="e.g. avl, tree, dsa"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">
                  Question Description (Supports Markdown, formulas, code)
                </label>
                <textarea
                  rows={6}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Provide all context, code snippets, or error traces. Describe what you have attempted..."
                  required
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              {/* Optional AI Question Assistance Advisory */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#101828]">
                    <Sparkles className="h-4 w-4 text-[#4F46E5]" />
                    <span>AI Question Advisory Assistance</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetAiAssistance}
                    disabled={aiLoading}
                    className="text-[11px] font-semibold text-[#4F46E5] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? 'Analyzing...' : 'Run Clarity & Tag Suggestions'}
                  </button>
                </div>

                {aiFeedback && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                    <p className="text-[#344054]">
                      <span className="font-semibold text-slate-900">Feedback: </span>
                      {aiFeedback.clarity_feedback}
                    </p>

                    {aiFeedback.suggested_tags?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-[#667085]">Click to add tags:</span>
                        {aiFeedback.suggested_tags.map((tg) => (
                          <button
                            key={tg}
                            type="button"
                            onClick={() => handleApplyAiTags(tg)}
                            className="px-2 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[10px] font-semibold hover:bg-blue-200 cursor-pointer"
                          >
                            +{tg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#475467] hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Post Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
