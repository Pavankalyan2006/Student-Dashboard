// src/features/languages/components/ContextualTranslatorView.tsx
// Deep contextual translation and cross-lingual breakdown for 150 languages

import * as React from 'react';
import {
  Globe,
  ArrowRightLeft,
  Volume2,
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  Info,
} from 'lucide-react';
import { ContextualTranslationResult, LanguageEntry } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface ContextualTranslatorViewProps {
  currentLanguage: LanguageEntry;
  allLanguages: LanguageEntry[];
  onBack: () => void;
}

export function ContextualTranslatorView({
  currentLanguage,
  allLanguages,
  onBack,
}: ContextualTranslatorViewProps) {
  const [sourceCode, setSourceCode] = React.useState('en');
  const [targetCode, setTargetCode] = React.useState(currentLanguage.code);
  const [inputText, setInputText] = React.useState('Hello, it is a pleasure to meet you.');
  const [result, setResult] = React.useState<ContextualTranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = React.useState(false);

  const targetLang = allLanguages.find((l) => l.code === targetCode) || currentLanguage;

  const handleSwap = () => {
    const temp = sourceCode;
    setSourceCode(targetCode);
    setTargetCode(temp);
    if (result) {
      setInputText(result.primary_translation);
    }
  };

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isTranslating) return;

    try {
      setIsTranslating(true);
      const res = await languageApi.translate(sourceCode, targetCode, inputText.trim());
      setResult(res);
    } catch (err: any) {
      toast.error('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="text-xs text-slate-400">
          Contextual AI Translator • 150 Languages
        </div>
      </div>

      {/* Language Selector Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Source Language */}
        <div className="w-full sm:w-5/12">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Source Language:</label>
          <select
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="en">English (English)</option>
            {allLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag_emoji} {l.name} ({l.native_name})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          onClick={handleSwap}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors shrink-0"
          title="Swap source and target"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* Target Language */}
        <div className="w-full sm:w-5/12">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Language:</label>
          <select
            value={targetCode}
            onChange={(e) => setTargetCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
          >
            {allLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag_emoji} {l.name} ({l.native_name})
              </option>
            ))}
            <option value="en">English (English)</option>
          </select>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        <label className="text-xs font-semibold text-slate-400">Enter text or sentence to translate:</label>
        <textarea
          rows={3}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type phrase, idiom, or conversation snippet..."
          className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500">
            Translates with register nuances, word-by-word breakdowns, and transliterations.
          </span>
          <button
            onClick={handleTranslate}
            disabled={!inputText.trim() || isTranslating}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-colors disabled:opacity-50"
          >
            {isTranslating ? <>Translating...</> : <>Translate & Analyze <Sparkles className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>

      {/* Output Results View */}
      {result && (
        <div className="space-y-4 animate-in fade-in">
          {/* Main Primary Translation */}
          <div
            className="bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 relative"
            dir={targetLang.direction}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-2xl font-bold text-white leading-relaxed">
                  {result.primary_translation}
                </div>
                {result.transliteration && (
                  <div className="text-xs text-indigo-400 font-mono mt-1" dir="ltr">
                    /{result.transliteration}/
                  </div>
                )}
              </div>
              <button
                onClick={() => playSpeech(result.primary_translation)}
                className="p-2.5 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                title="Speak translation"
                dir="ltr"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Formal vs Informal Variants */}
          {(result.formal_variant || result.informal_variant) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.formal_variant && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                    Formal / Respectful Address:
                  </div>
                  <div className="text-xs text-white font-medium" dir={targetLang.direction}>
                    {result.formal_variant}
                  </div>
                </div>
              )}
              {result.informal_variant && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
                    Informal / Casual Peer Address:
                  </div>
                  <div className="text-xs text-white font-medium" dir={targetLang.direction}>
                    {result.informal_variant}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Morphological Word Breakdown */}
          {result.word_breakdown && result.word_breakdown.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Word-by-Word Breakdown
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {result.word_breakdown.map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-xs font-bold text-white">{item.word}</div>
                    <div className="text-[11px] text-indigo-300 mt-0.5">{item.meaning}</div>
                    {item.pos && <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.pos}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar & Context Warnings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.grammar_explanation && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> Grammatical Structure
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.grammar_explanation}</p>
              </div>
            )}

            {result.contextual_warning && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Cultural Nuance & Idioms
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{result.contextual_warning}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
