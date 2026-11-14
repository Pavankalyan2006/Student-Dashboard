// server/execution/sqlEngine.ts
// Main-thread client for the SQL Lab worker (server/execution/sqlWorker.cjs).
// The worker holds open SQLite databases; this side keeps the authoritative database images
// (base64) so a worker that had to be killed after a timeout can be restarted and reloaded.
import { Worker } from 'worker_threads';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { logger } from '../core/logging';

export const SQL_TIMEOUT_MS = Number(process.env.SQL_LAB_TIMEOUT_MS) || 3000;
/** Extra time for the first request to a new worker: spawning it and compiling SQLite's WebAssembly
 * can take several seconds on a cold serverless instance, and that is not the student's query. */
export const SQL_COLD_START_MS = Number(process.env.SQL_LAB_COLD_START_MS) || 15000;

function workerPath(): string {
  const candidates: string[] = [];
  try {
    candidates.push(path.join(path.dirname(fileURLToPath(import.meta.url)), 'sqlWorker.cjs'));
  } catch {}
  candidates.push(path.resolve(process.cwd(), 'server/execution/sqlWorker.cjs'));
  return candidates.find((p) => fs.existsSync(p)) || candidates[candidates.length - 1];
}

export interface WorkerReply {
  ok: boolean;
  error?: string;
  code?: string;
  [k: string]: any;
}

export class SqlEngine {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (r: WorkerReply) => void; timer: NodeJS.Timeout }>();
  /** Keys whose current image is loaded in the running worker. */
  private loaded = new Set<string>();
  private queue: Promise<unknown> = Promise.resolve();
  /** True once the current worker has answered at least once (SQLite is initialised). */
  private warm = false;

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;
    const w = new Worker(workerPath(), { resourceLimits: { maxOldGenerationSizeMb: 256 } });
    w.on('message', (msg: WorkerReply & { id: number }) => {
      if (this.worker === w) this.warm = true;
      const p = this.pending.get(msg.id);
      if (!p) return;
      clearTimeout(p.timer);
      this.pending.delete(msg.id);
      p.resolve(msg);
    });
    w.on('error', (err) => {
      logger.error('SQL Lab worker crashed', { error: err.message });
      this.reset(`The SQL engine stopped unexpectedly (${err.message}).`);
    });
    w.on('exit', () => {
      if (this.worker === w) this.reset('The SQL engine stopped.');
    });
    w.unref();
    this.worker = w;
    return w;
  }

  private reset(reason: string) {
    const w = this.worker;
    this.worker = null;
    this.warm = false;
    this.loaded.clear();
    for (const [id, p] of this.pending) {
      clearTimeout(p.timer);
      p.resolve({ ok: false, error: reason, code: 'ENGINE_RESET' });
      this.pending.delete(id);
    }
    if (w) w.terminate().catch(() => {});
  }

  /**
   * Sends one request. Requests are serialised so one student's slow query cannot interleave
   * with another's reload. `image` is the stored database (or '' for a new empty one).
   */
  request(key: string, image: string | undefined, msg: Record<string, any>, timeoutMs = SQL_TIMEOUT_MS): Promise<WorkerReply> {
    const run = async (): Promise<WorkerReply> => {
      const send = (withImage: boolean) =>
        new Promise<WorkerReply>((resolve) => {
          const w = this.ensureWorker();
          const id = this.nextId++;
          const limit = this.warm ? timeoutMs : timeoutMs + SQL_COLD_START_MS;
          const timer = setTimeout(() => {
            this.pending.delete(id);
            logger.warn('SQL Lab query timed out; restarting worker', { key: key.split('::')[1] });
            resolve({ ok: false, error: `Query stopped after ${timeoutMs / 1000} seconds (time limit).`, code: 'TIMEOUT' });
            this.reset('Engine restarted after a timeout.');
          }, limit);
          this.pending.set(id, { resolve, timer });
          w.postMessage({ ...msg, id, key, image: withImage ? image ?? '' : undefined });
        });
      let reply = await send(!this.loaded.has(key));
      if (!reply.ok && reply.code === 'NOT_LOADED') {
        this.loaded.delete(key);
        reply = await send(true);
      }
      if (reply.ok || reply.code !== 'TIMEOUT') this.loaded.add(key);
      return reply;
    };
    const next = this.queue.then(run, run);
    this.queue = next.catch(() => undefined);
    return next;
  }

  forget(key: string) {
    this.loaded.delete(key);
    if (this.worker) this.worker.postMessage({ op: 'drop', id: this.nextId++, key });
  }

  async shutdown() {
    this.reset('shutdown');
  }
}

export const sqlEngine = new SqlEngine();
