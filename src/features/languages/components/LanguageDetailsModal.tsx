// src/features/languages/components/LanguageDetailsModal.tsx
// Deep breakdown of language origins, writing systems, pronunciation, and capabilities

import * as React from 'react';
import {
  X,
  Globe,
  BookOpen,
  Volume2,
  Mic,
  MessageSquare,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { LanguageEntry } from '../types/languageTypes';

interface LanguageDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageEntry | null;
  onStartLearning: (lang: LanguageEntry) => void;
  onGoToDashboard: (langCode: string) => void;
}

export function LanguageDetailsModal({
  isOpen,
  onClose,
  language,
  onStartLearning,
  onGoToDashboard,
}: LanguageDetailsModalProps) {
  if (!isOpen || !language) return null;

  const playSample = (phrase: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3.5">
            <span className="text-4xl">{language.flag_emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{language.name}</h2>
                <span className="text-sm px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
                  {language.native_name}
                </span>
                {language.direction === 'rtl' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                    RTL
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {language.family} • {language.region} Region • ISO 639: <span className="font-mono">{language.code}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Overview */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Introduction & Overview</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
              {language.description}
            </p>
          </div>

          {/* Writing System */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Writing System & Direction</h4>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Primary Scripts:</span>
                <span className="text-white font-medium">{language.scripts.join(', ')}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Text Direction:</span>
                <span className="text-white font-medium">
                  {language.direction === 'rtl' ? 'Right-to-Left (RTL)' : 'Left-to-Right (LTR)'}
                </span>
              </div>
              <div className="text-xs text-slate-300 pt-1 border-t border-slate-700/60 leading-relaxed">
                {language.writing_system_overview}
              </div>
            </div>
          </div>

          {/* Sample Greeting */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sample Everyday Greeting</h4>
            <div
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4"
              dir={language.direction}
            >
              <div>
                <div className="text-base font-semibold text-white">{language.sample_phrase}</div>
                {language.pronunciation_guide && (
                  <div className="text-xs text-indigo-400 font-mono mt-1" dir="ltr">
                    /{language.pronunciation_guide}/
                  </div>
                )}
                <div className="text-xs text-slate-400 mt-1" dir="ltr">
                  "{language.sample_translation}"
                </div>
              </div>
              <button
                onClick={() => playSample(language.sample_phrase)}
                className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                title="Play pronunciation sample"
                dir="ltr"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Honest Capability Registry */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Available Learning Capabilities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {Object.entries(language.capabilities).map(([key, status]) => {
                const label = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());

                const isSupported = status === 'SUPPORTED';
                const isLimited = status === 'LIMITED';

                return (
                  <div
                    key={key}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isSupported
                        ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300'
                        : isLimited
                        ? 'border-amber-500/20 bg-amber-950/10 text-amber-300'
                        : 'border-slate-800 bg-slate-800/20 text-slate-500'
                    }`}
                  >
                    <span className="truncate pr-1">{label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase">
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {language.is_enrolled ? (
            <button
              onClick={() => {
                onClose();
                onGoToDashboard(language.code);
              }}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-400 text-sm font-semibold flex items-center gap-1.5 border border-indigo-500/20"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Continue Learning
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                onClose();
                onStartLearning(language);
              }}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
            >
              Start Learning Now <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
