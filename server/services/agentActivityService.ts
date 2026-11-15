// Per-student log of what the AI agents did with the platform's tools, and the student's own agent switches.
//
// Every tool call made for a student (by an agent or by a confirmed action on a page) is recorded here with its
// outcome, so the Agent Control Center can show a real execution log. Tool parameters and results are not
// stored: only the tool name, its category, whether it needed approval, and whether it worked.

export type ToolCategory = 'READ_ONLY' | 'AI_GENERATION' | 'MUTATION' | 'EXTERNAL_ACTION';

export interface AgentActivityEntry {
  id: string;
  at: string;
  tool: string;
  /** The specialist agent that called the tool; absent when the student ran it from a page. */
  agent?: string;
  category: ToolCategory;
  status: 'ok' | 'failed' | 'blocked';
  needs_approval: boolean;
  approved: boolean;
  duration_ms: number;
  error?: string;
}

export interface StudentAgentPrefs {
  student_id: string;
  /** Specialist agents the student has switched off. */
  disabled: string[];
  updated_at: string | null;
}

export const MAX_ACTIVITY = 100;

export const agentActivityStores: { log: Map<string, AgentActivityEntry[]>; prefs: Map<string, StudentAgentPrefs> } = {
  log: new Map(),
  prefs: new Map(),
};

const entryId = () => `aa${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export class AgentActivityService {
  static record(studentId: string, entry: Omit<AgentActivityEntry, 'id' | 'at'>): void {
    if (!studentId) return;
    const clean: AgentActivityEntry = { ...entry, id: entryId(), at: new Date().toISOString(), error: entry.error ? String(entry.error).slice(0, 200) : undefined };
    // A new array each time, so the state store sees the change and persists it.
    const next = [clean, ...(agentActivityStores.log.get(studentId) || [])].slice(0, MAX_ACTIVITY);
    agentActivityStores.log.set(studentId, next);
  }

  static list(studentId: string, limit = 50): AgentActivityEntry[] {
    return (agentActivityStores.log.get(studentId) || []).slice(0, Math.max(1, Math.min(MAX_ACTIVITY, limit)));
  }

  static prefs(studentId: string): StudentAgentPrefs {
    return agentActivityStores.prefs.get(studentId) || { student_id: studentId, disabled: [], updated_at: null };
  }

  static setEnabled(studentId: string, agentId: string, enabled: boolean): StudentAgentPrefs {
    const cur = this.prefs(studentId);
    const disabled = new Set(cur.disabled);
    if (enabled) disabled.delete(agentId);
    else disabled.add(agentId);
    const next = { student_id: studentId, disabled: [...disabled].sort(), updated_at: new Date().toISOString() };
    agentActivityStores.prefs.set(studentId, next);
    return next;
  }
}
