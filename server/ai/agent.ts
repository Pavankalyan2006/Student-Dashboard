import { MasterAgent, MultiAgentStreamEvent } from './orchestration/master';

export type AgentStreamEvent = MultiAgentStreamEvent;

export class AgentService {
  /**
   * Orchestrates multi-agent intent resolution, tool execution, and cross-agent response synthesis.
   */
  public static async *runAgentStream(
    studentId: string,
    conversationId: string,
    userMessage: string,
    clientContext?: Record<string, any>
  ): AsyncGenerator<AgentStreamEvent> {
    const explicitMode = clientContext?.mode || 'AUTO';
    for await (const event of MasterAgent.runStream(
      studentId,
      conversationId,
      userMessage,
      clientContext,
      explicitMode
    )) {
      yield event;
    }
  }
}
