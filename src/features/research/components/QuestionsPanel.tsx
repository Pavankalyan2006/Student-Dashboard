import React, { useState } from 'react';
import { useResearchQuestions } from '../hooks/useResearch';
import { researchApi } from '../api/researchApi';
import { ResearchQuestion, QuestionCategory } from '../types';
import { useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Plus, Trash2, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface QuestionsPanelProps {
  projectId: string;
}

export const QuestionsPanel: React.FC<QuestionsPanelProps> = ({ projectId }) => {
  const qc = useQueryClient();
  const { data: questions = [], isLoading } = useResearchQuestions(projectId);

  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCategory, setNewCategory] = useState<QuestionCategory>('PRIMARY');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    try {
      await researchApi.addQuestion(projectId, {
        question: newQuestionText.trim(),
        category: newCategory,
      });
      setNewQuestionText('');
      setIsAdding(false);
      qc.invalidateQueries({ queryKey: ['research-questions', projectId] });
      toast.success('Research question added');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add question');
    }
  };

  const handleDelete = async (questionId: string) => {
    try {
      await researchApi.deleteQuestion(projectId, questionId);
      qc.invalidateQueries({ queryKey: ['research-questions', projectId] });
      toast.success('Question removed');
    } catch (err: any) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Questions</h2>
          <p className="text-xs text-slate-500">
            Formulate primary, secondary, and exploratory questions to steer your thesis.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Research Question
        </button>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleAddQuestion} className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">New Research Question</h4>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value="PRIMARY">PRIMARY</option>
              <option value="SECONDARY">SECONDARY</option>
              <option value="EXPLORATORY">EXPLORATORY</option>
              <option value="COMPARATIVE">COMPARATIVE</option>
              <option value="EXPERIMENTAL">EXPERIMENTAL</option>
              <option value="SURVEY">SURVEY</option>
            </select>
          </div>

          <textarea
            required
            rows={2}
            placeholder="Formulate your inquiry with clear scope (e.g. To what extent does sparse attention improve throughput in low-latency systems?)..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"
            >
              Save Question
            </button>
          </div>
        </form>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          Loading questions...
        </div>
      ) : questions.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-base font-bold text-slate-900">No Research Questions Defined</h4>
          <p className="text-xs text-slate-500">Define your core inquiries to focus literature reviews and experimentation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 transition-all flex items-start justify-between gap-4 shadow-2xs"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                    {q.category}
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {q.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>
                {q.evidence && q.evidence.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {q.evidence.map((ev, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                        {ev}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(q.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
