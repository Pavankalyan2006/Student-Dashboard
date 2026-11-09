// Local file persistence for the in-memory data store.
//
// The platform keeps all records in JavaScript Maps (see DatabaseStore and the static
// Maps in a few services). Without this module every server restart wiped every
// student account, note, document record and progress entry. This module snapshots
// the registered Maps/arrays to a JSON file and restores them on startup.
//
// It is a stop-gap for local/single-instance use, not a replacement for a real database.
import fs from 'fs';
import path from 'path';
import { logger } from '../core/logging';

interface PersistentSource {
  name: string;
  target: Record<string, any>;
  keys: string[];
}

const sources: PersistentSource[] = [];
let saveTimer: NodeJS.Timeout | null = null;
let restored = false;

/** Resolved snapshot path, or null when persistence is disabled. */
export function getSnapshotPath(): string | null {
  const mode = (process.env.DATA_PERSISTENCE || '').toLowerCase();
  if (mode === 'off' || mode === 'false' || mode === '0') return null;
  // Never touch disk from the unit test runner unless explicitly requested.
  if ((process.env.VITEST || process.env.NODE_ENV === 'test') && !process.env.DATA_SNAPSHOT_PATH) return null;
  return path.resolve(process.env.DATA_SNAPSHOT_PATH || './data/runtime/db-snapshot.json');
}

export function encodeValue(value: unknown): unknown {
  return encode(value);
}

export function decodeValue(value: any): any {
  return decode(value);
}

/** Read-only view of the registered sources (used by the Postgres state store). */
export function getRegisteredSources(): ReadonlyArray<{ name: string; target: Record<string, any>; keys: string[] }> {
  return sources;
}

function encode(value: unknown): unknown {
  if (value instanceof Map) {
    return { __type: 'Map', entries: Array.from(value.entries()).map(([k, v]) => [k, encode(v)]) };
  }
  if (value instanceof Set) {
    return { __type: 'Set', values: Array.from(value.values()).map(encode) };
  }
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = encode(v);
    return out;
  }
  return value;
}

function decode(value: any): any {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === 'object') {
    if (value.__type === 'Map' && Array.isArray(value.entries)) {
      return new Map(value.entries.map(([k, v]: [unknown, unknown]) => [k, decode(v)]));
    }
    if (value.__type === 'Set' && Array.isArray(value.values)) {
      return new Set(value.values.map(decode));
    }
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = decode(v);
    return out;
  }
  return value;
}

/**
 * Registers an object (instance or class with static fields) whose Map/array fields
 * should be persisted. When `keys` is omitted every own Map/Set/array field is used.
 */
export function registerPersistentSource(name: string, target: Record<string, any>, keys?: string[]): void {
  const resolvedKeys =
    keys ||
    Object.keys(target).filter((k) => {
      const v = target[k];
      return v instanceof Map || v instanceof Set || Array.isArray(v);
    });
  // Re-registering a name replaces it (a retried serverless cold start registers again).
  const existing = sources.findIndex((s) => s.name === name);
  if (existing >= 0) sources.splice(existing, 1);
  sources.push({ name, target, keys: resolvedKeys });
}

/**
 * Restores registered sources from the snapshot. Snapshot entries are merged over the
 * seeded Maps (so new seed records added in code still appear); arrays and Sets are replaced.
 */
export function restoreSnapshot(): boolean {
  const file = getSnapshotPath();
  if (!file || restored) return false;
  restored = true;
  if (!fs.existsSync(file)) return false;
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
    for (const source of sources) {
      const saved = raw?.sources?.[source.name];
      if (!saved) continue;
      for (const key of source.keys) {
        if (!(key in saved)) continue;
        const value = decode(saved[key]);
        const current = source.target[key];
        if (current instanceof Map && value instanceof Map) {
          for (const [k, v] of value) current.set(k, v);
        } else {
          source.target[key] = value;
        }
      }
    }
    logger.info(`Restored persisted data snapshot from ${file}`);
    return true;
  } catch (err) {
    logger.error(`Failed to restore data snapshot from ${file}; continuing with seed data only`, err as any);
    return false;
  }
}

/** Writes the snapshot atomically (temp file + rename). */
export function saveSnapshotNow(): void {
  const file = getSnapshotPath();
  if (!file) return;
  try {
    const payload: Record<string, any> = { version: 1, saved_at: new Date().toISOString(), sources: {} };
    for (const source of sources) {
      const data: Record<string, unknown> = {};
      for (const key of source.keys) data[key] = encode(source.target[key]);
      payload.sources[source.name] = data;
    }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
    fs.renameSync(tmp, file);
  } catch (err) {
    logger.error('Failed to write data snapshot', err as any);
  }
}

/** Debounced save, called after mutating API requests. */
export function scheduleSnapshotSave(delayMs = 1000): void {
  if (!getSnapshotPath()) return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveSnapshotNow();
  }, delayMs);
  saveTimer.unref?.();
}

/** Flushes any pending save; used on shutdown. */
export function flushSnapshot(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  saveSnapshotNow();
}

/**
 * Phase 5: synchronous save that reports failure, for writes whose success message must mean
 * "persisted" (registration, profile edits). No-op when persistence is disabled.
 */
export function saveSnapshotStrict(): void {
  const file = getSnapshotPath();
  if (!file) return;
  const payload: Record<string, any> = { version: 1, saved_at: new Date().toISOString(), sources: {} };
  for (const source of sources) {
    const data: Record<string, unknown> = {};
    for (const key of source.keys) data[key] = encode(source.target[key]);
    payload.sources[source.name] = data;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(payload), { mode: 0o600 });
  fs.renameSync(tmp, file);
}
