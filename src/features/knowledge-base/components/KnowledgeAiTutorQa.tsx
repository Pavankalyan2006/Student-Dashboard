// src/features/knowledge-base/components/KnowledgeAiTutorQa.tsx
// Grounded AI Question Answering workspace with page citations, key concepts, and follow-ups

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  Send,
  CornerDownRight,
  CheckCircle,
  ExternalLink,
  Clock,
  Layers,
  ChevronRight,
  Lightbulb,
} from 'lucide-react';
import {
  KnowledgeCollection,
  AskKnowledgeQuestionResponse,
  KnowledgeQuestionRecord,
} from '../types/knowledgeBaseTypes';
import { DocumentCardData } from '../../../types';
import { knowledgeBaseApi } from '../api/knowledgeBaseApi';

interface KnowledgeAiTutorQaProps {
  collections: KnowledgeCollection[];
  documents: DocumentCardData[];
  initialQuestion?: string;
  initialDocumentId?: string;
  onOpenDocumentPage?: (docId: string, pageNumber: number) => void;
}

export const KnowledgeAiTutorQa: React.FC<KnowledgeAiTutorQaProps> = ({
  collections,
  documents,
  initialQuestion = '',
  initialDocumentId,
  onOpenDocumentPage,
}) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocumentId || '');
  const [selectedColId, setSelectedColId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AskKnowledgeQuestionResponse | null>(null);
  const [history, setHistory] = useState<KnowledgeQuestionRecord[]>([]);

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
    }
    if (initialDocumentId) {
      setSelectedDocId(initialDocumentId);
    }
  }, [initialQuestion, initialDocumentId]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const past = await knowledgeBaseApi.getQuestionHistory(10);
      setHistory(past);
    } catch (err) {
      console.error('Failed loading question history:', err);
    }
  };

  const handleAsk = async (e?: React.FormEvent, overrideQ?: string) => {
    if (e) e.preventDefault();
    const promptText = overrideQ || question;
    if (!promptText.trim()) return;

    setLoading(true);
    try {
      const res = await knowledgeBaseApi.askQuestion({
        question: promptText.trim(),
        document_id: selectedDocId || undefined,
        collection_id: selectedColId || undefined,
      });
      setCurrentResponse(res);
      setQuestion('');
      loadHistory();
    } catch (err) {
      console.error('QA failure:', err);
    } finally {
      setLoading(false);
    }
  };

  const PROMPT_SUGGESTIONS = [
    'Explain the core mechanism with an architectural breakdown',
    'What are the standard time and space complexities involved?',
    'What are the most frequent semester exam questions on this topic?',
    'Summarize the key mathematical formulas and their variable definitions',
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
      {/* Main QA Interface (Left 2 cols) */}
      <div className="lg:col-span-2 space-y-5">
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-white">Grounded AI Academic Tutor</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Ask any academic question. Answers are synthesized directly from your uploaded materials with exact page citations.
          </p>

          {/* Scope Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Scope to Collection:
              </label>
              <select
                value={selectedColId}
                onChange={(e) => {
                  setSelectedColId(e.target.value);
                  setSelectedDocId('');
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Collections</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Scope to Specific Document:
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Documents in Scope</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title || d.original_filename}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleAsk} className="space-y-3">
            <div className="relative">
              <textarea
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about theorems, algorithms, proof steps, architectural designs..."
                className="w-full p-3.5 pr-12 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition resize-none shadow-inner"
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition shadow-md shadow-emerald-600/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Prompt Ideas */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-400" /> Prompts:
              </span>
              {PROMPT_SUGGESTIONS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setQuestion(p)}
                  className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-lg">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-white">Retrieving grounded context & citations...</p>
            <p className="text-xs text-slate-400 mt-1">
              Searching vector store chunks and synthesizing response
            </p>
          </div>
        )}

        {/* Current Response View */}
        {currentResponse && !loading && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5 animate-fade-in">
            {/* Question Asked */}
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                Your Question
              </span>
              <h3 className="text-base font-bold text-white">{currentResponse.question}</h3>
            </div>

            {/* Answer Body */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Tutor Answer
              </span>
              <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 font-sans">
                {currentResponse.answer}
              </div>
            </div>

            {/* Grounded Citations */}
            {currentResponse.citations && currentResponse.citations.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Grounded Source Citations
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentResponse.citations.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/70 space-y-1.5 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate max-w-[180px]">
                          {c.document_title}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-700 text-indigo-300 text-[10px] font-medium">
                          Page {c.page_number}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        "{c.snippet}"
                      </p>
                      {c.document_id && onOpenDocumentPage && (
                        <div className="pt-1 border-t border-slate-700/50 flex justify-end">
                          <button
                            type="button"
                            onClick={() => onOpenDocumentPage(c.document_id, c.page_number)}
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open Page {c.page_number}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Concepts */}
            {currentResponse.key_concepts && currentResponse.key_concepts.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Core Concepts Covered
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentResponse.key_concepts.map((kc, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium"
                    >
                      {kc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Prompts */}
            {currentResponse.follow_up_questions && currentResponse.follow_up_questions.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Recommended Follow-up Questions
                </span>
                <div className="flex flex-col gap-1.5">
                  {currentResponse.follow_up_questions.map((fq, i) => (
                    <button
                      key={i}
                      onClick={() => handleAsk(undefined, fq)}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left text-xs text-slate-300 hover:text-white transition group"
                    >
                      <span className="flex items-center gap-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{fq}</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Sidebar (Right 1 col) */}
      <div className="space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Recent AI Consultations</span>
            </h3>
            <span className="text-xs text-slate-500">{history.length}</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              No previous questions asked yet. Ask your first academic question to start building your study log!
            </p>
          ) : (
            <div className="space-y-2.5">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentResponse(item as any)}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition cursor-pointer space-y-1.5"
                >
                  <p className="text-xs font-semibold text-white line-clamp-2">
                    {item.question}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>
                      {item.citations ? `${item.citations.length} citations` : 'Direct synthesis'}
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
