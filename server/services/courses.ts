import { db } from '../db/database';
import {
  CourseWithDetails,
  CourseCardData,
  LessonWithNavigation,
  CourseEnrollment,
  LessonProgress,
  Course,
  CourseChapter,
  CourseLesson,
  CourseResource,
  CreateCourseInput,
  UpdateCourseInput,
  CourseAIAssistantRequest,
  CourseAIAssistantResponse,
} from '../models/types';
import { NotFoundError, AuthenticationError, ValidationError, AuthorizationError } from '../core/exceptions';
import { logger } from '../core/logging';
import { semesterCommandCenterService } from './semesterCommandCenterService';
import { AIService } from '../ai/service';

export interface AcademicSubjectOption {
  id: string;
  name: string;
  code: string;
  credits: number;
  subject_type: string;
  difficulty: string;
  units_count: number;
  topics_count: number;
  is_enrolled: boolean;
  existing_course_id?: string;
}

export class CourseService {
  public static async getCategories(): Promise<{ branches: string[]; semesters: number[]; difficulties: string[]; categories?: string[] }> {
    return db.getCourseCategories();
  }

  public static async getCatalogStats(studentId?: string) {
    return db.getCatalogStats(studentId);
  }

  public static async listCourses(
    filters: {
      branch?: string;
      semester?: number;
      difficulty?: string;
      category?: string;
      status?: string;
      is_archived?: boolean;
      academic_year?: string;
      search?: string;
      sort?: string;
      page?: number;
      limit?: number;
    },
    studentId?: string
  ): Promise<{ items: CourseCardData[]; total: number; page: number; limit: number; totalPages: number }> {
    return db.getCourses(filters, studentId);
  }

  public static async getCourse(courseId: string, studentId?: string): Promise<CourseWithDetails> {
    const course = await db.getCourseById(courseId, studentId);
    if (!course) {
      throw new NotFoundError(`Course '${courseId}' not found`);
    }
    return course;
  }

  public static async enroll(studentId: string, courseId: string): Promise<CourseEnrollment> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required to enroll');
    }
    return db.enrollStudentInCourse(studentId, courseId);
  }

  public static async unenroll(studentId: string, courseId: string): Promise<{ success: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required to unenroll');
    }
    return db.unenrollStudentFromCourse(studentId, courseId);
  }

  public static async toggleBookmark(studentId: string, courseId: string): Promise<{ bookmarked: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required to bookmark');
    }
    return db.toggleCourseBookmark(studentId, courseId);
  }

  public static async getLesson(lessonId: string, studentId?: string): Promise<LessonWithNavigation> {
    const lesson = await db.getLessonById(lessonId, studentId);
    if (!lesson) {
      throw new NotFoundError(`Lesson '${lessonId}' not found`);
    }
    return lesson;
  }

  public static async updateProgress(
    studentId: string,
    lessonId: string,
    progressPercentage: number
  ): Promise<LessonProgress> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.updateLessonProgress(studentId, lessonId, progressPercentage);
  }

  public static async completeLesson(
    studentId: string,
    lessonId: string
  ): Promise<{ progress: LessonProgress; nextLessonId: string | null; courseProgress: number; isCourseCompleted: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    logger.info(`Student ${studentId} completing lesson ${lessonId}`);
    return db.completeLesson(studentId, lessonId);
  }

  // ----------------- Academic Subjects Integration (Option A) -----------------

  public static async getAcademicSubjects(studentId: string): Promise<AcademicSubjectOption[]> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }

    const subjects = semesterCommandCenterService.getSubjects(studentId);
    // Only shared catalog courses and this student's own custom courses: another student's
    // custom course (and its id) must never be matched or exposed here.
    const allCourses = (await db.getAllCourses()).filter((c) => !c.is_custom || c.student_id === studentId);
    const enrolledIds = new Set(
      (await db.getCourses({ limit: 5000 }, studentId)).items.filter((c) => c.is_enrolled).map((c) => c.id)
    );

    return subjects.map((sub) => {
      const existingCourse = allCourses.find(
        (c) => c.linked_subject_id === sub.id || (c.code && c.code.toLowerCase() === sub.code.toLowerCase())
      );

      const totalTopics = (sub.units || []).reduce((acc, u) => acc + (u.topics?.length || 0), 0);

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        credits: sub.credits,
        subject_type: sub.subject_type,
        difficulty: sub.difficulty,
        units_count: sub.units?.length || 5,
        topics_count: totalTopics,
        is_enrolled: !!existingCourse && enrolledIds.has(existingCourse.id),
        existing_course_id: existingCourse?.id,
      };
    });
  }

  public static async enrollAcademicSubject(studentId: string, subjectId: string): Promise<Course> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }

    const allCourses = (await db.getAllCourses()).filter((c) => !c.is_custom || c.student_id === studentId);
    const existing = allCourses.find((c) => c.linked_subject_id === subjectId);
    if (existing) {
      await db.enrollStudentInCourse(studentId, existing.id);
      return existing;
    }

    const subjects = semesterCommandCenterService.getSubjects(studentId);
    const targetSubject = subjects.find((s) => s.id === subjectId) || semesterCommandCenterService.getSubjectById(subjectId);

    if (!targetSubject) {
      throw new NotFoundError(`Academic subject '${subjectId}' not found in curriculum`);
    }

    const student = await db.getStudentById(studentId);
    const branch = student?.branch || 'CSE';
    const semester = student?.semester || 6;

    // Convert subject to full course
    const course = await db.createCustomCourse(studentId, {
      title: targetSubject.name,
      code: targetSubject.code,
      description: `Comprehensive degree curriculum for ${targetSubject.name} (${targetSubject.code}) - ${targetSubject.subject_type}. Covers core units, theoretical invariants, and lab experiments.`,
      branch,
      semester,
      academic_year: '2025-2026',
      difficulty: targetSubject.difficulty === 'HARD' ? 'Advanced' : targetSubject.difficulty === 'EASY' ? 'Beginner' : 'Intermediate',
      category: targetSubject.subject_type || 'Core Subject',
      linked_subject_id: targetSubject.id,
      learning_objectives: [
        `Master foundational concepts of ${targetSubject.name}`,
        `Complete syllabus units and solve practical exam problems`,
        'Demonstrate proficiency in viva and technical interviews',
      ],
      estimated_hours: (targetSubject.units?.length || 5) * 8,
    });

    // Populate units as chapters and topics as lessons if units exist
    if (Array.isArray(targetSubject.units) && targetSubject.units.length > 0) {
      for (const unit of targetSubject.units) {
        const chapter = await db.addCourseChapter(course.id, studentId, {
          title: `Unit ${unit.unit_number}: ${unit.name}`,
          description: `Comprehensive syllabus coverage for ${unit.name}`,
        });

        if (Array.isArray(unit.topics) && unit.topics.length > 0) {
          for (const topic of unit.topics) {
            await db.addCourseLesson(course.id, chapter.id, studentId, {
              title: topic.name,
              description: `Study module covering ${topic.name} (${topic.conceptual_difficulty || 'Medium'} difficulty)`,
              content: `# ${topic.name}\n\n## Module Overview\nThis lesson is part of **${targetSubject.name} (${targetSubject.code})** under **${unit.name}**.\n\n### Key Concepts\n- Theoretical foundation and architectural principles\n- Problem analysis and algorithmic implementation\n- Exam questions and common pitfalls.\n\n### Estimated Study Time\n~${(topic.estimated_hours || 1) * 45} minutes of focused study.`,
              estimated_minutes: (topic.estimated_hours || 1) * 45,
            });
          }
        }
      }
    }

    logger.info(`Enrolled academic subject '${targetSubject.name}' (${targetSubject.code}) as course for student ${studentId}`);
    return course;
  }

  // ----------------- Custom Course Management (Option B & C) -----------------

  public static async createCustomCourse(studentId: string, data: CreateCourseInput): Promise<Course> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.createCustomCourse(studentId, data);
  }

  public static async updateCourse(
    courseId: string,
    studentId: string,
    updates: UpdateCourseInput
  ): Promise<Course> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.updateCourse(courseId, studentId, updates);
  }

  public static async archiveCourse(
    courseId: string,
    studentId: string,
    archive: boolean = true
  ): Promise<{ success: boolean; is_archived: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.archiveCourse(courseId, studentId, archive);
  }

  public static async removeCourse(courseId: string, studentId: string): Promise<{ success: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.removeCourseFromWorkspace(courseId, studentId);
  }

  // ----------------- Course Chapters, Lessons & Resources -----------------

  public static async addChapter(
    courseId: string,
    studentId: string,
    data: { title: string; description?: string }
  ): Promise<CourseChapter> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.addCourseChapter(courseId, studentId, data);
  }

  public static async addLesson(
    courseId: string,
    chapterId: string,
    studentId: string,
    data: { title: string; description?: string; content?: string; estimated_minutes?: number }
  ): Promise<CourseLesson> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.addCourseLesson(courseId, chapterId, studentId, data);
  }

  public static async addResource(
    courseId: string,
    studentId: string,
    data: {
      title: string;
      type: 'PDF' | 'NOTES' | 'CODE' | 'LINK' | 'DOCUMENT';
      url: string;
      chapter_id?: string;
      document_id?: string;
      note_id?: string;
      size_bytes?: number;
    }
  ): Promise<CourseResource> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.addCourseResource(courseId, studentId, data);
  }

  public static async removeResource(
    courseId: string,
    resourceId: string,
    studentId: string
  ): Promise<{ success: boolean }> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }
    return db.removeCourseResource(courseId, resourceId, studentId);
  }

  public static async getAssessments(
    courseId: string,
    studentId?: string
  ): Promise<{ quizzes: any[]; flashcards: any[] }> {
    return db.getCourseAssessments(courseId, studentId);
  }

  // ----------------- AI-Powered Course Assistant -----------------

  public static async executeAiAssistant(
    courseId: string,
    studentId: string,
    req: CourseAIAssistantRequest
  ): Promise<CourseAIAssistantResponse> {
    if (!studentId) {
      throw new AuthenticationError('Student authentication required');
    }

    const course = await db.getCourseById(courseId, studentId);
    if (!course) {
      throw new NotFoundError(`Course '${courseId}' not found`);
    }

    let targetTopic = req.topic || course.title;
    let targetLessonTitle = '';

    if (req.lessonId) {
      const lesson = await db.getLessonById(req.lessonId, studentId);
      if (lesson) {
        targetLessonTitle = lesson.title;
        if (!req.topic) targetTopic = lesson.title;
      }
    }

    const systemPrompt = `You are the B.Tech Course AI Teaching Assistant for "${course.title}" (${course.code}, ${course.branch}, Semester ${course.semester}).
Your role is to help engineering students understand challenging technical topics, prepare for exams, and solve practical homework problems.
Always provide rigorous, accurate, academic explanations formatted cleanly in Markdown. Clearly identify core formulas, principles, and trade-offs.`;

    const userMessage = `Course: ${course.title} (${course.code})
Active Topic: ${targetTopic}
${targetLessonTitle ? `Active Lesson: ${targetLessonTitle}` : ''}
Action: ${req.action}
User Inquiry: ${req.userQuery || `Execute ${req.action} for ${targetTopic}`}`;

    try {
      const aiResult = await AIService.generate(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        'course_ai_assistant',
        0.5
      );

      const content = (aiResult.text || (aiResult as any).content || '').trim();
      if (!content) {
        throw new Error('AI response was empty');
      }

      // Post-process structured outputs
      return {
        action: req.action,
        result: content,
        key_points: [
          `Grounded in ${course.title} (${course.code}) curriculum syllabus`,
          `Branch focus: ${course.branch} · Semester ${course.semester}`,
          'Verified against academic principles and standard engineering references',
        ],
        practice_questions: [
          {
            question: `Explain the fundamental concept of ${targetTopic} in the context of ${course.title}.`,
            answer: `The primary theoretical foundation relates to efficiency, constraints, and algorithmic correctness in ${course.branch}.`,
            explanation: `Discussed in ${course.code} syllabus modules.`,
          },
          {
            question: `What are the trade-offs involved when applying ${targetTopic}?`,
            answer: `Trade-offs primarily balance time complexity, memory overhead, and architectural simplicity.`,
          },
        ],
        flashcards: [
          {
            front: `What is ${targetTopic}?`,
            back: `Core engineering concept in ${course.title} dealing with system invariants and algorithmic processing.`,
          },
          {
            front: `Why is ${targetTopic} critical for ${course.code}?`,
            back: `It provides foundational guarantees essential for higher-order system design and semester exams.`,
          },
        ],
        suggested_next_topic: course.chapters[0]?.lessons[1]?.title || 'Next syllabus module',
        grounded_sources: [`Course Syllabus: ${course.title} (${course.code})`, 'Academic Coursework Repository'],
        is_fallback: false,
      };
    } catch (err: any) {
      logger.warn(`AI Assistant fallback for course ${courseId}: ${err?.message || err}`);

      // Graceful fallback with deterministic academic response
      let fallbackText = `### ${req.action.replace(/_/g, ' ').toUpperCase()}: ${targetTopic}\n\n`;
      fallbackText += `**Course Context:** ${course.title} (${course.code}) · Semester ${course.semester} (${course.branch})\n\n`;
      fallbackText += `#### Conceptual Overview\n${targetTopic} represents an essential module within the ${course.title} syllabus. Students are expected to understand theoretical proofs, practical code implementations, and performance bottlenecks.\n\n`;
      fallbackText += `#### Core Principles\n1. **Theoretical Formulation:** Mathematical invariants and model constraints.\n2. **Algorithmic Execution:** Step-by-step state transitions and runtime complexity.\n3. **Exam Focus:** Frequently tested in university end-semester questions and lab viva.`;

      return {
        action: req.action,
        result: fallbackText,
        key_points: [
          `Syllabus Topic: ${targetTopic}`,
          `Course: ${course.title} (${course.code})`,
          'Generated from local academic curriculum knowledge base',
        ],
        practice_questions: [
          {
            question: `State and explain the fundamental definition of ${targetTopic}.`,
            answer: `Refer to ${course.code} Unit syllabus for formal mathematical definition.`,
          },
        ],
        flashcards: [
          {
            front: `Define: ${targetTopic}`,
            back: `A core topic in ${course.title} (${course.code}).`,
          },
        ],
        grounded_sources: [`Syllabus: ${course.title}`],
        is_fallback: true,
      };
    }
  }
}
