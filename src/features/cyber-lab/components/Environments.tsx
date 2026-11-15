import * as React from 'react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/utils';
import { VirtualShell, type ShellFile } from '../lib/shell';
import { caesarShift, decodeBase64, hexToBytes, xorWithByte, sha256Hex, decodeJwt, b64url, signJwtHS256, verifyJwt } from '../lib/tools';

export interface EnvProps {
  data: Record<string, any>;
  /** Puts a found flag into the answer box. */
  onFound: (flag: string) => void;
}

const box = 'rounded-xl border border-slate-200 bg-white p-3';
const field = 'h-9 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-mono focus:border-blue-400 focus:outline-none';
const label = 'text-xs font-medium text-slate-600';

/** Shell exercises: a simulated terminal over the exercise's practice file system. */
export function ShellEnv({ data, user = 'student' }: EnvProps & { user?: string }) {
  const shell = React.useMemo(() => new VirtualShell((data.files || []) as ShellFile[], data.cwd || '/', data.cwd?.startsWith('/home/guest') ? 'guest' : user), [data, user]);
  const [lines, setLines] = React.useState<{ cmd?: string; cwd?: string; out: string; err?: boolean }[]>([{ out: 'Practice shell. Nothing here touches a real machine. Type help for the commands.\n' }]);
  const [cmd, setCmd] = React.useState('');
  const [history, setHistory] = React.useState<string[]>([]);
  const [hIdx, setHIdx] = React.useState(-1);
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [lines]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = cmd;
    setCmd('');
    setHIdx(-1);
    if (!c.trim()) return;
    setHistory((h) => [c, ...h].slice(0, 50));
    const cwd = shell.cwd;
    try {
      const out = shell.run(c);
      if (out === null) return setLines([]);
      setLines((l) => [...l, { cmd: c, cwd, out }].slice(-200));
    } catch (err: any) {
      setLines((l) => [...l, { cmd: c, cwd, out: `${err.message}\n`, err: true }].slice(-200));
    }
  };
  const short = (p: string) => p.replace(new RegExp(`^/home/${shell.user}`), '~') || '/';
  return (
    <div className="rounded-xl bg-slate-950 p-3 font-mono text-[12px] leading-relaxed text-slate-200" data-testid="cyber-shell">
      <div className="max-h-80 overflow-auto whitespace-pre-wrap break-words">
        {lines.map((l, i) => (
          <div key={i}>
            {l.cmd !== undefined && (
              <div>
                <span className="text-emerald-400">{shell.user}@practice</span>:<span className="text-sky-400">{short(l.cwd || '/')}</span>$ {l.cmd}
              </div>
            )}
            {l.out && <div className={l.err ? 'text-rose-300' : ''}>{l.out.replace(/\n$/, '')}</div>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={submit} className="mt-1 flex items-center gap-1">
        <span className="shrink-0">
          <span className="text-emerald-400">{shell.user}@practice</span>:<span className="text-sky-400">{short(shell.cwd)}</span>$
        </span>
        <input
          aria-label="Shell command"
          className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none"
          value={cmd}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp' && history.length) {
              e.preventDefault();
              const i = Math.min(hIdx + 1, history.length - 1);
              setHIdx(i);
              setCmd(history[i]);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              const i = hIdx - 1;
              setHIdx(i);
              setCmd(i >= 0 ? history[i] : '');
            }
          }}
        />
      </form>
    </div>
  );
}

/** A practice packet capture shown as a table. */
export function CaptureEnv({ data }: EnvProps) {
  const rows: string[][] = data.capture || [];
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left font-mono text-xs" data-testid="cyber-capture">
        <thead className="bg-slate-50 text-slate-500"><tr>{rows[0]?.map((h) => <th key={h} className="px-3 py-1.5 font-medium">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{rows.slice(1).map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="whitespace-nowrap px-3 py-1">{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/** Multiple choice with a code snippet. The chosen option index is the answer. */
export function McqEnv({ data, value, onChange }: EnvProps & { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-3">
      <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-[12px] leading-relaxed text-slate-100">{data.code}</pre>
      <fieldset className="space-y-2">
        <legend className="sr-only">Options</legend>
        {(data.options as string[]).map((o, i) => (
          <label key={i} className={cn('flex cursor-pointer items-start gap-2 rounded-lg border p-2.5 text-sm', value === String(i) ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white')}>
            <input type="radio" name="mcq" className="mt-1" checked={value === String(i)} onChange={() => onChange(String(i))} />
            <span className="font-mono text-[12px] text-slate-800">{o}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}

// ---- Practice web apps ----

let sqlPromise: Promise<any> | null = null;
async function loadSql() {
  if (!sqlPromise) {
    sqlPromise = (async () => {
      // @ts-ignore sql.js ships no type declarations
      const init = (await import('sql.js')).default;
      const wasmUrl = (await import('sql.js/dist/sql-wasm.wasm?url')).default;
      return init({ locateFile: () => wasmUrl });
    })().catch((e) => {
      sqlPromise = null;
      throw e;
    });
  }
  return sqlPromise;
}

/** A practice login backed by an in-browser SQLite database, built with string concatenation. */
export function SqliEnv({ data, onFound }: EnvProps) {
  const [db, setDb] = React.useState<any>(null);
  const [loadErr, setLoadErr] = React.useState('');
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [fixed, setFixed] = React.useState(false);
  const [result, setResult] = React.useState<{ query: string; text: string; tone: 'ok' | 'bad' | 'err' } | null>(null);

  React.useEffect(() => {
    let alive = true;
    loadSql()
      .then((SQL) => {
        if (!alive) return;
        const d = new SQL.Database();
        d.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT);
               INSERT INTO users VALUES (1, 'admin', 'x9#Lq!practice-only', 'admin'), (2, 'asha', 'sunrise42', 'student'), (3, 'ravi', 'blue-river', 'student');`);
        setDb(d);
      })
      .catch(() => alive && setLoadErr('The practice database could not start in this browser.'));
    return () => {
      alive = false;
    };
  }, []);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    if (fixed) {
      const query = 'SELECT id, username, role FROM users WHERE username = ? AND password = ?';
      const stmt = db.prepare(query);
      stmt.bind([user, pass]);
      const row = stmt.step() ? stmt.getAsObject() : null;
      stmt.free();
      setResult({ query: `${query}   -- values bound separately: [${JSON.stringify(user)}, ${JSON.stringify(pass)}]`, text: row ? `Signed in as ${row.username}.` : 'Wrong username or password.', tone: row ? 'ok' : 'bad' });
      return;
    }
    const query = `SELECT id, username, role FROM users WHERE username = '${user}' AND password = '${pass}'`;
    try {
      const res = db.exec(query);
      const rows = res[0]?.values || [];
      if (!rows.length) return setResult({ query, text: 'Wrong username or password.', tone: 'bad' });
      const [, name, role] = rows[0];
      if (role === 'admin') {
        setResult({ query, text: `Signed in as ${name} (admin). Secret: ${data.flag}`, tone: 'ok' });
        onFound(data.flag);
      } else setResult({ query, text: `Signed in as ${name}.`, tone: 'ok' });
    } catch (err: any) {
      // Showing the database error is itself a classic mistake; it is kept here because it helps learning.
      setResult({ query, text: `Database error: ${err.message}`, tone: 'err' });
    }
  };

  if (loadErr) return <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{loadErr}</p>;
  return (
    <div className={cn(box, 'space-y-3')} data-testid="cyber-sqli">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Practice Portal: sign in</p>
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} /> Fixed version (parameterised query)
        </label>
      </div>
      <form onSubmit={login} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input className={field} placeholder="username" aria-label="Username" value={user} onChange={(e) => setUser(e.target.value)} />
        <input className={field} placeholder="password" aria-label="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
        <Button type="submit" size="sm" disabled={!db}>{db ? 'Sign in' : 'Starting…'}</Button>
      </form>
      {result && (
        <div className="space-y-1.5">
          <pre className="overflow-x-auto rounded-lg bg-slate-950 p-2.5 text-[11px] text-amber-200">{result.query}</pre>
          <p className={cn('text-sm', result.tone === 'ok' ? 'text-emerald-700' : result.tone === 'err' ? 'text-rose-700' : 'text-slate-700')} role="status">{result.text}</p>
        </div>
      )}
    </div>
  );
}

/**
 * A practice comment board in a sandboxed iframe (scripts allowed, but a separate, opaque origin: it cannot
 * reach this page, its storage or the sign-in). Comments are inserted with innerHTML, which is the bug.
 */
export function XssEnv({ data, onFound }: EnvProps) {
  const [comments, setComments] = React.useState<string[]>(['Great lecture today!', 'Can someone share the notes for unit 3?']);
  const [text, setText] = React.useState('');
  const [fixed, setFixed] = React.useState(false);
  const token = React.useMemo(() => Math.random().toString(36).slice(2), []);
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [solved, setSolved] = React.useState(false);

  React.useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.source === frame.current?.contentWindow && e.data?.cyberLab === 'xss' && e.data.token === token) {
        setSolved(true);
        onFound(data.flag);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [token, data.flag, onFound]);

  const srcDoc = `<!doctype html><html><body style="font:14px system-ui;margin:12px;color:#0f172a">
<h3 style="margin:0 0 8px">Class board</h3><div id="list"></div>
<script>
function solve(){ parent.postMessage({ cyberLab: 'xss', token: ${JSON.stringify(token)} }, '*'); }
var comments = ${JSON.stringify(comments).replace(/</g, '\\u003c')};
var list = document.getElementById('list');
comments.forEach(function (c) {
  var d = document.createElement('div');
  d.style.cssText = 'border:1px solid #e2e8f0;border-radius:8px;padding:6px 8px;margin:6px 0';
  ${fixed ? 'd.textContent = c;' : 'd.innerHTML = c;'}
  list.appendChild(d);
});
</script></body></html>`;

  return (
    <div className={cn(box, 'space-y-3')} data-testid="cyber-xss">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Practice comment board</p>
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} /> Fixed version (textContent)
        </label>
      </div>
      <iframe ref={frame} title="Practice comment board" sandbox="allow-scripts" srcDoc={srcDoc} className="h-48 w-full rounded-lg border border-slate-200 bg-white" />
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) setComments((c) => [...c, text].slice(-8));
          setText('');
        }}
      >
        <input className={field} placeholder="Write a comment" aria-label="Comment" value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" size="sm">Post</Button>
      </form>
      {solved && <p className="text-sm text-emerald-700" role="status">The board ran solve(). Secret: {data.flag}</p>}
    </div>
  );
}

const INVOICES: Record<number, { owner: number; to: string; amount: string; note?: string }> = {
  1001: { owner: 3, to: 'Ravi', amount: '₹1,200' },
  1002: { owner: 7, to: 'You (user 7)', amount: '₹850' },
  1003: { owner: 1, to: 'Administrator', amount: '₹0', note: 'internal' },
  1004: { owner: 4, to: 'Meena', amount: '₹2,450' },
};

/** A simulated billing API that checks sign-in but not ownership. */
export function IdorEnv({ data, onFound }: EnvProps) {
  const [path, setPath] = React.useState('/api/invoices/1002');
  const [fixed, setFixed] = React.useState(false);
  const [resp, setResp] = React.useState<{ status: number; body: unknown } | null>(null);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const m = /^\/api\/invoices\/(\d+)$/.exec(path.trim());
    if (!m) return setResp({ status: 404, body: { error: 'Not found' } });
    const inv = INVOICES[Number(m[1])];
    if (!inv) return setResp({ status: 404, body: { error: 'No such invoice' } });
    if (fixed && inv.owner !== 7) return setResp({ status: 403, body: { error: 'This invoice is not yours' } });
    const body: any = { id: Number(m[1]), owner_id: inv.owner, billed_to: inv.to, amount: inv.amount };
    if (inv.note) body.note = `${inv.note}: ${data.flag}`;
    setResp({ status: 200, body });
    if (inv.owner !== 7 && inv.note) onFound(data.flag);
  };
  return (
    <div className={cn(box, 'space-y-3')} data-testid="cyber-idor">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Practice billing API <span className="font-normal text-slate-500">· signed in as user 7</span></p>
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} /> Fixed version (owner check)
        </label>
      </div>
      <form onSubmit={send} className="flex gap-2">
        <span className="inline-flex h-9 items-center rounded-lg bg-slate-100 px-2.5 font-mono text-xs text-slate-700">GET</span>
        <input className={field} aria-label="Request path" value={path} onChange={(e) => setPath(e.target.value)} />
        <Button type="submit" size="sm">Send</Button>
      </form>
      {resp && <pre className="overflow-x-auto rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-100">{`HTTP ${resp.status}\n${JSON.stringify(resp.body, null, 2)}`}</pre>}
    </div>
  );
}

/** A practice API whose JWT check trusts the token's own "alg". */
export function JwtEnv({ data, onFound }: EnvProps) {
  const secret = React.useMemo(() => crypto.getRandomValues(new Uint32Array(4)).join('-'), []);
  const [original, setOriginal] = React.useState('');
  const [token, setToken] = React.useState('');
  const [header, setHeader] = React.useState('');
  const [payload, setPayload] = React.useState('');
  const [fixed, setFixed] = React.useState(false);
  const [resp, setResp] = React.useState('');
  React.useEffect(() => {
    signJwtHS256({ sub: '7', name: 'student', role: 'student' }, secret).then((t) => {
      setOriginal(t);
      setToken(t);
    });
  }, [secret]);
  const decode = () => {
    try {
      const d = decodeJwt(token);
      setHeader(JSON.stringify(d.header));
      setPayload(JSON.stringify(d.payload));
    } catch (e: any) {
      setResp(e.message);
    }
  };
  const encode = () => {
    try {
      const [, , sig = ''] = token.split('.');
      const h = JSON.parse(header);
      setToken(`${b64url(JSON.stringify(h))}.${b64url(JSON.stringify(JSON.parse(payload)))}.${String(h.alg).toLowerCase() === 'none' ? '' : sig}`);
    } catch {
      setResp('The header and payload must be valid JSON.');
    }
  };
  const call = async () => {
    const r = await verifyJwt(token, secret, fixed);
    if (!r.ok) return setResp(`HTTP 401\n${r.reason}`);
    if (r.payload?.role !== 'admin') return setResp(`HTTP 403\nHello ${r.payload?.name}, this page is for admins only.`);
    setResp(`HTTP 200\nWelcome, admin. Secret: ${data.flag}`);
    onFound(data.flag);
  };
  return (
    <div className={cn(box, 'space-y-3')} data-testid="cyber-jwt">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">Practice API: GET /admin</p>
        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600">
          <input type="checkbox" checked={fixed} onChange={(e) => setFixed(e.target.checked)} /> Fixed version (HS256 only)
        </label>
      </div>
      <label className={label}>Authorization: Bearer
        <textarea className="mt-1 block h-20 w-full rounded-lg border border-slate-200 p-2 font-mono text-[11px]" aria-label="Token" value={token} onChange={(e) => setToken(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={decode}>Decode</Button>
        <Button size="sm" variant="outline" onClick={encode} disabled={!header || !payload}>Encode edited parts</Button>
        <Button size="sm" variant="ghost" onClick={() => setToken(original)}>Reset token</Button>
        <Button size="sm" onClick={call} disabled={!token}>Send request</Button>
      </div>
      {(header || payload) && (
        <div className="grid gap-2 sm:grid-cols-2">
          <label className={label}>Header<input className={field} aria-label="JWT header" value={header} onChange={(e) => setHeader(e.target.value)} /></label>
          <label className={label}>Payload<input className={field} aria-label="JWT payload" value={payload} onChange={(e) => setPayload(e.target.value)} /></label>
        </div>
      )}
      {resp && <pre className="whitespace-pre-wrap rounded-lg bg-slate-950 p-2.5 text-[11px] text-slate-100" role="status">{resp}</pre>}
    </div>
  );
}

/** Hashes a wordlist in the browser and compares it with the leaked hash. */
export function HashEnv({ data }: EnvProps) {
  const [words, setWords] = React.useState<string>((data.wordlist || []).join('\n'));
  const [result, setResult] = React.useState<string>('');
  const [busy, setBusy] = React.useState(false);
  const run = async () => {
    setBusy(true);
    const list = words.split('\n').map((w) => w.trim()).filter(Boolean).slice(0, 5000);
    const started = performance.now();
    let hit = '';
    for (const w of list) {
      if ((await sha256Hex(w)) === data.hash) {
        hit = w;
        break;
      }
    }
    const ms = Math.round(performance.now() - started);
    setResult(hit ? `Match: "${hit}" (checked in ${ms} ms). Type it into the answer box.` : `No match among ${list.length} words (${ms} ms).`);
    setBusy(false);
  };
  return (
    <div className={cn(box, 'space-y-3')} data-testid="cyber-hash">
      <p className="text-xs text-slate-600">Leaked hash (SHA-256, no salt):</p>
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-2.5 text-[11px] text-amber-200">{data.hash}</pre>
      <label className={label}>Wordlist (one per line)
        <textarea className="mt-1 block h-28 w-full rounded-lg border border-slate-200 p-2 font-mono text-[11px]" aria-label="Wordlist" value={words} onChange={(e) => setWords(e.target.value)} />
      </label>
      <Button size="sm" onClick={run} isLoading={busy}>Hash each word and compare</Button>
      {result && <p className="text-sm text-slate-800" role="status">{result}</p>}
    </div>
  );
}

/** Decoding tools for the cryptography exercises. */
export function CryptoEnv({ data }: EnvProps) {
  const [input, setInput] = React.useState<string>(data.ciphertext || '');
  const [shift, setShift] = React.useState(0);
  const [key, setKey] = React.useState('00');
  const [out, setOut] = React.useState('');
  const safe = (fn: () => string) => {
    try {
      setOut(fn());
    } catch (e: any) {
      setOut(`Could not decode: ${e.message || 'invalid input'}`);
    }
  };
  return (
    <div className={cn(box, 'space-y-3')} data-testid="cyber-crypto">
      <label className={label}>Input
        <textarea className="mt-1 block h-16 w-full rounded-lg border border-slate-200 p-2 font-mono text-[12px]" aria-label="Cipher input" value={input} onChange={(e) => setInput(e.target.value)} />
      </label>
      <div className="flex flex-wrap items-end gap-2">
        <Button size="sm" variant="outline" onClick={() => safe(() => decodeBase64(input.trim()))}>Base64 decode</Button>
        <label className={label}>Shift
          <input type="number" min={0} max={25} className={cn(field, 'mt-1 w-20')} aria-label="Caesar shift" value={shift} onChange={(e) => setShift(Number(e.target.value) || 0)} />
        </label>
        <Button size="sm" variant="outline" onClick={() => safe(() => caesarShift(input, shift))}>Caesar shift</Button>
        <label className={label}>Key byte (hex)
          <input className={cn(field, 'mt-1 w-24')} aria-label="XOR key" value={key} onChange={(e) => setKey(e.target.value)} />
        </label>
        <Button size="sm" variant="outline" onClick={() => safe(() => xorWithByte(hexToBytes(input), parseInt(key, 16) || 0))}>XOR hex with key</Button>
      </div>
      {out && <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-2.5 text-[12px] text-emerald-200" role="status">{out}</pre>}
    </div>
  );
}
