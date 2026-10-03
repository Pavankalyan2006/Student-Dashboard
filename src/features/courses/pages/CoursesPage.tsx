import * as React from 'react';
import { BookOpen, Sparkles, Compass, ArrowRight } from 'lucide-react';
import { PageContainer, PageHeader, EmptyState, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { useCourses } from '../hooks/useCourses';
import { CourseFilterParams } from '../api/coursesApi';
import { CourseCard } from '../components/CourseCard';
import { CourseFilters } from '../components/CourseFilters';
import { CourseSearch } from '../components/CourseSearch';
import { Button } from '../../../components/ui/button';

export function CoursesPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [filters, setFilters] = React.useState<CourseFilterParams>({
    branch: 'All',
    difficulty: 'All',
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
    toggleBookmark,
  } = useCourses(filters);

  const handleFilterChange = (updates: Partial<CourseFilterParams>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const enrolledCourses = courses.filter((c) => c.is_enrolled);
  const featuredCourses = courses.slice(0, 3);

  return (
    <PageContainer className="space-y-8">
      {/* Header with Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="B.Tech Coursework & Syllabus"
          description="Explore core engineering modules, lecture notes, algorithm labs, and degree curriculum."
          badge={
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
              Semester 1-8 Catalogue
            </span>
          }
        />
        <CourseSearch
          value={filters.search || ''}
          onChange={(search) => handleFilterChange({ search, page: 1 })}
        />
      </div>

      {/* Filter Pills & Dropdowns */}
      <CourseFilters
        params={filters}
        onChange={handleFilterChange}
        categories={categories}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Loading curriculum catalog..." />
      ) : isError ? (
        <ErrorState
          title="Failed to load course catalogue"
          message={(error as any)?.message || 'Unable to retrieve courses from server.'}
          onRetry={() => refetch()}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          title="No courses found"
          description="Try adjusting your branch filter or search keywords to explore other subjects."
          actionText="Reset Filters"
          onAction={() => setFilters({ branch: 'All', difficulty: 'All', page: 1 })}
        />
      ) : (
        <div className="space-y-10">
          {/* Section: In Progress / Continue Learning */}
          {enrolledCourses.length > 0 && !filters.search && filters.branch === 'All' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#2563EB]" />
                  <h2 className="text-base font-bold text-[#101828]">Continue Learning</h2>
                </div>
                <span className="text-xs text-[#667085]">{enrolledCourses.length} Enrolled</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrolledCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onNavigate={onNavigate}
                    onEnroll={enrollCourse}
                    onToggleBookmark={toggleBookmark}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: All Courses Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#2563EB]" />
                <h2 className="text-base font-bold text-[#101828]">
                  {filters.search ? `Search Results (${total})` : 'All Engineering Courses'}
                </h2>
              </div>
              <span className="text-xs text-[#667085] tabular-nums">
                Showing {courses.length} of {total} courses
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onNavigate={onNavigate}
                  onEnroll={enrollCourse}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>

            {/* Pagination */}
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
    </PageContainer>
  );
}
