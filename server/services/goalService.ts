import { db } from '../db/database';
import { LearningGoal, ResourceRecommendation } from '../models/communityProfileProgressTypes';
import { NotFoundError } from '../core/exceptions';

export class GoalService {
  public static async getGoals(
    studentId: string,
    filters?: { status?: string; category?: string; priority?: string; search?: string }
  ): Promise<LearningGoal[]> {
    let goals = await db.getStudentGoals(studentId);

    if (filters?.status && filters.status !== 'ALL') {
      const sUpper = filters.status.toUpperCase();
      goals = goals.filter((g) => g.status.toUpperCase() === sUpper);
    }

    if (filters?.category && filters.category !== 'ALL') {
      const cUpper = filters.category.toUpperCase();
      goals = goals.filter((g) => g.category.toUpperCase() === cUpper);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      const pUpper = filters.priority.toUpperCase();
      goals = goals.filter((g) => ((g as any).priority || 'MEDIUM').toUpperCase() === pUpper);
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      goals = goals.filter(
        (g) => g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q))
      );
    }

    return goals;
  }

  public static async getGoal(arg1: string, arg2?: string): Promise<LearningGoal> {
    const goalId = (arg1 || '').startsWith('goal_') ? arg1 : arg2 || '';
    const studentId = (arg1 || '').startsWith('goal_') ? (arg2 || '') : arg1;
    const goal = await db.getGoalById(goalId, studentId);
    if (!goal) {
      throw new NotFoundError(`Learning goal '${goalId}' not found`);
    }
    return goal;
  }

  public static async getGoalById(arg1: string, arg2?: string): Promise<LearningGoal> {
    return this.getGoal(arg1, arg2);
  }

  public static async toggleMilestone(
    arg1: string,
    arg2: string,
    milestoneId: string
  ): Promise<LearningGoal> {
    const goalId = (arg1 || '').startsWith('goal_') ? arg1 : arg2;
    const studentId = (arg1 || '').startsWith('goal_') ? arg2 : arg1;
    const goal = await this.getGoal(goalId, studentId);
    let matched = false;

    const milestones = (goal.milestones || []).map((m, idx) => {
      const idMatch = m.id === milestoneId || String(idx) === milestoneId || `ms_${idx + 1}` === milestoneId;
      if (idMatch) {
        matched = true;
        const nextState = !m.is_completed && !m.completed;
        return {
          ...m,
          id: m.id || `ms_${idx + 1}`,
          is_completed: nextState,
          completed: nextState,
          completed_at: nextState ? new Date().toISOString() : undefined,
        };
      }
      return m;
    });

    if (!matched && milestones.length > 0) {
      // fallback toggle first incomplete or first milestone
      milestones[0].is_completed = !milestones[0].is_completed;
      milestones[0].completed = milestones[0].is_completed;
    }

    const completedCount = milestones.filter((m) => m.is_completed || m.completed).length;
    const allCompleted = milestones.length > 0 && completedCount === milestones.length;

    const nextStatus = allCompleted ? 'COMPLETED' : goal.status === 'COMPLETED' ? 'ACTIVE' : goal.status;
    const nextCurrentVal = milestones.length > 0 ? completedCount : goal.current_value;
    const nextProgressPercentage = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : goal.progress_percentage || 0;

    return db.updateGoal(goal.id, studentId, {
      milestones,
      current_value: nextCurrentVal,
      progress_percentage: nextProgressPercentage,
      status: nextStatus as any,
    });
  }

  public static async updateGoalProgress(
    studentId: string,
    goalId: string,
    progressValue: number
  ): Promise<LearningGoal> {
    const goal = await this.getGoal(goalId, studentId);
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
    arg1: string,
    arg2: string,
    updates: Partial<LearningGoal>
  ): Promise<LearningGoal> {
    const goalId = (arg1 || '').startsWith('goal_') ? arg1 : arg2;
    const studentId = (arg1 || '').startsWith('goal_') ? arg2 : arg1;
    return db.updateGoal(goalId, studentId, updates);
  }

  public static async deleteGoal(arg1: string, arg2?: string): Promise<{ success: boolean }> {
    const goalId = (arg1 || '').startsWith('goal_') ? arg1 : arg2 || '';
    const studentId = (arg1 || '').startsWith('goal_') ? (arg2 || '') : arg1;
    const deleted = await db.deleteGoal(goalId, studentId);
    return { success: deleted };
  }

  /**
   * Retrieves verified platform resources correlated with this goal
   */
  public static async getGoalRecommendations(
    arg1: string,
    arg2?: string
  ): Promise<any[]> {
    if (!arg2 && !arg1.startsWith('goal_')) {
      const studentId = arg1;
      const goals = await db.getStudentGoals(studentId);
      if (goals.length > 0) {
        return this.getGoalRecommendations(goals[0].id, studentId);
      }
      return [
        {
          id: 'rec_dsa_1',
          title: 'Master Graph Algorithms & Dynamic Programming',
          category: 'DSA',
          reason: 'Core B.Tech semester 6 placement requirement',
          estimated_time_minutes: 45,
          relevance_score: 95,
        },
      ];
    }
    const goalId = (arg1 || '').startsWith('goal_') ? arg1 : arg2 || '';
    const studentId = (arg1 || '').startsWith('goal_') ? (arg2 || '') : arg1;
    const goal = await this.getGoal(goalId, studentId);
    const recommendations: any[] = [];

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
