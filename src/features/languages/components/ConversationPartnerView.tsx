// src/features/languages/components/ConversationPartnerView.tsx
// Interactive AI conversation partner with voice recognition and grammar correction

import * as React from 'react';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Bot,
  User,
} from 'lucide-react';
import { ConversationSession, LanguageEntry } from '../types/languageTypes';
import { languageApi } from '../api/languageApi';
import { toast } from 'sonner';

interface ConversationPartnerViewProps {
  language: LanguageEntry;
  onBack: () => void;
}

export function ConversationPartnerView({ language, onBack }: ConversationPartnerViewProps) {
  const [sessions, setSessions] = React.useState<ConversationSession[]>([]);
  const [activeSession, setActiveSession] = React.useState<ConversationSession | null>(null);
  const [inputText, setInputText] = React.useState('');
  const [mode, setMode] = React.useState<'PRACTICE' | 'CORRECTION'>('PRACTICE');
  const [scenario, setScenario] = React.useState('Meeting someone at university campus');
  const [isSending, setIsSending] = React.useState(false);
  const [showTranslations, setShowTranslations] = React.useState(true);
  const [isListening, setIsListening] = React.useState(false);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load existing sessions
  const loadSessions = React.useCallback(async () => {
    try {
      const list = await languageApi.getConversations(language.code);
      setSessions(list);
      if (list.length > 0 && !activeSession) {
        setActiveSession(list[0]);
      }
    } catch (err: any) {
      loggerError(err);
    }
  }, [language.code, activeSession]);

  React.useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const handleStartNewSession = async () => {
    try {
      setIsSending(true);
      const session = await languageApi.startConversation(language.code, {
        scenario,
        mode,
      });
      setSessions((prev) => [session, ...prev]);
      setActiveSession(session);
      toast.success('New conversation started!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start conversation.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeSession || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const updated = await languageApi.sendMessage(language.code, activeSession.id, text);
      setActiveSession(updated);
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      // Keep the student's text so it is not lost when the partner cannot reply.
      setInputText(text);
      toast.error(err?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Speech Recognition for Voice Input
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.info('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language.code;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info(`Listening in ${language.name}... Speak into your microphone.`);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        toast.error(`Speech recognition: ${event.error || 'Microphone access denied'}`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      toast.error('Microphone service unavailable.');
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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showTranslations
                ? 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300'
                : 'border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {showTranslations ? 'Translations Visible' : 'Translations Hidden'}
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">AI Language Partner</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {language.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {activeSession ? activeSession.scenario : scenario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="PRACTICE">Practice Mode (Natural)</option>
              <option value="CORRECTION">Correction Mode (Feedback)</option>
            </select>

            <button
              onClick={handleStartNewSession}
              disabled={isSending}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Dialogue
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-slate-200">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-600" />
              <h4 className="text-base font-bold text-white">Ready to Practice Spoken {language.name}?</h4>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Choose a conversation scenario and start exchanging realistic messages in {language.name}.
              </p>
              <button
                onClick={handleStartNewSession}
                className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25"
              >
                Begin Conversation
              </button>
            </div>
          ) : (
            activeSession.messages.map((m) => {
              const isAi = m.sender === 'ai';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl p-4 space-y-2 ${
                      isAi
                        ? 'bg-slate-800/80 border border-slate-700/60 text-slate-100'
                        : 'bg-indigo-600 text-white ml-auto'
                    }`}
                  >
                    <div className="text-sm font-medium leading-relaxed" dir={language.direction}>
                      {m.text}
                    </div>

                    {/* Translation */}
                    {showTranslations && m.translation && (
                      <div
                        className={`text-xs ${
                          isAi ? 'text-slate-400' : 'text-indigo-200'
                        } border-t border-slate-700/50 pt-1.5`}
                        dir="ltr"
                      >
                        "{m.translation}"
                      </div>
                    )}

                    {/* AI Correction Note */}
                    {m.correction && (
                      <div
                        className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 flex items-start gap-2"
                        dir="ltr"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{m.correction}</span>
                      </div>
                    )}

                    {/* Audio Speak */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => playSpeech(m.text)}
                        className={`p-1 rounded hover:bg-slate-700/50 transition-colors ${
                          isAi ? 'text-slate-400' : 'text-indigo-200'
                        }`}
                        title="Speak aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 shrink-0 mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
              title="Click to speak (Web Speech API)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Reply in ${language.name}... (e.g. ${language.sample_phrase.split(' ')[0]})`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              dir={language.direction}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function loggerError(err: any) {
  // silent log helper
}
