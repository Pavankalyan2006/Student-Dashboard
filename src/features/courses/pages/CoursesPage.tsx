import * as React from 'react';
import {
  BookOpen,
  Sparkles,
  Compass,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  GraduationCap,
} from 'lucide-react';
import {
  PageContainer,
  PageHeader,
  EmptyState,
  LoadingState,
  ErrorState,
} from '../../../components/layout/PageComponents';
import { useCourses } from '../hooks/useCourses';
import { CourseFilterParams } from '../api/coursesApi';
import { CourseCard } from '../components/CourseCard';
import { CourseFilters } from '../components/CourseFilters';
import { CourseSearch } from '../components/CourseSearch';
import { AddCourseModal } from '../components/AddCourseModal';
import { EditCourseModal } from '../components/EditCourseModal';
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../../hooks/useAuth';
import { CourseCardData } from '../types/courses';

export function CoursesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { student } = useAuth();

  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingCourse, setEditingCourse] = React.useState<CourseCardData | null>(null);

  const [filters, setFilters] = React.useState<CourseFilterParams>({
    branch: 'All',
    difficulty: 'All',
    category: 'All',
    status: 'All',
    sort: 'recommended',
    page: 1,
    limit: 12,
  });

  const {
    courses,
    total,
    page,
    totalPages,
    categories,
    isLoading,
    isError,
    error,
    refetch,
    enrollCourse,
    unenrollCourse,
    toggleBookmark,
    archiveCourse,
    removeCourse,
  } = useCourses(filters);

  const handleFilterChange = (updates: Partial<CourseFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  // Quick stats derived from loaded list & student profile
  const enrolledCourses = courses.filter((c) => c.is_enrolled && !c.is_archived);
  const inProgressCourses = enrolledCourses.filter((c) => (c.progress_percentage || 0) < 100);
  const completedCourses = enrolledCourses.filter((c) => (c.progress_percentage || 0) >= 100);

  // Dynamic academic badge
  const studentBranch = student?.branch || 'CSE';
  const studentSem = student?.semester || 6;
  const studentYear = Math.ceil(studentSem / 2);
  const academicYearStr = (student as any)?.academic_year || '2025-2026';

  const isEnrolledOnly = filters.status === 'ENROLLED';

  return (
    <PageContainer className="space-y-8">
      {/* 1. Header with Title, Dynamic Student Profile & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title="Courses"
          description="Explore over 100 structured engineering courses, track modular progress, and access AI-assisted curricula."
          badge={
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-200">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>
                B.Tech {studentBranch} · Year {studentYear} · Sem {studentSem} ({academicYearStr})
              </span>
            </span>
          }
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <CourseSearch
            value={filters.search || ''}
            onChange={(search) => handleFilterChange({ search, page: 1 })}
          />

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Button
              variant={!isEnrolledOnly ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange({ status: 'All', page: 1 })}
              className="text-xs font-semibold h-7 px-2.5"
            >
              Full Catalog
            </Button>
            <Button
              variant={isEnrolledOnly ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleFilterChange({ status: 'ENROLLED', page: 1 })}
              className="text-xs font-semibold h-7 px-2.5"
            >
              Enrolled Courses
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5 text-xs font-semibold shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Course</span>
          </Button>
        </div>
      </div>

      {/* 2. Quick Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => handleFilterChange({ status: 'ENROLLED', page: 1 })}
          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-blue-400 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Enrolled Subjects</span>
            <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {enrolledCourses.length}
          </div>
        </div>

        <div
          onClick={() => handleFilterChange({ status: 'IN_PROGRESS', page: 1 })}
          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-amber-400 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>In Progress</span>
            <Clock className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {inProgressCourses.length}
          </div>
        </div>

        <div
          onClick={() => handleFilterChange({ status: 'COMPLETED', page: 1 })}
          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-emerald-400 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Completed</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">
            {completedCourses.length}
          </div>
        </div>

        <div
          onClick={() => handleFilterChange({ status: 'All', category: 'All', branch: 'All', page: 1 })}
          className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 hover:border-blue-400 cursor-pointer transition-all shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Catalog Total</span>
            <Layers className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{total}</div>
        </div>
      </div>

      {/* 3. Filters, Sorting & Layout Switcher */}
      <CourseFilters
        params={filters}
        onChange={handleFilterChange}
        categories={categories}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentSemester={studentSem}
        totalResults={total}
        currentCount={courses.length}
      />

      {/* 4. Main Content Area */}
      {isLoading ? (
        <LoadingState message="Loading curriculum catalog and enrolled courses..." />
      ) : isError ? (
        <ErrorState
          title="Failed to load courses"
          message={(error as any)?.message || 'Unable to retrieve courses from server.'}
          onRetry={() => refetch()}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          title={filters.search ? 'No matching courses found' : 'No courses in this category'}
          description={
            filters.search
              ? `No subjects matched "${filters.search}". Try adjusting keywords, subject codes, or branch filters.`
              : 'Add an academic subject from your semester curriculum or create a custom course.'
          }
          actionText={filters.search ? 'Reset All Filters' : 'Add Course'}
          onAction={
            filters.search
              ? () =>
                  setFilters({
                    branch: 'All',
                    difficulty: 'All',
                    category: 'All',
                    status: 'All',
                    search: '',
                    page: 1,
                  })
              : () => setIsAddModalOpen(true)
          }
        />
      ) : (
        <div className="space-y-10">
          {/* Section: Continue Learning (Only when not searching or specific filters) */}
          {enrolledCourses.length > 0 &&
            !filters.search &&
            filters.branch === 'All' &&
            filters.status === 'All' &&
            filters.page === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-[#2563EB]" />
                    <h2 className="text-base font-bold text-[#101828]">Continue Learning</h2>
                  </div>
                  <span className="text-xs text-[#667085] font-medium">
                    {enrolledCourses.length} Enrolled in Workspace
                  </span>
                </div>

                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
                      : 'space-y-3'
                  }
                >
                  {enrolledCourses.map((course) => (
                    <CourseCard
                      key={`enrolled_${course.id}`}
                      course={course}
                      onNavigate={onNavigate}
                      onEnroll={enrollCourse}
                      onToggleBookmark={toggleBookmark}
                      onEditCourse={(c) => setEditingCourse(c)}
                      onArchiveCourse={archiveCourse}
                      onRemoveCourse={removeCourse}
                      layout={viewMode}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Section: All Courses / Search Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#101828]">
                  {filters.search
                    ? `Search Results for "${filters.search}"`
                    : filters.status === 'ARCHIVED'
                    ? 'Archived Courses'
                    : 'Engineering Curriculum Courses'}
                </h2>
              </div>
              <span className="text-xs text-[#667085] tabular-nums font-medium">
                Showing {courses.length} of {total} courses
              </span>
            </div>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                  : 'space-y-3'
              }
            >
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNavigate={onNavigate}
                  onEnroll={enrollCourse}
                  onToggleBookmark={toggleBookmark}
                  onEditCourse={(c) => setEditingCourse(c)}
                  onArchiveCourse={archiveCourse}
                  onRemoveCourse={removeCourse}
                  layout={viewMode}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handleFilterChange({ page: page - 1 })}
                >
                  Previous Page
                </Button>
                <span className="text-xs font-semibold text-slate-700 tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handleFilterChange({ page: page + 1 })}
                >
                  Next Page
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Course Creation & Enrollment Modal */}
      <AddCourseModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onNavigate={onNavigate}
        onCourseCreated={() => refetch()}
      />

      {/* 6. Course Edit Modal */}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          open={!!editingCourse}
          onOpenChange={(open) => !open && setEditingCourse(null)}
          onUpdated={() => refetch()}
        />
      )}
    </PageContainer>
  );
}
