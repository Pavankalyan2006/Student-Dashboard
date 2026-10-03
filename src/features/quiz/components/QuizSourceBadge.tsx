import React from 'react';
import { QuizSourceType } from '../types/quiz';
import { BookOpen, FileText, Code2, Layers, Cpu, Compass } from 'lucide-react';

interface QuizSourceBadgeProps {
  sourceType: QuizSourceType;
  className?: string;
}

export const QuizSourceBadge: React.FC<QuizSourceBadgeProps> = ({ sourceType, className = '' }) => {
  switch (sourceType) {
    case 'COURSE':
    case 'LESSON':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 ${className}`}
        >
          <BookOpen className="w-3 h-3" />
          {sourceType === 'LESSON' ? 'Lesson Syllabus' : 'Course Module'}
        </span>
      );
    case 'NOTES':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 ${className}`}
        >
          <FileText className="w-3 h-3" />
          Revision Note
        </span>
      );
    case 'DOCUMENT':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 ${className}`}
        >
          <Layers className="w-3 h-3" />
          Document / PDF RAG
        </span>
      );
    case 'DSA':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
        >
          <Code2 className="w-3 h-3" />
          DSA Lab
        </span>
      );
    case 'MIXED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 ${className}`}
        >
          <Cpu className="w-3 h-3" />
          Mixed Curricula
        </span>
      );
    case 'TOPIC':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 ${className}`}
        >
          <Compass className="w-3 h-3" />
          Engineering Topic
        </span>
      );
  }
};
