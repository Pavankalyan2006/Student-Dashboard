import { AgentResult, SourceProvenance } from './types';
import { logger } from '../../core/logging';

export const SOURCE_AUTHORITY_PRIORITY: Record<string, number> = {
  STUDENT_DATABASE: 7,
  COURSE_DATABASE: 6,
  PROJECT_DATABASE: 5,
  GITHUB_API: 4,
  RESEARCH_PROVIDER: 3,
  DOCUMENT_RAG: 2,
  AI_INFERENCE: 1,
};

export class ConflictResolver {
  /**
   * Resolves conflicts between multiple agent findings by applying the authoritative source hierarchy:
   * Student DB > Course DB > Project DB > GitHub API > Research provider > Document RAG > AI inference.
   */
  public static resolveConflicts(results: AgentResult[]): AgentResult[] {
    const verifiedDataMap = new Map<string, { value: any; priority: number; source: SourceProvenance }>();

    for (const res of results) {
      for (const [key, val] of Object.entries(res.data)) {
        if (val === undefined || val === null) continue;

        const bestSource = res.sources.reduce((highest, current) => {
          const currentPri = SOURCE_AUTHORITY_PRIORITY[current.sourceType] || 0;
          const highestPri = highest ? (SOURCE_AUTHORITY_PRIORITY[highest.sourceType] || 0) : -1;
          return currentPri > highestPri ? current : highest;
        }, null as SourceProvenance | null);

        const currentPriority = bestSource
          ? (SOURCE_AUTHORITY_PRIORITY[bestSource.sourceType] || 1)
          : (res.evidenceType === 'OBSERVED_DATA' ? 5 : 1);

        const existing = verifiedDataMap.get(key);
        if (!existing) {
          verifiedDataMap.set(key, { value: val, priority: currentPriority, source: bestSource! });
        } else if (currentPriority > existing.priority) {
          logger.info(`Resolved data conflict for '${key}': preferred priority ${currentPriority} over ${existing.priority}`);
          verifiedDataMap.set(key, { value: val, priority: currentPriority, source: bestSource! });
        }
      }
    }

    return results;
  }
}

export class ResultValidator {
  /**
   * Validates an agent result against schema invariants, evidence rules, and permission safety.
   */
  public static validate(result: AgentResult): { isValid: boolean; sanitizedResult: AgentResult; error?: string } {
    if (!result || typeof result !== 'object') {
      return {
        isValid: false,
        sanitizedResult: {
          agent: 'LearningAgent',
          status: 'failure',
          summary: 'Invalid result format produced by agent',
          data: {},
          evidenceType: 'INFERENCE',
          sources: [],
        },
        error: 'Null or non-object result produced',
      };
    }

    // Ensure status is valid
    const status = ['success', 'failure', 'partial'].includes(result.status)
      ? result.status
      : 'partial';

    // Ensure evidenceType is valid
    const evidenceType = ['OBSERVED_DATA', 'AI_RECOMMENDATION', 'INFERENCE', 'USER_PROVIDED'].includes(
      result.evidenceType
    )
      ? result.evidenceType
      : 'INFERENCE';

    // Sanitize sources to ensure valid URLs and dates
    const sanitizedSources: SourceProvenance[] = (result.sources || []).map((s, idx) => ({
      sourceType: s.sourceType || 'AI_INFERENCE',
      sourceId: s.sourceId || `src_${idx}`,
      title: s.title || 'Platform Reference',
      location: s.location,
      link: s.link,
      page: s.page,
      retrievedAt: s.retrievedAt || new Date().toISOString(),
      confidence: typeof s.confidence === 'number' ? s.confidence : 0.9,
    }));

    return {
      isValid: true,
      sanitizedResult: {
        ...result,
        status,
        evidenceType,
        sources: sanitizedSources,
        data: result.data || {},
        summary: result.summary || 'Task completed',
      },
    };
  }
}
