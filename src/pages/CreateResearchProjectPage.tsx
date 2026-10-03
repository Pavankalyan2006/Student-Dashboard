import React, { useState } from 'react';
import { useNavigate, useSearchParams } from '../lib/router';
import { useCreateResearchProject } from '../features/research/hooks/useResearch';
import { ResearchType } from '../features/research/types';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  FileText,
  Layers,
  Code2,
} from 'lucide-react';
import { toast } from 'sonner';

export const CreateResearchProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const createMutation = useCreateResearchProject();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [domain, setDomain] = useState(searchParams.get('domain') || 'Artificial Intelligence');
  const [branch, setBranch] = useState('Computer Science and Engineering');
  const [researchType, setResearchType] = useState<ResearchType>('RESEARCH_PAPER');
  const [objective, setObjective] = useState('');
  const [researchQuestion, setResearchQuestion] = useState('');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !topic.trim() || !objective.trim()) {
      toast.error('Title, topic, and research objective are required');
      return;
    }

    try {
      const project = await createMutation.mutateAsync({
        title: title.trim(),
        topic: topic.trim(),
        domain: domain.trim(),
        branch: branch.trim(),
        research_type: researchType,
        objective: objective.trim(),
        research_question: researchQuestion.trim() || undefined,
      });

      navigate(`/research/${project.id}`);
    } catch (err) {
      // toast handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div>
        <button
          onClick={() => navigate('/research')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Research Dashboard
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Create Research Project</h1>
            <p className="text-xs text-slate-500">
              Initialize an academic workspace for literature review, paper extraction, and thesis development.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-6 shadow-xs">
        {/* Title & Topic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Research Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Scalable Multi-Agent Consensus in Distributed Systems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Research Topic *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Consensus & Vector Embeddings"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Domain, Branch & Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Branch / Department
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Research Type
            </label>
            <select
              value={researchType}
              onChange={(e) => setResearchType(e.target.value as ResearchType)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="RESEARCH_PAPER">Research Paper</option>
              <option value="LITERATURE_REVIEW">Literature Review</option>
              <option value="FINAL_YEAR_PROJECT">Final Year Project</option>
              <option value="SURVEY">Survey</option>
              <option value="EXPERIMENTAL_RESEARCH">Experimental Research</option>
              <option value="SYSTEMATIC_REVIEW">Systematic Review</option>
              <option value="TECHNICAL_STUDY">Technical Study</option>
              <option value="COMPARATIVE_STUDY">Comparative Study</option>
              <option value="PROTOTYPE_RESEARCH">Prototype Research</option>
            </select>
          </div>
        </div>

        {/* Objective */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Research Objective *
          </label>
          <textarea
            required
            rows={3}
            placeholder="Clearly state what problem this investigation addresses, proposed evaluation bounds, and expected contributions..."
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Optional Research Question */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Initial Research Question (Optional)</span>
            <span className="text-[10px] text-slate-400 font-normal">Can be refined later</span>
          </label>
          <input
            type="text"
            placeholder="e.g. How does vector quantization affect query latency in multi-tenant environments?"
            value={researchQuestion}
            onChange={(e) => setResearchQuestion(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Keywords */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Keywords (Comma-separated)
          </label>
          <input
            type="text"
            placeholder="distributed algorithms, indexing, concurrency, transformer models"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/research')}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            {createMutation.isPending ? (
              'Creating Project...'
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Initialize Research Workspace
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
