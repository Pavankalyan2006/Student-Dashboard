// src/features/gate/components/GateRevisionView.tsx
import React from 'react';
import { GateDashboardData, GateQuestion, GateBookmark } from '../types/gateTypes';
import {
  AlertTriangle,
  Bookmark,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GateRevisionViewProps {
  weakTopics: GateDashboardData['weak_topics'];
  bookmarks: (GateBookmark & { question: GateQuestion | null })[];
  onOpenQuestionModal: (question: GateQuestion) => void;
  onNavigateTab: (tab: string) => void;
  onPracticeTopic?: (topicId: string) => void;
}

export const GateRevisionView: React.FC<GateRevisionViewProps> = ({
  weakTopics,
  bookmarks,
  onOpenQuestionModal,
  onNavigateTab,
  onPracticeTopic,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Weak Topics & Revision Command Center
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
          Actionable remedial diagnostics generated from your actual practice question mistakes,
          unverified guesses, and topics flagged for revision.
        </p>
      </div>

      {/* Weak Topics Section */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Concepts Requiring Priority Remediation ({weakTopics.length})
          </h3>
          <span className="text-xs text-slate-500">Ranked by error frequency</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {weakTopics.map((wt) => (
            <div
              key={wt.topic_id}
              className="p-4 bg-white border border-slate-200 hover:border-amber-200 rounded-xl space-y-2 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{wt.topic_name}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  {wt.accuracy === null || wt.accuracy === undefined ? 'Flagged by you' : `${wt.accuracy}% Accuracy`}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">{wt.recommendation}</p>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">{wt.subject}</span>
                <Button
                  size="sm"
                  onClick={() => onPracticeTopic ? onPracticeTopic(wt.topic_id) : onNavigateTab('questions')}
                  className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2.5"
                >
                  Practice Questions &rarr;
                </Button>
              </div>
            </div>
          ))}

          {weakTopics.length === 0 && (
            <div className="col-span-2 p-6 text-center text-xs text-slate-500">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              No critical weak areas identified! Maintain your streak by solving new PYQs.
            </div>
          )}
        </div>
      </div>

      {/* Bookmarked Questions */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-amber-600" />
            Saved & Bookmarked Questions ({bookmarks.length})
          </h3>
          <span className="text-xs text-slate-500">Quick-solve anytime</span>
        </div>

        <div className="space-y-3">
          {bookmarks.map((bm) => {
            if (!bm.question) return null;
            const q = bm.question;

            return (
              <div
                key={bm.id}
                className="p-4 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                      {q.subject}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-sm bg-slate-50 font-mono text-[10px]">
                      {q.question_type}
                    </span>
                    <span className="text-emerald-600 font-bold text-[10px]">+{q.marks} Marks</span>
                  </div>
                  <p className="text-slate-800 line-clamp-2 leading-relaxed">{q.question_statement}</p>
                  {bm.notes && <p className="text-[11px] text-amber-800 font-mono">Note: {bm.notes}</p>}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Button
                    size="sm"
                    onClick={() => onOpenQuestionModal(q)}
                    className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 font-semibold flex items-center gap-1.5"
                  >
                    <span>Solve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {bookmarks.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6">
              You haven't bookmarked any questions yet. Bookmark difficult PYQs while practicing to review them here!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
