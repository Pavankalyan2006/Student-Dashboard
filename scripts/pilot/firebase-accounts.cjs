// Firebase test accounts for production end-to-end runs (no SDK; Node 18+ fetch only).
// Sign-up/sign-in use the public web API key. Marking the email verified and deleting the
// accounts afterwards use the Admin REST API with a service account read from
// FIREBASE_SERVICE_ACCOUNT_BASE64 (never logged). Synthetic emails only (@example.test).
const crypto = require('crypto');

const KEY = process.env.FIREBASE_WEB_API_KEY;
const IDT = 'https://identitytoolkit.googleapis.com/v1';

async function post(url, body, headers = {}) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j };
}

let adminToken = null;
function serviceAccount() {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return null;
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}
async function getAdminToken() {
  if (adminToken) return adminToken;
  const sa = serviceAccount();
  if (!sa) return null;
  const now = Math.floor(Date.now() / 1000);
  const enc = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/identitytoolkit https://www.googleapis.com/auth/cloud-platform', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(sa.private_key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${unsigned}.${sig}` });
  const j = await r.json();
  adminToken = j.access_token || null;
  return adminToken;
}

async function signUp(email, password) {
  return post(`${IDT}/accounts:signUp?key=${KEY}`, { email, password, returnSecureToken: true });
}
async function signIn(email, password) {
  return post(`${IDT}/accounts:signInWithPassword?key=${KEY}`, { email, password, returnSecureToken: true });
}
async function markVerified(localId) {
  const t = await getAdminToken();
  if (!t) return { status: 0, body: { error: 'no service account' } };
  const sa = serviceAccount();
  return post(`${IDT}/projects/${sa.project_id}/accounts:update`, { localId, emailVerified: true }, { authorization: `Bearer ${t}` });
}
async function deleteAccount(localId) {
  const t = await getAdminToken();
  if (!t) return { status: 0 };
  const sa = serviceAccount();
  return post(`${IDT}/projects/${sa.project_id}/accounts:delete`, { localId }, { authorization: `Bearer ${t}` });
}

module.exports = { enabled: Boolean(KEY), signUp, signIn, markVerified, deleteAccount };
