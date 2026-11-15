// Cybersecurity Lab: the exercise catalogue.
//
// Every target is a training environment that runs inside the student's browser: a simulated shell over a
// made-up file system, a toy SQLite login, a comment board in a sandboxed iframe, a simulated invoice API and
// a JWT checker. Nothing is scanned or attacked over the network. The logs and captures are practice data,
// and their IP addresses come from the documentation ranges (RFC 5737), which are never used on the internet.
//
// Answers stay on the server. The client gets `publicExercise()`; attempts are checked here.
import crypto from 'crypto';

export type CyberKind = 'answer' | 'mcq' | 'shell' | 'sqli' | 'xss' | 'idor' | 'jwt' | 'hash' | 'crypto';
export type CyberLevel = 1 | 2 | 3;

export interface CyberTrack {
  id: string;
  title: string;
  summary: string;
  /** Existing courses (by id) and pages this track builds on. */
  courses: { id: string; title: string }[];
  links?: { href: string; label: string }[];
}

export interface CyberExercise {
  id: string;
  track: string;
  level: CyberLevel;
  title: string;
  kind: CyberKind;
  /** What to do, shown to the student. */
  brief: string;
  /** Data the browser environment needs (file system, log, options, ciphertext). No answers for answer/mcq kinds. */
  data?: Record<string, unknown>;
  hints: string[];
  skills: string[];
  /** Accepted answers, compared after trimming, collapsing spaces and ignoring case. */
  answers: string[];
  /** Shown after solving: why it worked and how to defend against it. */
  lesson: string;
}

export const TRACKS: CyberTrack[] = [
  {
    id: 'networking',
    title: 'Networking fundamentals',
    summary: 'Addresses, subnets and reading a packet capture.',
    courses: [{ id: 'crs_cat_025', title: 'Computer Networks' }],
    links: [{ href: '/virtual-lab', label: 'Subnetting in the Virtual Lab' }],
  },
  {
    id: 'linux',
    title: 'Linux and the command line',
    summary: 'Hidden files, searching logs, file permissions.',
    courses: [
      { id: 'crs_cat_061', title: 'Linux Fundamentals' },
      { id: 'crs_cat_024', title: 'Operating Systems' },
    ],
  },
  {
    id: 'web',
    title: 'Web application security (OWASP)',
    summary: 'Injection, cross-site scripting and broken access control in practice apps.',
    courses: [{ id: 'crs_cat_020', title: 'Web Application Security' }],
  },
  {
    id: 'auth',
    title: 'Authentication security',
    summary: 'Password hashes and token validation.',
    courses: [
      { id: 'crs_cat_034', title: 'Computer Security Fundamentals' },
      { id: 'crs_cat_020', title: 'Web Application Security' },
    ],
  },
  {
    id: 'crypto',
    title: 'Cryptography fundamentals',
    summary: 'Encoding versus encryption, classical ciphers, XOR.',
    courses: [{ id: 'crs_cat_034', title: 'Computer Security Fundamentals' }],
  },
  {
    id: 'secure-coding',
    title: 'Secure coding',
    summary: 'Spot the vulnerable line and choose the right fix.',
    courses: [{ id: 'crs_cat_020', title: 'Web Application Security' }],
    links: [{ href: '/code-review', label: 'Review your own code' }],
  },
  {
    id: 'analysis',
    title: 'Security analysis',
    summary: 'Read an authentication log like an analyst.',
    courses: [{ id: 'crs_cat_034', title: 'Computer Security Fundamentals' }],
  },
  {
    id: 'ctf',
    title: 'Capture the flag',
    summary: 'Put the skills together on a practice machine.',
    courses: [
      { id: 'crs_cat_061', title: 'Linux Fundamentals' },
      { id: 'crs_cat_034', title: 'Computer Security Fundamentals' },
    ],
  },
];

// ---- Practice data -------------------------------------------------------------------------------------

const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
const caesar = (s: string, k: number) => s.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + k) % 26) + 65));
const xorHex = (s: string, key: number) => Buffer.from([...Buffer.from(s, 'utf8')].map((b) => b ^ key)).toString('hex');
const sha256 = (s: string) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

/** A practice SSH authentication log: one address tries many passwords, then a different account is used. */
export function practiceAuthLog(): string {
  const lines: string[] = [];
  let t = 0;
  const at = () => {
    t += 7;
    const s = 8 * 3600 + 12 * 60 + t;
    const hh = String(Math.floor(s / 3600)).padStart(2, '0');
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `Nov 14 ${hh}:${mm}:${ss} lab-server sshd[${2100 + lines.length}]:`;
  };
  lines.push(`${at()} Accepted publickey for asha from 192.0.2.10 port 51122 ssh2`);
  const users = ['root', 'admin', 'test', 'oracle', 'ubuntu', 'deploy', 'git', 'postgres'];
  for (let i = 0; i < 18; i++) lines.push(`${at()} Failed password for ${i % 3 === 0 ? 'invalid user ' : ''}${users[i % users.length]} from 203.0.113.45 port ${40000 + i * 13} ssh2`);
  for (let i = 0; i < 4; i++) lines.push(`${at()} Failed password for root from 198.51.100.23 port ${52000 + i} ssh2`);
  lines.push(`${at()} Failed password for asha from 192.0.2.10 port 51180 ssh2`);
  lines.push(`${at()} Accepted password for asha from 192.0.2.10 port 51181 ssh2`);
  for (let i = 0; i < 6; i++) lines.push(`${at()} Failed password for deploy from 203.0.113.45 port ${41000 + i * 7} ssh2`);
  lines.push(`${at()} Accepted password for deploy from 203.0.113.45 port 41050 ssh2`);
  lines.push(`${at()} pam_unix(sshd:session): session opened for user deploy by (uid=0)`);
  lines.push(`${at()} Failed password for invalid user admin from 198.51.100.23 port 52011 ssh2`);
  return lines.join('\n') + '\n';
}

const appLog = (() => {
  const out: string[] = [];
  for (let i = 0; i < 120; i++) {
    const lvl = i % 17 === 0 ? 'WARN' : 'INFO';
    out.push(`2026-11-14T09:${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}Z ${lvl} worker-${i % 4} processed job ${5000 + i}`);
    if (i === 87) out.push('2026-11-14T09:43:31Z DEBUG worker-3 leftover debug token FLAG{grep_finds_needles}');
  }
  return out.join('\n') + '\n';
})();

const WORDLIST = [
  '123456', 'password', '12345678', 'qwerty', '123456789', '12345', '1234', '111111', '1234567', 'dragon',
  '123123', 'baseball', 'abc123', 'football', 'monkey', 'letmein', '696969', 'shadow', 'master', '666666',
  'qwertyuiop', '123321', 'mustang', '1234567890', 'michael', '654321', 'superman', '1qaz2wsx', '7777777', 'welcome1',
  'iloveyou', 'sunshine', 'princess', 'admin123', 'monkey123', 'trustno1', 'passw0rd', 'starwars', 'hello123', 'freedom',
];

// ---- Exercises -----------------------------------------------------------------------------------------

export const EXERCISES: CyberExercise[] = [
  // Networking
  {
    id: 'net-hosts',
    track: 'networking',
    level: 1,
    title: 'Usable hosts in a subnet',
    kind: 'answer',
    brief: 'A lab network is 192.168.10.0/26. How many addresses can be given to hosts?',
    hints: ['A /26 leaves 32 − 26 = 6 bits for hosts.', '2⁶ = 64 addresses, but the network and broadcast addresses cannot be used by hosts.'],
    skills: ['Subnetting'],
    answers: ['62'],
    lesson: '2^(32−prefix) − 2 usable hosts. Knowing the size of a subnet tells you what a scan of it would cover, and what a firewall rule for it allows.',
  },
  {
    id: 'net-network',
    track: 'networking',
    level: 2,
    title: 'Which network is this host on?',
    kind: 'answer',
    brief: 'A server has the address 10.4.77.200/20. Give the network address of its subnet.',
    hints: ['A /20 mask is 255.255.240.0.', 'Only the third octet is split: blocks of 16 (0, 16, 32, 48, 64, 80…). 77 falls in the block that starts at 64.'],
    skills: ['Subnetting'],
    answers: ['10.4.64.0', '10.4.64.0/20'],
    lesson: 'AND the address with the mask. Firewall rules, routing tables and allow-lists are written per network, so this is how you check what a rule really covers.',
  },
  {
    id: 'net-capture',
    track: 'networking',
    level: 2,
    title: 'Read a packet capture',
    kind: 'answer',
    brief: 'This practice capture shows a client trying several ports on a server. Which destination port completed the TCP three-way handshake?',
    data: {
      capture: [
        ['No.', 'Source', 'Destination', 'Info'],
        ['1', '192.0.2.10:50001', '192.0.2.80:23', '[SYN]'],
        ['2', '192.0.2.80:23', '192.0.2.10:50001', '[RST, ACK]'],
        ['3', '192.0.2.10:50002', '192.0.2.80:80', '[SYN]'],
        ['4', '192.0.2.80:80', '192.0.2.10:50002', '[RST, ACK]'],
        ['5', '192.0.2.10:50003', '192.0.2.80:22', '[SYN]'],
        ['6', '192.0.2.80:22', '192.0.2.10:50003', '[SYN, ACK]'],
        ['7', '192.0.2.10:50003', '192.0.2.80:22', '[ACK]'],
        ['8', '192.0.2.10:50004', '192.0.2.80:3306', '[SYN]'],
        ['9', '192.0.2.80:3306', '192.0.2.10:50004', '[RST, ACK]'],
      ],
    },
    hints: ['A handshake is SYN, then SYN-ACK back, then ACK.', 'RST means the port is closed.'],
    skills: ['TCP handshake', 'Packet analysis'],
    answers: ['22', 'port 22', '22/tcp', 'ssh'],
    lesson: 'Port 22 (SSH) answered with SYN-ACK, so it is open; the RST replies mean closed ports. This is what a port scanner does, which is why scanning a machine you do not own or have written permission to test is not allowed.',
  },
  // Linux
  {
    id: 'lnx-hidden',
    track: 'linux',
    level: 1,
    title: 'Find the hidden file',
    kind: 'shell',
    brief: 'Someone left a note in your home directory, but `ls` does not show it. Find it and read it. The flag looks like FLAG{…}.',
    data: {
      cwd: '/home/student',
      files: [
        { path: '/home/student/notes.txt', content: 'Remember: ls hides files whose names start with a dot.\n' },
        { path: '/home/student/projects/readme.md', content: '# Nothing here\n' },
        { path: '/home/student/.flag', content: 'FLAG{hidden_files_start_with_a_dot}\n' },
        { path: '/home/student/.bashrc', content: 'alias ll="ls -la"\n' },
      ],
    },
    hints: ['Try `ls -a`.', 'Then `cat .flag`.'],
    skills: ['Linux file system', 'Command line'],
    answers: ['FLAG{hidden_files_start_with_a_dot}'],
    lesson: 'Dotfiles are hidden from `ls` but not protected. Secrets in hidden files (keys, .env files, shell history) are one of the first things an attacker looks for, so they need real permissions, not a dot.',
  },
  {
    id: 'lnx-grep',
    track: 'linux',
    level: 2,
    title: 'Search a log',
    kind: 'shell',
    brief: 'The application log in /var/log/app.log has over a hundred lines. One debug line leaked a flag. Find it without reading the whole file.',
    data: {
      cwd: '/home/student',
      files: [
        { path: '/var/log/app.log', content: appLog },
        { path: '/var/log/syslog', content: 'Nov 14 09:00:00 lab-server systemd[1]: Started app.service.\n' },
        { path: '/home/student/todo.txt', content: 'check the logs\n' },
      ],
    },
    hints: ['`grep PATTERN FILE` prints matching lines.', 'Try `grep FLAG /var/log/app.log`, or `grep -i debug /var/log/app.log`.'],
    skills: ['Command line', 'Log analysis'],
    answers: ['FLAG{grep_finds_needles}'],
    lesson: 'Logs leak secrets when debug output is left on. Search logs with grep, and never log tokens or passwords in the first place.',
  },
  {
    id: 'lnx-perms',
    track: 'linux',
    level: 3,
    title: 'Find the world-writable file',
    kind: 'shell',
    brief: 'One configuration file under /etc/app can be changed by any user on the machine. Give its full path.',
    data: {
      cwd: '/etc/app',
      files: [
        { path: '/etc/app/app.conf', content: 'port=8080\n', mode: '-rw-r--r--', owner: 'root' },
        { path: '/etc/app/db.conf', content: 'host=localhost\n', mode: '-rw-r-----', owner: 'root' },
        { path: '/etc/app/backup.conf', content: 'target=/srv/backup\n', mode: '-rw-rw-rw-', owner: 'root' },
        { path: '/etc/app/logging.conf', content: 'level=info\n', mode: '-rw-r--r--', owner: 'root' },
        { path: '/etc/app/keys/server.key', content: '(practice key)\n', mode: '-rw-------', owner: 'root' },
      ],
    },
    hints: ['`ls -l` shows permissions: owner, group, others.', 'Look for a w in the last three characters.'],
    skills: ['File permissions', 'Linux file system'],
    answers: ['/etc/app/backup.conf'],
    lesson: 'Mode -rw-rw-rw- lets every user write the file. A world-writable config read by a root process is a privilege-escalation path. Fix it with `chmod 644` (or tighter).',
  },
  // Web
  {
    id: 'web-sqli',
    track: 'web',
    level: 1,
    title: 'SQL injection: log in as admin',
    kind: 'sqli',
    brief: 'This practice login builds its SQL query by pasting your input into a string. Log in as the admin user without knowing the password. The query it runs is shown under the form.',
    data: { flag: 'FLAG{sqli_bypassed_login}' },
    hints: ['A single quote ends the string the query is building.', "Try the username admin'-- (the -- starts an SQL comment)."],
    skills: ['SQL injection', 'OWASP A03: Injection'],
    answers: ['FLAG{sqli_bypassed_login}'],
    lesson: 'Input became part of the SQL, so the comment removed the password check. The fix is a parameterised query (placeholders such as ? with values bound separately), which the form shows when you switch to the fixed version.',
  },
  {
    id: 'web-xss',
    track: 'web',
    level: 2,
    title: 'Stored XSS on a comment board',
    kind: 'xss',
    brief: 'This practice comment board puts each comment into the page as HTML. Post a comment that makes the board run its own solve() function.',
    data: { flag: 'FLAG{stored_xss_runs_in_the_browser}' },
    hints: ['A <script> tag added through innerHTML does not run, but event handlers do.', 'Try <img src=x onerror="solve()">.'],
    skills: ['Cross-site scripting', 'OWASP A03: Injection'],
    answers: ['FLAG{stored_xss_runs_in_the_browser}'],
    lesson: 'The board inserted the comment as HTML, so your attribute became code. Escape output (textContent instead of innerHTML), and add a Content Security Policy as a second layer.',
  },
  {
    id: 'web-idor',
    track: 'web',
    level: 2,
    title: 'Broken access control (IDOR)',
    kind: 'idor',
    brief: 'You are signed in to a practice billing API as user 7. Your invoice is 1002. Read an invoice that belongs to someone else.',
    data: { flag: 'FLAG{idor_check_the_owner}' },
    hints: ['Invoice numbers are sequential.', 'Change the number in the request path.'],
    skills: ['Access control', 'OWASP A01: Broken Access Control'],
    answers: ['FLAG{idor_check_the_owner}'],
    lesson: 'The API checked that you were signed in, but not that the invoice was yours. Every request for a record must check its owner on the server.',
  },
  // Authentication
  {
    id: 'auth-hash',
    track: 'auth',
    level: 2,
    title: 'Crack an unsalted password hash',
    kind: 'hash',
    brief: 'A practice database stored passwords as plain SHA-256, with no salt. Use the wordlist to find the password behind this hash.',
    data: { hash: sha256('monkey123'), wordlist: WORDLIST },
    hints: ['Hash every word in the list and compare.', 'The tool below hashes the list in your browser.'],
    skills: ['Password hashing', 'Dictionary attacks'],
    answers: ['monkey123'],
    lesson: 'Fast unsalted hashes can be checked against huge wordlists in seconds. Store passwords with a slow, salted algorithm such as bcrypt, scrypt or Argon2, and block common passwords at sign-up.',
  },
  {
    id: 'auth-jwt',
    track: 'auth',
    level: 3,
    title: 'Forge a token the server should reject',
    kind: 'jwt',
    brief: 'This practice API trusts the "alg" field of a JWT. You have a valid token for a student. Get the /admin endpoint to accept you as an admin.',
    data: { flag: 'FLAG{never_accept_alg_none}' },
    hints: ['Decode the token: it is three base64url parts.', 'What happens if the header says "alg": "none" and there is no signature?'],
    skills: ['JWT validation', 'OWASP A07: Identification and Authentication Failures'],
    answers: ['FLAG{never_accept_alg_none}'],
    lesson: 'The server let the token choose its own algorithm, including "none". Fix the algorithm on the server (for example, only HS256 with your key) and reject anything else.',
  },
  // Cryptography
  {
    id: 'cry-base64',
    track: 'crypto',
    level: 1,
    title: 'Encoding is not encryption',
    kind: 'crypto',
    brief: 'A config file "protected" a secret like this. Recover it.',
    data: { ciphertext: b64('FLAG{base64_is_encoding_not_encryption}') },
    hints: ['Characters A–Z, a–z, 0–9, + and / with = at the end usually mean base64.'],
    skills: ['Encoding vs encryption'],
    answers: ['FLAG{base64_is_encoding_not_encryption}'],
    lesson: 'Base64 has no key; anyone can reverse it. Secrets need real encryption or, better, a secret manager.',
  },
  {
    id: 'cry-caesar',
    track: 'crypto',
    level: 2,
    title: 'Break a Caesar cipher',
    kind: 'crypto',
    brief: 'This message was shifted through the alphabet by an unknown amount. Recover it.',
    data: { ciphertext: caesar('FLAG{CAESAR_SHIFTS_ARE_EASY_TO_BREAK}', 11) },
    hints: ['There are only 25 possible shifts.', 'The message should start with FLAG.'],
    skills: ['Classical ciphers', 'Brute force'],
    answers: ['FLAG{CAESAR_SHIFTS_ARE_EASY_TO_BREAK}'],
    lesson: 'A key space of 25 can be tried by hand. Real ciphers need key spaces far too large to search, such as AES with 128-bit or longer keys.',
  },
  {
    id: 'cry-xor',
    track: 'crypto',
    level: 3,
    title: 'Single-byte XOR',
    kind: 'crypto',
    brief: 'These bytes (hex) were XORed with one secret byte. Find the byte and recover the message.',
    data: { ciphertext: xorHex('FLAG{xor_with_one_byte_is_weak}', 0x5a), format: 'hex' },
    hints: ['XOR is its own inverse: (m ⊕ k) ⊕ k = m.', 'The first byte should decode to F (0x46). 0x46 ⊕ first byte = key.'],
    skills: ['XOR', 'Known-plaintext attacks'],
    answers: ['FLAG{xor_with_one_byte_is_weak}'],
    lesson: 'Knowing part of the plaintext gave away the key. A repeating short key is just as weak; use a vetted cipher and mode such as AES-GCM.',
  },
  // Secure coding
  {
    id: 'sc-sql',
    track: 'secure-coding',
    level: 1,
    title: 'Fix the login query',
    kind: 'mcq',
    brief: 'Which change removes the SQL injection in this Node.js handler?',
    data: {
      code: "app.post('/login', async (req, res) => {\n  const q = `SELECT * FROM users WHERE email = '${req.body.email}'`;\n  const user = await db.query(q);\n  ...\n});",
      options: [
        "Remove quotes from the input with req.body.email.replace(/'/g, '')",
        "Use a parameterised query: db.query('SELECT * FROM users WHERE email = $1', [req.body.email])",
        'Check that the email field is not empty before building the query',
        'Wrap the query in try/catch so errors are not shown',
      ],
    },
    hints: ['Filtering characters misses cases; the fix keeps data and code apart.'],
    skills: ['Secure coding: parameterised queries'],
    answers: ['1'],
    lesson: 'Placeholders send the value separately from the SQL text, so it can never change the query. Stripping characters is a blocklist and is easy to get around.',
  },
  {
    id: 'sc-passwords',
    track: 'secure-coding',
    level: 2,
    title: 'Store passwords safely',
    kind: 'mcq',
    brief: 'This sign-up code stores md5(password). What should it do instead?',
    data: {
      code: "const hash = crypto.createHash('md5').update(password).digest('hex');\nawait db.users.insert({ email, password_hash: hash });",
      options: [
        'Use SHA-256 instead of MD5',
        'Encrypt the password with AES and keep the key in the code',
        'Hash it with bcrypt or Argon2, which add a salt and are deliberately slow',
        'Store the password as base64 so it is not readable',
      ],
    },
    hints: ['Fast hashes are the problem, not just MD5.'],
    skills: ['Password hashing', 'Secure coding: credential storage'],
    answers: ['2'],
    lesson: 'Password hashes must be salted and slow so that a stolen table cannot be cracked quickly. SHA-256 is fast; encryption can be reversed by whoever has the key; base64 is not protection at all.',
  },
  {
    id: 'sc-xss',
    track: 'secure-coding',
    level: 2,
    title: 'Render user text safely',
    kind: 'mcq',
    brief: 'Comments are shown with this code. Which line is the safe replacement?',
    data: {
      code: "const div = document.createElement('div');\ndiv.innerHTML = comment.text;\nlist.appendChild(div);",
      options: [
        'div.innerHTML = comment.text.replace(/<script>/g, "")',
        'div.textContent = comment.text',
        'div.innerHTML = escape(comment.text)  // the deprecated URL escape()',
        'div.outerHTML = comment.text',
      ],
    },
    hints: ['Which property never parses HTML?'],
    skills: ['Secure coding: output encoding', 'Cross-site scripting'],
    answers: ['1'],
    lesson: 'textContent treats the comment as text, so no tag or attribute in it can run. Removing <script> misses event handlers such as onerror.',
  },
  // Security analysis
  {
    id: 'an-bruteforce',
    track: 'analysis',
    level: 2,
    title: 'Spot the brute-force attack',
    kind: 'shell',
    brief: 'Read the practice SSH log at /var/log/auth.log. Which IP address made the most failed login attempts?',
    data: { cwd: '/var/log', files: [{ path: '/var/log/auth.log', content: practiceAuthLog() }] },
    hints: ['`grep "Failed password" auth.log` keeps only the failures.', 'Count lines per address: `grep "Failed password" auth.log | grep 203.0.113.45 | wc -l`, and the same for the others.'],
    skills: ['Log analysis', 'Incident detection'],
    answers: ['203.0.113.45'],
    lesson: 'Many failures from one address in a short time is a password-guessing attack. Rate limiting, fail2ban-style blocking and key-only SSH logins stop it.',
  },
  {
    id: 'an-compromise',
    track: 'analysis',
    level: 3,
    title: 'Which account was broken into?',
    kind: 'shell',
    brief: 'Same log. After the failures, the attacker got in. Which user account did they log in as?',
    data: { cwd: '/var/log', files: [{ path: '/var/log/auth.log', content: practiceAuthLog() }] },
    hints: ['Look for "Accepted" lines.', 'Which accepted login came from the attacking address?'],
    skills: ['Log analysis', 'Incident response'],
    answers: ['deploy'],
    lesson: 'An accepted login from the address that was guessing passwords means that account is compromised: disable it, rotate its credentials and check what it did after the session opened.',
  },
  // Capture the flag
  {
    id: 'ctf-box',
    track: 'ctf',
    level: 3,
    title: 'The practice box',
    kind: 'shell',
    brief: 'You have a shell on a practice machine as guest. Somewhere is an encoded secret. Find it, decode it in the shell, and submit the flag.',
    data: {
      cwd: '/home/guest',
      files: [
        { path: '/home/guest/welcome.txt', content: 'Welcome. Admins keep their notes somewhere sensible.\n' },
        { path: '/home/admin/notes/todo.txt', content: 'rotate keys; remove the encoded secret from .vault\n' },
        { path: '/home/admin/notes/.vault', content: b64('FLAG{decoded_in_the_shell}') + '\n' },
        { path: '/opt/tools/README', content: 'base64 -d FILE decodes base64.\n' },
      ],
    },
    hints: ['Look in other users’ home directories: `ls /home`.', 'Hidden files again, then `base64 -d`.'],
    skills: ['Linux file system', 'Encoding vs encryption', 'Capture the flag'],
    answers: ['FLAG{decoded_in_the_shell}'],
    lesson: 'Readable home directories and "hidden" encoded secrets add up. Restrict home directories (chmod 750) and keep secrets out of files on shared machines.',
  },
];

export const EXERCISE_BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

export const normaliseAnswer = (s: unknown) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

export function checkAnswer(ex: CyberExercise, answer: unknown): boolean {
  const a = normaliseAnswer(answer);
  return !!a && ex.answers.some((x) => normaliseAnswer(x) === a);
}

/** What the browser gets: everything except the accepted answers and the lesson (shown once solved). */
export function publicExercise(ex: CyberExercise) {
  const { answers: _a, lesson: _l, ...rest } = ex;
  return rest;
}
