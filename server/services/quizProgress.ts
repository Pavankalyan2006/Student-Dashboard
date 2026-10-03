import { db } from '../db/database';
import {
  QuizProgress,
  TopicPerformance,
  DifficultyProgression,
  RecentScore,
  RevisionRecommendation,
  QuizAttempt,
  QuizQuestion,
  QuestionAttempt,
  QuizDifficulty,
} from '../models/quizTypes';
import { logger } from '../core/logging';

export class QuizProgressService {
  /**
   * Get student's overall quiz progress and analytics
   */
  public static async getStudentProgress(studentId: string): Promise<QuizProgress> {
    try {
      const attempts = await db.getQuizAttempts(studentId);
      const completedAttempts = attempts.filter((a) => a.status === 'COMPLETED');

      // If we already have stored progress, refresh it with latest calculations
      const storedProgress = await db.getQuizProgress(studentId);

      if (completedAttempts.length === 0) {
        return storedProgress;
      }

      // Compute aggregates across all attempts
      let totalQuestionsAnswered = 0;
      let totalCorrect = 0;
      let totalScoreSum = 0;

      const topicMap = new Map<string, {
        topic_name: string;
        total_questions: number;
        correct_answers: number;
        last_practiced_at: string;
      }>();

      const difficultyMap: Record<QuizDifficulty, { attempted: number; correct: number }> = {
        BEGINNER: { attempted: 0, correct: 0 },
        EASY: { attempted: 0, correct: 0 },
        MEDIUM: { attempted: 0, correct: 0 },
        HARD: { attempted: 0, correct: 0 },
        ADVANCED: { attempted: 0, correct: 0 },
      };

      const recentScores: RecentScore[] = [];

      for (const attempt of completedAttempts) {
        totalScoreSum += attempt.score;
        totalQuestionsAnswered += (attempt.correct_count + attempt.incorrect_count + attempt.unanswered_count);
        totalCorrect += attempt.correct_count;

        const quiz = await db.getQuizById(attempt.quiz_id);
        const diff = (quiz?.difficulty || 'MEDIUM') as QuizDifficulty;
        if (difficultyMap[diff]) {
          difficultyMap[diff].attempted += (attempt.correct_count + attempt.incorrect_count);
          difficultyMap[diff].correct += attempt.correct_count;
        }

        recentScores.push({
          quiz_id: attempt.quiz_id,
          quiz_title: quiz?.title || 'Academic Quiz',
          score: attempt.score,
          completed_at: attempt.completed_at || attempt.started_at,
          difficulty: diff,
        });

        // Tally question attempts
        const qAttempts = await db.getQuestionAttempts(attempt.id);
        for (const qa of qAttempts) {
          const q = await db.getQuizQuestionById(qa.question_id);
          if (q) {
            const topicId = q.topic_id || 'General';
            const topicName = q.topic_name || q.metadata?.topic_name || topicId;
            const existing = topicMap.get(topicId) || {
              topic_name: topicName,
              total_questions: 0,
              correct_answers: 0,
              last_practiced_at: attempt.completed_at || attempt.started_at,
            };
            existing.total_questions += 1;
            if (qa.is_correct) {
              existing.correct_answers += 1;
            }
            if (new Date(attempt.completed_at || 0) > new Date(existing.last_practiced_at)) {
              existing.last_practiced_at = attempt.completed_at || attempt.started_at;
            }
            topicMap.set(topicId, existing);
          }
        }
      }

      // Convert topic map to array
      const topicPerformances: TopicPerformance[] = [];
      const weakAreas: TopicPerformance[] = [];
      const strongAreas: TopicPerformance[] = [];

      for (const [topicId, data] of topicMap.entries()) {
        const accuracy = data.total_questions > 0
          ? Math.round((data.correct_answers / data.total_questions) * 100)
          : 0;

        let status: 'NEEDS_PRACTICE' | 'PROFICIENT' | 'MASTERED' = 'PROFICIENT';
        if (accuracy < 60) {
          status = 'NEEDS_PRACTICE';
        } else if (accuracy >= 85 && data.total_questions >= 3) {
          status = 'MASTERED';
        }

        const perf: TopicPerformance = {
          topic_id: topicId,
          topic_name: data.topic_name,
          accuracy,
          accuracy_rate: accuracy,
          total_questions: data.total_questions,
          questions_answered: data.total_questions,
          correct_count: data.correct_answers,
          correct_answers: data.correct_answers,
          last_practiced_at: data.last_practiced_at,
          status,
        };

        topicPerformances.push(perf);

        // Weak area rule: minimum 2 questions attempted and accuracy < 60%
        if (data.total_questions >= 2 && accuracy < 60) {
          weakAreas.push(perf);
        } else if (data.total_questions >= 2 && accuracy >= 80) {
          strongAreas.push(perf);
        }
      }

      // Sort topic performances by lowest accuracy first for focused attention
      topicPerformances.sort((a, b) => a.accuracy - b.accuracy);

      const difficultyProgression: DifficultyProgression[] = (
        ['BEGINNER', 'EASY', 'MEDIUM', 'HARD', 'ADVANCED'] as QuizDifficulty[]
      ).map((diff) => {
        const stats = difficultyMap[diff];
        return {
          difficulty: diff,
          attempted: stats.attempted,
          correct: stats.correct,
          accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0,
        };
      });

      // Recommended revisions derived from weak topics
      const recommendedRevisions: RevisionRecommendation[] = weakAreas.map((weak) => ({
        topic_id: weak.topic_id,
        topic_name: weak.topic_name,
        reason: `Accuracy is currently ${weak.accuracy}%. Targeted practice will solidify key foundational concepts.`,
        recommended_difficulty: weak.accuracy < 40 ? 'EASY' : 'MEDIUM',
        suggested_question_count: 5,
      }));

      // If no weak areas, add a proactive recommendation from the lowest performing topic or general
      if (recommendedRevisions.length === 0 && topicPerformances.length > 0) {
        const candidate = topicPerformances[0];
        recommendedRevisions.push({
          topic_id: candidate.topic_id,
          topic_name: candidate.topic_name,
          reason: `Keep your mastery sharp with a rapid revision quiz. Current accuracy is ${candidate.accuracy}%.`,
          recommended_difficulty: 'HARD',
          suggested_question_count: 5,
        });
      }

      const averageScore = completedAttempts.length > 0
        ? Math.round(totalScoreSum / completedAttempts.length)
        : 0;
      const overallAccuracy = totalQuestionsAnswered > 0
        ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
        : 0;

      const progress: QuizProgress = {
        student_id: studentId,
        total_quizzes_taken: attempts.length,
        total_quizzes: attempts.length,
        total_quizzes_completed: completedAttempts.length,
        completed_quizzes: completedAttempts.length,
        total_questions_answered: totalQuestionsAnswered,
        questions_answered: totalQuestionsAnswered,
        average_score: averageScore,
        accuracy_rate: overallAccuracy,
        overall_accuracy: overallAccuracy,
        topic_performances: topicPerformances,
        weak_topics: weakAreas,
        weak_areas: weakAreas,
        strong_topics: strongAreas,
        strong_areas: strongAreas,
        difficulty_progression: difficultyProgression,
        recent_scores: recentScores.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()).slice(0, 10),
        recommended_revisions: recommendedRevisions,
        revision_recommendations: recommendedRevisions,
        last_activity_at: completedAttempts[0]?.completed_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await db.saveQuizProgress(progress);
      return progress;
    } catch (err) {
      logger.error('Error calculating student quiz progress', err);
      return await db.getQuizProgress(studentId);
    }
  }

  /**
   * Get performance for a specific topic
   */
  public static async getTopicPerformance(studentId: string, topicId: string): Promise<TopicPerformance | null> {
    const progress = await this.getStudentProgress(studentId);
    const list: TopicPerformance[] = Array.isArray(progress.topic_performances)
      ? progress.topic_performances
      : Object.values(progress.topic_performances);

    const found = list.find(
      (tp: TopicPerformance) => tp.topic_id.toLowerCase() === topicId.toLowerCase() || tp.topic_name.toLowerCase() === topicId.toLowerCase()
    );
    return found || null;
  }

  /**
   * Record attempt results into student progress
   */
  public static async recordAttemptProgress(
    studentId: string,
    attempt: QuizAttempt,
    questions: QuizQuestion[],
    questionAttempts: QuestionAttempt[]
  ): Promise<QuizProgress> {
    await db.saveQuestionAttempts(attempt.id, questionAttempts);
    return await this.getStudentProgress(studentId);
  }
}
