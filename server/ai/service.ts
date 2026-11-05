import { AIProvider, GeminiProvider, MockAIProvider, AIMessage, AIGenerateResult } from './provider';
import { PromptService } from './prompts';
import { ToolRegistry } from './tools';
import { config } from '../core/config';
import { logger } from '../core/logging';
import { UserRole } from '../models/types';

export class AIService {
  private static provider: AIProvider =
    config.aiProvider === 'gemini' ? new GeminiProvider() : new MockAIProvider();

  /** What the UI may truthfully show about the AI provider: its name, model and whether a key is set. */
  public static getStatus(): { provider: string; configured: boolean; model: string | null } {
    const p: any = this.provider;
    return {
      provider: p.name,
      configured: p.name === 'gemini' ? Boolean(p.configured) : false,
      model: p.name === 'gemini' && p.configured ? p.primaryModel : null,
    };
  }

  public static setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  /**
   * True when the provider answered with its "AI unavailable" notice instead of model output
   * (no API key, or the provider request failed). Callers that persist AI output (notes,
   * generated study material) must not save that notice as if it were generated content.
   */
  public static isUnavailableResult(result: AIGenerateResult): boolean {
    return typeof result?.text === 'string' && result.text.startsWith('**AI unavailable.**');
  }

  public static async generate(
    messages: AIMessage[],
    promptKey?: string,
    temperature = 0.7
  ): Promise<AIGenerateResult> {
    // 1. Extract system instruction from messages or explicit promptKey
    let systemInstruction: string | undefined = undefined;
    const filteredMessages: AIMessage[] = [];

    for (const m of messages) {
      if (m.role === 'system') {
        if (!systemInstruction) {
          systemInstruction = m.content;
        } else {
          systemInstruction += '\n\n' + m.content;
        }
      } else {
        filteredMessages.push(m);
      }
    }

    if (!systemInstruction && promptKey) {
      systemInstruction = PromptService.getPrompt(promptKey);
    }

    logger.info('AIService generate call initiated', {
      context: { provider: this.provider.name, promptKey, messageCount: filteredMessages.length },
    });

    return this.provider.generate({
      messages: filteredMessages.length > 0 ? filteredMessages : messages,
      systemInstruction,
      temperature,
    });
  }

  public static async stream(
    messages: AIMessage[],
    onChunk: (text: string) => void,
    promptKey?: string,
    temperature = 0.7
  ): Promise<void> {
    let systemInstruction: string | undefined = undefined;
    const filteredMessages: AIMessage[] = [];

    for (const m of messages) {
      if (m.role === 'system') {
        if (!systemInstruction) {
          systemInstruction = m.content;
        } else {
          systemInstruction += '\n\n' + m.content;
        }
      } else {
        filteredMessages.push(m);
      }
    }

    if (!systemInstruction && promptKey) {
      systemInstruction = PromptService.getPrompt(promptKey);
    }

    logger.info('AIService stream call initiated', {
      context: { provider: this.provider.name, promptKey, messageCount: filteredMessages.length },
    });

    return this.provider.stream(
      {
        messages: filteredMessages.length > 0 ? filteredMessages : messages,
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
