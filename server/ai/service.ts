import { AIProvider, GeminiProvider, MockAIProvider, AIMessage, AIGenerateResult } from './provider';
import { PromptService } from './prompts';
import { ToolRegistry } from './tools';
import { config } from '../core/config';
import { logger } from '../core/logging';
import { UserRole } from '../models/types';

export class AIService {
  private static provider: AIProvider =
    config.aiProvider === 'gemini' ? new GeminiProvider() : new MockAIProvider();

  public static setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  public static async generate(
    messages: AIMessage[],
    promptKey = 'student_learning_agent',
    temperature = 0.7
  ): Promise<AIGenerateResult> {
    const systemInstruction = PromptService.getPrompt(promptKey);
    logger.info('AIService generate call initiated', {
      context: { provider: this.provider.name, promptKey, messageCount: messages.length },
    });
    return this.provider.generate({
      messages,
      systemInstruction,
      temperature,
    });
  }

  public static async stream(
    messages: AIMessage[],
    onChunk: (text: string) => void,
    promptKey = 'student_learning_agent',
    temperature = 0.7
  ): Promise<void> {
    const systemInstruction = PromptService.getPrompt(promptKey);
    logger.info('AIService stream call initiated', {
      context: { provider: this.provider.name, promptKey, messageCount: messages.length },
    });
    return this.provider.stream(
      {
        messages,
        systemInstruction,
        temperature,
      },
      onChunk
    );
  }

  public static async executeTool(
    toolName: string,
    params: Record<string, any>,
    context: { studentId: string; role: UserRole }
  ): Promise<any> {
    return ToolRegistry.execute(toolName, params, context);
  }

  public static getRegisteredTools() {
    return ToolRegistry.getAllTools();
  }
}
