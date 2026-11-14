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
  Plus,
  HelpCircle,
  Code2,
  FileQuestion,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { PageContainer, LoadingState, ErrorState } from '../../../components/layout/PageComponents';
import { useCourse } from '../hooks/useCourse';
import { CourseHero } from '../components/CourseHero';
import { CourseResources } from '../components/CourseResources';
import { EditCourseModal } from '../components/EditCourseModal';
import { LinkResourceModal } from '../components/LinkResourceModal';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { useUiStore } from '../../../store/uiStore';
import { coursesApi } from '../api/coursesApi';
import { CourseAIAssistantResponse } from '../types/courses';
import { MarkdownContent } from '../../../components/content/MarkdownContent';
import { toast } from 'sonner';

export function CourseDetailPage({
  courseId,
  onNavigate,
}: {
  courseId: string;
  onNavigate: (path: string) => void;
}) {
  const {
    course,
    isLoading,
    isError,
    error,
    refetch,
    enroll,
    toggleBookmark,
    addChapter,
    addLesson,
    removeResource,
  } = useCourse(courseId);

  const setAiInitialPrompt = useUiStore((s) => s.setAiInitialPrompt);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isLinkResourceModalOpen, setIsLinkResourceModalOpen] = React.useState(false);
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = React.useState(false);
  const [addLessonChapterId, setAddLessonChapterId] = React.useState<string | null>(null);

  // Add chapter form
  const [newChapterTitle, setNewChapterTitle] = React.useState('');
  const [newChapterDesc, setNewChapterDesc] = React.useState('');
  const [isSubmittingChapter, setIsSubmittingChapter] = React.useState(false);

  // Add lesson form
  const [newLessonTitle, setNewLessonTitle] = React.useState('');
  const [newLessonDesc, setNewLessonDesc] = React.useState('');
  const [newLessonMinutes, setNewLessonMinutes] = React.useState(30);
  const [newLessonContent, setNewLessonContent] = React.useState('');
  const [isSubmittingLesson, setIsSubmittingLesson] = React.useState(false);

  // Collapsed chapters accordion state
  const [collapsedChapters, setCollapsedChapters] = React.useState<Record<string, boolean>>({});

  // Assessments state
  const [assessments, setAssessments] = React.useState<{ quizzes: any[]; flashcards: any[] }>({
    quizzes: [],
    flashcards: [],
  });
  const [isLoadingAssessments, setIsLoadingAssessments] = React.useState(false);

  // Interactive AI Assistant state
  const [aiAction, setAiAction] = React.useState<string>('explain_simple');
  const [aiResult, setAiResult] = React.useState<CourseAIAssistantResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  // Active sub-tab
  const [activeTab, setActiveTab] = React.useState<'curriculum' | 'resources' | 'assessments' | 'ai'>('curriculum');

  React.useEffect(() => {
    if (courseId) {
      loadAssessments();
    }
  }, [courseId]);

  const loadAssessments = async () => {
    setIsLoadingAssessments(true);
    try {
      const res = await coursesApi.getAssessments(courseId);
      setAssessments(res);
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingAssessments(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleArchive = async (archive: boolean) => {
    try {
      if (archive) {
        await coursesApi.archiveCourse(courseId);
        toast.success('Course archived');
      } else {
        await coursesApi.restoreCourse(courseId);
        toast.success('Course restored');
      }
      refetch();
    } catch (err: any) {
      toast.error(err?.message || 'Archive action failed');
    }
  };

  const handleRemove = async () => {
    try {
      await coursesApi.removeCourse(courseId);
      toast.success('Course removed from workspace');
      onNavigate('/courses');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove course');
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) {
      toast.error('Chapter title is required');
      return;
    }

    setIsSubmittingChapter(true);
    try {
      await addChapter({ title: newChapterTitle.trim(), description: newChapterDesc.trim() || undefined });
      toast.success('Chapter added successfully!');
      setIsAddChapterModalOpen(false);
      setNewChapterTitle('');
      setNewChapterDesc('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add chapter');
    } finally {
      setIsSubmittingChapter(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addLessonChapterId || !newLessonTitle.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    setIsSubmittingLesson(true);
    try {
      await addLesson({
        chapterId: addLessonChapterId,
        payload: {
          title: newLessonTitle.trim(),
          description: newLessonDesc.trim() || undefined,
          estimated_minutes: Number(newLessonMinutes) || 25,
          content: newLessonContent.trim() || undefined,
        },
      });
      toast.success('Lesson added successfully!');
      setAddLessonChapterId(null);
      setNewLessonTitle('');
      setNewLessonDesc('');
      setNewLessonContent('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add lesson');
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  const handleRunAiAction = async (action: string) => {
    setAiAction(action);
    setIsAiLoading(true);
    try {
      const res = await coursesApi.executeAiAssistant(courseId, { action: action as any });
      setAiResult(res);
      toast.success('AI insights generated!');
    } catch (err: any) {
      toast.error(err?.message || 'AI request failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskAIAgent = (topic: string) => {
    setAiInitialPrompt(
      `I am studying "${course?.title}" (${course?.code}). Please explain "${topic}" in depth with engineering examples, mathematical principles, and practice questions.`
    );
    onNavigate('/ai-agent');
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingState message="Loading course syllabus and progress..." />
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

  return (
    <PageContainer className="space-y-8">
      {/* 1. Hero Section */}
      <CourseHero
        course={course}
        onNavigate={onNavigate}
        onEnroll={enroll}
        onToggleBookmark={toggleBookmark}
        onEditCourse={() => setIsEditModalOpen(true)}
        onArchiveCourse={handleArchive}
        onRemoveCourse={handleRemove}
      />

      {/* 2. Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives Card */}
          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <Card className="border border-slate-200 bg-white p-5 space-y-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <span>What You Will Learn in This Course</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                {course.learning_objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Navigation Sub-Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="curriculum" className="text-xs">
                Curriculum ({course.total_lessons})
              </TabsTrigger>
              <TabsTrigger value="resources" className="text-xs">
                Resources ({course.resources?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="assessments" className="text-xs">
                Practice &amp; Quizzes
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs">
                AI Assistant
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: CURRICULUM & UNITS */}
            <TabsContent value="curriculum" className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    Course Curriculum &amp; Units
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 tabular-nums">
                    {course.chapters.length} Units · {course.total_lessons} Lessons
                  </span>
                  {course.is_custom && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddChapterModalOpen(true)}
                      className="text-xs gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Unit</span>
                    </Button>
                  )}
                </div>
              </div>

              {course.chapters.length === 0 ? (
                <div className="py-10 text-center space-y-2 border border-dashed rounded-xl p-6">
                  <BookOpen className="h-8 w-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No units in this course yet</p>
                  {course.is_custom && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsAddChapterModalOpen(true)}
                      className="text-xs"
                    >
                      Create First Unit
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {course.chapters.map((chapter, chIdx) => {
                    const isCollapsed = collapsedChapters[chapter.id];
                    const completedInChapter = chapter.lessons.filter((l) => l.is_completed).length;

                    return (
                      <Card
                        key={chapter.id}
                        className="border border-slate-200 bg-white overflow-hidden"
                      >
                        <div
                          onClick={() => toggleChapter(chapter.id)}
                          className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isCollapsed ? (
                              <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                            )}
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Unit 0{chIdx + 1}
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                                {chapter.title}
                              </h4>
                              {chapter.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {chapter.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[11px] font-semibold text-slate-500">
                              {completedInChapter}/{chapter.lessons.length} done
                            </span>
                            {course.is_custom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddLessonChapterId(chapter.id);
                                }}
                                title="Add lesson to this unit"
                                className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:text-blue-600 cursor-pointer"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {!isCollapsed && (
                          <div className="divide-y divide-slate-100">
                            {chapter.lessons.length === 0 ? (
                              <div className="p-4 text-center text-xs text-slate-400">
                                No lessons in this unit yet.
                              </div>
                            ) : (
                              chapter.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  onClick={() =>
                                    onNavigate(`/courses/${course.id}/learn/${lesson.id}`)
                                  }
                                  className="p-3.5 hover:bg-slate-50/80 transition-colors flex items-center justify-between cursor-pointer group text-xs"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-2">
                                    {lesson.is_completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-emerald-600 fill-emerald-100 shrink-0" />
                                    ) : (
                                      <Play className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                      <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate block">
                                        {lesson.title}
                                      </span>
                                      {lesson.description && (
                                        <span className="text-[11px] text-slate-500 line-clamp-1">
                                          {lesson.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-[11px] font-mono text-slate-400">
                                      {lesson.estimated_minutes} min
                                    </span>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* TAB 2: LEARNING RESOURCES */}
            <TabsContent value="resources" className="space-y-4 pt-2">
              <CourseResources
                resources={course.resources || []}
                onNavigate={onNavigate}
                onOpenLinkModal={() => setIsLinkResourceModalOpen(true)}
                onRemoveResource={(resId) => removeResource(resId)}
              />
            </TabsContent>

            {/* TAB 3: ASSESSMENTS & PRACTICE */}
            <TabsContent value="assessments" className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Syllabus Quizzes &amp; Practical Coding
                  </h3>
                  <p className="text-xs text-slate-500">
                    Test your understanding with diagnostics and real algorithmic problem solving.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    onNavigate(
                      `/quiz/create?courseId=${course.id}&topic=${encodeURIComponent(
                        course.title
                      )}&source_type=COURSE`
                    )
                  }
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Generate Quiz</span>
                </Button>
              </div>

              {isLoadingAssessments ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading assessments...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Practice Quizzes */}
                  {assessments.quizzes.map((q) => (
                    <Card
                      key={q.id}
                      className="p-4 border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-2.5 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                          <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {q.difficulty || 'MEDIUM'}
                          </span>
                          <span>{q.total_questions} questions</span>
                        </div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{q.title}</h4>
                        <p className="text-slate-500 text-[11px] line-clamp-2 mt-0.5">
                          {q.description}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate(`/quiz/${q.id}/play`)}
                        className="w-full text-xs gap-1"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-blue-600" />
                        <span>Start Practice Quiz</span>
                      </Button>
                    </Card>
                  ))}

                  {/* Coding Lab Card */}
                  <Card className="p-4 border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 space-y-2.5 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-indigo-700 font-semibold mb-1">
                        <span>LIVE SANDBOX</span>
                        <span>C++ / Python / TS</span>
                      </div>
                      <h4 className="font-bold text-indigo-950">
                        {course.title} Code Sandbox
                      </h4>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Implement algorithms and test boundary constraints for {course.code} in the
                        interactive terminal.
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigate(`/coding/editor?courseId=${course.id}`)}
                      className="w-full text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Code2 className="h-3.5 w-3.5" />
                      <span>Open in Coding Lab</span>
                    </Button>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* TAB 4: CONTEXT-AWARE AI ASSISTANT */}
            <TabsContent value="ai" className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/40 border border-indigo-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-indigo-950">
                      Context-Aware AI Assistant
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAskAIAgent(course.title)}
                    className="text-xs gap-1 text-indigo-700 border-indigo-200"
                  >
                    <span>Full AI Agent Chat</span>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Ask the assistant to generate revision notes, explain difficult terminology, or
                  create practice questions directly calibrated to {course.title} ({course.code}).
                </p>

                {/* 1-Click AI Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: 'Explain Simply', action: 'explain_simple' },
                    { label: 'Practical Example', action: 'practical_example' },
                    { label: 'Step-by-Step Breakdown', action: 'step_by_step' },
                    { label: 'Summarize Syllabus', action: 'summarize_chapter' },
                    { label: 'Generate Revision Notes', action: 'revision_notes' },
                    { label: 'Create Practice Questions', action: 'practice_questions' },
                    { label: 'Create Flashcards', action: 'flashcards' },
                    { label: 'Revision Checklist', action: 'revision_checklist' },
                  ].map((btn) => (
                    <button
                      key={btn.action}
                      type="button"
                      disabled={isAiLoading}
                      onClick={() => handleRunAiAction(btn.action)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        aiAction === btn.action && aiResult
                          ? 'bg-blue-600 text-white border-transparent'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Result Card */}
              {isAiLoading ? (
                <div className="p-8 text-center text-xs text-slate-500 border rounded-xl bg-white space-y-2">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-blue-600" />
                  <p className="font-semibold text-slate-700">
                    Generating academic response with course context...
                  </p>
                </div>
              ) : aiResult ? (
                <Card className="border border-slate-200 bg-white p-5 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      <span className="capitalize">{aiResult.action.replace(/_/g, ' ')}</span>
                    </div>
                    {aiResult.is_fallback && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Academic Curriculum Knowledge
                      </span>
                    )}
                  </div>

                  <div className="prose prose-slate max-w-none text-slate-800 text-xs sm:text-sm">
                    <MarkdownContent content={aiResult.result} />
                  </div>

                  {aiResult.key_points && aiResult.key_points.length > 0 && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                      <h5 className="font-bold text-slate-800 text-[11px]">Core Key Points:</h5>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                        {aiResult.key_points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiResult.practice_questions && aiResult.practice_questions.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <h5 className="font-bold text-slate-900">Practice Questions &amp; Rubrics:</h5>
                      <div className="space-y-2">
                        {aiResult.practice_questions.map((pq, i) => (
                          <div key={i} className="p-2.5 rounded-lg border bg-slate-50 space-y-1">
                            <p className="font-semibold text-slate-800">
                              Q{i + 1}: {pq.question}
                            </p>
                            <p className="text-slate-600 text-[11px]">
                              <strong>Answer:</strong> {pq.answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Rail Column (1 col) */}
        <div className="space-y-6">
          {/* Prerequisites */}
          <Card className="border border-slate-200 bg-white p-5 space-y-3">
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
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>Ask AI About This Course</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Need exam prep, quick revision, or code debugging for {course.code}? Consult the AI
              agent with real course context.
            </p>
            <Button
              variant="ai"
              size="sm"
              onClick={() => handleAskAIAgent(course.title)}
              className="w-full gap-1.5 text-xs shadow-xs"
            >
              <span>Consult AI Agent</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          {/* Related Courses */}
          {course.related_courses && course.related_courses.length > 0 && (
            <Card className="border border-slate-200 bg-white p-5 space-y-3">
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
                      <span className="font-mono font-bold text-blue-600">{rel.code}</span>
                      <span>{rel.difficulty}</span>
                    </div>
                    <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {rel.title}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Course Modal */}
      <EditCourseModal
        course={course}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onUpdated={() => refetch()}
      />

      {/* Link Resource Modal */}
      <LinkResourceModal
        courseId={course.id}
        chapters={course.chapters.map((ch) => ({ id: ch.id, title: ch.title }))}
        open={isLinkResourceModalOpen}
        onOpenChange={setIsLinkResourceModalOpen}
        onResourceAdded={() => refetch()}
      />

      {/* Add Chapter Dialog */}
      <Dialog open={isAddChapterModalOpen} onOpenChange={setIsAddChapterModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add New Unit / Chapter
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a structured unit for {course.title}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddChapter} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Unit Title *</label>
              <Input
                placeholder="e.g. Unit 2: Storage Architectures & B-Trees"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Syllabus overview for this unit..."
                value={newChapterDesc}
                onChange={(e) => setNewChapterDesc(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddChapterModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingChapter}
                className="gap-1.5"
              >
                <span>{isSubmittingChapter ? 'Adding...' : 'Add Unit'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Lesson Dialog */}
      <Dialog
        open={!!addLessonChapterId}
        onOpenChange={(open) => !open && setAddLessonChapterId(null)}
      >
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Add Lesson to Unit
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Create a new learning lesson with technical markdown content.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLesson} className="space-y-3 pt-2 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Lesson Title *</label>
              <Input
                placeholder="e.g. Lesson 2.1: B+ Tree Insertion Invariants"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Estimated Minutes</label>
                <Input
                  type="number"
                  min={5}
                  max={240}
                  value={newLessonMinutes}
                  onChange={(e) => setNewLessonMinutes(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Description</label>
              <Input
                placeholder="Short summary of topics covered"
                value={newLessonDesc}
                onChange={(e) => setNewLessonDesc(e.target.value)}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Lesson Markdown Content</label>
              <textarea
                rows={4}
                placeholder="# Lesson Overview&#10;&#10;Key theoretical principles and code examples..."
                value={newLessonContent}
                onChange={(e) => setNewLessonContent(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddLessonChapterId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingLesson}
                className="gap-1.5"
              >
                <span>{isSubmittingLesson ? 'Adding...' : 'Add Lesson'}</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
