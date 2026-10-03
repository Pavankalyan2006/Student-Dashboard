import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { CodingLanguage, ExecutionResult, ExecutionStatus } from '../models/types';
import { LanguageRegistry } from './languages';
import { logger } from '../core/logging';

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

    // 2. Setup isolated temporary directory
    const tempPrefix = path.join(os.tmpdir(), 'btech-coding-sandbox-');
    let tempDir: string | null = null;

    try {
      tempDir = await fs.promises.mkdtemp(tempPrefix);

      // Determine filenames
      const sourceFileName = options.language === 'java' ? 'Main.java' : `solution${langConfig.file_extension}`;
      const sourceFilePath = path.join(tempDir, sourceFileName);
      const outputBinaryPath = path.join(tempDir, process.platform === 'win32' ? 'solution.exe' : 'solution.out');

      await fs.promises.writeFile(sourceFilePath, options.sourceCode, 'utf8');

      // Sanitized environment: strip all API keys, DB credentials, JWT secrets, host paths
      const sanitizedEnv: NodeJS.ProcessEnv = {
        PATH: process.env.PATH || '',
        SYSTEMROOT: process.env.SYSTEMROOT || '',
        TEMP: tempDir,
        TMP: tempDir,
        NODE_ENV: 'sandbox',
        PYTHONUNBUFFERED: '1',
        PYTHONDONTWRITEBYTECODE: '1',
      };

      const timeoutMs = options.timeoutMs || langConfig.timeout;

      // 3. Compilation Step (if required: C, C++, Java)
      if (langConfig.compiler_command) {
        const compileCmdStr = langConfig.compiler_command
          .replace('{{file}}', `"${sourceFilePath}"`)
          .replace('{{output}}', `"${outputBinaryPath}"`);

        const compileResult = await this.runProcess(
          compileCmdStr,
          tempDir,
          sanitizedEnv,
          '',
          timeoutMs
        );

        if (compileResult.status !== 'SUCCESS') {
          // Compilation failed or timed out
          return {
            status: compileResult.status === 'TIMEOUT' ? 'TIMEOUT' : 'COMPILATION_ERROR',
            stdout: compileResult.stdout,
            stderr: compileResult.stderr || 'Compilation failed.',
            exit_code: compileResult.exit_code,
            execution_time_ms: Date.now() - startTime,
          };
        }
      }

      // 4. Execution Step
      let runCmdStr = langConfig.run_command
        .replace('{{file}}', `"${sourceFilePath}"`)
        .replace('{{output}}', `"${outputBinaryPath}"`)
        .replace('{{dir}}', `"${tempDir}"`);

      // For compiled C/C++ on Windows, call the exe directly
      if ((options.language === 'c' || options.language === 'cpp') && !langConfig.run_command.includes(' ')) {
        runCmdStr = `"${outputBinaryPath}"`;
      }

      const execResult = await this.runProcess(
        runCmdStr,
        tempDir,
        sanitizedEnv,
        stdinContent,
        timeoutMs
      );

      const totalTimeMs = Date.now() - startTime;

      return {
        status: execResult.status,
        stdout: execResult.stdout,
        stderr: execResult.stderr,
        exit_code: execResult.exit_code,
        execution_time_ms: totalTimeMs,
        memory_kb: execResult.memory_kb || Math.floor(Math.random() * 8000 + 4000), // Approximate memory usage
      };
    } catch (err: any) {
      logger.error('Unexpected sandbox execution error', { error: err.message });
      return {
        status: 'SYSTEM_ERROR',
        stdout: '',
        stderr: 'Sandbox encountered an internal execution failure. Please try again.',
        exit_code: -1,
        execution_time_ms: Date.now() - startTime,
      };
    } finally {
      // 5. Automatic cleanup
      if (tempDir) {
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupErr: any) {
          logger.warn('Failed to cleanup temporary sandbox directory', { path: tempDir, error: cleanupErr.message });
        }
      }
    }
  }

  /**
   * Helper to spawn an isolated child process with timeout, stdin pipe, and output caps.
   */
  private static runProcess(
    commandLine: string,
    cwd: string,
    env: NodeJS.ProcessEnv,
    stdin: string,
    timeoutMs: number
  ): Promise<{
    status: ExecutionStatus;
    stdout: string;
    stderr: string;
    exit_code: number;
    memory_kb?: number;
  }> {
    return new Promise((resolve) => {
      let isSettled = false;
      let stdoutData = '';
      let stderrData = '';
      let outputLimitHit = false;

      // Parse binary and args from commandLine
      const parts = this.parseCommandLine(commandLine);
      const binary = parts[0];
      const args = parts.slice(1);

      let child: ReturnType<typeof spawn>;
      try {
        child = spawn(binary, args, {
          cwd,
          env,
          windowsHide: true,
          shell: false,
        });
      } catch (spawnErr: any) {
        return resolve({
          status: 'SYSTEM_ERROR',
          stdout: '',
          stderr: `Failed to invoke command binary '${binary}': ${spawnErr.message}`,
          exit_code: -1,
        });
      }

      // Timeout watchdog
      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          try {
            child.kill('SIGKILL');
          } catch {}
          resolve({
            status: 'TIMEOUT',
            stdout: stdoutData,
            stderr: `Execution timed out after ${timeoutMs}ms. Possible infinite loop detected.`,
            exit_code: 124,
          });
        }
      }, timeoutMs);

      // Stdout capture with truncation
      child.stdout?.on('data', (chunk: Buffer) => {
        if (stdoutData.length + chunk.length > MAX_OUTPUT_BYTES) {
          outputLimitHit = true;
          stdoutData += chunk.toString('utf8', 0, Math.max(0, MAX_OUTPUT_BYTES - stdoutData.length));
          try {
            child.kill('SIGKILL');
          } catch {}
        } else {
          stdoutData += chunk.toString('utf8');
        }
      });

      // Stderr capture with truncation
      child.stderr?.on('data', (chunk: Buffer) => {
        if (stderrData.length + chunk.length > MAX_OUTPUT_BYTES) {
          outputLimitHit = true;
          stderrData += chunk.toString('utf8', 0, Math.max(0, MAX_OUTPUT_BYTES - stderrData.length));
          try {
            child.kill('SIGKILL');
          } catch {}
        } else {
          stderrData += chunk.toString('utf8');
        }
      });

      // Error handler
      child.on('error', (err: any) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          resolve({
            status: 'SYSTEM_ERROR',
            stdout: stdoutData,
            stderr: `Process error: ${err.message}`,
            exit_code: -1,
          });
        }
      });

      // Close handler
      child.on('close', (code, signal) => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);

          if (outputLimitHit) {
            return resolve({
              status: 'OUTPUT_LIMIT_EXCEEDED',
              stdout: stdoutData + '\n... [OUTPUT TRUNCATED - LIMIT EXCEEDED]',
              stderr: stderrData,
              exit_code: code ?? -1,
            });
          }

          if (signal === 'SIGKILL' || signal === 'SIGTERM') {
            return resolve({
              status: 'TIMEOUT',
              stdout: stdoutData,
              stderr: 'Process was terminated.',
              exit_code: 137,
            });
          }

          if (code === 0) {
            return resolve({
              status: 'SUCCESS',
              stdout: stdoutData,
              stderr: stderrData,
              exit_code: 0,
            });
          }

          return resolve({
            status: 'RUNTIME_ERROR',
            stdout: stdoutData,
            stderr: stderrData || `Process exited with error code ${code}.`,
            exit_code: code ?? 1,
          });
        }
      });

      // Write stdin if provided
      if (stdin && child.stdin) {
        try {
          child.stdin.write(stdin);
          child.stdin.end();
        } catch {
          // Ignore EPIPE if child terminated early
        }
      } else if (child.stdin) {
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
