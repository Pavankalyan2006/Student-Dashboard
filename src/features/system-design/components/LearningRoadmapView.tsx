// src/features/system-design/components/LearningRoadmapView.tsx
// 5-Level Progressive Learning Curriculum with Completion Badges and Knowledge Checks

import * as React from 'react';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronRight,
  Sparkles,
  Lock,
  Layers,
  Award
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { SystemDesignLesson } from '../types/systemDesign';

interface LearningRoadmapViewProps {
  roadmap: any;
  onSelectLesson: (lesson: SystemDesignLesson) => void;
}

export function LearningRoadmapView({ roadmap, onSelectLesson }: LearningRoadmapViewProps) {
  const [selectedLevel, setSelectedLevel] = React.useState<number>(1);

  if (!roadmap || !roadmap.levels) {
    return (
      <div className="p-8 text-center text-slate-400">
        <BookOpen className="w-8 h-8 mx-auto mb-2 text-indigo-400 animate-pulse" />
        Loading curriculum roadmap...
      </div>
    );
  }

  const currentLevelInfo = roadmap.levels.find((l: any) => l.level === selectedLevel) || roadmap.levels[0];

  return (
    <div className="space-y-6">
      {/* Top Progress Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Structured Engineering Path
              </span>
              <span className="text-xs text-slate-400">69 Lessons across 5 Mastery Levels</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Design Curriculum Roadmap</h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              From single-server client-server foundations to high-throughput multi-region distributed architectures and FAANG interview methodologies.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 min-w-[200px] text-center shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Curriculum Completion</div>
            <div className="text-3xl font-extrabold text-indigo-400 mt-1">
              {roadmap.overall_progress_percentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {roadmap.completed_lessons_count} of {roadmap.total_lessons_count} Lessons Passed
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${roadmap.overall_progress_percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5 Levels Selector Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {roadmap.levels.map((lvl: any) => {
          const isSelected = lvl.level === selectedLevel;
          const isComplete = lvl.is_completed;
          return (
            <button
              key={lvl.level}
              onClick={() => setSelectedLevel(lvl.level)}
              className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
                  Level {lvl.level}
                </span>
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[11px] font-mono text-slate-400">
                    {lvl.completed_lessons}/{lvl.total_lessons}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-100">{lvl.name}</div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{lvl.tagline}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Level Content & Lessons List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Level {currentLevelInfo.level}: {currentLevelInfo.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{currentLevelInfo.description}</p>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {currentLevelInfo.lessons?.length || 0} Lessons in this module
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {currentLevelInfo.lessons?.map((lesson: any) => {
            const isCompleted = lesson.is_completed;
            return (
              <div
                key={lesson.id}
                onClick={() => onSelectLesson(lesson)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-slate-900 border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      #{lesson.order_index}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed ({lesson.quiz_score || 100}%)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        {lesson.estimated_minutes} min
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {lesson.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>{isCompleted ? 'Review Lesson' : 'Start Lesson'}</span>
                  <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
