// Small tools for the Cybersecurity Lab exercises. All run in the page.
import { encodeBase64, decodeBase64 } from './shell';

export { encodeBase64, decodeBase64 };

export const caesarShift = (s: string, k: number) =>
  s.replace(/[A-Za-z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((((c.charCodeAt(0) - base + k) % 26) + 26) % 26) + base);
  });

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, '');
  if (clean.length % 2) throw new Error('Hex needs an even number of digits.');
  return Uint8Array.from(clean.match(/../g) || [], (h) => parseInt(h, 16));
}

/** XORs bytes with a single byte key and returns printable text (non-printable bytes as dots). */
export function xorWithByte(bytes: Uint8Array, key: number): string {
  return Array.from(bytes, (b) => {
    const c = b ^ (key & 0xff);
    return c >= 32 && c < 127 ? String.fromCharCode(c) : '.';
  }).join('');
}

export async function sha256Hex(s: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ---- JWT ----

export const b64url = (s: string) => encodeBase64(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const fromB64url = (s: string) => decodeBase64(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));

export function decodeJwt(token: string): { header: any; payload: any; signature: string } {
  const [h, p, sig = ''] = token.trim().split('.');
  if (!h || !p) throw new Error('A JWT has three parts separated by dots.');
  return { header: JSON.parse(fromB64url(h)), payload: JSON.parse(fromB64url(p)), signature: sig };
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)));
  let bin = '';
  for (const b of sig) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function signJwtHS256(payload: object, secret: string): Promise<string> {
  const head = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  return `${head}.${body}.${await hmac(secret, `${head}.${body}`)}`;
}

/**
 * The practice API's verifier. The vulnerable version trusts the token's own "alg" (and so accepts "none");
 * the fixed one only accepts HS256 with the server's key.
 */
export async function verifyJwt(token: string, secret: string, fixed: boolean): Promise<{ ok: boolean; payload?: any; reason?: string }> {
  let parts;
  try {
    parts = decodeJwt(token);
  } catch (e: any) {
    return { ok: false, reason: e.message || 'Malformed token.' };
  }
  const [h, p] = token.trim().split('.');
  const alg = String(parts.header?.alg || '');
  if (!fixed && alg.toLowerCase() === 'none') return { ok: true, payload: parts.payload };
  if (alg !== 'HS256') return { ok: false, reason: `Algorithm ${alg || '(missing)'} is not accepted.` };
  const expected = await hmac(secret, `${h}.${p}`);
  return expected === parts.signature ? { ok: true, payload: parts.payload } : { ok: false, reason: 'Signature does not match.' };
}
