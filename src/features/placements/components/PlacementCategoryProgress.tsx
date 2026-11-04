import React, { useState } from 'react';
import { CategoryProgressItem } from '../types/placement';
import {
  Calculator,
  BrainCircuit,
  MessageSquareText,
  Code2,
  Binary,
  Database,
  Cpu,
  Network,
  Boxes,
  ShieldCheck,
  FileQuestion,
  Terminal,
  Users,
  UserCheck,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Play,
} from 'lucide-react';

interface Props {
  categories: CategoryProgressItem[];
  onNavigate: (path: string) => void;
  onOpenGDModal: () => void;
  onOpenResumeAudit: () => void;
  onOpenAssessmentWithCategory: (category: string) => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Calculator,
  BrainCircuit,
  MessageSquareText,
  Code2,
  Binary,
  Database,
  Cpu,
  Network,
  Boxes,
  ShieldCheck,
  FileQuestion,
  Terminal,
  Users,
  UserCheck,
  Briefcase,
};

export const PlacementCategoryProgress: React.FC<Props> = ({
  categories,
  onNavigate,
  onOpenGDModal,
  onOpenResumeAudit,
  onOpenAssessmentWithCategory,
}) => {
  const [filterGroup, setFilterGroup] = useState<'ALL' | 'APTITUDE' | 'TECHNICAL' | 'INTERVIEW'>('ALL');

  const getFilteredCategories = () => {
    if (filterGroup === 'APTITUDE') {
      return categories.filter((c) => ['quant', 'lr', 'verbal'].includes(c.category_id));
    }
    if (filterGroup === 'TECHNICAL') {
      return categories.filter((c) =>
        ['prog_fundamentals', 'dsa', 'dbms_sql', 'os', 'networks', 'oop', 'software_eng', 'coding_assessments'].includes(c.category_id)
      );
    }
    if (filterGroup === 'INTERVIEW') {
      return categories.filter((c) =>
        ['tech_interviews', 'gd', 'hr_interviews', 'resume_projects'].includes(c.category_id)
      );
    }
    return categories;
  };

  const handleAction = (cat: CategoryProgressItem) => {
    if (cat.category_id === 'gd') {
      onOpenGDModal();
      return;
    }
    if (cat.category_id === 'resume_projects') {
      onOpenResumeAudit();
      return;
    }
    onNavigate(cat.route);
  };

  const filtered = getFilteredCategories();

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Section Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              15 Preparation Categories
            </h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
              {categories.filter((c) => c.status !== 'NOT_STARTED').length} / 15 Active
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Authoritative progress derived from your practice answers, coding submissions, and mock interview diagnostics.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'ALL', label: 'All 15' },
            { id: 'APTITUDE', label: 'Aptitude & Verbal' },
            { id: 'TECHNICAL', label: 'Core CS & DSA' },
            { id: 'INTERVIEW', label: 'Interviews & HR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterGroup(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterGroup === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 15 Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((cat) => {
          const IconComponent = iconMap[cat.icon] || FileQuestion;

          // Status Badge configuration
          let badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
          let badgeText = 'NOT STARTED';
          if (cat.status === 'IN_PROGRESS') {
            badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
            badgeText = 'IN PROGRESS';
          } else if (cat.status === 'MASTERED') {
            badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            badgeText = 'MASTERED';
          }

          return (
            <div
              key={cat.category_id}
              className="group border border-slate-200/90 hover:border-blue-300 rounded-2xl p-5 hover:shadow-md bg-white hover:bg-slate-50/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-100 group-hover:bg-blue-50 text-slate-700 group-hover:text-blue-600 rounded-xl transition-colors">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <span className={`inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold border rounded-md ${badgeBg}`}>
                        {badgeText}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {cat.description}
                </p>
              </div>

              {/* Bottom stats and action button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xs">
                  {cat.status === 'NOT_STARTED' ? (
                    <span className="text-slate-400 font-medium">No activity yet</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {cat.completed_count} {cat.completed_count === 1 ? 'item' : 'items'}
                      </span>
                      {cat.accuracy_percentage !== null && (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                          {cat.accuracy_percentage}% acc
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAction(cat)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 group-hover:bg-blue-600 text-slate-700 group-hover:text-white rounded-lg text-xs font-semibold transition-all shadow-none group-hover:shadow-sm"
                >
                  <span>Open</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
