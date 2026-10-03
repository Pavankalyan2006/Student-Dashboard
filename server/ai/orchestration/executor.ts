import { TaskPlan, AgentContext, AgentResult, AgentTask } from './types';
import { AgentRegistry } from './registry';
import { AgentHandlers } from './agentHandlers';
import { ResultValidator, ConflictResolver } from './validator';
import { logger } from '../../core/logging';

export interface ExecutorCallbacks {
  onTaskStart?: (task: AgentTask) => void;
  onTaskComplete?: (task: AgentTask, result: AgentResult) => void;
  onTaskFailed?: (task: AgentTask, error: string) => void;
}

export class AgentExecutor {
  private static readonly MAX_STEPS = 15;
  private static readonly MAX_WORKFLOW_TIME_MS = 60000;

  /**
   * Executes the tasks in a plan in dependency order with parallel execution of independent tasks.
   */
  public static async executePlan(
    plan: TaskPlan,
    context: AgentContext,
    callbacks?: ExecutorCallbacks
  ): Promise<AgentResult[]> {
    const startTime = Date.now();
    const completedTasks = new Set<string>();
    const sharedResults = new Map<string, AgentResult>();
    const results: AgentResult[] = [];
    let stepCount = 0;

    const remainingTasks = [...plan.tasks];

    while (remainingTasks.length > 0) {
      stepCount++;
      if (stepCount > this.MAX_STEPS) {
        logger.warn(`Agent loop protection triggered: exceeded ${this.MAX_STEPS} steps`);
        break;
      }

      if (Date.now() - startTime > this.MAX_WORKFLOW_TIME_MS) {
        logger.warn(`Agent workflow timeout triggered: exceeded ${this.MAX_WORKFLOW_TIME_MS}ms`);
        break;
      }

      // Find all tasks whose dependencies have been completed
      const readyTasks = remainingTasks.filter((task) =>
        task.dependencies.every((depId) => completedTasks.has(depId))
      );

      if (readyTasks.length === 0) {
        logger.warn('Dependency deadlock detected or remaining tasks have unmet dependencies');
        break;
      }

      // Execute ready tasks in parallel
      const executionPromises = readyTasks.map(async (task) => {
        task.status = 'in_progress';
        task.startedAt = new Date().toISOString();
        callbacks?.onTaskStart?.(task);

        const taskStart = Date.now();
        let result: AgentResult;

        try {
          const def = AgentRegistry.get(task.agent);
          const timeoutMs = def?.timeoutMs || 15000;

          // Execute with timeout wrapper
          result = await Promise.race([
            AgentHandlers.executeTask(task, context, sharedResults),
            new Promise<AgentResult>((_, reject) =>
              setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
            ),
          ]);
        } catch (err: any) {
          logger.error(`Error executing task ${task.id} (${task.agent})`, err);
          result = {
            agent: task.agent,
            status: 'failure',
            summary: `Execution error: ${err.message}`,
            data: {},
            evidenceType: 'INFERENCE',
            sources: [],
            warnings: [err.message],
          };
        }

        const durationMs = Date.now() - taskStart;
        task.durationMs = durationMs;
        task.completedAt = new Date().toISOString();

        // Validate and sanitize result
        const { sanitizedResult } = ResultValidator.validate(result);
        task.result = sanitizedResult;

        if (sanitizedResult.status === 'failure') {
          task.status = 'failed';
          task.error = sanitizedResult.summary;
          callbacks?.onTaskFailed?.(task, sanitizedResult.summary);
          AgentRegistry.recordExecution(task.agent, false, durationMs, sanitizedResult.toolCallsExecuted?.length || 0);
        } else {
          task.status = 'completed';
          callbacks?.onTaskComplete?.(task, sanitizedResult);
          AgentRegistry.recordExecution(task.agent, true, durationMs, sanitizedResult.toolCallsExecuted?.length || 0);
        }

        return { task, result: sanitizedResult };
      });

      const batchResults = await Promise.all(executionPromises);

      for (const { task, result } of batchResults) {
        completedTasks.add(task.id);
        sharedResults.set(task.id, result);
        results.push(result);

        const idx = remainingTasks.findIndex((t) => t.id === task.id);
        if (idx !== -1) {
          remainingTasks.splice(idx, 1);
        }
      }
    }

    // Resolve any cross-agent data conflicts
    return ConflictResolver.resolveConflicts(results);
  }
}
