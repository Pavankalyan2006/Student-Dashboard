import * as React from 'react';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { CourseFilterParams } from '../api/coursesApi';
import { Button } from '../../../components/ui/button';

export function CourseFilters({
  params,
  onChange,
  categories,
}: {
  params: CourseFilterParams;
  onChange: (updates: Partial<CourseFilterParams>) => void;
  categories?: { branches: string[]; semesters: number[]; difficulties: string[] };
}) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const branches = categories?.branches || ['All', 'CSE', 'AIML', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const activeBranch = params.branch || 'All';

  const filterContent = (
    <div className="space-y-4">
      {/* Branch Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {branches.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange({ branch: b, page: 1 })}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all border ${
              activeBranch === b
                ? 'bg-[#2563EB] text-white border-transparent shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* Secondary dropdown row: Semester, Difficulty, Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Dropdown */}
          <select
            value={params.semester || ''}
            onChange={(e) =>
              onChange({
                semester: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Semesters</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={params.difficulty || 'All'}
            onChange={(e) => onChange({ difficulty: e.target.value, page: 1 })}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Difficulties</option>
            {difficulties
              .filter((d) => d !== 'All')
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Sort by:</span>
          <select
            value={params.sort || 'recommended'}
            onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Recently Added</option>
            <option value="duration">Estimated Hours</option>
            <option value="difficulty">Difficulty Level</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Mobile filter trigger */}
      <div className="flex md:hidden items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileFilterOpen(true)}
          className="gap-1.5 text-xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters &amp; Sorting</span>
        </Button>
      </div>

      {/* Desktop filters */}
      <div className="hidden md:block">{filterContent}</div>

      {/* Mobile Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-sm ml-auto h-full bg-white p-5 shadow-2xl space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Course Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setMobileFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
