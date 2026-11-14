// src/features/gate/components/GatePaperSelectorModal.tsx
import React, { useState } from 'react';
import { GatePaper, GateStudentProfile } from '../types/gateTypes';
import { X, Check, BookOpen, Calendar, Target, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';

interface GatePaperSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: GatePaper[];
  currentProfile: GateStudentProfile | null;
  onSave: (updates: Partial<GateStudentProfile>) => Promise<void>;
}

export const GatePaperSelectorModal: React.FC<GatePaperSelectorModalProps> = ({
  isOpen,
  onClose,
  papers,
  currentProfile,
  onSave,
}) => {
  const [selectedPaper, setSelectedPaper] = useState<string>(currentProfile?.target_paper || 'CS');
  const [examCycle, setExamCycle] = useState<string>(currentProfile?.exam_cycle || 'GATE 2026');
  const [targetDate, setTargetDate] = useState<string>(currentProfile?.target_date || '2026-02-07');
  const [targetScore, setTargetScore] = useState<number>(currentProfile?.target_score || 75);
  const [airGoal, setAirGoal] = useState<string>(currentProfile?.air_goal || '< 500');
  const [weeklyHours, setWeeklyHours] = useState<number>(currentProfile?.weekly_study_hours || 20);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        target_paper: selectedPaper,
        exam_cycle: examCycle,
        target_date: targetDate,
        target_score: Number(targetScore),
        air_goal: airGoal,
        weekly_study_hours: Number(weeklyHours),
        onboarding_completed: true,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Configure Target GATE Paper & Goals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your academic discipline, target exam cycle, and personalized score target.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Paper Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Select GATE Discipline / Paper
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {papers.map((p) => {
                const isSelected = selectedPaper === p.code;
                return (
                  <div
                    key={p.code}
                    onClick={() => setSelectedPaper(p.code)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-slate-900 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-indigo-700">[{p.code}]</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <div className="font-medium text-xs mt-1 text-slate-900">{p.name}</div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exam Cycle & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Exam Cycle
              </label>
              <select
                value={examCycle}
                onChange={(e) => setExamCycle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="GATE 2026">GATE 2026 (Upcoming February)</option>
                <option value="GATE 2025">GATE 2025 (Official Cycle)</option>
                <option value="GATE 2027">GATE 2027 (Long-Term Prep)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Target Exam Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Official GATE typically takes place on the 1st/2nd weekend of February.
              </span>
            </div>
          </div>

          {/* Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                Target Marks (out of 100)
              </label>
              <input
                type="number"
                min="30"
                max="100"
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-purple-600" />
                All India Rank Goal
              </label>
              <select
                value={airGoal}
                onChange={(e) => setAirGoal(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
              >
                <option value="< 100">AIR &lt; 100 (Top PSU / IISc / IITB)</option>
                <option value="< 500">AIR &lt; 500 (Old IITs Direct Admission)</option>
                <option value="< 1000">AIR &lt; 1000 (Top NITs / Newer IITs)</option>
                <option value="< 2500">AIR &lt; 2500 (Qualifying / CCMT)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Weekly Study Hours
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} size="sm" className="border-slate-200 text-slate-700">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? 'Saving...' : 'Save & Update Syllabus'}
          </Button>
        </div>
      </div>
    </div>
  );
};
