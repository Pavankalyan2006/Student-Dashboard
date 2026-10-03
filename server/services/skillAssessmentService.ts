import { db } from '../db/database';
import { SkillAssessment } from '../models/careerResumeTypes';
import { QuizGenerationService } from './quizGeneration';
import { QuizAttemptService } from './quizAttempt';
import { SkillService } from './skillService';
import { NotFoundError } from '../core/exceptions';
import { logger } from '../core/logging';

export class SkillAssessmentService {
  /**
   * Start a new skill assessment reusing Phase 9 Quiz infrastructure
   */
  public static async startAssessment(
    studentId: string,
    skillId: string,
    difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' = 'INTERMEDIATE',
    questionCount: number = 5
  ): Promise<{ assessment: SkillAssessment; questions: any[]; attemptId: string }> {
    const skill = await SkillService.getSkill(skillId);

    // 1. Generate or retrieve questions using QuizGenerationService
    const { quiz, questions } = await QuizGenerationService.generateQuiz(studentId, {
      title: `${skill.name} Skill Assessment`,
      topic_id: skill.name,
      difficulty: difficulty === 'BEGINNER' ? 'EASY' : difficulty === 'ADVANCED' ? 'HARD' : 'MEDIUM',
      question_count: questionCount,
      question_type: 'MIXED',
      source_type: 'TOPIC',
    });

    // 2. Start attempt using QuizAttemptService
    const attemptData = await QuizAttemptService.startAttempt(studentId, quiz.id);
    const attempt = attemptData.attempt;

    // 3. Save SkillAssessment entity
    const assessmentId = `sa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const assessment: SkillAssessment = {
      id: assessmentId,
      student_id: studentId,
      title: `${skill.name} Skill Assessment (${difficulty})`,
      skill_id: skill.id,
      difficulty,
      question_count: questions.length,
      status: 'IN_PROGRESS',
      quiz_id: quiz.id,
      quiz_attempt_id: attempt.id,
      started_at: now,
      created_at: now,
    };

    await db.saveSkillAssessment(assessment);

    return {
      assessment,
      questions: questions.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options,
      })),
      attemptId: attempt.id,
    };
  }

  /**
   * Submit an answer to a question in the skill assessment
   */
  public static async submitAnswer(
    assessmentId: string,
    studentId: string,
    questionId: string,
    answerOrOption:
      | {
          selected_option?: number;
          answer_text?: string;
          code?: string;
        }
      | number,
    optionalText?: string
  ): Promise<any> {
    const answer =
      typeof answerOrOption === 'number'
        ? { selected_option: answerOrOption, answer_text: optionalText, code: optionalText }
        : answerOrOption;

    const assessment = await db.getSkillAssessmentById(assessmentId, studentId);
    if (!assessment) {
      throw new NotFoundError(`Skill assessment '${assessmentId}' not found`);
    }
    if (!assessment.quiz_attempt_id) {
      throw new NotFoundError('Associated quiz attempt not found');
    }

    const value =
      answer.selected_option !== undefined
        ? String(answer.selected_option)
        : answer.answer_text || answer.code || '';

    return await QuizAttemptService.saveAnswers(studentId, assessment.quiz_attempt_id, {
      [questionId]: value,
    });
  }

  /**
   * Complete the skill assessment, evaluate score, and record skill evidence
   */
  public static async completeAssessment(
    assessmentId: string,
    studentId: string
  ): Promise<{ assessment: SkillAssessment; attemptResult: any; evidence: any }> {
    const assessment = await db.getSkillAssessmentById(assessmentId, studentId);
    if (!assessment) {
      throw new NotFoundError(`Skill assessment '${assessmentId}' not found`);
    }
    if (!assessment.quiz_attempt_id) {
      throw new NotFoundError('Associated quiz attempt not found');
    }

    // Complete attempt using Phase 9 engine
    const attemptResult = await QuizAttemptService.submitAttempt(studentId, assessment.quiz_attempt_id);

    const now = new Date().toISOString();
    const finalScore = attemptResult.percentage !== undefined ? attemptResult.percentage : attemptResult.score || 0;

    assessment.status = 'COMPLETED';
    assessment.score = finalScore;
    assessment.completed_at = now;
    await db.saveSkillAssessment(assessment);

    // Record verified SkillEvidence
    const evidence = await SkillService.recordEvidence(studentId, assessment.skill_id, {
      source_type: 'ASSESSMENT',
      source_id: assessment.id,
      description: `Completed ${assessment.title} with score ${finalScore}%.`,
      score: finalScore,
    });

    return {
      assessment,
      attemptResult,
      evidence,
    };
  }

  /**
   * List assessments for the student
   */
  public static async listAssessments(studentId: string): Promise<SkillAssessment[]> {
    return await db.getSkillAssessments(studentId);
  }

  /**
   * Get single assessment
   */
  public static async getAssessment(assessmentId: string, studentId: string): Promise<SkillAssessment> {
    const assessment = await db.getSkillAssessmentById(assessmentId, studentId);
    if (!assessment) {
      throw new NotFoundError(`Skill assessment '${assessmentId}' not found`);
    }
    return assessment;
  }
}
