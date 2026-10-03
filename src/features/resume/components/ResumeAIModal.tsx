import React, { useState } from 'react';
import { resumeApi } from '../api/resumeApi';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface ResumeAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
  initialMode?: 'SUMMARY' | 'BULLET' | 'IMPROVE';
  initialText?: string;
  targetRole?: string;
  onApply: (appliedText: string) => void;
}

export const ResumeAIModal: React.FC<ResumeAIModalProps> = ({
  isOpen,
  onClose,
  resumeId,
  initialMode = 'SUMMARY',
  initialText = '',
  targetRole = 'Software Engineer',
  onApply,
}) => {
  const [mode, setMode] = useState<'SUMMARY' | 'BULLET' | 'IMPROVE'>(initialMode);
  const [role, setRole] = useState(targetRole);

  // Bullet form state
  const [bulletTask, setBulletTask] = useState('');
  const [bulletTech, setBulletTech] = useState('');
  const [bulletOutcome, setBulletOutcome] = useState('');

  // Improve form state
  const [improveText, setImproveText] = useState(initialText);
  const [improvementType, setImprovementType] = useState<'TECHNICAL' | 'CONCISE' | 'ACHIEVEMENT' | 'GRAMMAR'>('TECHNICAL');

  // Results
  const [isLoading, setIsLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    text: string;
    rationale?: string;
    current?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    try {
      setIsLoading(true);
      const res = await resumeApi.generateAISummary(resumeId, { target_role: role });
      setGeneratedResult({
        text: res.summary,
        rationale: res.rationale,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBullet = async () => {
    if (!bulletTask.trim()) {
      toast.error('Please describe the task or engineering contribution');
      return;
    }

    try {
      setIsLoading(true);
      const res = await resumeApi.generateAIBullet(resumeId, {
        task: bulletTask,
        technology: bulletTech,
        outcome: bulletOutcome,
      });
      setGeneratedResult({
        text: res.bullet,
        rationale: `Formula applied: ${res.formula_breakdown}`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate bullet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!improveText.trim()) {
      toast.error('Please enter the text you wish to improve');
      return;
    }

    try {
      setIsLoading(true);
      const res = await resumeApi.improveWording(resumeId, {
        current_text: improveText,
        improvement_type: improvementType,
        target_role: role,
      });
      setGeneratedResult({
        current: res.current,
        text: res.suggested,
        rationale: res.reason,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to improve wording');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (generatedResult?.text) {
      onApply(generatedResult.text);
      toast.success('Applied to resume!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Resume Assistant</h3>
              <p className="text-[11px] text-slate-500">Generate or refine factual, ATS-friendly phrasing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 pt-2">
          <button
            onClick={() => {
              setMode('SUMMARY');
              setGeneratedResult(null);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              mode === 'SUMMARY'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Professional Summary
          </button>
          <button
            onClick={() => {
              setMode('BULLET');
              setGeneratedResult(null);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              mode === 'BULLET'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Action Bullet Generator
          </button>
          <button
            onClick={() => {
              setMode('IMPROVE');
              setGeneratedResult(null);
            }}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              mode === 'IMPROVE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Improve Phrasing
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mode === 'SUMMARY' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Engineering Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs border border-blue-200 dark:border-blue-900/40">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  The AI uses strictly verified profile courses and project builders. It will NOT invent employment or fake metrics.
                </span>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {isLoading ? 'Synthesizing...' : 'Generate Factual Summary'}
              </button>
            </div>
          )}

          {mode === 'BULLET' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  What did you build or engineer? *
                </label>
                <textarea
                  rows={2}
                  value={bulletTask}
                  onChange={(e) => setBulletTask(e.target.value)}
                  placeholder="e.g. designed database schemas and built authentication routes"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Technology Used
                  </label>
                  <input
                    type="text"
                    value={bulletTech}
                    onChange={(e) => setBulletTech(e.target.value)}
                    placeholder="e.g. PostgreSQL, JWT, FastAPI"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Outcome (Optional - only if verified)
                  </label>
                  <input
                    type="text"
                    value={bulletOutcome}
                    onChange={(e) => setBulletOutcome(e.target.value)}
                    placeholder="e.g. achieve sub-50ms token validation"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={handleGenerateBullet}
                disabled={isLoading || !bulletTask.trim()}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {isLoading ? 'Structuring...' : 'Generate Action Bullet'}
              </button>
            </div>
          )}

          {mode === 'IMPROVE' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Text to Refine *
                </label>
                <textarea
                  rows={3}
                  value={improveText}
                  onChange={(e) => setImproveText(e.target.value)}
                  placeholder="Paste a resume bullet or sentence..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Improvement Direction
                </label>
                <select
                  value={improvementType}
                  onChange={(e) => setImprovementType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="TECHNICAL">More Technical (Industry nomenclature)</option>
                  <option value="CONCISE">Make Concise (Cut wordy fluff)</option>
                  <option value="ACHIEVEMENT">Achievement & Action-oriented</option>
                  <option value="GRAMMAR">Fix Grammar & Flow</option>
                </select>
              </div>
              <button
                onClick={handleImprove}
                disabled={isLoading || !improveText.trim()}
                className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {isLoading ? 'Refining...' : 'Improve Wording'}
              </button>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Suggested Result
                </span>
                {generatedResult.rationale && (
                  <span className="text-[11px] text-slate-500 font-medium">
                    {generatedResult.rationale}
                  </span>
                )}
              </div>

              {generatedResult.current && (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Original: </span>
                  {generatedResult.current}
                </div>
              )}

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
                {generatedResult.text}
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={handleApplyClick}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition"
                >
                  <Check className="h-3.5 w-3.5" />
                  Apply This to Resume
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
