// src/features/languages/components/LanguageExploreView.tsx
// Searchable & Filterable Catalog of up to 150 Languages with honest capability matrices

import * as React from 'react';
import {
  Search,
  Filter,
  Globe,
  Sparkles,
  BookOpen,
  Volume2,
  Mic,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Info,
  ChevronDown,
} from 'lucide-react';
import { LanguageEntry } from '../types/languageTypes';

interface LanguageExploreViewProps {
  languages: LanguageEntry[];
  totalCount: number;
  regions: string[];
  scripts: string[];
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
  selectedScript: string;
  onSelectScript: (s: string) => void;
  selectedCapability: string;
  onSelectCapability: (c: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onStartLearning: (lang: LanguageEntry) => void;
  onOpenDetails: (lang: LanguageEntry) => void;
  onGoToDashboard: (langCode: string) => void;
}

export function LanguageExploreView({
  languages,
  totalCount,
  regions,
  scripts,
  selectedRegion,
  onSelectRegion,
  selectedScript,
  onSelectScript,
  selectedCapability,
  onSelectCapability,
  searchQuery,
  onSearchChange,
  onStartLearning,
  onOpenDetails,
  onGoToDashboard,
}: LanguageExploreViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl surface-hero border border-indigo-200 p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-medium mb-3">
            <Globe className="w-3.5 h-3.5" /> 150 Supported World & Regional Languages
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore & Master Global Languages
          </h2>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
            From Spanish, German, Japanese, and Korean to Hindi, Telugu, Tamil, Arabic, and 140+ world languages.
            Select any language to build real vocabulary, grammar, and conversational fluency.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        {/* Search Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by English name, native script, language code (e.g. Spanish, తెలుగు, ja, Devanagari)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Script Filter Dropdown */}
          <div className="sm:w-52">
            <select
              value={selectedScript}
              onChange={(e) => onSelectScript(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Writing Scripts</option>
              {scripts.filter((s) => s !== 'ALL').map((s) => (
                <option key={s} value={s}>
                  {s} Script
                </option>
              ))}
            </select>
          </div>

          {/* Capability Filter Dropdown */}
          <div className="sm:w-56">
            <select
              value={selectedCapability}
              onChange={(e) => onSelectCapability(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Learning Capabilities</option>
              <option value="text_lessons">Interactive Lessons</option>
              <option value="tts_audio">Text-to-Speech Audio</option>
              <option value="speech_recognition">Speech Recognition</option>
              <option value="ai_conversation">AI Conversation Partner</option>
              <option value="writing_feedback">AI Writing Feedback</option>
            </select>
          </div>
        </div>

        {/* Region Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => onSelectRegion(reg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedRegion === reg
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-50 text-slate-500 hover:text-slate-900 hover:bg-slate-750'
              }`}
            >
              {reg === 'ALL' ? '🌍 All Regions' : reg}
            </button>
          ))}
          <span className="text-xs text-slate-500 ml-auto shrink-0 pl-2">
            Showing <strong className="text-slate-700">{languages.length}</strong> of {totalCount}
          </span>
        </div>
      </div>

      {/* Language Cards Grid */}
      {languages.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Globe className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">No languages matched your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms, changing the region tab, or clearing writing script filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {languages.map((lang) => {
            const isEnrolled = !!lang.is_enrolled;

            return (
              <div
                key={lang.code}
                className="group bg-white border border-slate-200 hover:border-slate-200 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-indigo-950/20"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl filter drop-shadow">{lang.flag_emoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {lang.name}
                          </h3>
                          {lang.direction === 'rtl' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200 font-mono">
                              RTL
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-indigo-700 font-medium">{lang.native_name}</span>
                          <span>•</span>
                          <span className="text-slate-500 font-mono">{lang.code.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenDetails(lang)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="View language details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Sample Phrase Box */}
                  <div
                    className="p-3 rounded-xl bg-white border border-slate-200 mb-3"
                    dir={lang.direction}
                  >
                    <div className="text-xs font-medium text-slate-800 line-clamp-1">{lang.sample_phrase}</div>
                    <div
                      className="text-[11px] text-slate-500 mt-1 line-clamp-1"
                      dir="ltr"
                    >
                      "{lang.sample_translation}"
                    </div>
                  </div>

                  {/* Meta Tags: Region & Scripts */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700">
                      {lang.region}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700">
                      {lang.scripts.join(', ')}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 text-slate-700">
                      {lang.total_lessons_count} Lessons
                    </span>
                  </div>

                  {/* Honest Capability Matrix Badges */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-200 pt-3 mb-4">
                    <span
                      className={`flex items-center gap-1 ${
                        lang.capabilities.text_lessons === 'SUPPORTED'
                          ? 'text-emerald-600'
                          : lang.capabilities.text_lessons === 'LIMITED'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                      title={`Lessons: ${lang.capabilities.text_lessons}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        lang.capabilities.tts_audio === 'SUPPORTED'
                          ? 'text-emerald-600'
                          : lang.capabilities.tts_audio === 'LIMITED'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                      title={`Audio: ${lang.capabilities.tts_audio}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        lang.capabilities.speech_recognition === 'SUPPORTED'
                          ? 'text-emerald-600'
                          : lang.capabilities.speech_recognition === 'LIMITED'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                      title={`Speech Recognition: ${lang.capabilities.speech_recognition}`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </span>
                    <span
                      className={`flex items-center gap-1 ${
                        lang.capabilities.ai_conversation === 'SUPPORTED'
                          ? 'text-emerald-600'
                          : lang.capabilities.ai_conversation === 'LIMITED'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                      title={`AI Conversation: ${lang.capabilities.ai_conversation}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </span>

                    <span className="text-[10px] text-slate-500 ml-auto">
                      {lang.capabilities.ai_conversation === 'SUPPORTED' ? 'AI Ready' : 'Foundation'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div>
                  {isEnrolled ? (
                    <button
                      onClick={() => onGoToDashboard(lang.code)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-750 text-indigo-600 text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-200 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Continue Learning
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartLearning(lang)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/30"
                    >
                      Start Learning <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
