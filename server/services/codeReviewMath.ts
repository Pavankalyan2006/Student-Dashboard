// Pure logic for Code Review Intelligence: deterministic static checks with line numbers, per-function metrics,
// and the validation applied to AI review output. No I/O.
//
// The checks are heuristics on the source text (there is no compiler here). Each finding says which rule fired, so a
// student can see why. Nothing here claims a program is correct or secure.

export type ReviewLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'c' | 'cpp' | 'other';
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Category =
  | 'correctness'
  | 'readability'
  | 'naming'
  | 'maintainability'
  | 'complexity'
  | 'performance'
  | 'error_handling'
  | 'security'
  | 'testing'
  | 'best_practice'
  | 'documentation'
  | 'architecture';
export type FindingStatus = 'open' | 'accepted' | 'rejected' | 'modified';

export const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
export const CATEGORIES: Category[] = [
  'correctness',
  'readability',
  'naming',
  'maintainability',
  'complexity',
  'performance',
  'error_handling',
  'security',
  'testing',
  'best_practice',
  'documentation',
  'architecture',
];

export interface ReviewFile {
  name: string;
  content: string;
  language: ReviewLanguage;
}

export interface ReviewFinding {
  id: string;
  file: string;
  line?: number;
  end_line?: number;
  severity: Severity;
  category: Category;
  title: string;
  explanation: string;
  suggestion?: string;
  corrected_example?: string;
  learning?: string;
  source: 'static' | 'ai';
  rule?: string;
  status: FindingStatus;
  student_note?: string;
}

export interface FunctionMetric {
  name: string;
  line: number;
  length: number;
  /** Decision points + 1 (McCabe), counted from the source text. */
  complexity: number;
  max_loop_depth: number;
  recursive: boolean;
  /** Heuristic from loop nesting, for the student to check: "O(n^2) if each loop runs over the input". */
  estimate?: string;
}

export interface FileMetrics {
  file: string;
  language: ReviewLanguage;
  lines: number;
  code_lines: number;
  comment_lines: number;
  functions: FunctionMetric[];
  max_nesting: number;
}

export const LIMITS = { maxFiles: 5, maxFileChars: 20_000, maxTotalChars: 40_000, maxFindingsPerFile: 60, perRule: 5 };

const EXT: Record<string, ReviewLanguage> = {
  py: 'python',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  java: 'java',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
};

/** From the file extension, else from tell-tale syntax. */
export function detectLanguage(name: string, content: string, hint?: string): ReviewLanguage {
  const h = String(hint || '').toLowerCase();
  if (h === 'c++') return 'cpp';
  if (['python', 'javascript', 'typescript', 'java', 'c', 'cpp'].includes(h)) return h as ReviewLanguage;
  const ext = /\.([a-z0-9]+)$/i.exec(name || '')?.[1]?.toLowerCase();
  if (ext && EXT[ext]) return EXT[ext];
  const c = content || '';
  if (/^\s*#include\s*<(iostream|vector|string|bits\/stdc\+\+\.h)>/m.test(c) || /\bstd::|\bcout\s*<</.test(c)) return 'cpp';
  if (/^\s*#include\s*</m.test(c)) return 'c';
  if (/\bpublic\s+(static\s+)?(class|void)\b|System\.out\.print/.test(c)) return 'java';
  if (/^\s*def\s+\w+\s*\(.*\)\s*:|^\s*import\s+\w+\s*$|^\s*from\s+\w+\s+import\b/m.test(c)) return 'python';
  if (/:\s*(string|number|boolean)\b|\binterface\s+\w+\s*\{/.test(c)) return 'typescript';
  if (/\b(const|let|var)\s+\w+\s*=|=>|console\.log|function\s+\w+\s*\(/.test(c)) return 'javascript';
  return 'other';
}

const cLike = (l: ReviewLanguage) => l !== 'python' && l !== 'other';

/**
 * Per line, the code with comments removed and string contents blanked, so checks do not fire on text inside
 * strings or comments. Also reports which lines are comments.
 */
export function stripSource(content: string, language: ReviewLanguage): { code: string[]; comment: boolean[] } {
  const lines = String(content || '').split(/\r?\n/);
  const code: string[] = [];
  const comment: boolean[] = [];
  let inBlock = false; // /* */ or a Python triple-quoted string
  let tq = '';
  for (const line of lines) {
    let out = '';
    let i = 0;
    let sawComment = false;
    while (i < line.length) {
      if (inBlock) {
        sawComment = true;
        const end = language === 'python' ? line.indexOf(tq, i) : line.indexOf('*/', i);
        if (end < 0) {
          i = line.length;
          break;
        }
        i = end + (language === 'python' ? 3 : 2);
        inBlock = false;
        continue;
      }
      const ch = line[i];
      const two = line.slice(i, i + 2);
      if (language === 'python' && (line.startsWith('"""', i) || line.startsWith("'''", i))) {
        tq = line.slice(i, i + 3);
        inBlock = true;
        i += 3;
        out += '""';
        continue;
      }
      if (cLike(language) && two === '/*') {
        inBlock = true;
        sawComment = true;
        i += 2;
        continue;
      }
      if ((cLike(language) && two === '//') || (language === 'python' && ch === '#')) {
        sawComment = true;
        break;
      }
      if (ch === '"' || ch === "'" || (ch === '`' && (language === 'javascript' || language === 'typescript'))) {
        const q = ch;
        let j = i + 1;
        while (j < line.length && line[j] !== q) j += line[j] === '\\' ? 2 : 1;
        out += q + q;
        i = j + 1;
        continue;
      }
      out += ch;
      i++;
    }
    code.push(out);
    comment.push(sawComment && !out.trim());
  }
  return { code, comment };
}

interface Rule {
  id: string;
  langs: ReviewLanguage[] | 'all';
  /** 'raw' rules read the original line (strings included); the rest read the stripped line. */
  raw?: boolean;
  test: RegExp;
  severity: Severity;
  category: Category;
  title: string;
  explanation: string;
  suggestion: string;
  learning?: string;
}

const C_LIKE: ReviewLanguage[] = ['javascript', 'typescript', 'java', 'c', 'cpp'];
const JS: ReviewLanguage[] = ['javascript', 'typescript'];

const RULES: Rule[] = [
  {
    id: 'hardcoded-secret',
    langs: 'all',
    raw: true,
    test: /\b(password|passwd|pwd|secret|api[_-]?key|access[_-]?key|auth[_-]?token|private[_-]?key)\w*\s*[:=]\s*['"`][^'"`\s]{4,}['"`]|AKIA[0-9A-Z]{16}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/i,
    severity: 'high',
    category: 'security',
    title: 'Secret written in the code',
    explanation: 'A password, key or token is written directly in the source. Anyone who can read the code or its history can use it.',
    suggestion: 'Read it from an environment variable or a secrets manager, and rotate the value if it was ever committed.',
    learning: 'Secrets belong in configuration, not in source control.',
  },
  {
    id: 'eval',
    langs: ['python', 'javascript', 'typescript'],
    test: /(^|[^\w.])(eval|exec)\s*\(|\bnew\s+Function\s*\(/,
    severity: 'high',
    category: 'security',
    title: 'Code built from a string is executed',
    explanation: 'eval, exec and new Function run text as code. If any part of that text comes from a user, they can run their own code.',
    suggestion: 'Parse the input instead (for example int(), JSON.parse or a lookup table of allowed operations).',
  },
  {
    id: 'sql-concat',
    langs: 'all',
    raw: true,
    test: /\b(SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b[^;]*?(['"`]\s*\+\s*\w|\+\s*['"`]|\$\{|%\s*\(|['"]\s*%\s*\w|\.format\s*\(|f['"])/i,
    severity: 'high',
    category: 'security',
    title: 'SQL built by joining strings',
    explanation: 'Values are joined into the SQL text. Input such as \' OR \'1\'=\'1 changes the meaning of the query (SQL injection).',
    suggestion: 'Use a parameterised query: pass the values separately with placeholders such as ? or %s.',
    learning: 'Parameterised queries keep data and code apart, so input can never become SQL.',
  },
  {
    id: 'c-gets',
    langs: ['c', 'cpp'],
    test: /\bgets\s*\(/,
    severity: 'critical',
    category: 'security',
    title: 'gets() cannot limit input length',
    explanation: 'gets() writes past the end of the buffer when the input is longer than it. It was removed from the C standard for this reason.',
    suggestion: 'Use fgets(buf, sizeof buf, stdin) and remove the trailing newline.',
  },
  {
    id: 'c-unsafe-copy',
    langs: ['c', 'cpp'],
    test: /\b(strcpy|strcat|sprintf)\s*\(/,
    severity: 'medium',
    category: 'security',
    title: 'Unbounded string copy',
    explanation: 'strcpy, strcat and sprintf do not check the size of the destination, so long input overflows the buffer.',
    suggestion: 'Use snprintf, or strncpy/strncat with the buffer size, and make sure the result is terminated.',
  },
  {
    id: 'c-scanf-s',
    langs: ['c', 'cpp'],
    raw: true,
    test: /\bscanf\s*\(\s*"[^"]*%s/,
    severity: 'medium',
    category: 'security',
    title: 'scanf("%s") without a width',
    explanation: 'Without a width, %s reads any length of input into the buffer.',
    suggestion: 'Give a width one less than the buffer size, for example scanf("%99s", name) for char name[100].',
  },
  {
    id: 'shell-true',
    langs: ['python'],
    test: /shell\s*=\s*True|\bos\.system\s*\(/,
    severity: 'high',
    category: 'security',
    title: 'Command run through the shell',
    explanation: 'With the shell, characters such as ; and | in input start other commands (command injection).',
    suggestion: 'Pass a list of arguments to subprocess.run(...) without shell=True.',
  },
  {
    id: 'unsafe-deserialise',
    langs: ['python'],
    test: /\bpickle\.loads?\s*\(|\byaml\.load\s*\((?![^)]*Loader)/,
    severity: 'medium',
    category: 'security',
    title: 'Unsafe deserialisation',
    explanation: 'pickle and yaml.load can run code while loading data. Never use them on data from someone else.',
    suggestion: 'Use json, or yaml.safe_load.',
  },
  {
    id: 'inner-html',
    langs: JS,
    test: /\.innerHTML\s*\+?=|\bdocument\.write\s*\(|dangerouslySetInnerHTML/,
    severity: 'medium',
    category: 'security',
    title: 'HTML inserted from a value',
    explanation: 'If the value contains user input, a <script> or onerror= attribute in it runs in the page (cross-site scripting).',
    suggestion: 'Use textContent, or escape the value, or sanitise it with a library such as DOMPurify.',
  },
  {
    id: 'weak-hash',
    langs: 'all',
    raw: true,
    test: /\bmd5\s*\(|hashlib\.(md5|sha1)\b|getInstance\(\s*"(MD5|SHA-?1)"|createHash\(\s*['"](md5|sha1)['"]/i,
    severity: 'medium',
    category: 'security',
    title: 'Weak hash function',
    explanation: 'MD5 and SHA-1 are broken for security use, and any fast hash is too fast for passwords.',
    suggestion: 'For passwords use bcrypt, scrypt or Argon2. For integrity checks use SHA-256.',
  },
  {
    id: 'bare-except',
    langs: ['python'],
    test: /^\s*except\s*:/,
    severity: 'medium',
    category: 'error_handling',
    title: 'Bare except',
    explanation: 'A bare except also catches KeyboardInterrupt and real bugs, which hides the cause of failures.',
    suggestion: 'Catch the exception you expect, for example except ValueError:.',
  },
  {
    id: 'none-compare',
    langs: ['python'],
    test: /[!=]=\s*None\b/,
    severity: 'low',
    category: 'correctness',
    title: 'Comparison to None with == or !=',
    explanation: '== can be overridden by a class, so it may not mean "is None".',
    suggestion: 'Use "is None" or "is not None".',
  },
  {
    id: 'mutable-default',
    langs: ['python'],
    test: /^\s*def\s+\w+\s*\([^)]*=\s*(\[\s*\]|\{\s*\}|list\(\)|dict\(\))/,
    severity: 'medium',
    category: 'correctness',
    title: 'Mutable default argument',
    explanation: 'The default list or dict is created once and shared by every call, so values from one call leak into the next.',
    suggestion: 'Default to None and create the list inside the function: if items is None: items = [].',
  },
  {
    id: 'loose-equality',
    langs: JS,
    test: /[^=!<>]==[^=]|!=[^=]/,
    severity: 'low',
    category: 'correctness',
    title: 'Loose equality (== or !=)',
    explanation: '== converts types before comparing, so 0 == "" and "1" == 1 are both true.',
    suggestion: 'Use === and !==.',
  },
  {
    id: 'var',
    langs: JS,
    test: /(^|[^\w.])var\s+\w/,
    severity: 'low',
    category: 'best_practice',
    title: 'var declaration',
    explanation: 'var is function-scoped and hoisted, which causes surprises in loops and blocks.',
    suggestion: 'Use const, or let when the value changes.',
  },
  {
    id: 'assign-in-condition',
    langs: C_LIKE,
    test: /\b(if|while)\s*\((?:[^()=!<>]|\([^()]*\))*[^=!<>+\-*/%&|^]=(?!=)/,
    severity: 'medium',
    category: 'correctness',
    title: 'Assignment inside a condition',
    explanation: 'A single = assigns instead of comparing, so the condition is the assigned value.',
    suggestion: 'Use == (or === in JavaScript) to compare.',
  },
  {
    id: 'java-string-eq',
    langs: ['java'],
    raw: true,
    test: /==\s*"|"\s*==/,
    severity: 'medium',
    category: 'correctness',
    title: 'Strings compared with ==',
    explanation: 'In Java, == compares object references, not text, so two equal strings can compare false.',
    suggestion: 'Use a.equals(b), or "text".equals(a) to be safe when a is null.',
  },
  {
    id: 'empty-catch',
    langs: C_LIKE,
    test: /\bcatch\s*(\([^)]*\))?\s*\{\s*\}/,
    severity: 'medium',
    category: 'error_handling',
    title: 'Empty catch block',
    explanation: 'The error is caught and ignored, so failures disappear silently.',
    suggestion: 'Handle the error, log it, or let it propagate.',
  },
  {
    id: 'console-log',
    langs: JS,
    test: /\bconsole\.(log|debug)\s*\(/,
    severity: 'info',
    category: 'best_practice',
    title: 'Debug logging left in',
    explanation: 'console.log calls are usually left over from debugging.',
    suggestion: 'Remove them, or use a logger with levels.',
  },
  {
    id: 'todo',
    langs: 'all',
    raw: true,
    test: /\b(TODO|FIXME|XXX|HACK)\b/,
    severity: 'info',
    category: 'maintainability',
    title: 'Unfinished work marked in a comment',
    explanation: 'The comment marks something left to do.',
    suggestion: 'Finish it or track it as an issue.',
  },
  {
    id: 'py-camel-def',
    langs: ['python'],
    test: /^\s*def\s+[a-z]+[A-Z]\w*\s*\(/,
    severity: 'low',
    category: 'naming',
    title: 'Function name is not snake_case',
    explanation: 'PEP 8 names Python functions in snake_case.',
    suggestion: 'Rename it, for example findMax -> find_max.',
  },
  {
    id: 'lower-class',
    langs: ['java', 'python', 'typescript', 'javascript', 'cpp'],
    test: /^\s*(public\s+|export\s+)?(abstract\s+)?class\s+[a-z]\w*/,
    severity: 'low',
    category: 'naming',
    title: 'Class name does not start with a capital',
    explanation: 'Classes are named in PascalCase in this language.',
    suggestion: 'Rename it, for example student -> Student.',
  },
];

const LONG_LINE = 120;

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

/** Function boundaries and metrics, from the stripped source. */
export function functionMetrics(code: string[], language: ReviewLanguage): FunctionMetric[] {
  const out: FunctionMetric[] = [];
  const decision = language === 'python' ? /\b(if|elif|for|while|except|and|or)\b|\bif\b.*\belse\b/g : /\b(if|for|while|case|catch)\b|&&|\|\||\?(?![.?:])/g;
  if (language === 'python') {
    for (let i = 0; i < code.length; i++) {
      const m = /^(\s*)def\s+(\w+)\s*\(/.exec(code[i]);
      if (!m) continue;
      const indent = m[1].length;
      let end = i;
      for (let j = i + 1; j < code.length; j++) {
        if (!code[j].trim()) continue;
        if ((/^\s*/.exec(code[j])?.[0].length ?? 0) <= indent) break;
        end = j;
      }
      const body = code.slice(i + 1, end + 1);
      out.push(metric(m[2], i + 1, body, decision, language));
    }
    return out;
  }
  if (!cLike(language)) return out;
  const header =
    /^\s*(?:(?:export\s+)?(?:async\s+)?function\s*\*?\s*(\w+)\s*\(|(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*(?::[^=]+)?=>\s*\{?|(?:(?:public|private|protected|static|final|virtual|inline|async|override|synchronized)\s+)*(?:[\w<>[\],.*&:]+\s+)+\**(\w+)\s*\([^;]*\)\s*(?:const\s*)?(?:throws\s+[\w., ]+)?\s*\{?\s*$|(?:(?:public|private|protected|static|async)\s+)*(\w+)\s*\([^;]*\)\s*(?::\s*[^={]+)?\{\s*$)/;
  const KEYWORDS = new Set(['if', 'for', 'while', 'switch', 'catch', 'return', 'else', 'do', 'new', 'sizeof', 'typeof']);
  for (let i = 0; i < code.length; i++) {
    const m = header.exec(code[i]);
    if (!m) continue;
    const name = m[1] || m[2] || m[3] || m[4];
    if (!name || KEYWORDS.has(name) || /^\s*(else|return)\b/.test(code[i])) continue;
    // Find the opening brace on this line or the next, then its match.
    let j = i;
    let depth = 0;
    let opened = false;
    let end = -1;
    for (; j < code.length; j++) {
      for (const ch of code[j]) {
        if (ch === '{') {
          depth++;
          opened = true;
        } else if (ch === '}') {
          depth--;
          if (opened && depth === 0) {
            end = j;
            break;
          }
        }
      }
      if (end >= 0) break;
      if (!opened && j >= i + 1) break;
    }
    if (end < 0 || !opened) continue;
    const body = code.slice(i, end + 1);
    body[0] = body[0].slice(body[0].indexOf('{') + 1);
    out.push(metric(name, i + 1, body, decision, language));
    i = end;
  }
  return out;
}

function metric(name: string, line: number, body: string[], decision: RegExp, language: ReviewLanguage): FunctionMetric {
  const text = body.join('\n');
  const complexity = 1 + (text.match(decision) || []).length;
  const loop = /\b(for|while)\b/;
  let maxLoop = 0;
  if (language === 'python') {
    const stack: number[] = [];
    for (const l of body) {
      if (!l.trim()) continue;
      const ind = /^\s*/.exec(l)![0].length;
      while (stack.length && stack[stack.length - 1] >= ind) stack.pop();
      if (/^\s*(for|while)\b/.test(l)) {
        stack.push(ind);
        maxLoop = Math.max(maxLoop, stack.length);
      }
    }
  } else {
    // Each loop records the brace depth it starts at. A later loop at the same or a shallower depth closes it.
    // (A loop without braces nested in another is counted as a sibling, so the estimate can be low there.)
    const stack: number[] = [];
    let depth = 0;
    for (const l of body) {
      if (loop.test(l)) {
        while (stack.length && stack[stack.length - 1] >= depth) stack.pop();
        stack.push(depth);
        maxLoop = Math.max(maxLoop, stack.length);
      }
      for (const ch of l) {
        if (ch === '{') depth++;
        else if (ch === '}') depth = Math.max(0, depth - 1);
      }
    }
  }
  const recursive = new RegExp(`(^|[^\\w.])${name}\\s*\\(`).test(text);
  const estimate = recursive
    ? 'Recursive: the running time depends on the recurrence (how many calls each call makes, and on how much smaller an input).'
    : maxLoop >= 1
      ? `About O(n${maxLoop > 1 ? `^${maxLoop}` : ''}) if each of the ${maxLoop} nested loop${maxLoop > 1 ? 's' : ''} runs over the input. Check what each loop's bounds really are.`
      : 'No loops or recursion: constant time apart from the functions it calls.';
  return { name, line, length: body.length, complexity, max_loop_depth: maxLoop, recursive, estimate };
}

function maxNesting(code: string[], language: ReviewLanguage): number {
  if (language === 'python') {
    let max = 0;
    for (const l of code) if (l.trim()) max = Math.max(max, Math.floor(/^\s*/.exec(l)![0].replace(/\t/g, '    ').length / 4));
    return max;
  }
  let depth = 0;
  let max = 0;
  for (const l of code)
    for (const ch of l) {
      if (ch === '{') max = Math.max(max, ++depth);
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
  return max;
}

let seq = 0;
const fid = (prefix: string) => `${prefix}${Date.now().toString(36)}${(seq++).toString(36)}`;

/** Static findings and metrics for one file. */
export function staticReview(file: ReviewFile): { findings: ReviewFinding[]; metrics: FileMetrics } {
  const raw = String(file.content || '').split(/\r?\n/);
  const { code, comment } = stripSource(file.content, file.language);
  const findings: ReviewFinding[] = [];
  const counts = new Map<string, number>();
  const add = (rule: string, f: Omit<ReviewFinding, 'id' | 'file' | 'source' | 'status' | 'rule'>) => {
    const n = (counts.get(rule) || 0) + 1;
    counts.set(rule, n);
    if (n > LIMITS.perRule || findings.length >= LIMITS.maxFindingsPerFile) return;
    findings.push({ id: fid('s'), file: file.name, source: 'static', status: 'open', rule, ...f });
  };

  for (let i = 0; i < raw.length; i++) {
    for (const r of RULES) {
      if (r.langs !== 'all' && !r.langs.includes(file.language)) continue;
      const text = r.raw ? raw[i] : code[i];
      if (!text || !r.test.test(text)) continue;
      // A raw rule must still see code on the line, except the TODO rule, which is about comments.
      if (r.raw && r.id !== 'todo' && r.id !== 'hardcoded-secret' && !code[i].trim()) continue;
      add(r.id, { line: i + 1, severity: r.severity, category: r.category, title: r.title, explanation: r.explanation, suggestion: r.suggestion, learning: r.learning });
    }
    if (raw[i].length > LONG_LINE) {
      add('long-line', {
        line: i + 1,
        severity: 'info',
        category: 'readability',
        title: `Line is ${raw[i].length} characters long`,
        explanation: `Lines over ${LONG_LINE} characters are hard to read side by side and in reviews.`,
        suggestion: 'Break it into smaller expressions with named variables.',
      });
    }
  }

  // Python: "except ...:" whose whole body is "pass".
  if (file.language === 'python') {
    const indent = (l: string) => /^\s*/.exec(l)![0].length;
    for (let i = 0; i < code.length - 1; i++) {
      if (!/^\s*except\b.*:\s*$/.test(code[i]) || !/^\s*pass\s*$/.test(code[i + 1])) continue;
      const next = code.slice(i + 2).find((l) => l.trim());
      if (next === undefined || indent(next) < indent(code[i + 1]))
        add('swallowed-exception', {
          line: i + 1,
          end_line: i + 2,
          severity: 'medium',
          category: 'error_handling',
          title: 'Exception caught and ignored',
          explanation: 'except followed only by pass hides the error, so the program carries on in a bad state.',
          suggestion: 'Handle it, log it, or remove the try so the error is visible.',
        });
    }
  }

  const functions = functionMetrics(code, file.language);
  for (const f of functions) {
    if (f.complexity > 10)
      add('complexity', {
        line: f.line,
        severity: f.complexity > 20 ? 'high' : 'medium',
        category: 'complexity',
        title: `${f.name}() has cyclomatic complexity ${f.complexity}`,
        explanation: `It has ${f.complexity - 1} decision points (if, loops, cases, && and ||). Above 10, a function is hard to test fully: each path needs its own test.`,
        suggestion: 'Split it into smaller functions, or replace long if/else chains with a lookup table.',
        learning: 'Cyclomatic complexity counts the independent paths through a function.',
      });
    if (f.length > 60)
      add('long-function', {
        line: f.line,
        severity: 'low',
        category: 'maintainability',
        title: `${f.name}() is ${f.length} lines long`,
        explanation: 'Long functions usually do several jobs, which makes them harder to read and test.',
        suggestion: 'Move each job into its own well-named function.',
      });
    if (f.length > 15) {
      const prev = raw.slice(Math.max(0, f.line - 3), f.line - 1).join('\n');
      const next = raw[f.line] || '';
      const documented = /\/\/|\/\*|\*\/|#/.test(prev) || /^\s*("""|''')/.test(next);
      if (!documented)
        add('undocumented', {
          line: f.line,
          severity: 'info',
          category: 'documentation',
          title: `${f.name}() has no comment or docstring`,
          explanation: 'A short description of what it takes, returns and assumes helps the next reader.',
          suggestion: file.language === 'python' ? 'Add a docstring under the def line.' : 'Add a comment above the function.',
        });
    }
  }
  const nesting = maxNesting(code, file.language);
  if (nesting > 4)
    add('deep-nesting', {
      severity: 'low',
      category: 'readability',
      title: `Code is nested ${nesting} levels deep`,
      explanation: 'Deep nesting makes it hard to follow which conditions apply to a line.',
      suggestion: 'Return early for special cases, or move inner blocks into functions.',
    });

  // "and N more" notes for rules that fired more often than shown.
  for (const [rule, n] of counts) {
    if (n <= LIMITS.perRule) continue;
    const first = findings.find((f) => f.rule === rule);
    if (first) first.explanation += ` (${n - LIMITS.perRule} more line${n - LIMITS.perRule > 1 ? 's' : ''} like this not listed.)`;
  }

  return {
    findings,
    metrics: {
      file: file.name,
      language: file.language,
      lines: raw.length,
      code_lines: code.filter((l) => l.trim()).length,
      comment_lines: comment.filter(Boolean).length,
      functions,
      max_nesting: nesting,
    },
  };
}

/** True when any file looks like a test file or contains test code. */
export function hasTests(files: ReviewFile[]): boolean {
  return files.some((f) => /(^|[/_.-])(test|spec)s?([/_.-]|$)/i.test(f.name) || /\bassert\b|\bdescribe\s*\(|\bit\s*\(|@Test\b|\bunittest\b|\bpytest\b|\bexpect\s*\(/.test(f.content));
}

// ---------- AI output validation ----------

const str = (v: unknown, n: number) => (typeof v === 'string' ? clip(v.trim(), n) : '');

/**
 * Keeps only well-formed AI findings: the file must be one that was sent, the line must exist in that file
 * (otherwise the line is dropped and the finding stays file-level), and severity and category are from the lists.
 */
export function sanitiseAiFindings(raw: unknown, files: ReviewFile[], max = 40): ReviewFinding[] {
  if (!Array.isArray(raw)) return [];
  const lineCount = new Map(files.map((f) => [f.name, String(f.content).split(/\r?\n/).length]));
  const out: ReviewFinding[] = [];
  for (const r of raw.slice(0, max * 2)) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    const title = str(o.title, 140);
    const explanation = str(o.explanation, 1200);
    if (!title || !explanation) continue;
    const file = lineCount.has(String(o.file)) ? String(o.file) : files.length === 1 ? files[0].name : '';
    if (!file) continue;
    const n = lineCount.get(file)!;
    const line = Number.isInteger(o.line) && (o.line as number) >= 1 && (o.line as number) <= n ? (o.line as number) : undefined;
    const end = line && Number.isInteger(o.end_line) && (o.end_line as number) >= line && (o.end_line as number) <= n ? (o.end_line as number) : undefined;
    out.push({
      id: fid('a'),
      file,
      line,
      end_line: end,
      severity: SEVERITIES.includes(o.severity as Severity) ? (o.severity as Severity) : 'low',
      category: CATEGORIES.includes(o.category as Category) ? (o.category as Category) : 'best_practice',
      title,
      explanation,
      suggestion: str(o.suggestion, 800) || undefined,
      corrected_example: str(o.corrected_example, 2000) || undefined,
      learning: str(o.learning, 600) || undefined,
      source: 'ai',
      status: 'open',
    });
    if (out.length >= max) break;
  }
  return out;
}

export function severityCounts(findings: ReviewFinding[]): Record<Severity, number> {
  const c = { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<Severity, number>;
  for (const f of findings) c[f.severity]++;
  return c;
}

/** Source lines with numbers, for the AI prompt, so it can cite real lines. */
export function numbered(content: string): string {
  return String(content)
    .split(/\r?\n/)
    .map((l, i) => `${String(i + 1).padStart(4, ' ')}| ${l}`)
    .join('\n');
}
