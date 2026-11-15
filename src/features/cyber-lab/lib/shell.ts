/**
 * A simulated Linux shell over a made-up file system, for the Cybersecurity Lab. It runs entirely in the page:
 * no command reaches a real machine. It supports the commands the exercises need, pipes, and simple flags.
 */

export interface ShellFile {
  path: string;
  content: string;
  mode?: string;
  owner?: string;
}

interface Node {
  type: 'dir' | 'file';
  name: string;
  content?: string;
  mode: string;
  owner: string;
  children?: Map<string, Node>;
}

export const SHELL_COMMANDS = ['help', 'ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'wc', 'base64', 'echo', 'whoami', 'clear'];

const HELP = `Commands in this practice shell:
  ls [-a] [-l] [path]      list a directory (-a shows hidden files, -l shows permissions)
  cd path | pwd            change or show the directory
  cat file                 print a file
  head [-n N] file         first lines; tail [-n N] file: last lines
  grep [-i] [-v] [-c] pattern [file]   matching lines (-i ignore case, -v invert, -c count)
  find [path] [-name pattern]          list files, e.g. find / -name "*.conf"
  wc [-l] [file]           count lines, words and characters
  base64 [-d] [file]       encode, or decode with -d
  echo text | whoami | clear
Pipes work: cat auth.log | grep Failed | wc -l`;

export class VirtualShell {
  private root: Node = { type: 'dir', name: '', mode: 'drwxr-xr-x', owner: 'root', children: new Map() };
  cwd: string;
  readonly user: string;

  constructor(files: ShellFile[], cwd = '/', user = 'student') {
    for (const f of files) this.addFile(f);
    this.user = user;
    this.cwd = this.resolve(cwd);
    if (!this.lookup(this.cwd)) this.mkdirs(this.cwd);
  }

  private mkdirs(path: string): Node {
    let node = this.root;
    for (const part of path.split('/').filter(Boolean)) {
      let next = node.children!.get(part);
      if (!next) {
        next = { type: 'dir', name: part, mode: 'drwxr-xr-x', owner: 'root', children: new Map() };
        node.children!.set(part, next);
      }
      node = next;
    }
    return node;
  }

  private addFile(f: ShellFile) {
    const parts = f.path.split('/').filter(Boolean);
    const name = parts.pop()!;
    const dir = this.mkdirs('/' + parts.join('/'));
    dir.children!.set(name, { type: 'file', name, content: f.content, mode: f.mode || '-rw-r--r--', owner: f.owner || 'root' });
  }

  resolve(path: string): string {
    const abs = path.startsWith('/') ? path : `${this.cwd}/${path}`;
    const out: string[] = [];
    for (const p of abs.split('/')) {
      if (!p || p === '.') continue;
      if (p === '..') out.pop();
      else out.push(p);
    }
    return '/' + out.join('/');
  }

  private lookup(abs: string): Node | null {
    let node: Node | undefined = this.root;
    for (const part of abs.split('/').filter(Boolean)) {
      if (!node || node.type !== 'dir') return null;
      node = node.children!.get(part);
    }
    return node || null;
  }

  private readFile(arg: string): string {
    const n = this.lookup(this.resolve(arg));
    if (!n) throw new Error(`${arg}: No such file or directory`);
    if (n.type === 'dir') throw new Error(`${arg}: Is a directory`);
    return n.content || '';
  }

  /** Runs one line (with pipes). Returns the output text; `clear` returns null. */
  run(line: string): string | null {
    const stages = splitPipes(line.trim());
    if (!stages.length) return '';
    let input: string | undefined;
    for (const stage of stages) {
      const argv = tokenize(stage);
      if (!argv.length) continue;
      if (argv[0] === 'clear') return null;
      input = this.exec(argv, input);
    }
    return input ?? '';
  }

  private exec(argv: string[], stdin?: string): string {
    const [cmd, ...rest] = argv;
    const flags = new Set(rest.filter((a) => /^-[a-zA-Z]+$/.test(a)).flatMap((a) => a.slice(1).split('')));
    const args = rest.filter((a) => !/^-[a-zA-Z]+$/.test(a));
    switch (cmd) {
      case 'help':
        return HELP + '\n';
      case 'pwd':
        return this.cwd + '\n';
      case 'whoami':
        return this.user + '\n';
      case 'echo':
        return rest.join(' ') + '\n';
      case 'cd': {
        const target = this.resolve(args[0] || `/home/${this.user}`);
        const n = this.lookup(target);
        if (!n) throw new Error(`cd: ${args[0]}: No such file or directory`);
        if (n.type !== 'dir') throw new Error(`cd: ${args[0]}: Not a directory`);
        this.cwd = target;
        return '';
      }
      case 'ls': {
        const target = args[0] ? this.resolve(args[0]) : this.cwd;
        const n = this.lookup(target);
        if (!n) throw new Error(`ls: cannot access '${args[0]}': No such file or directory`);
        const entries = n.type === 'dir' ? [...n.children!.values()].sort((a, b) => a.name.localeCompare(b.name)) : [n];
        const shown = entries.filter((e) => flags.has('a') || !e.name.startsWith('.'));
        if (flags.has('l')) {
          const all = flags.has('a') && n.type === 'dir' ? ['drwxr-xr-x root .', 'drwxr-xr-x root ..'] : [];
          return [...all, ...shown.map((e) => `${e.mode} ${e.owner.padEnd(5)} ${String(e.type === 'file' ? (e.content || '').length : 4096).padStart(6)} ${e.name}`)].join('\n') + (all.length + shown.length ? '\n' : '');
        }
        const names = [...(flags.has('a') && n.type === 'dir' ? ['.', '..'] : []), ...shown.map((e) => (e.type === 'dir' ? e.name + '/' : e.name))];
        return names.length ? names.join('  ') + '\n' : '';
      }
      case 'cat':
        if (!args.length) return stdin ?? '';
        return args.map((a) => this.readFile(a)).join('');
      case 'head':
      case 'tail': {
        const nIdx = rest.indexOf('-n');
        const count = nIdx >= 0 ? Math.max(0, Number(rest[nIdx + 1]) || 10) : 10;
        const file = rest.filter((a, i) => !a.startsWith('-') && !(nIdx >= 0 && i === nIdx + 1))[0];
        const text = file ? this.readFile(file) : stdin ?? '';
        const lines = text.replace(/\n$/, '').split('\n');
        const pick = cmd === 'head' ? lines.slice(0, count) : lines.slice(-count);
        return pick.length && text ? pick.join('\n') + '\n' : '';
      }
      case 'grep': {
        const [pattern, file] = args;
        if (pattern === undefined) throw new Error('grep: usage: grep [-i] [-v] [-c] pattern [file]');
        const text = file ? this.readFile(file) : stdin ?? '';
        const needle = flags.has('i') ? pattern.toLowerCase() : pattern;
        const lines = text.replace(/\n$/, '').split('\n').filter((l) => text && (flags.has('i') ? l.toLowerCase() : l).includes(needle) !== flags.has('v'));
        if (flags.has('c')) return `${lines.length}\n`;
        return lines.length ? lines.join('\n') + '\n' : '';
      }
      case 'wc': {
        const text = args[0] ? this.readFile(args[0]) : stdin ?? '';
        const lines = (text.match(/\n/g) || []).length;
        if (flags.has('l')) return `${lines}\n`;
        const words = text.split(/\s+/).filter(Boolean).length;
        return `${lines} ${words} ${text.length}\n`;
      }
      case 'find': {
        const nameIdx = rest.indexOf('-name');
        const pattern = nameIdx >= 0 ? rest[nameIdx + 1] : undefined;
        const start = rest[0] && !rest[0].startsWith('-') ? this.resolve(rest[0]) : this.cwd;
        const node = this.lookup(start);
        if (!node) throw new Error(`find: '${rest[0]}': No such file or directory`);
        const re = pattern ? new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$') : null;
        const out: string[] = [];
        const walk = (n: Node, p: string) => {
          if (!re || re.test(n.name)) out.push(p || '/');
          if (n.type === 'dir') for (const c of [...n.children!.values()].sort((a, b) => a.name.localeCompare(b.name))) walk(c, `${p === '/' ? '' : p}/${c.name}`);
        };
        walk(node, start);
        return out.length ? out.join('\n') + '\n' : '';
      }
      case 'base64': {
        const text = args[0] ? this.readFile(args[0]) : stdin ?? '';
        if (flags.has('d')) {
          try {
            return decodeBase64(text.replace(/\s+/g, ''));
          } catch {
            throw new Error('base64: invalid input');
          }
        }
        return encodeBase64(text) + '\n';
      }
      default:
        throw new Error(`${cmd}: command not found. Type help for the list.`);
    }
  }
}

export function encodeBase64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function decodeBase64(s: string): string {
  const bin = atob(s);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function splitPipes(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let quote = '';
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = '';
      cur += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
    } else if (ch === '|') {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function tokenize(s: string): string[] {
  const out: string[] = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}
