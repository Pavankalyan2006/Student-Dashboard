import * as React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Play,
  ArrowRight,
  Clock,
  Sparkles,
  Award,
  Layers,
  FileCheck,
} from 'lucide-react';
import { PageContainer, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { useCourse } from '../hooks/useCourse';
import { CourseHero } from '../components/CourseHero';
import { CourseResources } from '../components/CourseResources';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { useUiStore } from '../../../store/uiStore';

export function CourseDetailPage({
  courseId,
  onNavigate,
}: {
  courseId: string;
  onNavigate: (path: string) => void;
}) {
  const { course, isLoading, isError, error, refetch, enroll, toggleBookmark } = useCourse(courseId);
  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading course syllabus..." />
      </PageContainer>
    );
  }

  if (isError || !course) {
    return (
      <PageContainer>
        <ErrorState
          title="Course not found"
          message={(error as any)?.message || 'The requested course does not exist.'}
          onRetry={() => refetch()}
        />
      </PageContainer>
    );
  }

  const handleAskAI = (topic: string) => {
    setAiInitialPrompt(`Explain "${topic}" from the ${course.title} (${course.code}) syllabus with examples.`);
    onNavigate('/ai-agent');
  };

  return (
    <PageContainer className="space-y-8">
      {/* 1. Hero Section */}
      <CourseHero
        course={course}
        onNavigate={onNavigate}
        onEnroll={enroll}
        onToggleBookmark={toggleBookmark}
      />

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Syllabus Content & Learning Outcomes (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* What you will learn */}
          <Card className="border border-[#E4E7EC] bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#101828] flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-[#2563EB]" />
              <span>What You Will Learn in This Course</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              {course.skills.map((skill, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Syllabus Chapter Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#101828]">Course Curriculum &amp; Chapters</h3>
              </div>
              <span className="text-xs text-[#667085] tabular-nums">
                {course.chapters.length} Modules · {course.total_lessons} Lessons
              </span>
            </div>

            <div className="space-y-3">
              {course.chapters.map((chapter, chIdx) => (
                <Card key={chapter.id} className="border border-[#E4E7EC] bg-white overflow-hidden">
                  <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Module 0{chIdx + 1}
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                        {chapter.title}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {chapter.lessons.length} lessons
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {chapter.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        onClick={() => onNavigate(`/courses/${course.id}/learn/${lesson.id}`)}
                        className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between cursor-pointer group text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {lesson.is_completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100 shrink-0" />
                          ) : (
                            <Play className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate block">
                              {lesson.title}
                            </span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">
                              {lesson.description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono text-slate-400">
                            {lesson.estimated_minutes} min
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Rail Column (1 col) */}
        <div className="space-y-6">
          {/* Prerequisites */}
          <Card className="border border-[#E4E7EC] bg-white p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Prerequisites
            </h4>
            <div className="space-y-1.5">
              {course.prerequisites.length === 0 ? (
                <p className="text-xs text-slate-500">No prior prerequisites required.</p>
              ) : (
                course.prerequisites.map((prereq, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-800"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{prereq}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* AI Learning Assistant Banner */}
          <Card className="border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-blue-50/40 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-indigo-950">
              <Sparkles className="h-4 w-4 text-[#4F46E5]" />
              <span>Ask AI About This Course</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Need exam prep, quick revision, or code debugging for {course.code}? Consult the AI agent with real course context.
            </p>
            <Button
              variant="ai"
              size="sm"
              onClick={() => handleAskAI(course.title)}
              className="w-full gap-1.5 text-xs shadow-xs"
            >
              <span>Consult AI Agent</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          {/* Downloadable Resources */}
          <CourseResources resources={course.resources} onNavigate={onNavigate} />

          {/* Related Courses */}
          {course.related_courses && course.related_courses.length > 0 && (
            <Card className="border border-[#E4E7EC] bg-white p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Related Engineering Subjects
              </h4>
              <div className="space-y-2">
                {course.related_courses.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onNavigate(`/courses/${rel.id}`)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer text-xs group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-mono font-bold text-[#2563EB]">{rel.code}</span>
                      <span>{rel.difficulty}</span>
                    </div>
                    <div className="font-semibold text-slate-900 group-hover:text-[#2563EB] transition-colors truncate">
                      {rel.title}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
