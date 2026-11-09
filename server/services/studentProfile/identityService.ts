// Phase 5: student account creation and identity mapping.
//
// Firebase mode: an account is created (or found) from a verified Firebase ID token. The Firebase
// uid is unique per student and is only ever taken from the verified token. The operation is
// idempotent: retrying after a failure (e.g. the database was down right after Firebase sign-up)
// returns the same student and never creates a duplicate.
//
// Legacy mode: the existing email/password provider, kept until the owner configures Firebase.
import crypto from 'crypto';
import { db } from '../../db/database';
import { Security } from '../../core/security';
import { ConflictError, ValidationError, AuthorizationError } from '../../core/exceptions';
import { logger } from '../../core/logging';
import type { Student, SafeStudent } from '../../models/types';
import type { VerifiedFirebaseUser } from '../../auth/firebaseAdmin';
import { getProfilePersistence, StudentAccountRow } from './persistence';
import { readCanonicalProfile, applyCanonicalProfile, ensureMeta } from './profileCache';
import { validateIdentity, cleanText } from './validation';
import { StudentProfileService } from './studentProfileService';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) throw new ValidationError('email: is required');
  const email = raw.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) throw new ValidationError('email: enter a valid email address');
  return email;
}

/** Same rule the registration form shows: 8+ characters with a letter and a number. */
export function checkPasswordStrength(password: unknown, email?: string): string {
  if (typeof password !== 'string' || !password) throw new ValidationError('password: is required');
  if (password.length < 8) throw new ValidationError('password: must be at least 8 characters');
  if (password.length > 128) throw new ValidationError('password: must be at most 128 characters');
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) throw new ValidationError('password: must contain a letter and a number');
  if (email && password.toLowerCase() === email.toLowerCase()) throw new ValidationError('password: must not be your email address');
  return password;
}

const inflight = new Map<string, Promise<{ student: SafeStudent; created: boolean; linked: boolean }>>();

function toAccountRow(s: Student): StudentAccountRow {
  return {
    id: s.id,
    firebase_uid: s.firebase_uid || null,
    email: s.email,
    auth_provider: s.auth_provider || 'legacy',
    email_verified: Boolean(s.email_verified),
    role: s.role,
    account_status: s.status || 'ACTIVE',
    created_at: s.created_at,
  };
}

async function persistNewAccount(student: Student): Promise<void> {
  const store = await getProfilePersistence();
  ensureMeta(student.id);
  const profile = readCanonicalProfile(student.id)!;
  try {
    await store.commit(toAccountRow(student), profile, null);
  } catch (err) {
    // Roll back the in-process record so nothing half-created is left behind; the client can retry.
    (db as any).students.delete(student.id);
    (db as any).studentProfiles?.delete?.(student.id);
    throw err;
  }
}

export class IdentityService {
  /**
   * Creates or returns the student for a verified Firebase user. `extra` may carry the name and
   * consent captured on the registration form; it never carries an id, uid or role.
   */
  static async bootstrapFirebaseStudent(
    user: VerifiedFirebaseUser,
    extra: { full_name?: unknown; accept_terms?: unknown; accept_privacy?: unknown; phone?: unknown } = {}
  ): Promise<{ student: SafeStudent; created: boolean; linked: boolean }> {
    const key = `uid:${user.uid}`;
    const running = inflight.get(key);
    if (running) return running;
    const task = this.bootstrapInner(user, extra).finally(() => inflight.delete(key));
    inflight.set(key, task);
    return task;
  }

  private static async bootstrapInner(
    user: VerifiedFirebaseUser,
    extra: { full_name?: unknown; accept_terms?: unknown; accept_privacy?: unknown; phone?: unknown }
  ) {
    await db.initialize();
    const store = await getProfilePersistence();
    const all: Student[] = Array.from((db as any).students.values());

    // 1. Already mapped to this uid.
    let student = all.find((s) => s.firebase_uid === user.uid);
    if (!student && store.name === 'supabase') {
      const id = await store.findIdByFirebaseUid(user.uid);
      if (id) {
        const loaded = await store.load(id);
        if (loaded) {
          student = this.materialise(loaded.account, loaded.profile.identity.full_name);
          applyCanonicalProfile(id, loaded.profile);
        }
      }
    }
    if (student) {
      if (user.email_verified && !student.email_verified) {
        student.email_verified = true;
        await StudentProfileService.commit(student.id, readCanonicalProfile(student.id)!, readCanonicalProfile(student.id)!, 'email_verified');
      }
      this.assertActive(student);
      return { student: db.toSafeStudent(student), created: false, linked: false };
    }

    if (!user.email) throw new ValidationError('Your sign-in account has no email address; email is required for registration.');
    const email = normalizeEmail(user.email);

    // 2. Existing account with the same email (e.g. created by the earlier email/password system).
    const sameEmail = all.find((s) => s.email.toLowerCase() === email);
    if (sameEmail) {
      if (sameEmail.firebase_uid && sameEmail.firebase_uid !== user.uid) {
        throw new ConflictError('An account with this email is already linked to a different sign-in.');
      }
      if (!user.email_verified) {
        const err = new ConflictError(
          'An account with this email already exists. Verify your email address (check your inbox), then sign in again to link it.'
        );
        (err as any).code = 'ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL';
        throw err;
      }
      this.assertActive(sameEmail);
      const before = readCanonicalProfile(sameEmail.id)!;
      const snapshot = { ...sameEmail };
      sameEmail.firebase_uid = user.uid;
      sameEmail.auth_provider = 'firebase';
      sameEmail.email_verified = true;
      sameEmail.password_hash = ''; // one credential only: Firebase now owns the password
      try {
        await StudentProfileService.commit(sameEmail.id, before, readCanonicalProfile(sameEmail.id)!, 'identity:link_firebase');
      } catch (err) {
        Object.assign(sameEmail, snapshot);
        throw err;
      }
      logger.info(`Linked existing student ${sameEmail.id} to Firebase identity`);
      return { student: db.toSafeStudent(sameEmail), created: false, linked: true };
    }

    // 3. New student.
    const now = new Date().toISOString();
    const errors: Record<string, string> = {};
    const name =
      cleanText(extra.full_name, 'full_name', errors, { min: 2, max: 100 }) ||
      cleanText(user.name, 'full_name', {}, { min: 2, max: 100 }) ||
      null;
    if (!name) throw new ValidationError('full_name: is required');
    const id = `std_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
    const created = (await db.createStudent({
      id,
      name,
      email,
      password_hash: '',
      branch: '',
      semester: 0,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
      onboarding_completed: false,
      auth_provider: 'firebase',
      firebase_uid: user.uid,
      email_verified: user.email_verified,
    } as any)) as SafeStudent;
    const record: Student = (db as any).students.get(created.id);
    try {
      const identity = validateIdentity(
        {
          full_name: name,
          ...(extra.phone ? { phone: extra.phone } : {}),
          ...(extra.accept_terms !== undefined ? { accept_terms: extra.accept_terms } : {}),
          ...(extra.accept_privacy !== undefined ? { accept_privacy: extra.accept_privacy } : {}),
        },
        readCanonicalProfile(id)!.identity
      );
      record.phone = identity.phone || undefined;
      record.terms_accepted_at = identity.terms_accepted_at || undefined;
      record.privacy_accepted_at = identity.privacy_accepted_at || undefined;
    } catch (err) {
      (db as any).students.delete(id);
      throw err;
    }
    record.created_at = now;
    await persistNewAccount(record);
    logger.info(`Created student ${id} for a new Firebase identity`);
    return { student: db.toSafeStudent(record), created: true, linked: false };
  }

  private static assertActive(s: Student) {
    if (s.status === 'SUSPENDED' || s.status === 'DISABLED' || s.is_active === false) {
      throw new AuthorizationError('This account is not active. Please contact support.');
    }
  }

  /** Recreates the in-process account record from Postgres (another instance created it). */
  private static materialise(account: StudentAccountRow, name: string): Student {
    const existing = (db as any).students.get(account.id);
    if (existing) return existing;
    const s: Student = {
      id: account.id,
      name,
      email: account.email,
      password_hash: '',
      branch: '',
      semester: 0,
      role: account.role as any,
      is_active: account.account_status === 'ACTIVE',
      status: account.account_status as any,
      auth_provider: account.auth_provider,
      firebase_uid: account.firebase_uid || undefined,
      email_verified: account.email_verified,
      created_at: account.created_at,
      updated_at: account.created_at,
    };
    (db as any).students.set(s.id, s);
    return s;
  }

  /** Legacy email/password registration (used only while Firebase is not configured). */
  static async registerLegacy(body: Record<string, any>): Promise<SafeStudent> {
    await db.initialize();
    const errors: Record<string, string> = {};
    const name = cleanText(body.name ?? body.full_name, 'full_name', errors, { min: 2, max: 100, required: true });
    if (errors.full_name) throw new ValidationError(`full_name: ${errors.full_name}`);
    const email = normalizeEmail(body.email);
    const password = checkPasswordStrength(body.password, email);
    if (body.confirm_password !== undefined && body.confirm_password !== password) {
      throw new ValidationError('confirm_password: passwords do not match');
    }
    if (await db.getStudentByEmail(email)) {
      throw new ConflictError('An account with this email address already exists. Please sign in instead.');
    }
    const passwordHash = await Security.hashPassword(password);
    const created = await db.createStudent({
      name: name!,
      display_name: typeof body.display_name === 'string' && body.display_name.trim() ? body.display_name.trim() : undefined,
      email,
      password_hash: passwordHash,
      branch: '',
      semester: 0,
      role: 'STUDENT',
      is_active: true,
      status: 'ACTIVE',
      onboarding_completed: false,
      auth_provider: 'legacy',
      email_verified: false,
    } as any);
    const record: Student = (db as any).students.get(created.id);
    if (body.accept_terms === true) record.terms_accepted_at = new Date().toISOString();
    if (body.accept_privacy === true) record.privacy_accepted_at = new Date().toISOString();
    if (typeof body.phone === 'string' && body.phone.trim()) {
      try {
        record.phone = validateIdentity({ phone: body.phone }, readCanonicalProfile(created.id)!.identity).phone || undefined;
      } catch (err) {
        (db as any).students.delete(created.id);
        throw err;
      }
    }
    await persistNewAccount(record);

    // Older clients send academic basics with the account; save them as entered (no defaults).
    const academic: Record<string, unknown> = {};
    if (body.degree) academic.degree = body.degree;
    if (body.branch) academic.branch = body.branch;
    if (body.institution) academic.college = body.institution;
    if (body.semester) {
      academic.current_semester = Number(body.semester);
      academic.academic_year = Math.ceil(Number(body.semester) / 2);
    }
    if (body.admission_year) academic.admission_year = Number(body.admission_year);
    if (Object.keys(academic).length) {
      try {
        await StudentProfileService.updateSection(created.id, 'academic', academic);
      } catch (err) {
        logger.warn(`Registration academic basics not saved: ${(err as any)?.message}`);
      }
    }
    if (body.target_role) {
      try {
        await StudentProfileService.updateSection(created.id, 'career', { target_roles: [String(body.target_role)] });
      } catch {}
    }
    return db.toSafeStudent(record);
  }
}

/** Finds the student mapped to a Firebase uid (in-process records, then Supabase if configured). */
export async function findStudentByFirebaseUid(uid: string): Promise<Student | null> {
  await db.initialize();
  for (const s of (db as any).students.values() as Iterable<Student>) {
    if (s.firebase_uid === uid) return s;
  }
  const store = await getProfilePersistence();
  if (store.name !== 'supabase') return null;
  const id = await store.findIdByFirebaseUid(uid);
  if (!id) return null;
  const loaded = await store.load(id);
  if (!loaded) return null;
  const existing = (db as any).students.get(id);
  if (!existing) {
    (db as any).students.set(id, {
      id,
      name: loaded.profile.identity.full_name,
      email: loaded.account.email,
      password_hash: '',
      branch: loaded.profile.academic.branch || '',
      semester: loaded.profile.academic.current_semester || 0,
      role: loaded.account.role,
      is_active: loaded.account.account_status === 'ACTIVE',
      status: loaded.account.account_status,
      auth_provider: loaded.account.auth_provider,
      firebase_uid: loaded.account.firebase_uid || undefined,
      email_verified: loaded.account.email_verified,
      created_at: loaded.account.created_at,
      updated_at: loaded.account.created_at,
    });
  }
  applyCanonicalProfile(id, loaded.profile);
  return (db as any).students.get(id);
}
