// Phase 5: the one authoritative student profile service.
//
// Every profile read and write in the application goes through here. Writes are:
//   validate -> persist to the authoritative store -> update the in-process records other modules
//   read -> bump profile_version (clients use it to invalidate caches) -> publish an event.
// Success is returned only after the store confirmed the write.
import { db } from '../../db/database';
import { config } from '../../core/config';
import { NotFoundError, ValidationError, ConflictError } from '../../core/exceptions';
import { logger } from '../../core/logging';
import { EventBus } from '../../events/eventBus';
import { applyCanonicalProfile, readCanonicalProfile, getMeta } from './profileCache';
import { getProfilePersistence, StudentAccountRow } from './persistence';
import { computeCompletion, ProfileCompletionReport } from './completion';
import { buildModuleContext } from './moduleContext';
import {
  validateAcademic,
  validateCareer,
  validateExperience,
  validateIdentity,
  validateLearning,
  validateSkills,
} from './validation';
import {
  CanonicalProfile,
  ONBOARDING_STEP_SECTIONS,
  PROFILE_MODULES,
  ProfileModule,
  ProfileSectionKey,
} from './types';

const locks = new Map<string, Promise<unknown>>();

/** Serialises writes per student so concurrent requests cannot interleave read-modify-write. */
async function withStudentLock<T>(studentId: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(studentId) || Promise.resolve();
  let release!: () => void;
  const mine = new Promise<void>((r) => (release = r));
  const chained = prev.then(() => mine);
  locks.set(studentId, chained);
  await prev.catch(() => undefined);
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(studentId) === chained) locks.delete(studentId);
  }
}

export function requireVerifiedEmail(): boolean {
  if (process.env.REQUIRE_EMAIL_VERIFICATION) return process.env.REQUIRE_EMAIL_VERIFICATION === 'true';
  return config.authProvider === 'firebase';
}

function accountRow(studentId: string): StudentAccountRow {
  const s = (db as any).students.get(studentId);
  if (!s) throw new NotFoundError('Student account not found');
  return {
    id: s.id,
    firebase_uid: s.firebase_uid || null,
    email: s.email,
    auth_provider: s.auth_provider || 'legacy',
    email_verified: Boolean(s.email_verified),
    role: s.role,
    account_status: s.status || (s.is_active ? 'ACTIVE' : 'SUSPENDED'),
    created_at: s.created_at,
  };
}

export interface ProfileResponse {
  profile: CanonicalProfile;
  completion: ProfileCompletionReport;
}

export class StudentProfileService {
  /** Loads from Postgres into the in-process records when this instance has not seen the student yet. */
  static async hydrate(studentId: string): Promise<void> {
    const store = await getProfilePersistence();
    if (store.name !== 'supabase' || getMeta(studentId)) return;
    const loaded = await store.load(studentId);
    if (loaded && (db as any).students.get(studentId)) applyCanonicalProfile(studentId, loaded.profile);
  }

  static async getProfile(studentId: string): Promise<ProfileResponse> {
    await this.hydrate(studentId);
    const profile = readCanonicalProfile(studentId);
    if (!profile) throw new NotFoundError('Student profile not found');
    return { profile, completion: computeCompletion(profile, { requireVerifiedEmail: requireVerifiedEmail() }) };
  }

  static async getSection(studentId: string, section: ProfileSectionKey | 'account') {
    const { profile } = await this.getProfile(studentId);
    return profile[section];
  }

  static async getCompletion(studentId: string): Promise<ProfileCompletionReport> {
    return (await this.getProfile(studentId)).completion;
  }

  /**
   * Commits a candidate profile. Supabase: Postgres first, then the in-process records. Snapshot:
   * the records are the store, so they are written, flushed, and rolled back if the flush fails.
   */
  static async commit(studentId: string, previous: CanonicalProfile, next: CanonicalProfile, reason: string): Promise<CanonicalProfile> {
    const now = new Date().toISOString();
    next.account = {
      ...next.account,
      profile_version: previous.account.profile_version + 1,
      last_profile_update: now,
      onboarding: { ...next.account.onboarding, last_saved_at: now },
    };
    const store = await getProfilePersistence();
    const account = accountRow(studentId);
    if (store.name === 'supabase') {
      await store.commit(account, next, previous.account.profile_version);
      applyCanonicalProfile(studentId, next);
    } else {
      applyCanonicalProfile(studentId, next);
      try {
        await store.commit(account, next, previous.account.profile_version);
      } catch (err) {
        applyCanonicalProfile(studentId, previous);
        throw err;
      }
    }
    try {
      await EventBus.getInstance().publish(
        'STUDENT_PROFILE_UPDATED',
        { studentId, reason, profileVersion: next.account.profile_version },
        { student_id: studentId, source: 'StudentProfileService' }
      );
    } catch (err) {
      logger.warn(`Profile event publish failed: ${err}`);
    }
    return next;
  }

  /** Validates and saves one section. `strict` applies the onboarding-required rules of that step. */
  static async updateSection(
    studentId: string,
    section: ProfileSectionKey,
    input: unknown,
    opts: { strict?: boolean; expectedVersion?: number } = {}
  ): Promise<ProfileResponse> {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new ValidationError('Request body must be an object');
    return withStudentLock(studentId, async () => {
      await this.hydrate(studentId);
      const current = readCanonicalProfile(studentId);
      if (!current) throw new NotFoundError('Student profile not found');
      if (opts.expectedVersion !== undefined && opts.expectedVersion !== current.account.profile_version) {
        throw new ConflictError('Your profile was changed in another tab or device. Reload to see the latest version.');
      }
      const next = structuredClone(current);
      const body = input as Record<string, any>;
      switch (section) {
        case 'identity':
          next.identity = validateIdentity(body, current.identity);
          break;
        case 'academic':
          next.academic = validateAcademic(body, current.academic, Boolean(opts.strict));
          break;
        case 'skills':
          next.skills = validateSkills(body, current.skills);
          break;
        case 'experience':
          next.experience = validateExperience(body, current.experience);
          break;
        case 'career':
          next.career = validateCareer(body, current.career, Boolean(opts.strict));
          break;
        case 'learning':
          next.learning = validateLearning(body, current.learning, Boolean(opts.strict));
          break;
        default:
          throw new ValidationError(`Unknown profile section '${section}'`);
      }
      const saved = await this.commit(studentId, current, next, `section:${section}`);
      return { profile: saved, completion: computeCompletion(saved, { requireVerifiedEmail: requireVerifiedEmail() }) };
    });
  }

  /**
   * Saves one onboarding step. Data is validated with the step's required rules unless the step is
   * skipped (only optional steps 3 and 4 can be skipped). Progress is saved with the data so a
   * student who leaves can resume exactly where they stopped.
   */
  static async saveOnboardingStep(
    studentId: string,
    step: number,
    data: unknown,
    opts: { skip?: boolean } = {}
  ): Promise<ProfileResponse> {
    if (!Number.isInteger(step) || step < 1 || step > 7) throw new ValidationError('step must be 1-7');
    const section = ONBOARDING_STEP_SECTIONS[step];
    if (opts.skip && step !== 3 && step !== 4) throw new ValidationError(`Step ${step} cannot be skipped`);
    return withStudentLock(studentId, async () => {
      await this.hydrate(studentId);
      const current = readCanonicalProfile(studentId);
      if (!current) throw new NotFoundError('Student profile not found');
      const next = structuredClone(current);
      if (!opts.skip && section !== 'review') {
        const body = (data && typeof data === 'object' ? data : {}) as Record<string, any>;
        switch (section) {
          case 'identity': {
            next.identity = validateIdentity(body, current.identity);
            if (!next.identity.terms_accepted_at || !next.identity.privacy_accepted_at) {
              throw new ValidationError('accept_terms: the terms and privacy policy must be accepted to continue');
            }
            break;
          }
          case 'academic':
            next.academic = validateAcademic(body, current.academic, true);
            break;
          case 'skills':
            next.skills = validateSkills(body.skills !== undefined ? { skills: body.skills } : { skills: current.skills.skills }, current.skills);
            if ('learning_interests' in body) next.learning = validateLearning({ learning_interests: body.learning_interests }, current.learning, false);
            break;
          case 'experience':
            next.experience = validateExperience(body, current.experience);
            break;
          case 'career':
            next.career = validateCareer(body, current.career, true);
            break;
          case 'learning':
            next.learning = validateLearning(body, current.learning, true);
            break;
        }
      }
      const o = next.account.onboarding;
      o.completed_steps = Array.from(new Set([...o.completed_steps.filter((x) => x !== step), ...(opts.skip ? [] : [step])])).sort();
      o.skipped_steps = Array.from(new Set([...o.skipped_steps.filter((x) => x !== step), ...(opts.skip ? [step] : [])])).sort();
      if (!o.completed) o.current_step = Math.min(7, Math.max(o.current_step, step + 1));
      const saved = await this.commit(studentId, current, next, `onboarding:step${step}${opts.skip ? ':skip' : ''}`);
      return { profile: saved, completion: computeCompletion(saved, { requireVerifiedEmail: requireVerifiedEmail() }) };
    });
  }

  /** Records completion with the real timestamp, only when the required sections are filled. */
  static async completeOnboarding(studentId: string): Promise<ProfileResponse> {
    const result = await withStudentLock(studentId, async () => {
      await this.hydrate(studentId);
      const current = readCanonicalProfile(studentId);
      if (!current) throw new NotFoundError('Student profile not found');
      if (current.account.onboarding.completed) {
        return { profile: current, completion: computeCompletion(current, { requireVerifiedEmail: requireVerifiedEmail() }), already: true };
      }
      const completion = computeCompletion(current, { requireVerifiedEmail: requireVerifiedEmail() });
      if (!completion.onboarding_ready) {
        const missing = completion.sections
          .flatMap((s) => s.items.filter((i) => i.required && !i.done).map((i) => `${s.label}: ${i.label}`));
        const err = new ValidationError(`Complete the required fields first: ${missing.join('; ')}`);
        (err as any).details = { missing };
        throw err;
      }
      const next = structuredClone(current);
      const now = new Date().toISOString();
      next.account.onboarding = {
        ...next.account.onboarding,
        completed: true,
        completed_at: now,
        current_step: 7,
        completed_steps: Array.from(new Set([...next.account.onboarding.completed_steps, 7])).sort(),
      };
      const saved = await this.commit(studentId, current, next, 'onboarding:complete');
      return { profile: saved, completion: computeCompletion(saved, { requireVerifiedEmail: requireVerifiedEmail() }), already: false };
    });
    if (!(result as any).already) {
      // Keep the earlier onboarding status record (read by older screens) consistent, without the
      // side effects of the old completion routine (it overwrote notification choices).
      try {
        const { OnboardingService } = await import('../onboardingService');
        const status = await OnboardingService.getOnboardingStatus(studentId);
        status.is_complete = true;
        status.completed_at = result.profile.account.onboarding.completed_at;
        status.last_saved_at = result.profile.account.onboarding.completed_at || status.last_saved_at;
        await EventBus.getInstance().publish(
          'ONBOARDING_COMPLETED',
          { studentId, completedAt: status.completed_at },
          { student_id: studentId, source: 'StudentProfileService' }
        );
      } catch (err) {
        logger.warn(`Legacy onboarding status sync failed: ${err}`);
      }
    }
    return { profile: result.profile, completion: result.completion };
  }

  static async getModuleContext(studentId: string, module: string): Promise<Record<string, unknown>> {
    if (!(PROFILE_MODULES as readonly string[]).includes(module)) throw new ValidationError(`Unknown module '${module}'`);
    const { profile } = await this.getProfile(studentId);
    const ctx = buildModuleContext(profile, module as ProfileModule);
    if (module === 'community') {
      const privacy = await db.getStudentPrivacy(studentId);
      if (privacy.profile_visibility === 'PRIVATE') return { shared: false };
      return { shared: true, ...ctx };
    }
    return { profile_version: profile.account.profile_version, ...ctx };
  }

  /** Synchronous read for code paths that cannot await (uses the in-process records only). */
  static getProfileSync(studentId: string): CanonicalProfile | null {
    return readCanonicalProfile(studentId);
  }

  static moduleContextSync(studentId: string, module: ProfileModule): Record<string, any> | null {
    const p = readCanonicalProfile(studentId);
    return p ? buildModuleContext(p, module) : null;
  }
}
