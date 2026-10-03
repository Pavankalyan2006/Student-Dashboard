import { db } from '../../db/database';
import { AgentRouter } from './router';
import { TaskPlanner } from './planner';
import { AgentExecutor } from './executor';
import { ResponseSynthesizer } from './synthesizer';
import { AgentContext, AgentWorkflowRecord } from './types';
import { AIMessageRecord, ToolExecutionSummary, AgentPlanItem, AICitationItem } from '../../models/types';
import { logger } from '../../core/logging';

export interface MultiAgentStreamEvent {
  type:
    | 'message_start'
    | 'agent_plan'
    | 'agent_step_start'
    | 'agent_step_complete'
    | 'tool_start'
    | 'tool_result'
    | 'message_delta'
    | 'message_complete'
    | 'error';
  data: any;
}

export class MasterAgent {
  /**
   * Primary entry point for multi-agent streaming orchestration.
   */
  public static async *runStream(
    studentId: string,
    conversationId: string,
    userMessage: string,
    clientContext?: Record<string, any>,
    explicitMode?: string
  ): AsyncGenerator<MultiAgentStreamEvent> {
    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const startedAt = new Date().toISOString();

    yield {
      type: 'message_start',
      data: { conversationId, workflowId, timestamp: startedAt },
    };

    try {
      // 1. Authenticate and retrieve student learning context
      const studentContext = await db.getStudentLearningContext(studentId);
      const student = studentContext.student;

      // 2. Build secure scoped AgentContext
      const agentContext: AgentContext = {
        student_id: studentId,
        role: student.role,
        conversation_id: conversationId,
        request_id: workflowId,
        current_course: studentContext.current_course,
        current_lesson: studentContext.current_lesson,
        client_metadata: clientContext,
        selected_documents: clientContext?.document_id ? [clientContext.document_id] : [],
        selected_repository: clientContext?.repository,
      };

      // 3. Classify intent and route to specialized agents
      const intent = AgentRouter.route(userMessage, agentContext, explicitMode);

      // 4. Create Task Plan DAG
      const plan = TaskPlanner.plan(workflowId, intent, userMessage, agentContext);

      // Map to frontend AgentPlanItem format
      const frontendPlanSteps: AgentPlanItem[] = plan.tasks.map((t, idx) => ({
        step: idx + 1,
        title: `[${t.agent}] ${t.title}`,
        description: t.description,
        status: 'pending',
      }));

      yield {
        type: 'agent_plan',
        data: { steps: frontendPlanSteps, intent: intent.intent, complexity: intent.complexity },
      };

      // Persist workflow in database
      const workflowRecord: AgentWorkflowRecord = {
        id: workflowId,
        conversation_id: conversationId,
        student_id: studentId,
        workflow_type: intent.intent,
        complexity: intent.complexity,
        status: 'PROCESSING',
        agents_involved: intent.targetAgents,
        tasks: plan.tasks.map((t) => ({
          id: t.id,
          agent: t.agent,
          title: t.title,
          status: 'pending',
        })),
        started_at: startedAt,
      };
      await db.saveAgentWorkflow(workflowRecord).catch(() => {});

      const toolSummaries: ToolExecutionSummary[] = [];

      // 5. Execute agent plan via AgentExecutor
      const agentResults = await AgentExecutor.executePlan(plan, agentContext, {
        onTaskStart: (task) => {
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem) stepItem.status = 'in_progress';
        },
        onTaskComplete: (task, res) => {
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem) stepItem.status = 'completed';

          if (res.toolCallsExecuted) {
            for (const call of res.toolCallsExecuted) {
              toolSummaries.push({
                id: `tool_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
                tool_name: `${task.agent} → ${call.toolName}`,
                status: 'completed',
                parameters: call.parameters,
                result: call.resultSummary,
              });
            }
          }
        },
        onTaskFailed: (task, err) => {
          const stepItem = frontendPlanSteps.find((s) => s.title.includes(task.title));
          if (stepItem) stepItem.status = 'pending';
        },
      });

      // Emit updated plan status
      yield {
        type: 'agent_plan',
        data: { steps: frontendPlanSteps },
      };

      // Emit tool execution events
      for (const t of toolSummaries) {
        yield {
          type: 'tool_start',
          data: { toolName: t.tool_name, parameters: t.parameters },
        };
        yield {
          type: 'tool_result',
          data: { toolName: t.tool_name, result: t.result },
        };
      }

      // 6. Synthesize final response
      const synthesized = ResponseSynthesizer.synthesize(userMessage, plan, agentResults);

      // Convert citations to frontend format
      const citations: AICitationItem[] = synthesized.sources.map((s, idx) => ({
        id: `cit_${idx}_${Date.now()}`,
        title: s.title,
        source: s.sourceType.replace(/_/g, ' '),
        page: s.page,
        link: s.link,
      }));

      // 7. Stream markdown content progressively
      let fullContent = '';
      const words = synthesized.markdownContent.split(' ');

      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + ' ';
        fullContent += chunk;
        yield {
          type: 'message_delta',
          data: { delta: chunk },
        };

        if (process.env.NODE_ENV !== 'test') {
          await new Promise((r) => setTimeout(r, 12));
        }
      }

      // 8. Persist completed message
      const assistantMsg = await db.addMessageToConversation(conversationId, studentId, {
        conversation_id: conversationId,
        role: 'assistant',
        content: fullContent,
        metadata: {
          toolCalls: toolSummaries,
          agentPlan: frontendPlanSteps,
          suggestedActions: synthesized.nextActions,
          citations,
          workflowId,
        },
      });

      // Update workflow record in db
      workflowRecord.status = 'COMPLETED';
      workflowRecord.completed_at = new Date().toISOString();
      workflowRecord.total_duration_ms = Date.now() - new Date(startedAt).getTime();
      await db.updateAgentWorkflow(workflowRecord).catch(() => {});

      yield {
        type: 'message_complete',
        data: {
          message: assistantMsg,
          conversationId,
          workflowId,
        },
      };
    } catch (err: any) {
      logger.error('MasterAgent execution error', err);
      yield {
        type: 'error',
        data: { message: err.message || 'Multi-agent orchestration encountered an error' },
      };
    }
  }

  /**
   * Synchronous helper for non-streaming endpoints.
   */
  public static async run(
    studentId: string,
    conversationId: string,
    userMessage: string,
    clientContext?: Record<string, any>,
    explicitMode?: string
  ): Promise<AIMessageRecord> {
    let finalMessage: AIMessageRecord | null = null;
    for await (const event of this.runStream(studentId, conversationId, userMessage, clientContext, explicitMode)) {
      if (event.type === 'message_complete') {
        finalMessage = event.data.message;
      }
    }

    if (!finalMessage) {
      throw new Error('Multi-agent execution did not produce a final message');
    }

    return finalMessage;
  }
}
