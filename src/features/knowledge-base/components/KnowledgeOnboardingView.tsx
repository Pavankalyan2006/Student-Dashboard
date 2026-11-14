// src/features/knowledge-base/components/KnowledgeOnboardingView.tsx
// Welcoming zero-state for new students with 0 documents and 0 collections

import React from 'react';
import {
  BookOpen,
  FolderPlus,
  UploadCloud,
  Sparkles,
  HelpCircle,
  Search,
  CheckCircle,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface KnowledgeOnboardingViewProps {
  onOpenCreateCollection: () => void;
  onOpenUpload: () => void;
  onOpenAskAi: () => void;
}

export const KnowledgeOnboardingView: React.FC<KnowledgeOnboardingViewProps> = ({
  onOpenCreateCollection,
  onOpenUpload,
  onOpenAskAi,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden my-6">
      {/* Background radial effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-transparent blur-3xl pointer-events-none" />

      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Welcome to Your AI Knowledge Base</span>
      </div>

      {/* Main Heading */}
      <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
        Your Personal Academic Library, <br className="hidden sm:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
          Powered by Grounded AI & Vector RAG
        </span>
      </h2>

      <p className="text-slate-500 text-base max-w-2xl mx-auto mb-10 leading-relaxed">
        Upload your lecture notes, textbook chapters, syllabi, and research papers. Our AI parses,
        chunks, and indexes your materials so you can search instantly, ask conceptual questions with exact
        page citations, and generate exam-ready flashcard decks.
      </p>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Search className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Search inside documents</h4>
          <p className="text-xs text-slate-500">
            Find passages that use your search terms across the text of your uploaded files.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Grounded Page Citations</h4>
          <p className="text-xs text-slate-500">
            Zero hallucinations. Every AI answer cites the exact document title and page number.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900 mb-1">Flashcards & Quizzes</h4>
          <p className="text-xs text-slate-500">
            Automatically transform dense academic chapters into active recall flashcards.
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
        <button
          onClick={onOpenCreateCollection}
          className="group p-5 rounded-2xl surface-hero border border-slate-200 hover:border-indigo-200 transition shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Create First Collection</h3>
            <p className="text-xs text-slate-500">
              Set up a folder for a subject like "Operating Systems" or "Computer Networks".
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 mt-4 group-hover:translate-x-1 transition">
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={onOpenUpload}
          className="group p-5 rounded-2xl surface-hero border border-indigo-200 hover:border-indigo-400 transition shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30 group-hover:scale-110 transition">
              <UploadCloud className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Upload First PDF / Notes</h3>
            <p className="text-xs text-slate-700">
              Upload PDF, PPTX, DOCX, or Markdown notes. We'll extract and index text immediately.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 mt-4 group-hover:translate-x-1 transition">
            <span>Upload Document</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={onOpenAskAi}
          className="group p-5 rounded-2xl surface-hero border border-slate-200 hover:border-emerald-200 transition shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Ask AI a Question</h3>
            <p className="text-xs text-slate-500">
              Query concepts in engineering mathematics, data structures, or system architecture.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mt-4 group-hover:translate-x-1 transition">
            <span>Open AI Tutor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    </div>
  );
};
