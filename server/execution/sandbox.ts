import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { CodingLanguage, ExecutionResult, ExecutionStatus } from '../models/types';
import { LanguageRegistry } from './languages';
import { logger } from '../core/logging';
import { detectIsolation, wrapCommand, IsolationInfo, ResourceLimits, SANDBOX_NOBODY_UID } from './isolation';

export const MAX_SOURCE_BYTES = 100 * 1024; // 100 KB
export const MAX_STDIN_BYTES = 64 * 1024;   // 64 KB
export const MAX_OUTPUT_BYTES = 64 * 1024;  // 64 KB max stdout/stderr

export interface SandboxExecutionOptions {
  language: CodingLanguage;
  sourceCode: string;
  stdin?: string;
  timeoutMs?: number;
  memoryLimitMb?: number;
}

export class SandboxService {
  /**
   * Securely executes student code in an isolated temporary environment.
   */
  public static async execute(options: SandboxExecutionOptions): Promise<ExecutionResult> {
    const startTime = Date.now();

    // 1. Input Validation
    if (!options.sourceCode || options.sourceCode.trim().length === 0) {
      return {
        status: 'COMPILATION_ERROR',
        stdout: '',
        stderr: 'Error: Source code cannot be empty.',
        exit_code: 1,
        execution_time_ms: 0,
      };
    }

    if (Buffer.byteLength(options.sourceCode, 'utf8') > MAX_SOURCE_BYTES) {
      return {
        status: 'SECURITY_ERROR',
        stdout: '',
        stderr: `Source code exceeds maximum permitted size of ${MAX_SOURCE_BYTES / 1024} KB.`,
        exit_code: 1,
        execution_time_ms: 0,
      };
    }

    const stdinContent = options.stdin || '';
    if (Buffer.byteLength(stdinContent, 'utf8') > MAX_STDIN_BYTES) {
      return {
        status: 'SECURITY_ERROR',
        stdout: '',
        stderr: `Standard input exceeds maximum permitted size of ${MAX_STDIN_BYTES / 1024} KB.`,
        exit_code: 1,
        execution_time_ms: 0,
      };
    }

    const langConfig = LanguageRegistry.get(options.language);
    if (!langConfig || !langConfig.enabled) {
      return {
        status: 'SECURITY_ERROR',
        stdout: '',
        stderr: `Unsupported or disabled programming language: ${options.language}`,
        exit_code: 1,
        execution_time_ms: 0,
      };
    }

    // 2. Decide the isolation level before touching the filesystem.
    const isolation = detectIsolation();
    if (!isolation.allowed) {
      logger.error('Code execution refused: no isolation available', { level: isolation.level });
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr:
          'Code execution is disabled on this server because a secure sandbox is not available. ' +
          'An administrator must enable Linux namespaces (unshare) or set CODE_SANDBOX_ALLOW_UNISOLATED=true for a trusted environment.',
        exit_code: -1,
        execution_time_ms: 0,
        isolation: isolation.level,
      };
    }
    const availability = LanguageRegistry.availability(langConfig.id);
    if (!availability.available) {
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: `${langConfig.display_name} is not installed on this server (${availability.detail}).`,
        exit_code: -1,
        execution_time_ms: 0,
        isolation: isolation.level,
      };
    }

    await this.acquireSlot();
    const tempPrefix = path.join(os.tmpdir(), 'btech-coding-sandbox-');
    let tempDir: string | null = null;

    try {
      tempDir = await fs.promises.mkdtemp(tempPrefix);

      const sourceFileName = options.language === 'java' ? 'Main.java' : `solution${langConfig.file_extension}`;
      const sourceFilePath = path.join(tempDir, sourceFileName);
      const outputBinaryPath = path.join(tempDir, 'solution.out');
      await fs.promises.writeFile(sourceFilePath, options.sourceCode, 'utf8');
      if (isolation.dropToNobody) {
        // The program runs as nobody, so it needs to own its scratch directory.
        await fs.promises.chown(tempDir, SANDBOX_NOBODY_UID, SANDBOX_NOBODY_UID);
        await fs.promises.chown(sourceFilePath, SANDBOX_NOBODY_UID, SANDBOX_NOBODY_UID);
      }

      // Sanitized environment: no API keys, DB credentials, JWT secrets or host paths.
      const sanitizedEnv: NodeJS.ProcessEnv = {
        PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
        SYSTEMROOT: process.env.SYSTEMROOT || '',
        HOME: tempDir,
        TEMP: tempDir,
        TMP: tempDir,
        TMPDIR: tempDir,
        LANG: 'C.UTF-8',
        NODE_ENV: 'sandbox',
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      };

      const timeoutMs = Math.min(options.timeoutMs || langConfig.timeout, 20000);
      const memMb = options.memoryLimitMb || langConfig.memory_limit_mb;
      const fill = (tpl: string) =>
        this.parseCommandLine(
          tpl
            .replace('{{file}}', `"${sourceFilePath}"`)
            .replace('{{output}}', `"${outputBinaryPath}"`)
            .replace('{{dir}}', `"${tempDir}"`)
            .replace('{{mem}}', String(memMb))
        ).map((a, i) => (i === 0 && availability.binary && a === langConfig.run_binary ? availability.binary : a));

      // 3. Compilation step (C, C++, Java). The compiler runs inside the same sandbox.
      if (langConfig.compiler_command) {
        const compileResult = await this.runProcess(
          fill(langConfig.compiler_command),
          tempDir,
          sanitizedEnv,
          '',
          Math.max(timeoutMs, 15000),
          { cpuSeconds: 20, addressSpaceMb: options.language === 'java' ? null : 1024, fileSizeKb: 50 * 1024, maxProcesses: 64, openFiles: 256 },
          isolation
        );

        if (compileResult.status !== 'SUCCESS') {
          return {
            status: compileResult.status === 'TIMEOUT' ? 'TIMEOUT' : 'COMPILATION_ERROR',
            stdout: compileResult.stdout,
            stderr: this.cleanPaths(compileResult.stderr || 'Compilation failed.', tempDir),
            exit_code: compileResult.exit_code,
            execution_time_ms: Date.now() - startTime,
            isolation: isolation.level,
          };
        }
      }

      // 4. Execution step.
      const runStart = Date.now();
      const managesOwnHeap = options.language === 'java' || options.language === 'javascript';
      const execResult = await this.runProcess(
        fill(langConfig.run_command),
        tempDir,
        sanitizedEnv,
        stdinContent,
        timeoutMs,
        {
          cpuSeconds: Math.ceil(timeoutMs / 1000) + 1,
          addressSpaceMb: managesOwnHeap ? null : memMb,
          fileSizeKb: 10 * 1024,
          maxProcesses: 32,
          openFiles: 64,
        },
        isolation
      );

      let status = execResult.status;
      let stderr = this.cleanPaths(execResult.stderr, tempDir);
      // Interpreted languages report syntax errors at run time; label them as compile errors.
      if (status === 'RUNTIME_ERROR' && /^(\s*File .*\n)?[\s\S]*\b(SyntaxError|IndentationError|TabError)\b/.test(stderr) && !/Traceback/.test(stderr)) {
        status = 'COMPILATION_ERROR';
      }
      if (status === 'RUNTIME_ERROR' && /MemoryError|OutOfMemoryError|heap out of memory|std::bad_alloc/.test(stderr)) {
        status = 'MEMORY_LIMIT';
        stderr += `\nMemory limit of ${memMb} MB exceeded.`;
      }

      return {
        status,
        stdout: execResult.stdout,
        stderr,
        exit_code: execResult.exit_code,
        // Wall-clock time of the run step only (compilation excluded). Memory is not measured.
        execution_time_ms: Date.now() - runStart,
        isolation: isolation.level,
      };
    } catch (err: any) {
      logger.error('Unexpected sandbox execution error', { error: err.message });
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: 'Sandbox encountered an internal execution failure. Please try again.',
        exit_code: -1,
        execution_time_ms: Date.now() - startTime,
        isolation: isolation.level,
      };
    } finally {
      this.releaseSlot();
      if (tempDir) {
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr: any) {
          logger.warn('Failed to cleanup temporary sandbox directory', { path: tempDir, error: cleanupErr.message });
        }
      }
    }
  }

  // ---- concurrency limit: at most N programs run at once; the rest wait in order ----
  private static running = 0;
  private static waiters: Array<() => void> = [];
  private static get maxConcurrent(): number {
    return Math.max(1, Number(process.env.CODE_SANDBOX_MAX_CONCURRENT) || 4);
  }
  private static acquireSlot(): Promise<void> {
    if (this.running < this.maxConcurrent) {
      this.running++;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.waiters.push(() => { this.running++; resolve(); }));
  }
  private static releaseSlot(): void {
    this.running = Math.max(0, this.running - 1);
    const next = this.waiters.shift();
    if (next) next();
  }

  /** Remove the random scratch path from compiler and interpreter messages. */
  private static cleanPaths(text: string, dir: string): string {
    return (text || '').split(dir + path.sep).join('').split(dir).join('.');
  }

  /**
   * Spawns one sandboxed process with a wall-clock timeout, stdin pipe and output caps.
   */
  private static runProcess(
    argv: string[],
    cwd: string,
    env: NodeJS.ProcessEnv,
    stdin: string,
    timeoutMs: number,
    limits: ResourceLimits,
    isolation: IsolationInfo
  ): Promise<{
    status: ExecutionStatus;
    stdout: string;
    stderr: string;
    exit_code: number;
  }> {
    return new Promise((resolve) => {
      let isSettled = false;
      let timedOut = false;
      let stdoutData = '';
      let stderrData = '';
      let outputLimitHit = false;

      const { bin, args } = wrapCommand(argv, cwd, limits, isolation);
      const detached = isolation.level !== 'none';

      let child: ReturnType<typeof spawn>;
      try {
        child = spawn(bin, args, { cwd, env, windowsHide: true, shell: false, detached });
      } catch (spawnErr: any) {
        return resolve({ status: 'SYSTEM_ERROR', stdout: '', stderr: `Failed to start '${argv[0]}': ${spawnErr.message}`, exit_code: -1 });
      }

      const killTree = () => {
        // Kill the namespace init (the program itself) directly: when it dies the kernel kills every
        // other process in its PID namespace. Credential changes clear PR_SET_PDEATHSIG, so killing
        // only `unshare` is not enough when the program was dropped to nobody.
        if (child.pid && isolation.level === 'namespace') {
          try {
            const kids = fs.readFileSync(`/proc/${child.pid}/task/${child.pid}/children`, 'utf8').trim().split(/\s+/).filter(Boolean);
            for (const k of kids) {
              try { process.kill(Number(k), 'SIGKILL'); } catch {}
            }
          } catch {}
        }
        try {
          if (child.pid) process.kill(-child.pid, 'SIGKILL');
        } catch {}
        try { child.kill('SIGKILL'); } catch {}
      };

      const timer = setTimeout(() => {
        timedOut = true;
        killTree();
      }, timeoutMs);

      const capture = (which: 'out' | 'err') => (chunk: Buffer) => {
        const current = which === 'out' ? stdoutData : stderrData;
        let next: string;
        if (current.length + chunk.length > MAX_OUTPUT_BYTES) {
          outputLimitHit = true;
          next = current + chunk.toString('utf8', 0, Math.max(0, MAX_OUTPUT_BYTES - current.length));
          killTree();
        } else {
          next = current + chunk.toString('utf8');
        }
        if (which === 'out') stdoutData = next;
        else stderrData = next;
      };
      child.stdout?.on('data', capture('out'));
      child.stderr?.on('data', capture('err'));

      child.on('error', (err: any) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);
        resolve({ status: 'SYSTEM_ERROR', stdout: stdoutData, stderr: `Process error: ${err.message}`, exit_code: -1 });
      });

      child.on('close', (code, signal) => {
        if (isSettled) return;
        isSettled = true;
        clearTimeout(timer);

        if (outputLimitHit) {
          return resolve({ status: 'OUTPUT_LIMIT_EXCEEDED', stdout: stdoutData + '\n... [OUTPUT TRUNCATED - LIMIT EXCEEDED]', stderr: stderrData, exit_code: code ?? -1 });
        }
        if (timedOut || signal === 'SIGXCPU' || code === 128 + 24) {
          return resolve({ status: 'TIMEOUT', stdout: stdoutData, stderr: `Execution timed out after ${timeoutMs}ms. Possible infinite loop detected.`, exit_code: 124 });
        }
        if (signal === 'SIGKILL' || code === 137) {
          return resolve({ status: 'RUNTIME_ERROR', stdout: stdoutData, stderr: (stderrData ? stderrData + '\n' : '') + 'Process was killed (resource limit reached).', exit_code: 137 });
        }
        if (signal === 'SIGSEGV' || code === 139) {
          return resolve({ status: 'RUNTIME_ERROR', stdout: stdoutData, stderr: (stderrData ? stderrData + '\n' : '') + 'Segmentation fault (invalid memory access or memory limit reached).', exit_code: 139 });
        }
        if (signal === 'SIGXFSZ' || code === 128 + 25) {
          return resolve({ status: 'OUTPUT_LIMIT_EXCEEDED', stdout: stdoutData, stderr: 'File size limit exceeded.', exit_code: 153 });
        }
        if (code === 0) {
          return resolve({ status: 'SUCCESS', stdout: stdoutData, stderr: stderrData, exit_code: 0 });
        }
        return resolve({ status: 'RUNTIME_ERROR', stdout: stdoutData, stderr: stderrData || `Process exited with error code ${code ?? signal}.`, exit_code: code ?? 1 });
      });

      if (child.stdin) {
        child.stdin.on('error', () => {}); // EPIPE when the program exits without reading stdin
        if (stdin) child.stdin.write(stdin);
        child.stdin.end();
      }
    });
  }

  /**
   * Parses command line string respecting double quotes.
   */
  private static parseCommandLine(cmd: string): string[] {
    const args: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < cmd.length; i++) {
      const char = cmd[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        if (current.length > 0) {
          args.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }
    if (current.length > 0) {
      args.push(current);
    }
    return args;
  }
}
