// server/ai/modelOutput.ts
// Shared rules for features that present AI output to students (Phase 1 rule, applied in Phase 2):
//  - no configured model  -> 503 AI_UNAVAILABLE, nothing is generated or saved;
//  - model answered but not in the requested format -> 502 AI_BAD_OUTPUT;
//  - never substitute template text that reads like a model answer.
import { AIService } from './service';
import { AIGenerateResult } from './provider';
import { AppError } from '../core/exceptions';

export function isModelAvailable(): boolean {
  const s = AIService.getStatus();
  return s.configured || s.provider === 'stub';
}

/** Throws 503 when the provider did not produce model output. Returns the text otherwise. */
export function requireModelText(result: AIGenerateResult, what: string): string {
  if (!result || AIService.isUnavailableResult(result) || /^\[Mock AI Provider\]/.test(result.text || '')) {
    throw new AppError(`${what} needs the AI provider, which is not available right now. Nothing was generated.`, 503, 'AI_UNAVAILABLE');
  }
  return result.text;
}

/** Strips a ```json fence and parses; throws 502 when the model did not return JSON. */
export function parseModelJson<T = any>(result: AIGenerateResult, what: string): T {
  const text = requireModelText(result, what).trim();
  let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = cleaned.search(/[\[{]/);
  const end = Math.max(cleaned.lastIndexOf('}'), cleaned.lastIndexOf(']'));
  if (start > 0 || (end > -1 && end < cleaned.length - 1)) cleaned = cleaned.slice(Math.max(0, start), end + 1);
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AppError(`${what}: the AI answered in an unexpected format, so nothing is shown. Please try again.`, 502, 'AI_BAD_OUTPUT');
  }
}

/** Re-throws AppErrors (503/502/validation) unchanged; wraps anything else as 502. */
export function rethrowAi(err: any, what: string): never {
  if (err instanceof AppError) throw err;
  throw new AppError(`${what} failed: ${err?.message || 'unknown error'}`, 502, 'AI_FAILED');
}
