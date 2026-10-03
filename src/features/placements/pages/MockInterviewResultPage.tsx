import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { placementsApi } from '../api/placementsApi';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Binary,
  Code2,
  FileText,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  sessionId: string;
  onNavigate: (path: string) => void;
}

export const MockInterviewResultPage: React.FC<Props> = ({ sessionId, onNavigate }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['mock-interview-session', sessionId],
    queryFn: () => placementsApi.getInterviewSession(sessionId),
  });

  const session = data?.session;
  const feedback = session?.feedback_summary;
  const answers = data?.answers || [];

  const handleExportNotes = async () => {
    if (!feedback) return;
    try {
      const content = `### Performance Summary
${feedback.summary}

### Concepts Explained Well
${(feedback.concepts_explained_well || []).map((c) => `- ${c}`).join('\n')}

### Concepts Requiring Review
${(feedback.concepts_to_review || []).map((c) => `- ${c}`).join('\n')}

### Communication & Delivery Observations
${(feedback.communication_observations || []).map((c) => `- ${c}`).join('\n')}
`;
      await placementsApi.exportNotes(`${session?.interview_type} Interview Debrief`, content, 'MOCK_INTERVIEW');
      toast.success('Successfully exported interview debrief to Notes workspace!');
    } catch {
      toast.error('Failed to export notes');
    }
  };

  if (isLoading || !session || !feedback) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-xs text-slate-500">Compiling interview diagnostic report...</p>
      </div>
    );
  }

  const coverage = feedback.concept_coverage_stat;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Interview Diagnostic Report
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {session.interview_type} Mock Interview Debrief
          </h1>
          <p className="text-xs text-slate-500">
            Role: <span className="font-semibold text-slate-700">{session.role_id.replace('role_', '').toUpperCase()}</span> • {new Date(session.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Accuracy</div>
            <div className="text-2xl font-bold text-blue-600">{session.overall_score || 80}%</div>
          </div>
          <div className="text-right pl-3 border-l border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Concept Coverage</div>
            <div className="text-2xl font-bold text-emerald-600">{coverage.percentage}%</div>
          </div>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="bg-blue-50/50 border border-blue-200/60 rounded-xl p-5 text-xs text-blue-950 space-y-2">
        <h3 className="font-bold text-blue-900 text-sm flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Executive Interview Assessment
        </h3>
        <p className="leading-relaxed text-slate-700">{feedback.summary}</p>
      </div>

      {/* Two columns: Concepts Well Explained vs Concepts to Review */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Explained well */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Concepts Handled Strongly</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(feedback.concepts_explained_well || []).map((c, i) => (
              <li key={i} className="flex items-start gap-2 bg-emerald-50/40 border border-emerald-100 p-2.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* To review */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Key Concepts to Review</h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(feedback.concepts_to_review || []).map((c, i) => (
              <li key={i} className="flex items-start gap-2 bg-amber-50/40 border border-amber-100 p-2.5 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Communication Observations */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-semibold text-slate-900 text-sm">Communication & Delivery Feedback</h3>
        <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
          {(feedback.communication_observations || []).map((obs, i) => (
            <li key={i}>{obs}</li>
          ))}
        </ul>
      </div>

      {/* Recommended Remediation Actions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Recommended Practice Actions</h3>
          <p className="text-xs text-slate-500">
            Continue learning across existing platform courses, quizzes, and labs based on your interview gaps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(feedback.recommended_practice?.quizzes || []).map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => onNavigate(`/quiz/${quiz.id}`)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-slate-50 cursor-pointer transition-all space-y-2"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded uppercase">
                Quiz
              </span>
              <h4 className="font-semibold text-slate-900 text-xs line-clamp-2">{quiz.title}</h4>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-blue-600">
                <span>Take Quiz</span> <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}

          {(feedback.recommended_practice?.dsa_problems || []).map((dsa: any) => (
            <div
              key={dsa.id}
              onClick={() => onNavigate('/dsa')}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-slate-50 cursor-pointer transition-all space-y-2"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded uppercase">
                DSA Lab
              </span>
              <h4 className="font-semibold text-slate-900 text-xs line-clamp-2">{dsa.title}</h4>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <span>Solve in Lab</span> <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}

          {(feedback.recommended_practice?.courses || []).map((crs: any) => (
            <div
              key={crs.id}
              onClick={() => onNavigate(`/courses/${crs.id}`)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 cursor-pointer transition-all space-y-2"
            >
              <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded uppercase">
                Course
              </span>
              <h4 className="font-semibold text-slate-900 text-xs line-clamp-2">{crs.title}</h4>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
                <span>Review Lesson</span> <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={() => onNavigate('/placements')}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          Back to Placement Dashboard
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportNotes}
            className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            Export Notes to Workspace
          </button>
          <button
            onClick={() => onNavigate('/placements/mock-interview/setup')}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Practice Another Interview
          </button>
        </div>
      </div>
    </div>
  );
};
