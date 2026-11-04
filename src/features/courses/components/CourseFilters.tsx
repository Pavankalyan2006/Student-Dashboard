import * as React from 'react';
import {
  Filter,
  SlidersHorizontal,
  X,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CourseFilterParams } from '../api/coursesApi';
import { Button } from '../../../components/ui/button';

interface CourseFiltersProps {
  params: CourseFilterParams;
  onChange: (updates: Partial<CourseFilterParams>) => void;
  categories?: { branches: string[]; semesters: number[]; difficulties: string[]; categories?: string[] };
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  currentSemester?: number;
  totalResults?: number;
  currentCount?: number;
}

export function CourseFilters({
  params,
  onChange,
  categories,
  viewMode = 'grid',
  onViewModeChange,
  currentSemester,
  totalResults,
  currentCount,
}: CourseFiltersProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const branches = categories?.branches || [
    'All',
    'CSE',
    'AIML',
    'IT',
    'ECE',
    'EEE',
    'Mechanical',
    'Civil',
  ];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const catalogCategories = [
    { key: 'All', label: 'All Catalog' },
    { key: 'Programming Fundamentals', label: 'Programming' },
    { key: 'Web Development', label: 'Web Dev' },
    { key: 'Computer Science Core', label: 'CS Core' },
    { key: 'Artificial Intelligence and Machine Learning', label: 'AI & ML' },
    { key: 'Data Science and Analytics', label: 'Data Science' },
    { key: 'Cloud, DevOps, and Software Tools', label: 'Cloud & DevOps' },
    { key: 'Electronics and Communication Engineering', label: 'ECE' },
    { key: 'Electrical Engineering', label: 'EEE' },
    { key: 'Mechanical and Civil Engineering', label: 'Mech & Civil' },
    { key: 'Mathematics, Aptitude, and Career Skills', label: 'Math & Career' },
  ];

  const categoriesList = categories?.categories || [
    'All',
    'Programming Fundamentals',
    'Web Development',
    'Computer Science Core',
    'Artificial Intelligence and Machine Learning',
    'Data Science and Analytics',
    'Cloud, DevOps, and Software Tools',
    'Electronics and Communication Engineering',
    'Electrical Engineering',
    'Mechanical and Civil Engineering',
    'Mathematics, Aptitude, and Career Skills',
    'Core Subject',
    'Program Elective',
    'Open Elective',
    'Laboratory Course',
  ];

  const activeBranch = params.branch || 'All';
  const activeCategory = params.category || 'All';
  const hasActiveFilters =
    (params.branch && params.branch !== 'All') ||
    params.semester ||
    (params.difficulty && params.difficulty !== 'All') ||
    (params.category && params.category !== 'All') ||
    (params.status && params.status !== 'All') ||
    params.is_archived !== undefined ||
    params.search;

  const handleReset = () => {
    onChange({
      branch: 'All',
      semester: undefined,
      difficulty: 'All',
      category: 'All',
      status: 'All',
      is_archived: undefined,
      search: '',
      sort: 'recommended',
      page: 1,
    });
  };

  const filterControls = (
    <div className="space-y-3">
      {/* 1. Category Navigation Pills (Browse 100+ Catalog) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {catalogCategories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onChange({ category: cat.key, page: 1 })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer transition-all border ${
                isActive
                  ? 'bg-[#2563EB] text-white border-transparent shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 2. Branch Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1">Branch:</span>
        {branches.map((b) => (
          <button
            key={b}
            type="button"
            onClick={() => onChange({ branch: b, page: 1 })}
            className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 cursor-pointer transition-all border ${
              activeBranch === b
                ? 'bg-slate-900 text-white border-transparent'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {/* 2. Secondary Dropdowns & Sort Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          {/* Semester Selector */}
          <select
            value={params.semester || ''}
            onChange={(e) =>
              onChange({
                semester: e.target.value ? Number(e.target.value) : undefined,
                page: 1,
              })
            }
            aria-label="Filter by semester"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Semesters</option>
            {currentSemester && (
              <option value={currentSemester}>
                Current: Semester {currentSemester}
              </option>
            )}
            {semesters.map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>

          {/* Subject Category Selector */}
          <select
            value={params.category || 'All'}
            onChange={(e) => onChange({ category: e.target.value, page: 1 })}
            aria-label="Filter by category"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categoriesList
              .filter((c) => c !== 'All')
              .map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={params.difficulty || 'All'}
            onChange={(e) => onChange({ difficulty: e.target.value, page: 1 })}
            aria-label="Filter by difficulty"
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

          {/* Course Status Dropdown */}
          <select
            value={
              params.is_archived
                ? 'ARCHIVED'
                : params.status || 'All'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'ARCHIVED') {
                onChange({ is_archived: true, status: 'All', page: 1 });
              } else {
                onChange({ is_archived: undefined, status: val, page: 1 });
              }
            }}
            aria-label="Filter by course status"
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="ENROLLED">My Enrolled Courses</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="RECENT">Recently Studied</option>
            <option value="BOOKMARKED">Bookmarked</option>
            <option value="ARCHIVED">Archived Courses</option>
          </select>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right side: Sort order & Grid/List view switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sort:</span>
            <select
              value={params.sort || 'recommended'}
              onChange={(e) => onChange({ sort: e.target.value, page: 1 })}
              aria-label="Sort courses"
              className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="recent">Recently Accessed</option>
              <option value="name">Course Name (A-Z)</option>
              <option value="progress">Highest Progress</option>
              <option value="semester">Semester Number</option>
              <option value="duration">Estimated Hours</option>
              <option value="difficulty">Difficulty Level</option>
            </select>
          </div>

          {/* Layout Switcher (Grid vs List) */}
          {onViewModeChange && (
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                aria-label="Grid view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                aria-label="List view"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#2563EB] shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Mobile filter trigger & View Switcher */}
      <div className="flex md:hidden items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileFilterOpen(true)}
          className="gap-1.5 text-xs"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters &amp; Sort</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
          )}
        </Button>

        {onViewModeChange && (
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-slate-400'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden md:block">{filterControls}</div>

      {/* Mobile Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-full max-w-sm ml-auto h-full bg-white p-5 shadow-2xl space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Filters &amp; Sorting</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterControls}
            <div className="pt-4 flex gap-2">
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                  Reset
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
