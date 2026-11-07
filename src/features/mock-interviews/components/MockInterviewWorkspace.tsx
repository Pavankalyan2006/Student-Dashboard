// src/features/mock-interviews/components/MockInterviewWorkspace.tsx
// Comprehensive Live Interactive Interview Workspace with Voice, Code Sandbox, SQL Sandbox, and STAR Builder

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Clock,
  Sparkles,
  Send,
  HelpCircle,
  SkipForward,
  Flag,
  Code2,
  Database,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Terminal,
  Bookmark,
  Share2,
  Info,
} from 'lucide-react';
import {
  MockInterviewSessionEntity,
  MockInterviewSessionQuestion,
  MockInterviewAnswerEntity,
} from '../types/mockInterviewTypes';
import { mockInterviewApi } from '../api/mockInterviewApi';
import { toast } from 'sonner';

interface Props {
  sessionId: string;
  onFinish: () => void;
  onExit: () => void;
}

export const MockInterviewWorkspace: React.FC<Props> = ({ sessionId, onFinish, onExit }) => {
  const [session, setSession] = useState<MockInterviewSessionEntity | null>(null);
  const [questions, setQuestions] = useState<MockInterviewSessionQuestion[]>([]);
  const [answers, setAnswers] = useState<MockInterviewAnswerEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active question & answer draft
  const [answerDraft, setAnswerDraft] = useState('');
  const [activeTab, setActiveTab] = useState<'TEXT' | 'VOICE' | 'CODE' | 'SQL' | 'SYSTEM_DESIGN' | 'STAR'>('TEXT');

  // Timer & state
  const [remainingSeconds, setRemainingSeconds] = useState(1800);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);

  // Scratchpad notes
  const [scratchpad, setScratchpad] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // Voice Web Speech API
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Coding Sandbox State
  const [codeDraft, setCodeDraft] = useState('');
  const [codeLang, setCodeLang] = useState('python');
  const [codeStdout, setCodeStdout] = useState('');
  const [codeStderr, setCodeStderr] = useState('');
  const [codeRuntime, setCodeRuntime] = useState<number | null>(null);
  const [isRunningCode, setIsRunningCode] = useState(false);

  // SQL Sandbox State
  const [sqlQuery, setSqlQuery] = useState('');
  const [sqlColumns, setSqlColumns] = useState<string[]>([]);
  const [sqlRows, setSqlRows] = useState<any[]>([]);
  const [sqlError, setSqlError] = useState('');
  const [isRunningSql, setIsRunningSql] = useState(false);

  // System Design State
  const [architectureNodes, setArchitectureNodes] = useState<Array<{ id: string; name: string; type: string }>>([
    { id: '1', name: 'Web Client / Mobile', type: 'CLIENT' },
    { id: '2', name: 'Cloudflare CDN / DNS', type: 'CDN' },
    { id: '3', name: 'API Gateway / Load Balancer', type: 'GATEWAY' },
    { id: '4', name: 'Core Microservice Cluster', type: 'SERVICE' },
    { id: '5', name: 'Redis Distributed Cache', type: 'CACHE' },
    { id: '6', name: 'PostgreSQL Primary (Write)', type: 'DATABASE' },
    { id: '7', name: 'Kafka Event Queue', type: 'QUEUE' },
  ]);

  // STAR method builder states
  const [starSituation, setStarSituation] = useState('');
  const [starTask, setStarTask] = useState('');
  const [starAction, setStarAction] = useState('');
  const [starResult, setStarResult] = useState('');

  // Hints
  const [hintText, setHintText] = useState('');
  const [isLoadingHint, setIsLoadingHint] = useState(false);

  // 1. Load Session Data
  const loadSession = async () => {
    try {
      setIsLoading(true);
      const data = await mockInterviewApi.getSession(sessionId);
      setSession(data.session);
      setQuestions(data.questions);
      setAnswers(data.answers);
      setScratchpad(data.session.scratchpad_notes || '');

      // Set remaining time based on duration and elapsed
      const totalSecs = (data.session.duration_minutes || 30) * 60;
      const left = Math.max(0, totalSecs - (data.session.elapsed_seconds || 0));
      setRemainingSeconds(left);
      setIsPaused(data.session.is_paused || false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load interview session');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // 2. Active Question calculation
  const currentQuestion = questions.find(
    (q) => !answers.some((a) => a.question_id === q.id)
  ) || questions[questions.length - 1];

  // Initialize input defaults based on current question
  useEffect(() => {
    if (currentQuestion) {
      // Set appropriate active tab
      if (currentQuestion.question_type === 'CODING' || session?.category === 'CODING' || session?.category === 'DSA') {
        setActiveTab('CODE');
        setCodeDraft(currentQuestion.starter_code || '# Write your solution below\n');
        setCodeLang(currentQuestion.starter_language || session?.programming_language || 'python');
      } else if (currentQuestion.question_type === 'SQL' || session?.category === 'SQL') {
        setActiveTab('SQL');
        setSqlQuery(currentQuestion.starter_code || 'SELECT * FROM departments LIMIT 5;');
      } else if (currentQuestion.question_type === 'SYSTEM_DESIGN' || session?.category === 'SYSTEM_DESIGN') {
        setActiveTab('SYSTEM_DESIGN');
      } else if (currentQuestion.question_type === 'STAR' || currentQuestion.question_type === 'BEHAVIORAL') {
        setActiveTab('STAR');
      } else {
        setActiveTab('TEXT');
      }

      setHintText('');
      setAnswerDraft('');

      // Optional text-to-speech for the question if not muted
      if (!isTtsMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [currentQuestion?.id]);

  // 3. Web Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setVoiceTranscript((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recog.onerror = (event: any) => {
        console.warn('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. You can continue typing in text mode.');
        }
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      toast.error('Web Speech API is not supported in this browser. Please use text mode.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Voice recording stopped. Review transcript before submitting.');
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Microphone listening... Speak clearly.');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const applyVoiceTranscript = () => {
    if (voiceTranscript.trim()) {
      setAnswerDraft((prev) => (prev ? `${prev}\n\n${voiceTranscript}` : voiceTranscript));
      setVoiceTranscript('');
      setActiveTab('TEXT');
      toast.success('Transcript applied to answer draft!');
    }
  };

  // 4. Timer effect
  useEffect(() => {
    if (isPaused || isLoading || remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isLoading, remainingSeconds]);

  const handleTimeExpire = async () => {
    toast.warning('Time limit reached for this mock interview session. Finalizing...');
    await handleFinishInterview();
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // 5. Actions: Pause / Resume
  const togglePause = async () => {
    try {
      if (isPaused) {
        await mockInterviewApi.resumeSession(sessionId);
        setIsPaused(false);
        toast.info('Interview resumed.');
      } else {
        await mockInterviewApi.pauseSession(sessionId);
        setIsPaused(true);
        toast.info('Interview paused.');
      }
    } catch {
      toast.error('Failed to toggle session state');
    }
  };

  // 6. Action: Run Code in Isolated Sandbox
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    if (!codeDraft.trim()) {
      toast.error('Enter source code to run.');
      return;
    }
    setIsRunningCode(true);
    setCodeStdout('');
    setCodeStderr('');
    try {
      const res = await mockInterviewApi.runCode(sessionId, {
        question_id: currentQuestion.id,
        language: codeLang,
        source_code: codeDraft,
      });
      setCodeStdout(res.stdout || '');
      setCodeStderr(res.stderr || '');
      setCodeRuntime(res.execution_time_ms || 12);
      if (res.status === 'SUCCESS' || (!res.stderr && res.stdout)) {
        toast.success('Code executed successfully in sandbox!');
      } else {
        toast.warning('Code execution completed with output/errors.');
      }
    } catch (err: any) {
      setCodeStderr(err.message || 'Execution error');
      toast.error('Failed to run code in sandbox');
    } finally {
      setIsRunningCode(false);
    }
  };

  // 7. Action: Run SQL in Isolated Sandbox
  const handleRunSql = async () => {
    if (!currentQuestion) return;
    if (!sqlQuery.trim()) {
      toast.error('Enter a SQL query.');
      return;
    }
    setIsRunningSql(true);
    setSqlError('');
    try {
      const res = await mockInterviewApi.runSql(sessionId, {
        question_id: currentQuestion.id,
        query: sqlQuery,
      });
      if (res.success) {
        setSqlColumns(res.columns || []);
        setSqlRows(res.rows || []);
        toast.success(`SQL executed! Returned ${res.row_count || res.rows?.length || 0} rows.`);
      } else {
        setSqlError(res.error || 'Syntax error in SQL statement.');
      }
    } catch (err: any) {
      setSqlError(err.message || 'SQL execution failed');
    } finally {
      setIsRunningSql(false);
    }
  };

  // 8. Action: Apply STAR Method to Draft
  const handleApplyStar = () => {
    const combined = `**Situation:** ${starSituation.trim() || 'N/A'}\n\n**Task:** ${starTask.trim() || 'N/A'}\n\n**Action:** ${starAction.trim() || 'N/A'}\n\n**Result:** ${starResult.trim() || 'N/A'}`;
    setAnswerDraft(combined);
    setActiveTab('TEXT');
    toast.success('STAR narrative formatted and merged into your answer draft!');
  };

  // 9. Action: Request Hint
  const handleRequestHint = async () => {
    if (!currentQuestion) return;
    setIsLoadingHint(true);
    try {
      const res = await mockInterviewApi.requestHint(sessionId, currentQuestion.id);
      setHintText(res.hint);
      toast.info('Interviewer provided a hint!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to request hint');
    } finally {
      setIsLoadingHint(false);
    }
  };

  // 10. Action: Skip Question
  const handleSkipQuestion = async () => {
    if (!currentQuestion) return;
    try {
      const res = await mockInterviewApi.skipQuestion(sessionId, currentQuestion.id);
      toast.info('Question skipped.');
      if (res.is_completed) {
        toast.success('All questions addressed. Generating feedback report...');
        onFinish();
      } else {
        await loadSession();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to skip question');
    }
  };

  // 11. Action: Submit Answer
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    let finalAnswer = answerDraft.trim();

    // If candidate wrote code or SQL, merge it into the answer
    if (activeTab === 'CODE' && codeDraft.trim()) {
      finalAnswer = finalAnswer
        ? `${finalAnswer}\n\n### Code Solution (${codeLang}):\n\`\`\`${codeLang}\n${codeDraft}\n\`\`\``
        : `### Code Solution (${codeLang}):\n\`\`\`${codeLang}\n${codeDraft}\n\`\`\``;
    } else if (activeTab === 'SQL' && sqlQuery.trim()) {
      finalAnswer = finalAnswer
        ? `${finalAnswer}\n\n### SQL Query:\n\`\`\`sql\n${sqlQuery}\n\`\`\``
        : `### SQL Query:\n\`\`\`sql\n${sqlQuery}\n\`\`\``;
    }

    if (!finalAnswer) {
      toast.error('Please formulate your response before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await mockInterviewApi.submitAnswer(sessionId, {
        question_id: currentQuestion.id,
        answer_text: finalAnswer,
        duration_seconds: 60,
        input_mode: voiceTranscript ? 'VOICE' : 'TEXT',
        code_used: codeDraft || undefined,
        sql_query_used: sqlQuery || undefined,
        architecture_used: activeTab === 'SYSTEM_DESIGN' ? architectureNodes : undefined,
      });

      toast.success('Answer submitted and evaluated by AI interviewer!');

      if (res.is_completed) {
        toast.success('Interview complete! Preparing detailed scorecard...');
        onFinish();
      } else {
        await loadSession();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 12. Action: Finish Interview Early
  const handleFinishInterview = async () => {
    try {
      await mockInterviewApi.completeSession(sessionId);
      toast.success('Interview concluded. Generating debrief report...');
      setConfirmEndOpen(false);
      onFinish();
    } catch (err: any) {
      toast.error(err.message || 'Failed to complete interview');
    }
  };

  // 13. Action: Save Scratchpad
  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await mockInterviewApi.updateScratchpad(sessionId, scratchpad);
      toast.success('Scratchpad saved!');
    } catch {
      toast.error('Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // 14. Action: Save Question to Revision Bank
  const handleBookmarkQuestion = async () => {
    if (!currentQuestion) return;
    try {
      await mockInterviewApi.saveQuestion({
        question_id: currentQuestion.id,
        category: session?.category,
        topic: currentQuestion.topic,
        question: currentQuestion.question,
        expected_concepts: currentQuestion.expected_concepts,
        reference_answer: currentQuestion.reference_answer,
      });
      toast.success('Question bookmarked in Saved Questions bank!');
    } catch {
      toast.error('Failed to bookmark question');
    }
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-base font-bold text-slate-800">Initializing Live Interview Workspace</h3>
        <p className="text-xs text-slate-500 mt-1">Grounding questions, isolating execution sandboxes, and establishing connection...</p>
      </div>
    );
  }

  const answeredCount = answers.length;
  const currentNum = currentQuestion?.question_number || (answeredCount + 1);
  const totalQuestions = session.max_questions || questions.length || 4;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl text-blue-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-wide">
                {session.category} Mock Interview
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
                {session.target_role}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Question {currentNum} of {totalQuestions} • {session.difficulty} difficulty
            </p>
          </div>
        </div>

        {/* Center Timer & Pause */}
        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-1.5 rounded-xl shadow-inner">
          <Clock className={`w-4 h-4 ${remainingSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`} />
          <span className={`font-mono text-sm font-bold ${remainingSeconds < 300 ? 'text-rose-300' : 'text-slate-200'}`}>
            {formatTimer(remainingSeconds)}
          </span>
          <button
            onClick={togglePause}
            className="p-1 rounded text-slate-400 hover:text-white transition"
            title={isPaused ? 'Resume interview' : 'Pause interview'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* TTS Mute Toggle */}
          <button
            onClick={() => setIsTtsMuted(!isTtsMuted)}
            className={`p-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
              isTtsMuted
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                : 'bg-blue-600/20 border-blue-500/40 text-blue-300'
            }`}
            title={isTtsMuted ? 'Unmute AI voice reader' : 'Mute AI voice reader'}
          >
            {isTtsMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Bookmark Question */}
          <button
            onClick={handleBookmarkQuestion}
            className="p-2 rounded-xl border border-slate-700 text-slate-400 hover:text-amber-300 hover:border-amber-400/40 transition"
            title="Save question for revision"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* End Early */}
          <button
            onClick={() => setConfirmEndOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 text-xs font-semibold transition"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* LEFT / CENTER PANEL: Primary Question & Solution Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col border-r border-slate-800 overflow-y-auto p-6 space-y-6">
          {/* Active Question Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Interviewer Prompt #{currentNum}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                Topic: {currentQuestion?.topic || 'Engineering Architecture'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-white leading-relaxed">
              {currentQuestion?.question}
            </h2>

            {currentQuestion?.context && (
              <div className="mt-3.5 p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p>{currentQuestion.context}</p>
              </div>
            )}

            {/* Hint Card if revealed */}
            {hintText && (
              <div className="mt-3.5 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
                <HelpCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold block text-amber-300">Interviewer Hint:</span>
                  <p>{hintText}</p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Input Modes Selector */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setActiveTab('TEXT')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'TEXT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Text Response
              </button>

              <button
                onClick={() => setActiveTab('VOICE')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'VOICE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                Voice Practice
              </button>

              <button
                onClick={() => setActiveTab('CODE')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'CODE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Coding Sandbox
              </button>

              <button
                onClick={() => setActiveTab('SQL')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'SQL' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                SQL Sandbox
              </button>

              <button
                onClick={() => setActiveTab('SYSTEM_DESIGN')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'SYSTEM_DESIGN' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Architecture
              </button>

              <button
                onClick={() => setActiveTab('STAR')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                  activeTab === 'STAR' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                STAR Builder
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-mono">
              Draft: {answerDraft.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {/* MODE 1: Text Response Area */}
          {activeTab === 'TEXT' && (
            <div className="flex-1 flex flex-col space-y-2">
              <textarea
                rows={12}
                placeholder="Type your structured explanation, equations, edge cases, and architectural trade-offs here. Formulate clear paragraphs..."
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                className="w-full flex-1 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none font-sans leading-relaxed shadow-inner"
              />
            </div>
          )}

          {/* MODE 2: Voice Practice with Web Speech API */}
          {activeTab === 'VOICE' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Mic className="w-4 h-4 text-blue-400" />
                    Speech-to-Text Voice Recording
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Practice answering out loud. Web Speech API transcribes your response in real time without storing raw audio.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      Start Speaking
                    </>
                  )}
                </button>
              </div>

              {/* Status and transcript preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Live Speech Transcript Preview:</span>
                  {isListening && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Listening to microphone...
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  placeholder="Your transcribed spoken answer will appear here in real time. You can edit this text freely before merging it into your answer..."
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500">
                  Transcripts are editable before submission. Text fallback is always available.
                </span>
                <button
                  onClick={applyVoiceTranscript}
                  disabled={!voiceTranscript.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Apply Transcript to Main Answer
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: Coding Sandbox */}
          {activeTab === 'CODE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Sandbox Language:</span>
                  <select
                    value={codeLang}
                    onChange={(e) => setCodeLang(e.target.value)}
                    className="text-xs px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 outline-none"
                  >
                    <option value="python">Python 3.11</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java 21</option>
                    <option value="cpp">C++ 20</option>
                    <option value="go">Go 1.22</option>
                  </select>
                </div>

                <button
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  {isRunningCode ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Running in Sandbox...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Run Code in Sandbox</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Editor */}
              <textarea
                rows={10}
                value={codeDraft}
                onChange={(e) => setCodeDraft(e.target.value)}
                placeholder="Write your algorithmic solution here..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />

              {/* Sandbox Execution Output Console */}
              {(codeStdout || codeStderr || isRunningCode) && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-blue-400" />
                      Isolated Execution Sandbox Output
                    </span>
                    {codeRuntime !== null && (
                      <span className="text-[10px] text-slate-500">Execution time: {codeRuntime} ms</span>
                    )}
                  </div>
                  {codeStdout && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Standard Output:</span>
                      <pre className="text-emerald-300 whitespace-pre-wrap mt-0.5">{codeStdout}</pre>
                    </div>
                  )}
                  {codeStderr && (
                    <div>
                      <span className="text-[10px] text-rose-400 uppercase tracking-wider block">Standard Error:</span>
                      <pre className="text-rose-300 whitespace-pre-wrap mt-0.5">{codeStderr}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* MODE 4: SQL Sandbox */}
          {activeTab === 'SQL' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  Target: <strong>university_db.departments</strong> (Isolated Student In-Memory Sandbox)
                </span>
                <button
                  onClick={handleRunSql}
                  disabled={isRunningSql}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  {isRunningSql ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Executing Query...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute SQL Query</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                rows={5}
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="SELECT dept_name, budget FROM departments WHERE budget > 5000000;"
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-cyan-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />

              {/* SQL Result Table */}
              {sqlError ? (
                <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs">
                  {sqlError}
                </div>
              ) : sqlRows.length > 0 ? (
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-300 font-semibold border-b border-slate-700">
                      <tr>
                        {sqlColumns.map((c, i) => (
                          <th key={i} className="p-2.5">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {sqlRows.map((r, ri) => (
                        <tr key={ri} className="hover:bg-slate-800/40">
                          {sqlColumns.map((c, ci) => (
                            <td key={ci} className="p-2.5">{String(r[c] ?? 'NULL')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          )}

          {/* MODE 5: System Design Architecture */}
          {activeTab === 'SYSTEM_DESIGN' && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Distributed System Topology Palette
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select and verify components included in your architectural tier.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {architectureNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">{node.name}</span>
                      <span className="text-[10px] text-blue-400 font-mono uppercase">{node.type}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>

              <textarea
                rows={5}
                placeholder="Explain the data flow, capacity math (QPS, storage), caching policy (Cache-Aside / Write-Through), and SPoF elimination..."
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none leading-relaxed"
              />
            </div>
          )}

          {/* MODE 6: STAR Method Builder */}
          {activeTab === 'STAR' && (
            <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    STAR Behavioral Structure Builder
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Structure your story step-by-step into Situation, Task, Action, and Result.
                  </p>
                </div>
                <button
                  onClick={handleApplyStar}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Merge into Main Answer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-amber-300 block mb-1">Situation (Context & Project)</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the setting, project, or semester sprint..."
                    value={starSituation}
                    onChange={(e) => setStarSituation(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-300 block mb-1">Task (Challenge & Responsibility)</label>
                  <textarea
                    rows={3}
                    placeholder="What specific problem were you assigned to solve?"
                    value={starTask}
                    onChange={(e) => setStarTask(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-300 block mb-1">Action (Concrete Engineering Steps)</label>
                  <textarea
                    rows={3}
                    placeholder="What concrete tools, algorithms, or interpersonal actions did you take?"
                    value={starAction}
                    onChange={(e) => setStarAction(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-amber-300 block mb-1">Result (Quantifiable Outcome & Learnings)</label>
                  <textarea
                    rows={3}
                    placeholder="What was the measurable outcome, grade, or key retrospective lesson?"
                    value={starResult}
                    onChange={(e) => setStarResult(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestHint}
                disabled={isLoadingHint}
                className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>{isLoadingHint ? 'Requesting...' : 'Ask for Hint / Clarification'}</span>
              </button>

              <button
                type="button"
                onClick={handleSkipQuestion}
                className="px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip Question</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleSubmitAnswer}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Response...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Answer & Continue</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT SUPPORTING PANEL: Conversation Thread, Scratchpad & Progress (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 flex flex-col overflow-y-auto p-6 space-y-6">
          {/* Question Timeline Tracker */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-3">
              <span>Session Progression</span>
              <span className="font-mono text-blue-400">{answeredCount}/{totalQuestions} Answered</span>
            </div>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalQuestions }).map((_, i) => {
                const isAnswered = i < answeredCount;
                const isCurrent = i === answeredCount;
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      isAnswered
                        ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                        : isCurrent
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-slate-800'
                    }`}
                    title={`Question ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Conversation Thread / History */}
          <div className="flex-1 flex flex-col space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Interviewer Exchange
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {/* Interviewer welcome */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Interviewer:
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Welcome! This session evaluates your conceptual mastery, problem-solving flow, and communication. Answer directly and feel free to use the code/SQL sandboxes.
                </p>
              </div>

              {/* Past answers and critiques */}
              {answers.map((a, i) => (
                <div key={i} className="space-y-2">
                  <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-xs space-y-1 text-right">
                    <span className="font-bold text-blue-300">You (Candidate):</span>
                    <p className="text-slate-300 line-clamp-3">{a.answer_text}</p>
                  </div>
                  {a.evaluation && (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-400">
                          {a.evaluation.method === 'AI_MODEL' ? 'AI practice score:' : a.evaluation.method === 'SKIPPED' ? 'Skipped:' : 'Keyword check:'}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          {a.evaluation.score}%
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{a.evaluation.clarity_feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Scratchpad Notes Area */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Candidate Scratchpad
              </span>
              <button
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition"
              >
                {isSavingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Use this scratchpad to jot down complexity bounds, variable names, or outline thoughts..."
              value={scratchpad}
              onChange={(e) => setScratchpad(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none font-mono"
            />
          </div>

          {/* Ground Rules & Privacy */}
          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Workspace Security:</span>
            <p>Code and SQL queries run in isolated per-student memory sandboxes. State persists automatically.</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal to End Interview Early */}
      {confirmEndOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="font-bold text-white text-base">Conclude Interview Early?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your submitted answers will be scored and compiled into a diagnostic report.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              You have completed <strong>{answeredCount} of {totalQuestions}</strong> questions. Unanswered questions will receive zero points.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmEndOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Keep Practicing
              </button>
              <button
                onClick={handleFinishInterview}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                End & Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
