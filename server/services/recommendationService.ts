import { ResourceRecommendation } from '../models/communityProfileProgressTypes';
import { BriefingService, type BriefingItem } from './briefingService';
import { CareerService } from './careerService';

/**
 * Phase 7: the next useful activities for a student, at most three.
 *
 * Every suggestion comes from the student's own records through the Daily Briefing (deadlines, planned
 * tasks, due flashcards, open mistakes, knowledge-graph gaps, attendance) plus the next unverified step
 * of an active career roadmap. Each one says why it is suggested and which record it came from.
 * Suggestions the student dismissed or postponed in the briefing are not shown again; there is no
 * second dismiss list. A new student with no records gets an empty list, never sample content.
 *
 * (Earlier versions returned the same four hard-coded items, such as "Attention Is All You Need",
 * to every student.)
 */
export interface NextActivity extends ResourceRecommendation {
  /** The record it came from, in plain words ("Semester calendar", "Career roadmap: Data Analyst"). */
  source: string;
  /** Briefing item id: dismiss or postpone it with POST /briefing/me/items/:id. */
  briefing_item_id?: string;
}

export const MAX_RECOMMENDATIONS = 3;

const TYPE_FOR_KIND: Record<string, ResourceRecommendation['resource_type']> = {
  flashcards: 'QUIZ',
  mistakes: 'QUIZ',
  revision: 'NOTE',
  foundation: 'COURSE_LESSON',
  next_topic: 'COURSE_LESSON',
  study_task: 'PROJECT_TASK',
  overdue: 'PROJECT_TASK',
  due_soon: 'PROJECT_TASK',
  start_prep: 'NOTE',
  attendance: 'PROJECT_TASK',
  contest: 'CODING_PROBLEM',
};

export function fromBriefingItem(item: BriefingItem): NextActivity {
  return {
    id: `rec_${item.id}`,
    title: item.title,
    resource_type: TYPE_FOR_KIND[item.kind] || 'PROJECT_TASK',
    resource_id: item.id,
    link: item.route,
    reason: item.detail,
    estimated_time_minutes: item.minutes,
    // Briefing priority 1 (do today) ranks above 2 and 3. This is an order, not a prediction.
    relevance_score: item.priority === 1 ? 90 : item.priority === 2 ? 70 : 50,
    source: item.source,
    briefing_item_id: item.id,
  };
}

export class RecommendationService {
  public static async getRecommendations(studentId: string, today = new Date().toISOString().slice(0, 10)): Promise<NextActivity[]> {
    const out: NextActivity[] = [];
    const briefing = await BriefingService.forStudent(studentId, today).catch(() => null);
    for (const item of [...(briefing?.items || [])].sort((a, b) => a.priority - b.priority)) {
      if (out.length >= MAX_RECOMMENDATIONS - 1) break; // leave room for one career step
      out.push(fromBriefingItem(item));
    }

    const roadmaps: any[] = await CareerService.listRoadmaps(studentId).catch(() => []);
    for (const r of roadmaps.filter((x) => x.status !== 'COMPLETED')) {
      const next = (r.steps || []).find((s: any) => !s.evidence?.verified);
      if (!next) continue;
      out.push({
        id: `rec_step_${next.id}`,
        title: next.title,
        resource_type: next.source_type === 'COURSE' ? 'COURSE_LESSON' : next.source_type === 'DSA' ? 'DSA_PROBLEM' : 'PROJECT_TASK',
        resource_id: next.source_id || next.id,
        link: next.url || '/career/roadmap',
        reason: `Next step on your "${r.title}" roadmap that has no recorded evidence yet (${next.evidence?.detail || 'not started'}).`,
        estimated_time_minutes: 45,
        relevance_score: 60,
        source: `Career roadmap: ${r.title}`,
      });
      break;
    }

    // Fill up to three from the briefing if there was no roadmap step.
    if (out.length < MAX_RECOMMENDATIONS && briefing) {
      for (const item of [...briefing.items].sort((a, b) => a.priority - b.priority)) {
        if (out.length >= MAX_RECOMMENDATIONS) break;
        if (!out.some((o) => o.briefing_item_id === item.id)) out.push(fromBriefingItem(item));
      }
    }
    return out.slice(0, MAX_RECOMMENDATIONS);
  }
}
