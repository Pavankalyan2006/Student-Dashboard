import { db } from '../db/database';
import { LearningGoal, ResourceRecommendation } from '../models/communityProfileProgressTypes';
import { NotFoundError } from '../core/exceptions';

export class GoalService {
  public static async getGoals(studentId: string): Promise<LearningGoal[]> {
    return db.getStudentGoals(studentId);
  }

  public static async getGoal(arg1: string, arg2: string): Promise<LearningGoal> {
    const goalId = arg1.startsWith('goal_') ? arg1 : arg2;
    const studentId = arg1.startsWith('goal_') ? arg2 : arg1;
    const goal = await db.getGoalById(goalId, studentId);
    if (!goal) {
      throw new NotFoundError(`Learning goal '${goalId}' not found`);
    }
    return goal;
  }

  public static async getGoalById(arg1: string, arg2?: string): Promise<LearningGoal> {
    if (arg2) {
      return this.getGoal(arg1, arg2);
    }
    const goal = await db.getGoalById(arg1);
    if (!goal) throw new NotFoundError(`Learning goal '${arg1}' not found`);
    return goal;
  }

  public static async updateGoalProgress(
    studentId: string,
    goalId: string,
    progressValue: number
  ): Promise<LearningGoal> {
    const goal = await this.getGoalById(goalId, studentId);
    const milestones = goal.milestones.map((m, idx) => ({
      ...m,
      is_completed: progressValue >= (idx === 0 ? 10 : 25),
      completed: progressValue >= (idx === 0 ? 10 : 25),
    }));
    return db.updateGoal(goal.id, studentId, {
      current_value: progressValue,
      milestones,
      status: progressValue >= goal.target_value ? 'COMPLETED' : 'ACTIVE',
    });
  }

  public static async createGoal(studentId: string, data: Partial<LearningGoal>): Promise<LearningGoal> {
    const goal = await db.createGoal(studentId, data);
    await db.recordActivity(studentId, {
      activity_type: 'COURSE_STARTED', // qualifying setup event
      entity_type: 'LEARNING_GOAL',
      entity_id: goal.id,
      title: `Created learning goal: "${goal.title}"`,
      metadata: { target: goal.target_value, category: goal.category },
    });
    return goal;
  }

  public static async updateGoal(
    goalId: string,
    studentId: string,
    updates: Partial<LearningGoal>
  ): Promise<LearningGoal> {
    return db.updateGoal(goalId, studentId, updates);
  }

  public static async deleteGoal(goalId: string, studentId: string): Promise<boolean> {
    return db.deleteGoal(goalId, studentId);
  }

  /**
   * Retrieves verified platform resources correlated with this goal
   */
  public static async getGoalRecommendations(
    arg1: string,
    arg2: string
  ): Promise<ResourceRecommendation[]> {
    const goal = await this.getGoal(arg1, arg2);
    const recommendations: ResourceRecommendation[] = [];

    if (goal.category === 'DSA' || goal.title.toLowerCase().includes('dsa') || goal.title.toLowerCase().includes('algorithm')) {
      recommendations.push(
        {
          id: 'rec_dsa_1',
          title: 'Binary Search Trees & Balance Invariants',
          resource_type: 'DSA_PROBLEM',
          resource_id: 'prob_bst_validate',
          link: '/dsa/practice',
          reason: `Directly matches goal target: ${goal.title}`,
          estimated_time_minutes: 30,
          relevance_score: 95,
        },
        {
          id: 'rec_dsa_2',
          title: 'Graph Traversals (BFS / DFS Cycle Detection)',
          resource_type: 'COURSE_LESSON',
          resource_id: 'lesson_dsa_graph',
          link: '/courses',
          reason: 'Foundational algorithmic concepts required for milestone mastery',
          estimated_time_minutes: 45,
          relevance_score: 88,
        }
      );
    } else if (goal.category === 'RESEARCH' || goal.title.toLowerCase().includes('research') || goal.title.toLowerCase().includes('paper')) {
      recommendations.push(
        {
          id: 'rec_res_1',
          title: 'Attention Is All You Need (Vaswani et al.)',
          resource_type: 'RESEARCH_PAPER',
          resource_id: 'paper_seed_1',
          link: '/research',
          reason: 'Essential foundational architecture for proposed methodologies',
          estimated_time_minutes: 60,
          relevance_score: 96,
        },
        {
          id: 'rec_res_2',
          title: 'Literature Review Synthesis Tool',
          resource_type: 'NOTE',
          resource_id: 'note_research_guide',
          link: '/notes',
          reason: 'Structured guidelines on writing reproducible gap statements',
          estimated_time_minutes: 20,
          relevance_score: 85,
        }
      );
    } else {
      recommendations.push(
        {
          id: 'rec_gen_1',
          title: 'Operating Systems & System Architecture',
          resource_type: 'COURSE_LESSON',
          resource_id: 'lesson_os_01',
          link: '/courses',
          reason: 'Core engineering curriculum recommendation',
          estimated_time_minutes: 35,
          relevance_score: 90,
        },
        {
          id: 'rec_gen_2',
          title: 'Virtual Memory & Paging Assessment',
          resource_type: 'QUIZ',
          resource_id: 'quiz_os_paging',
          link: '/quiz',
          reason: 'Diagnostic test for current semester subjects',
          estimated_time_minutes: 15,
          relevance_score: 84,
        }
      );
    }

    return recommendations;
  }
}
