import * as React from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Check,
  Send,
  Trash2,
  AlertTriangle,
  Bookmark,
  Share2,
  User,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { communityProfileApi } from '../../../api/communityProfileApi';
import {
  CommunityQuestion,
  CommunityAnswer,
} from '../../../../server/models/communityProfileProgressTypes';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'sonner';

export function CommunityQuestionDetailPage({
  questionId,
  onNavigate,
}: {
  questionId: string;
  onNavigate: (path: string) => void;
}) {
  const { student } = useAuth();
  const [question, setQuestion] = React.useState<CommunityQuestion | null>(null);
  const [answers, setAnswers] = React.useState<CommunityAnswer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newAnswerText, setNewAnswerText] = React.useState('');
  const [submittingAnswer, setSubmittingAnswer] = React.useState(false);
  const [reportModal, setReportModal] = React.useState<{ open: boolean; targetType: string; targetId: string }>({
    open: false,
    targetType: 'QUESTION',
    targetId: questionId,
  });
  const [reportReason, setReportReason] = React.useState('SPAM');
  const [reportDesc, setReportDesc] = React.useState('');

  const handleUpvoteQuestion = async () => {
    if (!question) return;
    try {
      await communityProfileApi.upvoteQuestion(question.id);
      setQuestion((prev) => (prev ? { ...prev, upvotes: (prev.upvotes || 0) + 1 } : prev));
      toast.success('Question upvoted!');
    } catch {
      toast.error('Failed to upvote question');
    }
  };

  const handleUpvoteAnswer = async (answerId: string) => {
    try {
      await communityProfileApi.upvoteAnswer(questionId, answerId);
      setAnswers((prev) =>
        prev.map((a) => (a.id === answerId ? { ...a, upvotes: (a.upvotes || 0) + 1 } : a))
      );
      toast.success('Answer upvoted!');
    } catch {
      toast.error('Failed to upvote answer');
    }
  };

  React.useEffect(() => {
    loadData();
  }, [questionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const qData = await communityProfileApi.getQuestion(questionId);
      setQuestion(qData);
      try {
        const aData = await communityProfileApi.getAnswers(questionId);
        setAnswers(Array.isArray(aData) ? aData : (qData as any).answers || []);
      } catch {
        setAnswers((qData as any).answers || []);
      }
    } catch {
      toast.error('Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const isQuestionOwner = student && question && student.id === question.author_id;

  const handleAcceptAnswer = async (answerId: string) => {
    if (!isQuestionOwner) {
      toast.error('Only the question author can accept an answer');
      return;
    }
    try {
      await communityProfileApi.acceptAnswer(questionId, answerId);
      setAnswers((prev) =>
        prev.map((a) => ({
          ...a,
          is_accepted: a.id === answerId,
        }))
      );
      setQuestion((prev) => (prev ? { ...prev, is_accepted_answer: true } : prev));
      toast.success('Accepted answer updated!');
    } catch {
      toast.error('Failed to accept answer');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!window.confirm('Delete your answer?')) return;
    try {
      await communityProfileApi.deleteAnswer(answerId);
      setAnswers((prev) => prev.filter((a) => a.id !== answerId));
      toast.success('Answer deleted');
    } catch {
      toast.error('Failed to delete answer');
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswerText.trim()) return;

    try {
      setSubmittingAnswer(true);
      const answer = await communityProfileApi.createAnswer(questionId, {
        content: newAnswerText.trim(),
      });
      setAnswers((prev) => [...prev, answer]);
      setNewAnswerText('');
      toast.success('Answer posted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleBookmark = async () => {
    if (!question) return;
    try {
      await communityProfileApi.addBookmark({
        resource_type: 'COMMUNITY_POST',
        resource_id: question.id,
        title: question.title,
        url: `/community/questions/${question.id}`,
        label: 'Question',
      });
      toast.success('Question bookmarked!');
    } catch {
      toast.error('Failed to bookmark question');
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await communityProfileApi.createReport({
        target_type: reportModal.targetType as any,
        target_id: reportModal.targetId,
        reason: reportReason as any,
        description: reportDesc,
      });
      setReportModal({ open: false, targetType: 'QUESTION', targetId: questionId });
      setReportDesc('');
      toast.success('Report submitted to Super Admin moderation team');
    } catch {
      toast.error('Failed to submit report');
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 w-44 bg-slate-200 rounded" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
        <div className="h-44 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/community/questions')}
        className="flex items-center gap-1.5 text-xs font-semibold text-[#475467] hover:text-[#101828] transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Questions</span>
      </button>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl border border-[#E4E7EC] p-6 sm:p-8 shadow-xs space-y-5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-xs">{question.author_name}</span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] text-[#667085]">
                {new Date(question.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUpvoteQuestion}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{question.upvotes || 0} Upvotes</span>
              </button>

              <button
                onClick={handleBookmark}
                className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                title="Bookmark question"
              >
                <Bookmark className="h-4 w-4" />
              </button>

              <button
                onClick={() => setReportModal({ open: true, targetType: 'QUESTION', targetId: question.id })}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                title="Report content"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#101828] leading-tight">
            {question.title}
          </h1>

          {/* Markdown Content */}
          <div className="prose prose-sm max-w-none text-xs text-[#344054] leading-relaxed pt-2 border-t border-slate-100">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {question.description}
            </ReactMarkdown>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 pt-3">
            {question.tags?.map((t) => (
              <span
                key={t}
                className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563EB] text-[11px] font-semibold"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-[#101828] flex items-center gap-2">
          <span>{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</span>
        </h2>

        {answers.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#667085] bg-white rounded-2xl border border-[#E4E7EC]">
            No answers posted yet. Help your peer by submitting the first answer below!
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((ans) => {
              const isAnsAuthor = student && student.id === ans.author_id;
              return (
                <div
                  key={ans.id}
                  className={`rounded-2xl p-6 transition-all border ${
                    ans.is_accepted
                      ? 'bg-white border-2 border-emerald-500 shadow-sm'
                      : 'bg-white border-[#E4E7EC] shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                        {ans.author_name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-[#101828]">{ans.author_name}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] text-[#667085]">
                        {new Date(ans.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpvoteAnswer(ans.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-[#2563EB] bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{ans.upvotes || 0}</span>
                      </button>

                      {ans.is_accepted && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Accepted Answer</span>
                        </span>
                      )}

                      {/* Question owner can mark accepted */}
                      {isQuestionOwner && !ans.is_accepted && (
                        <button
                          onClick={() => handleAcceptAnswer(ans.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer"
                        >
                          <Check className="h-3 w-3" />
                          <span>Mark Accepted</span>
                        </button>
                      )}

                      {/* Author can delete */}
                      {isAnsAuthor && (
                        <button
                          onClick={() => handleDeleteAnswer(ans.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Answer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setReportModal({ open: true, targetType: 'ANSWER', targetId: ans.id })}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Report answer"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Markdown Content */}
                  <div className="prose prose-sm max-w-none text-xs text-[#344054] leading-relaxed pt-3">
                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {ans.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Answer Composer */}
      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#475467]">
          Submit Your Answer
        </h3>

        <form onSubmit={handlePostAnswer} className="space-y-3">
          <textarea
            rows={5}
            value={newAnswerText}
            onChange={(e) => setNewAnswerText(e.target.value)}
            placeholder="Write your explanation or code solution using markdown and LaTeX..."
            required
            className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#D0D5DD] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />

          <div className="flex justify-between items-center pt-2">
            <span className="text-[11px] text-[#667085]">
              Supports GFM markdown, KaTeX math formulas ($x^2$), and syntax-highlighted code.
            </span>
            <button
              type="submit"
              disabled={submittingAnswer || !newAnswerText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{submittingAnswer ? 'Posting...' : 'Post Answer'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Moderation Report Modal */}
      {reportModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#101828]">Report Community Content</h3>
            <form onSubmit={handleSendReport} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD] bg-white"
                >
                  <option value="SPAM">Spam or Irrelevant</option>
                  <option value="HARASSMENT">Harassment or Abuse</option>
                  <option value="INAPPROPRIATE">Inappropriate Content</option>
                  <option value="MISLEADING">Misleading Information</option>
                  <option value="COPYRIGHT">Copyright Infringement</option>
                  <option value="OTHER">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#344054] mb-1">Details</label>
                <textarea
                  rows={3}
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  placeholder="Provide context for moderation review..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D0D5DD]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModal({ open: false, targetType: 'QUESTION', targetId: questionId })}
                  className="px-3 py-1.5 text-xs text-[#475467] hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
