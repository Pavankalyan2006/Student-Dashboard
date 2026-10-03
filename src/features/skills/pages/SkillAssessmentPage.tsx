import React, { useEffect, useState } from 'react';
import { skillsApi, Skill, SkillAssessment } from '../api/skillsApi';
import {
  Sparkles,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface SkillAssessmentPageProps {
  onNavigate: (path: string) => void;
  initialSkillId?: string;
}

export const SkillAssessmentPage: React.FC<SkillAssessmentPageProps> = ({
  onNavigate,
  initialSkillId,
}) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState(initialSkillId || 'sk_sql');
  const [difficulty, setDifficulty] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('INTERMEDIATE');

  // Active assessment session
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState<any>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const list = await skillsApi.listSkills();
        setSkills(list);
        if (initialSkillId) {
          const match = list.find(
            (s) => s.id === initialSkillId || s.name.toLowerCase() === initialSkillId.toLowerCase()
          );
          if (match) {
            setSelectedSkillId(match.id);
          } else {
            setSelectedSkillId(initialSkillId);
          }
        } else if (list.length > 0) {
          setSelectedSkillId(list[0].id);
        }
      } catch {
        toast.error('Failed to load skills');
      }
    };
    fetchCatalog();
  }, [initialSkillId]);

  const handleStart = async () => {
    try {
      setIsStarting(true);
      const res = await skillsApi.startAssessment(selectedSkillId, difficulty, 5);
      setAssessment(res.assessment);
      setQuestions(res.questions);
      setCurrentQIndex(0);
      setAnswers({});
      setCompletedResult(null);
      toast.success('Skill assessment started');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start assessment');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectOption = (qId: string, optIdx: number) => {
    setAnswers({
      ...answers,
      [qId]: optIdx,
    });
  };

  const handleFinishAssessment = async () => {
    if (!assessment) return;
    try {
      setIsSubmitting(true);

      // Submit each answer
      for (const q of questions) {
        if (answers[q.id] !== undefined) {
          await skillsApi.submitAnswer(assessment.id, q.id, Number(answers[q.id]));
        }
      }

      // Complete attempt and record evidence
      const finalRes = await skillsApi.completeAssessment(assessment.id);
      setCompletedResult(finalRes);
      toast.success('Assessment completed! Evidence recorded.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to finish assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeQ = questions[currentQIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
        <button
          onClick={() => onNavigate('/skills')}
          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Skill Assessment
          </h1>
          <p className="text-xs text-slate-500">
            Diagnostic technical testing powered by the platform assessment engine. Scores directly reinforce verified profile evidence.
          </p>
        </div>
      </div>

      {!assessment && !completedResult && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Configure Diagnostic Test
            </h2>
            <p className="text-xs text-slate-500">
              Select a core competency to evaluate. Successfully completed assessments earn Verified evidence badges.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Choose Skill
              </label>
              <select
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {skills.map((sk) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.name} ({sk.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Evaluation Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 text-xs font-semibold rounded-lg border transition ${
                      difficulty === lvl
                        ? 'border-purple-600 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>
              Evidence Retention Guarantee: An incorrect test answer will NEVER erase previous verified coursework or project achievements. Evidence accumulates cumulatively.
            </span>
          </div>

          <button
            onClick={handleStart}
            disabled={isStarting}
            className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Sparkles className="h-4 w-4" />
            {isStarting ? 'Preparing Assessment...' : 'Start Assessment'}
          </button>
        </div>
      )}

      {/* Active Question Player */}
      {assessment && !completedResult && activeQ && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {assessment.title}
              </h2>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {Object.keys(answers).length} / {questions.length} answered
            </span>
          </div>

          <div className="text-sm text-slate-900 dark:text-slate-100 font-medium leading-relaxed">
            {activeQ.question_text}
          </div>

          {/* Options */}
          {activeQ.options && (
            <div className="space-y-2">
              {activeQ.options.map((opt: string, optIdx: number) => {
                const isSelected = answers[activeQ.id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(activeQ.id, optIdx)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-30"
            >
              Previous
            </button>

            {currentQIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQIndex(currentQIndex + 1)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                Next <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishAssessment}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Result Card */}
      {completedResult && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 text-center">
          <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Assessment Completed!
            </h2>
            <p className="text-xs text-slate-500">
              Score: <strong className="text-slate-800 dark:text-slate-200">{completedResult.assessment.score}%</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 max-w-md mx-auto text-xs text-slate-600 dark:text-slate-400 space-y-2">
            <span className="font-semibold text-slate-900 dark:text-white block">
              Skill Evidence Logged:
            </span>
            <p>{completedResult.evidence.description}</p>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                setAssessment(null);
                setCompletedResult(null);
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Take Another Test
            </button>
            <button
              onClick={() => onNavigate('/skills')}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
            >
              View Updated Skill Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
