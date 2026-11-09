// Phase 5: where the canonical profile is made durable.
//
// snapshot  - the existing JSON snapshot (default; nothing to configure).
// supabase  - Supabase Postgres through a server-only connection (SUPABASE_DB_URL). Writes are one
//             transaction per change; see supabaseProfileStore.ts and supabase/migrations/.
import { AppError } from '../../core/exceptions';
import { config } from '../../core/config';
import { saveSnapshotStrict } from '../../db/persistence';
import { logger } from '../../core/logging';
import type { CanonicalProfile } from './types';

export interface StudentAccountRow {
  id: string;
  firebase_uid: string | null;
  email: string;
  auth_provider: 'legacy' | 'firebase';
  email_verified: boolean;
  role: string;
  account_status: string;
  created_at: string;
}

export class ProfileStoreUnavailableError extends AppError {
  constructor(message = 'Your profile could not be saved because the database is unavailable. Nothing was changed; please try again.') {
    super(message, 503, 'PROFILE_STORE_UNAVAILABLE');
  }
}

export interface ProfilePersistence {
  readonly name: 'snapshot' | 'supabase';
  /** Atomically persists the account row and the full profile. Throws ProfileStoreUnavailableError. */
  commit(account: StudentAccountRow, profile: CanonicalProfile, expectedPreviousVersion: number | null): Promise<void>;
  /** Loads a student by id from the authoritative store (supabase only; snapshot returns null). */
  load(studentId: string): Promise<{ account: StudentAccountRow; profile: CanonicalProfile } | null>;
  findIdByFirebaseUid(uid: string): Promise<string | null>;
  findIdByEmail(email: string): Promise<string | null>;
}

export class SnapshotProfilePersistence implements ProfilePersistence {
  public readonly name = 'snapshot' as const;
  async commit(): Promise<void> {
    try {
      saveSnapshotStrict();
    } catch (err: any) {
      logger.error(`Profile snapshot write failed: ${err?.code || err?.message || 'unknown'}`);
      throw new ProfileStoreUnavailableError();
    }
  }
  async load() {
    return null;
  }
  async findIdByFirebaseUid() {
    return null;
  }
  async findIdByEmail() {
    return null;
  }
}

let active: ProfilePersistence | null = null;

export async function getProfilePersistence(): Promise<ProfilePersistence> {
  if (active) return active;
  if (config.profileStore === 'supabase') {
    const { SupabaseProfilePersistence } = await import('./supabaseProfileStore');
    active = new SupabaseProfilePersistence(config.supabaseDbUrl!);
  } else {
    active = new SnapshotProfilePersistence();
  }
  return active;
}

/** Test hook (failure injection, Postgres-backed tests). */
export function setProfilePersistence(p: ProfilePersistence | null): void {
  active = p;
}
