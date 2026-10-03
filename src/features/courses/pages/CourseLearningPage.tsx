import * as React from 'react';
import { PanelLeft, PanelRight, Sparkles, BookOpen } from 'lucide-react';
import { useCourse } from '../hooks/useCourse';
import { useLesson } from '../hooks/useLesson';
import { LessonNavigation } from '../components/LessonNavigation';
import { LessonContent } from '../components/LessonContent';
import { CourseAIActions } from '../components/CourseAIActions';
import { LoadingState, ErrorState } from '../../../components/layout/PageComponents';

export function CourseLearningPage({
  courseId,
  lessonId: initialLessonId,
  onNavigate,
}: {
  courseId: string;
  lessonId?: string;
  onNavigate: (path: string) => void;
}) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileAiOpen, setMobileAiOpen] = React.useState(false);

  const { course, isLoading: isLoadingCourse, isError: isCourseError } = useCourse(courseId);

  // Determine active lesson ID
  const activeLessonId = React.useMemo(() => {
    if (initialLessonId) return initialLessonId;
    if (!course) return undefined;

    // Find first uncompleted lesson, or fallback to first lesson
    for (const ch of course.chapters) {
      for (const l of ch.lessons) {
        if (!l.is_completed) return l.id;
      }
    }
    return course.chapters[0]?.lessons[0]?.id;
  }, [course, initialLessonId]);

  const {
    lesson,
    isLoading: isLoadingLesson,
    isError: isLessonError,
    completeLesson,
    isCompleting,
  } = useLesson(activeLessonId || '', (nextLessonId) => {
    if (nextLessonId) {
      onNavigate(`/courses/${courseId}/learn/${nextLessonId}`);
    }
  });

  if (isLoadingCourse || (activeLessonId && isLoadingLesson)) {
    return (
      <div className="h-[calc(100vh-4.5rem)] flex items-center justify-center bg-white rounded-2xl border border-[#E4E7EC]">
        <LoadingState message="Preparing your lesson environment..." />
      </div>
    );
  }

  if (isCourseError || !course) {
    return (
      <div className="h-[calc(100vh-4.5rem)] p-6 bg-white rounded-2xl border border-[#E4E7EC]">
        <ErrorState
          title="Course not found"
          message="Unable to load the requested course."
          onRetry={() => onNavigate('/courses')}
        />
      </div>
    );
  }

  if (!activeLessonId || !lesson) {
    return (
      <div className="h-[calc(100vh-4.5rem)] p-6 bg-white rounded-2xl border border-[#E4E7EC]">
        <ErrorState
          title="Lesson not found"
          message="No active lesson could be found for this module."
          onRetry={() => onNavigate(`/courses/${courseId}`)}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4.5rem)] flex rounded-2xl border border-[#E4E7EC] bg-white overflow-hidden shadow-xs relative">
      {/* 1. Left Sidebar: Lesson Navigation (280px on desktop) */}
      <div className="hidden md:block w-72 shrink-0 h-full">
        <LessonNavigation
          courseTitle={course.title}
          courseCode={course.code}
          courseId={course.id}
          chapters={course.chapters}
          currentLessonId={activeLessonId}
          onSelectLesson={(id) => onNavigate(`/courses/${courseId}/learn/${id}`)}
          onBackToCourse={() => onNavigate(`/courses/${courseId}`)}
        />
      </div>

      {/* 2. Center: Reading Canvas */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Mobile controls bar */}
        <div className="flex md:hidden items-center justify-between p-2.5 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700"
          >
            <PanelLeft className="h-3.5 w-3.5" />
            <span>Syllabus</span>
          </button>
          <button
            onClick={() => setMobileAiOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
            <span>AI Actions</span>
          </button>
        </div>

        <LessonContent
          lesson={lesson}
          onComplete={completeLesson}
          isCompleting={isCompleting}
          onNavigateLesson={(id) => onNavigate(`/courses/${courseId}/learn/${id}`)}
          onOpenAI={() => setMobileAiOpen(true)}
        />
      </div>

      {/* 3. Right Sidebar: AI Actions (280px on desktop) */}
      <div className="hidden lg:block w-72 shrink-0 h-full">
        <CourseAIActions
          courseTitle={course.title}
          lessonTitle={lesson.title}
          courseId={course.id}
          lessonId={lesson.id}
          onNavigate={onNavigate}
        />
      </div>

      {/* Mobile Drawer: Lesson Navigation */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white z-10 shadow-2xl">
            <LessonNavigation
              courseTitle={course.title}
              courseCode={course.code}
              courseId={course.id}
              chapters={course.chapters}
              currentLessonId={activeLessonId}
              onSelectLesson={(id) => onNavigate(`/courses/${courseId}/learn/${id}`)}
              onBackToCourse={() => onNavigate(`/courses/${courseId}`)}
              onCloseMobile={() => setMobileNavOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer: Course AI Actions */}
      {mobileAiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileAiOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-white z-10 shadow-2xl">
            <CourseAIActions
              courseTitle={course.title}
              lessonTitle={lesson.title}
              courseId={course.id}
              lessonId={lesson.id}
              onNavigate={onNavigate}
              onClose={() => setMobileAiOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
