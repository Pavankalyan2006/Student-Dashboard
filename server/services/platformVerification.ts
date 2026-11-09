// Phase 3: shared rules for "is this external account really the student's?".
// A platform is shown as Connected only when this module returns verified: true. Everything else is a saved link.
import { promises as dns } from 'dns';
import net from 'net';
import { db } from '../db/database';

export interface VerificationResult {
  verified: boolean;
  method: 'GITHUB_OAUTH' | 'GITHUB_TOKEN' | 'PROFILE_CHALLENGE' | 'NONE';
  message: string;
}

/** GitHub counts as verified only when GitHub itself accepted an OAuth grant or a personal access token for this student. */
export async function githubVerification(studentId: string, username?: string): Promise<VerificationResult & { username?: string }> {
  const conn = await db.getGitHubConnection(studentId);
  if (!conn || !conn.is_connected || !conn.connection_type || conn.connection_type === 'PUBLIC_USERNAME') {
    return { verified: false, method: 'NONE', message: 'GitHub is not connected with OAuth or a token, so account ownership is not verified.' };
  }
  if (username && conn.username && conn.username.toLowerCase() !== username.toLowerCase()) {
    return { verified: false, method: 'NONE', message: `Your verified GitHub account is @${conn.username}, not @${username}.` };
  }
  return {
    verified: true,
    method: conn.connection_type === 'OAUTH' ? 'GITHUB_OAUTH' : 'GITHUB_TOKEN',
    message: `Verified by GitHub (${conn.connection_type === 'OAUTH' ? 'OAuth' : 'access token'}) as @${conn.username}.`,
    username: conn.username,
  };
}

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
  return v === '::1' || v === '::' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80');
}

/**
 * Fetches a public https page for a challenge check. Blocks private, loopback and link-local addresses (checked after DNS
 * resolution), does not follow redirects, stops after `timeoutMs` and reads at most `maxBytes`.
 */
export async function safeFetchText(rawUrl: string, timeoutMs = 6000, maxBytes = 300_000): Promise<string> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error('Not a valid URL');
  }
  if (url.protocol !== 'https:') throw new Error('Only https:// pages can be checked');
  if (url.username || url.password) throw new Error('URLs with credentials are not allowed');
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addrs = net.isIP(host) ? [{ address: host }] : await dns.lookup(host, { all: true });
  if (!addrs.length || addrs.some((a) => isPrivateAddress(a.address))) throw new Error('That address is on a private network and cannot be checked');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { redirect: 'manual', signal: ctrl.signal, headers: { 'User-Agent': 'student-dashboard-profile-check' } });
    if (res.status >= 300 && res.status < 400) throw new Error('The page redirects elsewhere; enter the final address');
    if (!res.ok) throw new Error(`The page answered HTTP ${res.status}`);
    const reader = res.body?.getReader();
    if (!reader) return '';
    let size = 0;
    const chunks: Uint8Array[] = [];
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      chunks.push(value);
      if (size >= maxBytes) {
        await reader.cancel();
        break;
      }
    }
    return Buffer.concat(chunks).toString('utf8');
  } finally {
    clearTimeout(timer);
  }
}

/** JSON from a fixed official API host (the URL is built by our code, not taken from the student). */
export async function fetchOfficialJson(url: string, timeoutMs = 6000): Promise<any> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json', 'User-Agent': 'student-dashboard-profile-check' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Platforms with a real verification or sync implementation. The catalogue's flags are derived from these lists. */
export const CHALLENGE_VERIFIABLE = new Set(['github', 'codeforces', 'portfolio_website', 'github_pages']);
export const SYNCABLE = new Set(['github', 'codeforces']);
export const OAUTH_PLATFORMS = new Set(['github']);
