// src/features/mock-interviews/components/MockInterviewReportView.tsx
// Comprehensive Diagnostic Post-Interview Debrief Report View

import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Code2,
  Database,
  Layers,
  Sparkles,
  FileText,
  Bookmark,
  Share2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { MockInterviewReport } from '../types/mockInterviewTypes';
import { mockInterviewApi } from '../api/mockInterviewApi';
import { toast } from 'sonner';
import { copyText } from '../../../lib/clipboard';

interface Props {
  sessionId: string;
  onNavigate: (path: string) => void;
  onRetake: () => void;
}

export const MockInterviewReportView: React.FC<Props> = ({ sessionId, onNavigate, onRetake }) => {
  const [report, setReport] = useState<MockInterviewReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedQIndex, setExpandedQIndex] = useState<number | null>(0);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        const data = await mockInterviewApi.getReport(sessionId);
        setReport(data);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load interview report');
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  const handleExportNotes = async () => {
    if (!report) return;
    setIsExporting(true);
    try {
      const content = `### ${report.category} Mock Interview Debrief
**Target Role:** ${report.target_role}
**Overall Score:** ${report.overall_score}%
**Duration:** ${report.duration_minutes} minutes

#### Summary
${report.summary}

#### Strongest Demonstrated Areas
${report.strongest_areas.map((s) => `- ${s}`).join('\n')}

#### Key Concepts to Review
${report.improvement_areas.map((i) => `- ${i}`).join('\n')}

#### Communication & Delivery
${report.communication_observations.map((c) => `- ${c}`).join('\n')}
`;
      // Call notes export or clipboard
      await copyText(content);
      toast.success('Interview debrief copied to clipboard for your Notes workspace!');
    } catch {
      toast.error('Failed to export notes');
    } finally {
      setIsExporting(false);
    }
  };

  const handleBookmarkQuestion = async (q: any) => {
    try {
      await mockInterviewApi.saveQuestion({
        question_id: q.question_id,
        category: report?.category,
        topic: 'Interview Question',
        question: q.question_text,
        expected_concepts: q.missing_concepts,
        reference_answer: q.model_answer,
      });
      toast.success('Question added to your Saved Questions bank!');
    } catch {
      toast.error('Failed to bookmark question');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Generating Diagnostic Scorecard</h3>
        <p className="text-xs text-slate-500 mt-1">Evaluating multi-dimensional rubrics and compiling cross-module recommendations...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-600 text-sm">Report not available for this session.</p>
        <button
          onClick={() => onNavigate('/mock-interviews')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 lg:p-10">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/mock-interviews')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Mock Interviews Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportNotes}
            disabled={isExporting}
            className="px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Debrief to Notes</span>
          </button>

          <button
            onClick={onRetake}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Interview</span>
          </button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="hero-brand text-white rounded-3xl p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
                {report.category}
              </span>
              <span className="text-xs text-blue-200">
                {report.target_role}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Interview Diagnostic Report
            </h1>
            <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Overall Score Circle */}
          <div className="flex-shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shadow-inner">
            <div className="text-center">
              <span className="text-4xl font-extrabold text-white">{report.overall_score}%</span>
              <span className="text-[11px] text-blue-200 block font-medium mt-0.5">
                {(report as any).scoring_method === 'KEYWORD_MATCH' ? 'Practice score (keyword check)' : 'Overall Practice Score'}
              </span>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <div className="text-xs space-y-1 text-blue-100">
              <div><strong>{report.questions_answered}</strong> answered</div>
              <div><strong>{report.questions_skipped}</strong> skipped</div>
              <div><strong>{report.duration_minutes}m</strong> elapsed</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="relative z-10 text-[11px] text-blue-300/80 mt-4 border-t border-white/10 pt-3">
          <strong>Scoring Definition:</strong> {report.scoring_definition}
        </p>
      </div>

      {/* Rubric Dimension Breakdown */}
      {report.rubric_breakdown && report.rubric_breakdown.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            Multi-Dimensional Rubric Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.rubric_breakdown.map((r, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{r.dimension}</span>
                  <span className="font-mono font-bold text-blue-700">{r.score}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      r.score >= 80 ? 'bg-emerald-500' : r.score >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">{r.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Improvement Areas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Areas */}
        <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Demonstrated Strengths
          </h3>
          <ul className="space-y-2 text-xs text-emerald-800">
            {report.strongest_areas.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Concepts Requiring Review
          </h3>
          <ul className="space-y-2 text-xs text-amber-800">
            {report.improvement_areas.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Per-Question Detailed Feedback Accordions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          Per-Question Debrief & Model Answers ({report.per_question_feedback?.length || 0})
        </h3>

        <div className="space-y-3">
          {report.per_question_feedback?.map((q, idx) => {
            const isExpanded = expandedQIndex === idx;
            return (
              <div
                key={q.question_id || idx}
                className="border border-slate-200 rounded-xl overflow-hidden transition"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => setExpandedQIndex(isExpanded ? null : idx)}
                  className="w-full p-4 bg-slate-50 hover:bg-slate-100/70 text-left flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {q.question_number}
                    </span>
                    <span className="font-bold text-xs text-slate-900 line-clamp-1">
                      {q.question_text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded ${
                        q.score >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : q.score >= 60
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {q.score}%
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-200 space-y-4 bg-white text-xs">
                    {/* Candidate Answer */}
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Your Submitted Response:</span>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap font-sans">
                        {q.student_answer}
                      </div>
                    </div>

                    {/* Strengths & Missing Concepts */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <span className="font-bold text-emerald-900 block mb-1">What You Explained Well:</span>
                        <ul className="space-y-1 text-emerald-800">
                          {q.strengths.map((s, si) => (
                            <li key={si}>• {s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <span className="font-bold text-amber-900 block mb-1">Missing / Incomplete Concepts:</span>
                        <ul className="space-y-1 text-amber-800">
                          {q.missing_concepts.map((m, mi) => (
                            <li key={mi}>• {m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Model Answer */}
                    {q.model_answer && (
                      <div>
                        <span className="font-bold text-blue-900 block mb-1">Model Answer & Solution Guide:</span>
                        <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl text-blue-950 whitespace-pre-wrap leading-relaxed">
                          {q.model_answer}
                        </div>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleBookmarkQuestion(q)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                        <span>Bookmark for Revision</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Learning Modules (Connected directly to existing platform features) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Recommended Improvement Plan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Target your specific weak areas across the existing learning labs and curriculum workspaces.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {report.recommended_learning_modules?.map((rec) => (
            <div
              key={rec.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between space-y-3 hover:border-blue-400 transition"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  {rec.module_name}
                </span>
                <h4 className="font-bold text-xs text-slate-900 mt-2">{rec.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-normal">{rec.description}</p>
              </div>

              <button
                onClick={() => onNavigate(rec.route_path)}
                className="w-full py-2 bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-800 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{rec.action_label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
