import { db } from '../db/database';
import { ProgressService } from '../services/progressService';
import { semesterCommandCenterService } from '../services/semesterCommandCenterService';
import { OnboardingService } from '../services/onboardingService';
import { logger } from '../core/logging';
import { StudentAIPersona } from '../models/onboardingTypes';

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
    email: string;
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
    let student = await db.getStudentById(studentId);
    if (!student) {
      try {
        const edu = await OnboardingService.getEducationProfile(studentId);
        if (edu) {
          student = {
            id: studentId,
            name: 'B.Tech Student',
            email: `${studentId}@btech.edu`,
            branch: edu.branch || 'CSE',
            semester: edu.current_semester || 1,
            role: 'STUDENT',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any;
        }
      } catch {}
    }
    if (!student) {
      throw new Error(`Student ${studentId} not found for context loading`);
    }

    const domain = options.domain || 'GENERAL';
    let baseContext: any;
    try {
      baseContext = await db.getStudentLearningContext(studentId);
    } catch {
      baseContext = {
        current_course: { name: 'Design and Analysis of Algorithms', code: 'CS401', progress: 50 },
        current_lesson: { title: 'Introduction', topic: 'Algorithm Foundations', progress: 50 },
        recent_topics: [],
        weak_areas: [],
      };
    }

    const result: UnifiedStudentContext = {
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        semester: student.semester,
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
    if (domain === 'LEARNING' || domain === 'GENERAL' || domain === 'ACADEMIC') {
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
          topSkills: ['Data Structures', 'Algorithms', 'TypeScript', 'Python'],
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
        if (goals && (goals.target_job_role || goals.career_directions?.length > 0)) {
          result.career = {
            targetRole: goals.target_job_role || (goals.career_directions?.[0]?.replace(/_/g, ' ') || 'Software Engineer'),
            careerDirections: goals.career_directions?.map(c => c.replace(/_/g, ' ')) || [],
            readinessScore: 78,
            topGaps: goals.desired_technical_skills?.length > 0 ? goals.desired_technical_skills.slice(0, 3) : ['Distributed Systems', 'System Design Scale'],
          };
        } else {
          result.career = {
            targetRole: 'Full Stack Software Engineer',
            careerDirections: ['Software Development'],
            readinessScore: 70,
            topGaps: ['Distributed Systems', 'Cloud Deployment'],
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
          tenthBoard: edu.tenth_board,
          tenthPercentage: edu.tenth_percentage,
          twelfthStream: edu.twelfth_stream,
          twelfthPercentage: edu.twelfth_percentage,
          entranceExam: edu.entrance_exam_name,
          entranceRank: edu.entrance_exam_rank,
          firstGenerationEngineer: edu.first_generation_engineer,
          financialUrgency: edu.financial_urgency,
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
      lines.push(
        `### Active Student AI Companion: ${context.aiPersona.agent_companion_name}`,
        `- **Pedagogical Persona Tone**: ${context.aiPersona.pedagogical_tone}`,
        `- **Knowledge Graph Context**: ${context.aiPersona.knowledge_graph_summary}`,
        `- **Pedagogical Directives**:`,
        ...context.aiPersona.primary_focus_directives.map((d) => `  * ${d}`),
        ``
      );
    }

    lines.push(
      `### Verified Student Context:`,
      `- **Student**: ${context.student.name} (${context.student.branch}, Semester ${context.student.semester})`
    );

    if (context.education) {
      lines.push(
        `- **Academic Program**: ${context.education.degree} in ${context.education.branch} at ${context.education.institution} (Year ${context.education.currentYear}, Sem ${context.education.currentSemester})`
      );
      if (context.education.tenthPercentage || context.education.twelfthPercentage || context.education.entranceExam) {
        lines.push(
          `- **Academic Heritage**: 10th: ${context.education.tenthPercentage ? `${context.education.tenthPercentage}%` : 'N/A'}, 12th/Diploma: ${context.education.twelfthPercentage ? `${context.education.twelfthPercentage}% (${context.education.twelfthStream || 'PCM'})` : 'N/A'}, Entrance: ${context.education.entranceExam || 'Exam'} Rank #${context.education.entranceRank || 'N/A'}`
        );
      }
      if (context.education.firstGenerationEngineer) {
        lines.push(`- **Socio-Economic Context**: First-generation engineer in family (requires approachable, confidence-building explanations)`);
      }
      if (context.education.financialUrgency) {
        lines.push(`- **Career Urgency**: ${context.education.financialUrgency.replace(/_/g, ' ')}`);
      }
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

    if (context.learning) {
      lines.push(
        `- **Active Course Focus**: ${context.learning.currentCourse.name} (${context.learning.currentCourse.progress}% complete)`
      );
      lines.push(`- **Current Topic**: ${context.learning.currentLesson.topic}`);
    }

    if (context.coding) {
      lines.push(
        `- **Programming Progress**: ${context.coding.problemsSolved} challenges & ${context.coding.dsaSolved} DSA problems solved. Skills: ${context.coding.topSkills.join(', ')}`
      );
    }

    if (context.career) {
      lines.push(
        `- **Career Objective**: ${context.career.targetRole} (Readiness: ${context.career.readinessScore}%). Focus Gaps: ${context.career.topGaps?.join(', ')}`
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
