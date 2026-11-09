import { db } from '../db/database';
import { ProgressService } from '../services/progressService';
import { semesterCommandCenterService } from '../services/semesterCommandCenterService';
import { OnboardingService } from '../services/onboardingService';
import { logger } from '../core/logging';
import { StudentAIPersona } from '../models/onboardingTypes';
import { StudentProfileService } from '../services/studentProfile/studentProfileService';

export type ContextDomain = 'GENERAL' | 'ACADEMIC' | 'LEARNING' | 'CODING' | 'PROJECT' | 'CAREER' | 'EXAM';

export interface StudentContextOptions {
  domain?: ContextDomain;
  includeAcademic?: boolean;
  includeProgress?: boolean;
  includeProjects?: boolean;
  includeCareer?: boolean;
  includeRecentActivity?: boolean;
  maxTokensEstimate?: number;
}

export interface UnifiedStudentContext {
  student: {
    id: string;
    name: string;
    /** Phase 5: not populated; AI contexts never carry the email address. */
    email?: string;
    branch: string;
    semester: number;
    role: string;
    created_at: string;
  };
  aiPersona?: StudentAIPersona;
  education?: {
    institution: string;
    degree: string;
    branch: string;
    currentYear: number;
    currentSemester: number;
    expectedGraduationYear: number;
    tenthBoard?: string;
    tenthPercentage?: number;
    twelfthStream?: string;
    twelfthPercentage?: number;
    entranceExam?: string;
    entranceRank?: string;
    firstGenerationEngineer?: boolean;
    financialUrgency?: string;
  };
  preferences?: {
    learningStyle: string;
    explanationDepth: string;
    preferredLanguage: string;
    difficultTopics: string[];
    weekdayHours: number;
    weekendHours: number;
    preferredTime?: string;
    learningPace?: string;
  };
  academic?: {
    semesterNumber: number;
    subjects: { id: string; name: string; code: string; credits: number; difficulty: string }[];
    upcomingEvents: { title: string; eventType: string; date: string }[];
    weakAreas: string[];
    challengingSubjects?: string[];
    favoriteSubjects?: string[];
    readiness: string;
  };
  learning?: {
    currentCourse: { name: string; code: string; progress: number };
    currentLesson: { title: string; topic: string; progress: number };
    recentTopics: string[];
  };
  coding?: {
    problemsSolved: number;
    dsaSolved: number;
    topSkills: string[];
  };
  projects?: {
    title: string;
    progress: number;
    techStack: string[];
    currentMilestone: string;
  }[];
  career?: {
    targetRole?: string;
    careerDirections?: string[];
    readinessScore?: number;
    topGaps?: string[];
  };
  recentActivities?: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export class StudentContextEngine {
  /**
   * Builds prioritized, domain-scoped context for a student to feed into LLM agents.
   */
  public static async buildStudentContext(
    studentId: string,
    options: StudentContextOptions = {}
  ): Promise<UnifiedStudentContext> {
    return this.buildContext(studentId, options);
  }

  public static async buildContext(
    studentId: string,
    options: StudentContextOptions = {}
  ): Promise<UnifiedStudentContext> {
    const student = await db.getStudentById(studentId);
    if (!student) {
      throw new Error(`Student ${studentId} not found for context loading`);
    }
    // Phase 5: the central profile is the source for academic, skill and career fields.
    const profile = StudentProfileService.getProfileSync(studentId);

    const domain = options.domain || 'GENERAL';
    let baseContext: any;
    try {
      baseContext = await db.getStudentLearningContext(studentId);
    } catch {
      baseContext = { current_course: null, current_lesson: null, recent_topics: [], weak_areas: [] };
    }

    const result: UnifiedStudentContext = {
      student: {
        id: student.id,
        name: student.name,
        branch: profile?.academic.branch || student.branch,
        semester: profile?.academic.current_semester || student.semester,
        role: student.role,
        created_at: student.created_at,
      },
    };

    // 0. AI Companion Persona
    try {
      result.aiPersona = await OnboardingService.getOrGenerateAIPersona(studentId);
    } catch (err) {
      logger.warn(`[StudentContextEngine] Failed loading AI persona: ${err}`);
    }

    // 1. Academic Context (for ACADEMIC, EXAM, GENERAL)
    if (domain === 'ACADEMIC' || domain === 'EXAM' || options.includeAcademic || domain === 'GENERAL') {
      try {
        const overview = semesterCommandCenterService.getOverview(studentId);
        const subjects = overview.subjects || [];
        const events = overview.upcoming_events || [];
        const goals = await OnboardingService.getCareerGoals(studentId);

        result.academic = {
          semesterNumber: overview.config.semester_number || student.semester,
          subjects: subjects.map((s: any) => ({
            id: s.id,
            name: s.name,
            code: s.code,
            credits: s.credits,
            difficulty: s.difficulty,
          })),
          upcomingEvents: events
            .filter((e: any) => new Date(e.start_date) >= new Date())
            .slice(0, 5)
            .map((e: any) => ({
              title: e.title,
              eventType: e.event_type,
              date: e.start_date,
            })),
          weakAreas: baseContext.weak_areas || [],
          challengingSubjects: goals?.challenging_subjects || [],
          favoriteSubjects: goals?.favorite_subjects || [],
          readiness: 'ASSESSMENT_READY',
        };
      } catch (err) {
        logger.warn(`[StudentContextEngine] Failed loading academic context: ${err}`);
      }
    }

    // 2. Learning Context (for LEARNING, ACADEMIC, GENERAL)
    if ((domain === 'LEARNING' || domain === 'GENERAL' || domain === 'ACADEMIC') && baseContext.current_course) {
      result.learning = {
        currentCourse: baseContext.current_course,
        currentLesson: baseContext.current_lesson,
        recentTopics: baseContext.recent_topics || [],
      };
    }

    // 3. Coding Context (for CODING, GENERAL)
    if (domain === 'CODING' || domain === 'GENERAL' || options.includeProgress) {
      try {
        const progress = await ProgressService.getUnifiedProgress(studentId);
        result.coding = {
          problemsSolved: progress.overall_indicators.coding_problems_solved || 0,
          dsaSolved: progress.overall_indicators.dsa_problems_solved || 0,
          // Student-reported skills only (Phase 5); previously a fixed list.
          topSkills: (profile?.skills.skills || []).slice(0, 6).map((sk) => `${sk.name} (${sk.proficiency.toLowerCase()})`),
        };
      } catch (err) {
        logger.warn(`[StudentContextEngine] Failed loading coding progress context: ${err}`);
      }
    }

    // 4. Projects Context (for PROJECT, CAREER, GENERAL)
    if (domain === 'PROJECT' || domain === 'CAREER' || options.includeProjects || domain === 'GENERAL') {
      try {
        const projects = await db.getProjects(studentId);
        result.projects = projects.slice(0, 3).map((p) => ({
          title: p.title,
          progress: p.progress_percentage || 0,
          techStack: p.tags || [],
          currentMilestone: p.status || 'IN_PROGRESS',
        }));
      } catch (err) {
        logger.warn(`[StudentContextEngine] Failed loading projects context: ${err}`);
      }
    }

    // 5. Career Context (for CAREER, GENERAL)
    if (domain === 'CAREER' || domain === 'GENERAL' || options.includeCareer) {
      try {
        const goals = await OnboardingService.getCareerGoals(studentId);
        const roles = profile?.career.target_roles || [];
        if (roles.length || goals?.career_directions?.length) {
          // No invented readiness score or default role: only what the student entered.
          result.career = {
            targetRole: roles[0] || goals?.target_job_role,
            careerDirections: goals?.career_directions?.map((c) => c.replace(/_/g, ' ')) || [],
            topGaps: goals?.desired_technical_skills?.slice(0, 3) || [],
          };
        }
      } catch (err) {
        logger.warn(`[StudentContextEngine] Failed loading career context: ${err}`);
      }
    }

    // 6. Educational Background & Learning Preferences
    try {
      const edu = await OnboardingService.getEducationProfile(studentId);
      if (edu) {
        result.education = {
          institution: edu.institution,
          degree: edu.degree,
          branch: edu.branch,
          currentYear: edu.current_year,
          currentSemester: edu.current_semester,
          expectedGraduationYear: edu.expected_graduation_year,
          // Phase 5: school marks, entrance ranks and family/financial context are personal data the
          // AI provider does not need; they are no longer copied into AI context.
        };
      }

      const prefs = await OnboardingService.getLearningPreferences(studentId);
      if (prefs) {
        result.preferences = {
          learningStyle: prefs.learning_style,
          explanationDepth: prefs.explanation_depth,
          preferredLanguage: prefs.preferred_explanation_language,
          difficultTopics: prefs.difficult_topics || [],
          weekdayHours: prefs.weekday_study_hours,
          weekendHours: prefs.weekend_study_hours,
          preferredTime: prefs.preferred_study_time,
          learningPace: prefs.learning_pace,
        };
      }
    } catch (err) {
      logger.warn(`[StudentContextEngine] Failed loading edu/preferences: ${err}`);
    }

    // 7. Recent Activity
    if (options.includeRecentActivity || domain === 'GENERAL') {
      try {
        const activities = await db.getStudentActivities(studentId);
        result.recentActivities = activities.slice(0, 5).map((a) => ({
          type: a.activity_type,
          description: `Activity ${a.activity_type}`,
          timestamp: a.created_at,
        }));
      } catch (err) {
        logger.warn(`[StudentContextEngine] Failed loading recent activities: ${err}`);
      }
    }

    return result;
  }

  /**
   * Formats unified student context into a concise markdown prompt snippet for LLMs.
   */
  public static formatPromptContext(context: UnifiedStudentContext): string {
    const lines: string[] = [];

    // AI Companion Header & Tone Directives
    if (context.aiPersona) {
      // Phase 5: only the tone is sent. The persona's summary and directives embed the student's
      // name, school marks and family/financial context, which the AI provider does not need.
      lines.push(
        `### Tutor tone: ${context.aiPersona.pedagogical_tone.replace(/_/g, ' ').toLowerCase()}`,
        ``
      );
    }

    // Phase 5: no name, email or institution in AI prompts.
    lines.push(
      `### Verified Student Context:`,
      `- **Student**: ${context.student.branch || 'Branch not set'}, Semester ${context.student.semester || 'not set'}`
    );

    if (context.education) {
      lines.push(
        `- **Academic Program**: ${context.education.degree} in ${context.education.branch} (Year ${context.education.currentYear}, Sem ${context.education.currentSemester})`
      );
    }

    if (context.preferences) {
      lines.push(
        `- **Learning Preferences**: Style: ${context.preferences.learningStyle}, Depth: ${context.preferences.explanationDepth}, Language: ${context.preferences.preferredLanguage}, Pace: ${context.preferences.learningPace || 'STEADY_BALANCED'}`
      );
      if (context.preferences.difficultTopics.length > 0) {
        lines.push(`- **Student-Flagged Difficult Topics**: ${context.preferences.difficultTopics.join(', ')}`);
      }
    }

    if (context.academic) {
      lines.push(
        `- **Academic Status**: Semester ${context.academic.semesterNumber}, Enrolled in ${context.academic.subjects.length} subjects: ${context.academic.subjects.map((s) => s.code).join(', ')}`
      );
      if (context.academic.challengingSubjects && context.academic.challengingSubjects.length > 0) {
        lines.push(`- **Challenging Subjects (AI Tutor Intervention Needed)**: ${context.academic.challengingSubjects.join(', ')}`);
      }
      if (context.academic.favoriteSubjects && context.academic.favoriteSubjects.length > 0) {
        lines.push(`- **Favorite / Strong Subjects**: ${context.academic.favoriteSubjects.join(', ')}`);
      }
      if (context.academic.weakAreas.length > 0) {
        lines.push(`- **Identified Weak Topics**: ${context.academic.weakAreas.join(', ')}`);
      }
      if (context.academic.upcomingEvents.length > 0) {
        lines.push(
          `- **Upcoming Academic Deadlines**: ${context.academic.upcomingEvents
            .map((e) => `${e.title} (${e.date})`)
            .join('; ')}`
        );
      }
    }

    if (context.learning && context.learning.currentCourse) {
      lines.push(
        `- **Active Course Focus**: ${context.learning.currentCourse.name} (${context.learning.currentCourse.progress}% complete)`
      );
      lines.push(`- **Current Topic**: ${context.learning.currentLesson.topic}`);
    }

    if (context.coding) {
      lines.push(
        `- **Programming Progress**: ${context.coding.problemsSolved} challenges & ${context.coding.dsaSolved} DSA problems solved.${context.coding.topSkills.length ? ` Self-reported skills: ${context.coding.topSkills.join(', ')}` : ''}`
      );
    }

    if (context.career && context.career.targetRole) {
      lines.push(
        `- **Career Objective**: ${context.career.targetRole}${context.career.topGaps?.length ? `. Skills the student wants to build: ${context.career.topGaps.join(', ')}` : ''}`
      );
    }

    if (context.projects && context.projects.length > 0) {
      lines.push(
        `- **Active Project**: "${context.projects[0].title}" (${context.projects[0].progress}%, Status: ${context.projects[0].currentMilestone})`
      );
    }

    return lines.join('\n');
  }
}
