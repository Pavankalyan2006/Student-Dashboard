// The student's own controls over what the AI assistant remembers and uses.
//
// The assistant's context is rebuilt from the student's records on every request (see server/ai/personalization.ts).
// This store adds what only the student can decide:
//   - whether AI answers are personalised at all,
//   - whether recent activity and weak areas from their results are used, or only their profile,
//   - short notes they ask the assistant to remember ("I learn best from diagrams", "my lab exam is in C").
// Each student's settings are stored separately and persisted with the rest of the platform's state.
import { ValidationError, NotFoundError } from '../core/exceptions';

export interface AiMemoryNote {
  id: string;
  text: string;
  created_at: string;
}

export interface AiMemorySettings {
  student_id: string;
  personalize: boolean;
  use_activity: boolean;
  notes: AiMemoryNote[];
  updated_at: string | null;
}

export const MAX_MEMORY_NOTES = 20;
export const MAX_NOTE_LENGTH = 200;

export const aiMemoryStores: { settings: Map<string, AiMemorySettings> } = { settings: new Map() };

export function defaultSettings(studentId: string): AiMemorySettings {
  return { student_id: studentId, personalize: true, use_activity: true, notes: [], updated_at: null };
}

// Contact details do not belong in an AI prompt, so they are removed from notes before saving.
const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
const PHONE = /(\+?\d[\d\s-]{8,}\d)/g;
const URL_RE = /https?:\/\/\S+/g;

/** Cleans one note: single line, no contact details or links, within the length limit. */
export function cleanNote(text: unknown): string {
  return String(text ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(EMAIL, '[email removed]')
    .replace(PHONE, '[number removed]')
    .replace(URL_RE, '[link removed]')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, MAX_NOTE_LENGTH);
}

const noteId = () => `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export class AiMemoryService {
  static get(studentId: string): AiMemorySettings {
    return aiMemoryStores.settings.get(studentId) || defaultSettings(studentId);
  }

  // A new object on every change, so the state store sees it and persists it.
  private static put(studentId: string, next: Omit<AiMemorySettings, 'student_id' | 'updated_at'>): AiMemorySettings {
    const saved: AiMemorySettings = { ...next, student_id: studentId, updated_at: new Date().toISOString() };
    aiMemoryStores.settings.set(studentId, saved);
    return saved;
  }

  static updateSettings(studentId: string, input: any): AiMemorySettings {
    if (!input || typeof input !== 'object') throw new ValidationError('Send your AI settings as an object.');
    const cur = this.get(studentId);
    const bool = (v: unknown, fallback: boolean) => (typeof v === 'boolean' ? v : fallback);
    return this.put(studentId, {
      personalize: bool(input.personalize, cur.personalize),
      use_activity: bool(input.use_activity, cur.use_activity),
      notes: cur.notes,
    });
  }

  static addNote(studentId: string, text: unknown): AiMemorySettings {
    const clean = cleanNote(text);
    if (clean.length < 3) throw new ValidationError('Write a short note for the assistant to remember.');
    const cur = this.get(studentId);
    if (cur.notes.length >= MAX_MEMORY_NOTES) throw new ValidationError(`You can keep up to ${MAX_MEMORY_NOTES} notes. Remove one first.`);
    if (cur.notes.some((n) => n.text.toLowerCase() === clean.toLowerCase())) throw new ValidationError('The assistant already remembers that.');
    return this.put(studentId, { ...cur, notes: [...cur.notes, { id: noteId(), text: clean, created_at: new Date().toISOString() }] });
  }

  static removeNote(studentId: string, noteIdToRemove: string): AiMemorySettings {
    const cur = this.get(studentId);
    if (!cur.notes.some((n) => n.id === noteIdToRemove)) throw new NotFoundError('That note is not in your AI memory.');
    return this.put(studentId, { ...cur, notes: cur.notes.filter((n) => n.id !== noteIdToRemove) });
  }

  static clearNotes(studentId: string): AiMemorySettings {
    const cur = this.get(studentId);
    return this.put(studentId, { ...cur, notes: [] });
  }
}
