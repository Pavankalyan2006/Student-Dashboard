// src/features/labs/components/ExperimentWorkspace.tsx
// Comprehensive 15-section interactive experiment workspace with procedure checklist, code runner, SQL sandbox, observation tables, viva practice, and doubt assistant

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Code2,
  Database,
  Table as TableIcon,
  BookOpen,
  FileText,
  Send,
  Loader2,
  AlertCircle,
  Save,
  Printer,
  ChevronRight,
  Eye,
  EyeOff,
  Bookmark,
  Check,
  Terminal,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  LabCourse,
  LabExperimentDetail,
  ProcedureStepItem,
  VivaQuestionItem,
  ObservationTable,
  LabDoubtMessage,
} from '../types/labAssistantTypes';
import { labAssistantApi } from '../api/labAssistantApi';
import { toast } from 'sonner';

interface ExperimentWorkspaceProps {
  lab: LabCourse;
  experimentId: string;
  onBackToLab: () => void;
  onSelectExperiment: (expId: string) => void;
  onOpenReport: (expId: string) => void;
}

export function ExperimentWorkspace({
  lab,
  experimentId,
  onBackToLab,
  onSelectExperiment,
  onOpenReport,
}: ExperimentWorkspaceProps) {
  const [experiment, setExperiment] = useState<LabExperimentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'procedure' | 'theory' | 'code' | 'sql' | 'observations' | 'viva' | 'doubts' | 'notes'
  >('procedure');

  // Code runner state
  const [code, setCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [stdin, setStdin] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<{ stdout: string; stderr: string; timeMs: number } | null>(null);

  // SQL Sandbox state
  const [sqlQuery, setSqlQuery] = useState('');
  const [isRunningSql, setIsRunningSql] = useState(false);
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[]; timeMs: number; error?: string } | null>(null);

  // Viva Voce state
  const [activeVivaIdx, setActiveVivaIdx] = useState(0);
  const [vivaAnswers, setVivaAnswers] = useState<Record<string, string>>({});
  const [revealedViva, setRevealedViva] = useState<Record<string, boolean>>({});
  const [isEvaluatingViva, setIsEvaluatingViva] = useState(false);
  const [isGeneratingViva, setIsGeneratingViva] = useState(false);

  // Doubt assistant state
  const [doubtText, setDoubtText] = useState('');
  const [isAskingDoubt, setIsAskingDoubt] = useState(false);
  const [doubtHistory, setDoubtHistory] = useState<LabDoubtMessage[]>([]);

  // Observation table state
  const [observationTable, setObservationTable] = useState<ObservationTable>({
    headers: ['Input Parameter', 'Theoretical Value', 'Measured Reading', 'Deviation %'],
    rows: [['Test Case 1', '10.0', '10.2', '2.0%']],
    columns: [
      { id: 'col1', name: 'Input Parameter', unit: 'N' },
      { id: 'col2', name: 'Theoretical Value', unit: 'ms' },
      { id: 'col3', name: 'Measured Reading', unit: 'ms' },
      { id: 'col4', name: 'Deviation', unit: '%' },
    ],
    table_rows: [{ col1: 'N = 100', col2: '10.0', col3: '10.2', col4: '2.0' }],
  });
  const [isSavingObservations, setIsSavingObservations] = useState(false);

  // Student notes state
  const [studentNotes, setStudentNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  // AI Explanation state
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);

  // Load experiment details
  const loadExperiment = async () => {
    try {
      setLoading(true);
      const data = await labAssistantApi.getExperiment(lab.id, experimentId);
      setExperiment(data);
      setCode(data.implementation_code || data.source_code || '');
      setCodeLanguage(data.code_language || (lab.lab_type === 'DBMS' ? 'sql' : 'python'));
      setStudentNotes(data.student_notes || '');
      if (data.actual_output) {
        setCodeOutput({ stdout: data.actual_output, stderr: '', timeMs: data.execution_duration_ms || 42 });
      }
      if (data.observation_table && (data.observation_table.rows?.length || data.observation_table.table_rows?.length)) {
        setObservationTable(data.observation_table);
      }
      if (lab.lab_type === 'DBMS') {
        setSqlQuery(data.implementation_code || 'SELECT * FROM students LIMIT 10;');
      }
      // Load doubt history
      const history = await labAssistantApi.getDoubtHistory(lab.id, experimentId);
      setDoubtHistory(history);
    } catch (err: any) {
      toast.error('Failed to load experiment: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExperiment();
  }, [experimentId]);

  if (loading || !experiment) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-gray-500 font-medium">Initializing Experiment Workspace & Sandboxes...</p>
      </div>
    );
  }

  // Calculate procedure completion percentage
  const totalSteps = experiment.procedure_steps?.length || 0;
  const completedSteps = experiment.procedure_steps?.filter((s) => s.is_completed).length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Checklist Step Toggle
  const handleToggleStep = async (stepId: string, currentStatus: boolean) => {
    try {
      const res = await labAssistantApi.toggleChecklist(lab.id, experiment.id, stepId, !currentStatus);
      setExperiment(res.experiment);
      if (!currentStatus) {
        toast.success('Step marked complete!');
      }
    } catch (err: any) {
      toast.error('Error toggling step: ' + err.message);
    }
  };

  const handleResetChecklist = async () => {
    if (!window.confirm('Reset all checklist progress for this experiment?')) return;
    try {
      const res = await labAssistantApi.resetChecklist(lab.id, experiment.id);
      setExperiment(res.experiment);
      toast.info('Checklist reset.');
    } catch (err: any) {
      toast.error('Error resetting checklist: ' + err.message);
    }
  };

  // Run Code
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter code to execute');
      return;
    }
    try {
      setIsRunningCode(true);
      const res = await labAssistantApi.runCode(lab.id, experiment.id, code, codeLanguage, stdin);
      setCodeOutput({ stdout: res.stdout, stderr: res.stderr, timeMs: res.executionTimeMs });
      if (res.status === 'SUCCESS') {
        toast.success(`Executed in ${res.executionTimeMs}ms!`);
      } else {
        toast.error('Execution encountered errors.');
      }
    } catch (err: any) {
      toast.error('Execution error: ' + err.message);
    } finally {
      setIsRunningCode(false);
    }
  };

  // Run SQL
  const handleRunSql = async () => {
    if (!sqlQuery.trim()) {
      toast.error('Please enter an SQL query');
      return;
    }
    try {
      setIsRunningSql(true);
      const res = await labAssistantApi.runSql(lab.id, experiment.id, sqlQuery);
      setSqlResult({ columns: res.columns, rows: res.rows, timeMs: res.executionTimeMs, error: res.errorMessage });
      if (res.status === 'SUCCESS') {
        toast.success(`SQL query executed in ${res.executionTimeMs}ms!`);
      } else {
        toast.error(`SQL Error: ${res.errorMessage}`);
      }
    } catch (err: any) {
      toast.error('SQL error: ' + err.message);
    } finally {
      setIsRunningSql(false);
    }
  };

  // Evaluate Viva Answer
  const handleEvaluateViva = async (questionId: string) => {
    const ans = vivaAnswers[questionId];
    if (!ans || !ans.trim()) {
      toast.error('Please type your verbal or written answer first.');
      return;
    }
    try {
      setIsEvaluatingViva(true);
      const updatedQ = await labAssistantApi.evaluateViva(lab.id, experiment.id, questionId, ans);
      setExperiment((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          viva_questions: prev.viva_questions.map((q) => (q.id === questionId ? updatedQ : q)),
        };
      });
      toast.success('Viva evaluated against technical rubric!');
    } catch (err: any) {
      toast.error('Evaluation error: ' + err.message);
    } finally {
      setIsEvaluatingViva(false);
    }
  };

  // Ask Experiment Doubt
  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    try {
      setIsAskingDoubt(true);
      const res = await labAssistantApi.askDoubt(lab.id, experiment.id, doubtText);
      const history = await labAssistantApi.getDoubtHistory(lab.id, experiment.id);
      setDoubtHistory(history);
      setDoubtText('');
      toast.success('Assistant replied!');
    } catch (err: any) {
      toast.error('Doubt assistant error: ' + err.message);
    } finally {
      setIsAskingDoubt(false);
    }
  };

  // Save Notes
  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      await labAssistantApi.saveNotes(lab.id, experiment.id, studentNotes);
      toast.success('Personal notes saved!');
    } catch (err: any) {
      toast.error('Error saving notes: ' + err.message);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Mark Experiment Complete
  const handleMarkComplete = async () => {
    try {
      const updated = await labAssistantApi.markComplete(lab.id, experiment.id);
      setExperiment(updated);
      toast.success('Experiment marked as COMPLETED! Progress recorded.');
    } catch (err: any) {
      toast.error('Error completing experiment: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBackToLab} className="text-xs gap-1.5 h-8">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Labs
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {lab.course_code} • Sem {lab.semester}
              </span>
              <span className="text-xs font-bold text-gray-500">•</span>
              <h2 className="text-sm font-bold text-gray-900">{lab.name}</h2>
            </div>
          </div>

          {/* Experiment Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={experiment.id}
              onChange={(e) => onSelectExperiment(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {lab.experiments?.map((e) => (
                <option key={e.id} value={e.id}>
                  Exp {e.experiment_number}: {e.title}
                </option>
              ))}
            </select>

            <Button
              onClick={() => onOpenReport(experiment.id)}
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 border-gray-300 text-gray-700"
            >
              <Printer className="w-3.5 h-3.5" /> Lab Record
            </Button>

            {experiment.status === 'COMPLETED' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
              </span>
            ) : (
              <Button
                onClick={handleMarkComplete}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1 h-8"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
              </Button>
            )}
          </div>
        </div>

        {/* Title & Progress Summary */}
        <div className="pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {experiment.experiment_number}
              </span>
              <h1 className="text-base sm:text-lg font-bold text-gray-900">{experiment.title}</h1>
            </div>
            <p className="text-xs text-gray-600 mt-1 pl-9">
              <strong className="text-gray-800">Aim:</strong> {experiment.aim || 'State experiment aim'}
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="flex items-center gap-2 sm:justify-end">
              <span className="text-xs text-gray-500 font-medium">Checklist Progress:</span>
              <span className="text-xs font-black text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-36 h-2 bg-gray-100 rounded-full overflow-hidden mt-1 sm:ml-auto">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1.5 border-b border-gray-200 bg-white px-4 rounded-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('procedure')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'procedure'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Procedure Checklist ({completedSteps}/{totalSteps})
        </button>

        <button
          onClick={() => setActiveTab('theory')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'theory'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Theory & Algorithm
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'code'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Code Runner ({codeLanguage})
        </button>

        {lab.lab_type === 'DBMS' && (
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            SQL Sandbox
          </button>
        )}

        <button
          onClick={() => setActiveTab('observations')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'observations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          Observation Table
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'viva'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Viva Voce ({experiment.viva_questions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('doubts')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'doubts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          Doubt Assistant
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-3.5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Student Notes
        </button>
      </div>

      {/* TAB CONTENT AREAS */}

      {/* TAB 1: PROCEDURE CHECKLIST */}
      {activeTab === 'procedure' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Interactive Procedure Checklist</h3>
              <p className="text-xs text-gray-500">
                Check off each practical step as you execute the experiment in the lab
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChecklist}
              className="text-xs text-gray-600 hover:text-red-600 gap-1 h-7"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
          </div>

          <div className="space-y-3">
            {experiment.procedure_steps?.map((step) => (
              <div
                key={step.id}
                onClick={() => handleToggleStep(step.id, step.is_completed)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                  step.is_completed
                    ? 'bg-emerald-50/50 border-emerald-200 text-gray-700'
                    : 'bg-white border-gray-200 hover:border-blue-300 text-gray-900'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {step.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <span className="font-bold text-gray-500 mr-2">Step {step.step_number}:</span>
                  <span className={step.is_completed ? 'line-through text-gray-500' : 'font-medium'}>
                    {step.text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Requirements & Prerequisites Pill Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-700 block mb-1">Prerequisites</span>
              <div className="flex flex-wrap gap-1.5">
                {(experiment.prerequisites || ['Basic Programming Syntax']).map((p, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 text-[11px]">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
              <span className="font-bold text-gray-700 block mb-1">Requirements</span>
              <div className="flex flex-wrap gap-1.5">
                {(experiment.requirements || ['Computer', 'Runtime']).map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600 text-[11px]">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEORY & ALGORITHM */}
      {activeTab === 'theory' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Theoretical Foundation</h3>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                From Original Manual
              </span>
            </div>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
              {experiment.theory || 'No theory provided in manual.'}
            </p>
          </div>

          {experiment.algorithm && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-900">Algorithm Specification</h3>
              <pre className="p-4 rounded-xl bg-gray-900 text-gray-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {experiment.algorithm}
              </pre>
            </div>
          )}

          {experiment.result_conclusion && (
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs">
              <strong className="text-blue-900 font-bold block mb-1">Expected Practical Outcome / Conclusion:</strong>
              <span className="text-blue-800">{experiment.result_conclusion}</span>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CODE RUNNER WORKSPACE */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700">Language:</span>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold border border-gray-300 rounded-lg bg-gray-50"
              >
                <option value="python">Python 3</option>
                <option value="c">C (GCC)</option>
                <option value="cpp">C++ (G++)</option>
                <option value="java">Java (OpenJDK)</option>
                <option value="javascript">JavaScript (Node)</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await labAssistantApi.saveCodeDraft(lab.id, experiment.id, code, codeLanguage, stdin);
                  toast.success('Code draft saved to backend!');
                }}
                className="text-xs h-8 gap-1"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft
              </Button>

              <Button
                onClick={handleRunCode}
                disabled={isRunningCode}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 gap-1.5 shadow-xs"
              >
                {isRunningCode ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Code
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
            <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
              <span className="font-mono">main.{codeLanguage === 'python' ? 'py' : codeLanguage === 'java' ? 'java' : 'c'}</span>
              <span>Isolated Execution Sandbox</span>
            </div>
            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write or paste program code here..."
              className="w-full p-4 bg-gray-950 text-emerald-400 font-mono text-xs focus:outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Stdin Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Standard Input (stdin)</label>
            <input
              type="text"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-1.5 text-xs font-mono border border-gray-300 rounded-lg focus:outline-none"
            />
          </div>

          {/* Terminal Output & Comparison */}
          {codeOutput && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700">Actual Terminal Output</span>
                    <span className="text-[11px] text-gray-500 font-mono">{codeOutput.timeMs}ms</span>
                  </div>
                  <pre
                    className={`p-3.5 rounded-xl font-mono text-xs overflow-x-auto min-h-[90px] ${
                      codeOutput.stderr
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : 'bg-gray-900 text-emerald-300 border border-gray-800'
                    }`}
                  >
                    {codeOutput.stderr || codeOutput.stdout || '(Program completed with no output)'}
                  </pre>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-700">Expected Output</span>
                  <pre className="p-3.5 rounded-xl bg-gray-100 text-gray-800 font-mono text-xs overflow-x-auto min-h-[90px] border border-gray-200">
                    {experiment.expected_output || 'No expected output defined.'}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SQL SANDBOX */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Isolated Student SQL Sandbox</h3>
              <p className="text-xs text-gray-500">
                Connected to isolated student `university_db` SQLite sandbox. Never touches production.
              </p>
            </div>
            <Button
              onClick={handleRunSql}
              disabled={isRunningSql}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5 shadow-xs"
            >
              {isRunningSql ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Querying...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" /> Execute Query
                </>
              )}
            </Button>
          </div>

          <textarea
            rows={5}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="SELECT * FROM students WHERE semester = 6;"
            className="w-full p-3.5 rounded-xl bg-gray-900 text-emerald-400 font-mono text-xs focus:outline-none"
          />

          {sqlResult && (
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-gray-700">
                Query Result ({sqlResult.rows?.length || 0} rows in {sqlResult.timeMs}ms)
              </span>
              {sqlResult.error ? (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-mono border border-red-200">
                  {sqlResult.error}
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-x-auto max-h-60">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200">
                      <tr>
                        {sqlResult.columns.map((c) => (
                          <th key={c} className="p-2.5">
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.rows.map((r, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          {sqlResult.columns.map((c) => (
                            <td key={c} className="p-2.5 font-mono text-gray-700">
                              {r[c] !== undefined ? String(r[c]) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: OBSERVATION TABLE */}
      {activeTab === 'observations' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Observation & Reading Table</h3>
              <p className="text-xs text-gray-500">
                Record real experimental measurements. Units and mathematical formulas supported.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const rows = observationTable.table_rows ? [...observationTable.table_rows] : [];
                  rows.push({});
                  setObservationTable({ ...observationTable, table_rows: rows });
                }}
                className="text-xs h-8"
              >
                + Add Row
              </Button>

              <Button
                onClick={async () => {
                  setIsSavingObservations(true);
                  try {
                    await labAssistantApi.saveObservationTable(lab.id, experiment.id, observationTable);
                    toast.success('Observation table saved!');
                  } catch (err: any) {
                    toast.error('Error saving: ' + err.message);
                  } finally {
                    setIsSavingObservations(false);
                  }
                }}
                disabled={isSavingObservations}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5"
              >
                <Save className="w-3.5 h-3.5" /> Save Table
              </Button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-900 font-bold border-b border-gray-200">
                <tr>
                  <th className="p-2.5 w-12 text-center">#</th>
                  {observationTable.columns?.map((col) => (
                    <th key={col.id} className="p-2.5">
                      {col.name} {col.unit ? `(${col.unit})` : ''}
                    </th>
                  ))}
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {observationTable.table_rows?.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-gray-100">
                    <td className="p-2.5 text-center text-gray-400 font-bold">{rIdx + 1}</td>
                    {observationTable.columns?.map((col) => (
                      <td key={col.id} className="p-2">
                        <input
                          type="text"
                          value={row[col.id] || ''}
                          onChange={(e) => {
                            const rows = [...(observationTable.table_rows || [])];
                            rows[rIdx] = { ...rows[rIdx], [col.id]: e.target.value };
                            setObservationTable({ ...observationTable, table_rows: rows });
                          }}
                          className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                      </td>
                    ))}
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const rows = observationTable.table_rows?.filter((_, i) => i !== rIdx);
                          setObservationTable({ ...observationTable, table_rows: rows });
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: VIVA VOCE PRACTICE */}
      {activeTab === 'viva' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Viva Voce Preparation & Oral Practice</h3>
              <p className="text-xs text-gray-500">
                Formulate answers to curriculum questions. Graded objectively against core technical concepts.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsGeneratingViva(true);
                try {
                  const generated = await labAssistantApi.generateViva(lab.id, experiment.id, 2);
                  await loadExperiment();
                  toast.success(`Generated ${generated.length} additional viva questions!`);
                } catch (err: any) {
                  toast.error('Viva generation error: ' + err.message);
                } finally {
                  setIsGeneratingViva(false);
                }
              }}
              disabled={isGeneratingViva}
              className="text-xs gap-1.5 h-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              {isGeneratingViva ? 'Generating...' : 'Generate More Viva Questions'}
            </Button>
          </div>

          <div className="space-y-4">
            {experiment.viva_questions?.map((vq, idx) => (
              <div key={vq.id} className="p-5 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900">{vq.question}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-200/70 px-2 py-0.5 rounded mt-1 inline-block">
                        Difficulty: {vq.difficulty || 'INTERMEDIATE'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setRevealedViva((prev) => ({ ...prev, [vq.id]: !prev[vq.id] }))
                    }
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
                  >
                    {revealedViva[vq.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {revealedViva[vq.id] ? 'Hide Concept' : 'Reveal Expected Concept'}
                  </button>
                </div>

                {revealedViva[vq.id] && (
                  <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-900">
                    <strong className="block font-bold mb-0.5">Expected Technical Invariant:</strong>
                    <span>{vq.expected_concept}</span>
                  </div>
                )}

                {/* Student Answer Input */}
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={vivaAnswers[vq.id] !== undefined ? vivaAnswers[vq.id] : vq.student_answer || ''}
                    onChange={(e) => setVivaAnswers({ ...vivaAnswers, [vq.id]: e.target.value })}
                    placeholder="Type your verbal or written explanation for this viva question..."
                    className="w-full p-3 text-xs border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Answers are evaluated objectively against computer science standards
                    </span>
                    <Button
                      size="sm"
                      onClick={() => handleEvaluateViva(vq.id)}
                      disabled={isEvaluatingViva}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Evaluate Answer
                    </Button>
                  </div>
                </div>

                {/* AI Evaluation Scorecard */}
                {vq.ai_evaluation && (
                  <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-xs space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700">
                        {(vq.ai_evaluation as any).method === 'AI_MODEL'
                          ? 'AI practice feedback (not an official viva mark):'
                          : 'Keyword check (automatic, not AI and not an official mark):'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                        Score: {vq.ai_evaluation.score} / 10
                      </span>
                    </div>
                    <p className="text-xs text-gray-800">
                      <strong>Correctness:</strong> {vq.ai_evaluation.correctness}
                    </p>
                    {vq.ai_evaluation.missing_concepts?.length > 0 && (
                      <p className="text-xs text-amber-800">
                        <strong>Missing Concepts:</strong> {vq.ai_evaluation.missing_concepts.join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-emerald-800">
                      <strong>Suggestions:</strong> {vq.ai_evaluation.improvement}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DOUBT SOLVING ASSISTANT */}
      {activeTab === 'doubts' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Experiment-Aware Doubt Assistant</h3>
              <p className="text-xs text-gray-500">
                Grounded in Experiment {experiment.experiment_number}: {experiment.title}
              </p>
            </div>
            {doubtHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await labAssistantApi.clearDoubtHistory(lab.id, experiment.id);
                  setDoubtHistory([]);
                  toast.info('Chat history cleared');
                }}
                className="text-xs text-gray-500 hover:text-red-600 h-7"
              >
                Clear History
              </Button>
            )}
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              'Explain the aim in simple words',
              'Why is this algorithm used here?',
              'Explain this code line by line',
              'What does the expected output mean?',
              'How to troubleshoot runtime error?',
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => setDoubtText(chip)}
                className="text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 px-3 py-1 rounded-full border border-gray-200 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-3 max-h-80 overflow-y-auto p-4 rounded-xl bg-gray-50 border border-gray-200">
            {doubtHistory.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                No questions asked yet for this experiment. Ask any question above!
              </p>
            ) : (
              doubtHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                      msg.sender === 'student'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-xs leading-relaxed whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleAskDoubt} className="flex gap-2">
            <input
              type="text"
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              placeholder="Ask a question about this experiment..."
              className="flex-1 px-4 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Button
              type="submit"
              disabled={isAskingDoubt || !doubtText.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4"
            >
              {isAskingDoubt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      )}

      {/* TAB 8: STUDENT NOTES */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Personal Experiment Notes</h3>
              <p className="text-xs text-gray-500">
                Record your observations, hardware pin connections, edge cases, and personal tips
              </p>
            </div>
            <Button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Notes
            </Button>
          </div>

          <textarea
            rows={10}
            value={studentNotes}
            onChange={(e) => setStudentNotes(e.target.value)}
            placeholder="Type your personal observations, faculty guidance, or exam tips here..."
            className="w-full p-4 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}
