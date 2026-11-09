// Phase 5: registration, central student profile, Firebase session bootstrap, isolation,
// propagation and failure handling. Synthetic students only (Student A and Student B).
//
// Firebase is exercised with a test verifier (setFirebaseTokenVerifier): tokens are synthetic
// RS256-shaped strings mapped to fake Firebase users. This proves the backend logic; it is not a
// live Firebase integration test (no Firebase web API key is configured in this repository).
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { startTestApi, type TestApi } from './helpers/httpApp';
import { setFirebaseTokenVerifier, FirebaseUnavailableError, type VerifiedFirebaseUser } from '../../server/auth/firebaseAdmin';
import { setProfilePersistence, ProfileStoreUnavailableError, type ProfilePersistence } from '../../server/services/studentProfile/persistence';
import { StudentProfileService } from '../../server/services/studentProfile/studentProfileService';
import { db } from '../../server/db/database';
import { redactSecrets } from '../../server/ai/provider';
import { migrateSnapshotToSupabase } from '../../scripts/migrate/snapshot-to-supabase';

const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;

/** Builds a synthetic RS256-shaped token; the payload is ignored by the test verifier. */
function fakeIdToken(uid: string): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${b64({ alg: 'RS256', kid: 'test' })}.${b64({ sub: uid })}.c2lnbmF0dXJl`;
}

const firebaseUsers = new Map<string, VerifiedFirebaseUser>();
let firebaseDown = false;
function useFakeFirebase() {
  setFirebaseTokenVerifier(async (token) => {
    if (firebaseDown) throw new FirebaseUnavailableError();
    const uid = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).sub;
    const u = firebaseUsers.get(uid);
    if (!u) throw Object.assign(new Error('invalid'), { statusCode: 401 });
    return u;
  });
}
function firebaseUser(label: string, verified = true, email?: string): { token: string; user: VerifiedFirebaseUser } {
  const uid = `fbuid_${label}_${uniq()}`;
  const user: VerifiedFirebaseUser = {
    uid,
    email: email || `p5.${label}.${uniq()}@example.test`,
    email_verified: verified,
    name: null,
    phone_number: null,
    sign_in_provider: 'password',
  };
  firebaseUsers.set(uid, user);
  return { token: fakeIdToken(uid), user };
}

// Complete, valid step payloads for a synthetic student.
const STEP_DATA_A: Record<number, any> = {
  1: { full_name: 'Phase Five Student A', accept_terms: true, accept_privacy: true },
  2: {
    college: 'Synthetic Institute of Technology',
    degree: 'B.Tech',
    branch: 'Computer Science and Engineering',
    academic_year: 3,
    current_semester: 5,
    expected_graduation_year: new Date().getFullYear() + 2,
    subjects: ['Operating Systems', 'Database Management Systems', 'Computer Networks'],
  },
  3: { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }, { name: 'SQL', category: 'DATABASE', proficiency: 'BEGINNER' }] },
  4: { projects: [{ title: 'Student A Library Tracker', description: 'A small CRUD app', technologies: ['Python', 'SQLite'] }] },
  5: { target_roles: ['Backend Developer'], competitive_exams: ['GATE'], gate_paper: 'CS' },
  6: { preferred_languages: ['English'], explanation_style: 'STANDARD', weekly_study_hours: 12 },
};

async function completeRegistration(api: TestApi, token: string, data = STEP_DATA_A) {
  for (let step = 1; step <= 6; step++) {
    const r = await api.call('PUT', `/profile/me/onboarding/steps/${step}`, token, { data: data[step] });
    expect(r.status, `step ${step}: ${JSON.stringify(r.body)}`).toBe(200);
  }
  const done = await api.call('POST', '/profile/me/onboarding/complete', token, {});
  expect(done.status, JSON.stringify(done.body)).toBe(200);
  return done.body.data;
}

describe('Phase 5: registration and central student profile', () => {
  let api: TestApi;
  let A: { token: string; id: string; email: string };
  let B: { token: string; id: string; email: string };

  beforeAll(async () => {
    api = await startTestApi();
    const reg = async (label: string) => {
      const email = `p5.${label}.${uniq()}@example.test`;
      const r = await api.call('POST', '/auth/register', undefined, {
        email,
        password: 'Phase5Pass1',
        confirm_password: 'Phase5Pass1',
        name: `Phase Five Student ${label}`,
        accept_terms: true,
        accept_privacy: true,
      });
      expect(r.status, JSON.stringify(r.body)).toBe(201);
      return { token: r.body.data.token, id: r.body.data.student.id, email };
    };
    A = await reg('A');
    B = await reg('B');
  });

  afterAll(async () => {
    setFirebaseTokenVerifier(null);
    await api.close();
  });

  afterEach(() => {
    setProfilePersistence(null);
    firebaseDown = false;
  });

  describe('Test 1: legacy registration validation', () => {
    it('rejects an invalid email, a weak password, a mismatched confirmation and a duplicate email', async () => {
      const bad = (body: any) => api.call('POST', '/auth/register', undefined, { name: 'Valid Name', ...body });
      expect((await bad({ email: 'not-an-email', password: 'Phase5Pass1' })).status).toBe(400);
      expect((await bad({ email: `p5.weak.${uniq()}@example.test`, password: 'short' })).status).toBe(400);
      expect((await bad({ email: `p5.weak.${uniq()}@example.test`, password: 'onlyletters' })).status).toBe(400);
      expect((await bad({ email: `p5.mm.${uniq()}@example.test`, password: 'Phase5Pass1', confirm_password: 'Phase5Pass2' })).status).toBe(400);
      const dup = await bad({ email: A.email.toUpperCase(), password: 'Phase5Pass1' });
      expect(dup.status).toBe(409);
    });

    it('does not invent academic data for a new account', async () => {
      const r = await api.call('GET', '/profile/me', B.token);
      expect(r.status).toBe(200);
      const p = r.body.data.profile;
      expect(p.academic.branch === null || p.academic.branch === '').toBe(true);
      expect(p.academic.current_semester).toBeNull();
      expect(p.skills.skills).toEqual([]);
      expect(r.body.data.completion.overall_percentage).toBeLessThan(40);
    });
  });

  describe('Test 2: seven-step registration, resume and completion', () => {
    it('saves each step, resumes from the server-side step and only completes when required data exists', async () => {
      // Completing too early is refused.
      const early = await api.call('POST', '/profile/me/onboarding/complete', A.token, {});
      expect(early.status).toBe(400);

      // Step 1 and 2, then "leave".
      expect((await api.call('PUT', '/profile/me/onboarding/steps/1', A.token, { data: STEP_DATA_A[1] })).status).toBe(200);
      expect((await api.call('PUT', '/profile/me/onboarding/steps/2', A.token, { data: STEP_DATA_A[2] })).status).toBe(200);
      const resume = await api.call('GET', '/profile/me/onboarding', A.token);
      expect(resume.status).toBe(200);
      expect(resume.body.data.current_step ?? resume.body.data.onboarding?.current_step).toBe(3);

      // Required steps cannot be skipped; optional ones (3, 4) can.
      expect((await api.call('PUT', '/profile/me/onboarding/steps/5', A.token, { skip: true })).status).toBe(400);
      expect((await api.call('PUT', '/profile/me/onboarding/steps/4', A.token, { skip: true })).status).toBe(200);

      const done = await completeRegistration(api, A.token);
      expect(done.profile.account.onboarding.completed).toBe(true);
      expect(done.profile.academic.current_semester).toBe(5);
      expect(done.profile.experience.projects).toHaveLength(1);
    });

    it('rejects inconsistent academic data with per-field details', async () => {
      const r = await api.call('PATCH', '/profile/me/academic', B.token, { current_semester: 7, academic_year: 2 });
      expect(r.status).toBe(400);
      expect(r.body.error.details.current_semester).toMatch(/does not belong/);
      const cg = await api.call('PATCH', '/profile/me/academic', B.token, { cgpa_scale: 4, cgpa: 8.5 });
      expect(cg.status).toBe(400);
      expect(cg.body.error.details.cgpa).toBeDefined();
    });

    it('requires an explicit proficiency for every skill (no default level)', async () => {
      const r = await api.call('PUT', '/profile/me/skills', B.token, { skills: [{ name: 'Java', category: 'PROGRAMMING_LANGUAGE' }] });
      expect(r.status).toBe(400);
      expect(JSON.stringify(r.body.error.details)).toMatch(/proficiency/);
    });

    it('only accepts a GATE paper when GATE is a chosen exam', async () => {
      const r = await api.call('PATCH', '/profile/me/career', B.token, { target_roles: ['Data Analyst'], gate_paper: 'CS' });
      expect(r.status).toBe(400);
    });
  });

  describe('Test 3: protected fields and student isolation', () => {
    it('rejects attempts to set server-managed or identity-provider fields', async () => {
      for (const body of [{ firebase_uid: 'evil' }, { role: 'ADMIN' }, { email: 'x@example.test' }, { student_id: B.id }, { email_verified: true }]) {
        const r = await api.call('PATCH', '/profile/me/identity', A.token, body);
        expect(r.status, JSON.stringify(body)).toBe(400);
      }
      const acct = await api.call('PATCH', '/profile/me/account', A.token, { profile_version: 999 });
      expect([400, 404]).toContain(acct.status);
      const raw = (db as any).students.get(A.id);
      expect(raw.role).toBe('STUDENT');
    });

    it('never returns or changes another student\'s profile', async () => {
      const a = await api.call('GET', '/profile/me', A.token);
      const b = await api.call('GET', '/profile/me', B.token);
      expect(a.body.data.profile.account.student_id ?? A.id).not.toBe(B.id);
      expect(JSON.stringify(b.body.data)).not.toContain('Student A Library Tracker');
      expect(JSON.stringify(b.body.data)).not.toContain(A.email);

      // B edits their own academic section; A's stays as it was.
      const r = await api.call('PATCH', '/profile/me/academic', B.token, { college: 'Synthetic College B' });
      expect(r.status).toBe(200);
      const a2 = await api.call('GET', '/profile/me', A.token);
      expect(a2.body.data.profile.academic.college).toBe('Synthetic Institute of Technology');
    });

    it('keeps notes and goals private to their owner', async () => {
      const note = await api.call('POST', '/notes', A.token, { title: 'A private OS note', content: 'Paging and segmentation' });
      expect([200, 201]).toContain(note.status);
      const noteId = note.body.data?.id || note.body.data?.note?.id;
      expect(noteId).toBeTruthy();
      const bRead = await api.call('GET', `/notes/${noteId}`, B.token);
      expect(bRead.status).not.toBe(200);
      const bList = await api.call('GET', '/notes', B.token);
      expect(JSON.stringify(bList.body)).not.toContain('A private OS note');

      const goal = await api.call('POST', '/goals', A.token, { title: 'A private goal', category: 'ACADEMIC' });
      expect([200, 201]).toContain(goal.status);
      const goalId = goal.body.data?.id;
      const bGoal = await api.call('GET', `/goals/${goalId}`, B.token);
      expect(bGoal.status).not.toBe(200);
      const bDel = await api.call('DELETE', `/goals/${goalId}`, B.token);
      expect(bDel.status).not.toBe(200);
      const aGoal = await api.call('GET', `/goals/${goalId}`, A.token);
      expect(aGoal.status).toBe(200);
    });

    it('requires authentication for every profile endpoint', async () => {
      for (const path of ['/profile/me', '/profile/me/completion', '/profile/me/academic', '/profile/me/context/tutor', '/profile/me/onboarding']) {
        expect((await api.call('GET', path)).status, path).toBe(401);
      }
    });
  });

  describe('Test 4: dynamic completion', () => {
    it('reflects real data and changes when data is removed', async () => {
      const before = (await api.call('GET', '/profile/me/completion', A.token)).body.data;
      expect(before.overall_percentage).toBeGreaterThan(50);
      const r = await api.call('PUT', '/profile/me/skills', A.token, { skills: [] });
      expect(r.status).toBe(200);
      const after = (await api.call('GET', '/profile/me/completion', A.token)).body.data;
      expect(after.overall_percentage).toBeLessThan(before.overall_percentage);
      // Restore.
      await api.call('PUT', '/profile/me/skills', A.token, STEP_DATA_A[3]);
      const legacy = await api.call('GET', '/profile/completion', A.token);
      if (legacy.status === 200) expect(legacy.body.data.total_percentage).toBe(before.overall_percentage);
    });
  });

  describe('Test 5: update propagation', () => {
    it('a semester change reaches the dashboard, semester centre, tutor context and recommendations', async () => {
      const r = await api.call('PATCH', '/profile/me/academic', A.token, { current_semester: 6, academic_year: 3, subjects: ['Compiler Design', 'Machine Learning'] });
      expect(r.status, JSON.stringify(r.body)).toBe(200);

      const dash = await api.call('GET', '/dashboard', A.token);
      expect(dash.status).toBe(200);
      expect(dash.body.data.student_profile.semester).toBe(6);

      const sem = await api.call('GET', '/semester/overview', A.token);
      if (sem.status === 200) expect(sem.body.data.academic_context.semester).toBe(6);

      const tutor = await api.call('GET', '/profile/me/context/tutor', A.token);
      expect(tutor.body.data.semester).toBe(6);
      expect(tutor.body.data.subjects).toContain('Compiler Design');
      // Minimised for AI use: no name, email or institution in the tutor context.
      const t = JSON.stringify(tutor.body.data);
      expect(t).not.toContain(A.email);
      expect(t).not.toContain('Synthetic Institute of Technology');
      expect(t).not.toContain('Phase Five Student A');

      expect(StudentProfileService.moduleContextSync(A.id, 'tutor')).toMatchObject({ semester: 6 });

      const recs = await api.call('GET', '/profile/me/recommendations/courses', A.token);
      expect(recs.status).toBe(200);
      expect(recs.body.data.module).toBe('courses');
    });

    it('detects a stale edit from another tab with If-Match', async () => {
      const cur = await api.call('GET', '/profile/me', A.token);
      const version = cur.body.data.profile.account.profile_version;
      const send = (v: number, college: string) =>
        fetch(api.base + '/profile/me/academic', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${A.token}`, 'If-Match': `"${v}"` },
          body: JSON.stringify({ college }),
        });
      expect((await send(version, 'Synthetic Institute of Technology')).status).toBe(200);
      expect((await send(version, 'Stale College')).status).toBe(409);
    });
  });

  describe('Test 6: Firebase session bootstrap', () => {
    beforeAll(() => useFakeFirebase());

    it('creates exactly one student for parallel first sign-ins and is idempotent afterwards', async () => {
      const { token, user } = firebaseUser('C');
      const body = { full_name: 'Phase Five Student C', accept_terms: true, accept_privacy: true };
      const [r1, r2] = await Promise.all([
        api.call('POST', '/auth/firebase/session', token, body),
        api.call('POST', '/auth/firebase/session', token, body),
      ]);
      expect([200, 201]).toContain(r1.status);
      expect([200, 201]).toContain(r2.status);
      expect(r1.body.data.student.id).toBe(r2.body.data.student.id);
      const again = await api.call('POST', '/auth/firebase/session', token, body);
      expect(again.status).toBe(200);
      expect(again.body.data.created).toBe(false);
      const matches = Array.from(((db as any).students as Map<string, any>).values()).filter((s) => s.firebase_uid === user.uid);
      expect(matches).toHaveLength(1);
      expect(matches[0].password_hash).toBe('');

      // The Firebase token now authenticates the profile API.
      const me = await api.call('GET', '/profile/me', token);
      expect(me.status).toBe(200);
      expect(me.body.data.profile.identity.full_name).toBe('Phase Five Student C');
    });

    it('a Firebase token for an unprovisioned user cannot reach student APIs', async () => {
      const { token } = firebaseUser('D');
      expect((await api.call('GET', '/profile/me', token)).status).toBe(401);
    });

    it('links an existing password account only when the Firebase email is verified', async () => {
      const unverified = firebaseUser('Bunverified', false, B.email);
      const r = await api.call('POST', '/auth/firebase/session', unverified.token, {});
      expect(r.status).toBe(409);
      expect(r.body.error.code).toBe('ACCOUNT_LINK_REQUIRES_VERIFIED_EMAIL');
      expect((db as any).students.get(B.id).firebase_uid).toBeFalsy();

      const verified = firebaseUser('Bverified', true, B.email);
      const ok = await api.call('POST', '/auth/firebase/session', verified.token, {});
      expect(ok.status).toBe(200);
      expect(ok.body.data.linked).toBe(true);
      expect(ok.body.data.student.id).toBe(B.id);
      // B's data survived the link; the old password no longer works.
      expect(ok.body.data.profile.academic.college).toBe('Synthetic College B');
      const login = await api.call('POST', '/auth/login', undefined, { email: B.email, password: 'Phase5Pass1' });
      expect(login.status).toBe(401);
      // A second Firebase identity cannot take over the linked account.
      const other = firebaseUser('Bother', true, B.email);
      expect((await api.call('POST', '/auth/firebase/session', other.token, {})).status).toBe(409);
    });

    it('requires a name and consent for a new Firebase student', async () => {
      const { token } = firebaseUser('E');
      expect((await api.call('POST', '/auth/firebase/session', token, { accept_terms: true })).status).toBe(400);
      const noConsent = await api.call('POST', '/auth/firebase/session', token, { full_name: 'Phase Five Student E', accept_terms: false });
      expect(noConsent.status).toBe(400);
    });

    it('reports Firebase being unavailable as 503 without creating anything', async () => {
      const { token, user } = firebaseUser('F');
      firebaseDown = true;
      const r = await api.call('POST', '/auth/firebase/session', token, { full_name: 'Phase Five Student F', accept_terms: true, accept_privacy: true });
      expect(r.status).toBe(503);
      expect(r.body.error.code).toBe('FIREBASE_UNAVAILABLE');
      const matches = Array.from(((db as any).students as Map<string, any>).values()).filter((s) => s.firebase_uid === user.uid);
      expect(matches).toHaveLength(0);
    });
  });

  describe('Test 7: storage failure never reports success', () => {
    it('rolls back a section update when the store fails', async () => {
      const failing: ProfilePersistence = {
        name: 'snapshot',
        commit: async () => {
          throw new ProfileStoreUnavailableError();
        },
        load: async () => null,
        findIdByFirebaseUid: async () => null,
        findIdByEmail: async () => null,
      };
      const before = (await api.call('GET', '/profile/me', A.token)).body.data.profile;
      setProfilePersistence(failing);
      const r = await api.call('PATCH', '/profile/me/academic', A.token, { college: 'Should Not Persist College' });
      expect(r.status).toBe(503);
      expect(r.body.success).toBe(false);
      expect(r.body.error.code).toBe('PROFILE_STORE_UNAVAILABLE');
      setProfilePersistence(null);
      const after = (await api.call('GET', '/profile/me', A.token)).body.data.profile;
      expect(after.academic.college).toBe(before.academic.college);
      expect(after.account.profile_version).toBe(before.account.profile_version);
    });

    it('does not mark a registration step as saved when the store fails', async () => {
      const failing: ProfilePersistence = {
        name: 'snapshot',
        commit: async () => {
          throw new ProfileStoreUnavailableError();
        },
        load: async () => null,
        findIdByFirebaseUid: async () => null,
        findIdByEmail: async () => null,
      };
      const before = (await api.call('GET', '/profile/me/onboarding', B.token)).body.data;
      setProfilePersistence(failing);
      const r = await api.call('PUT', '/profile/me/onboarding/steps/6', B.token, { data: STEP_DATA_A[6] });
      expect(r.status).toBe(503);
      setProfilePersistence(null);
      const after = (await api.call('GET', '/profile/me/onboarding', B.token)).body.data;
      expect(after).toEqual(before);
    });
  });

  describe('Test 8: AI safety', () => {
    it('redacts API keys from provider error text', () => {
      const leaked = 'request failed https://generativelanguage.googleapis.com/v1/models?key=AIzaSyA1234567890abcdefghijklmnop x-goog-api-key: AIzaSyB0987654321abcdefghijklmnop';
      const out = redactSecrets(leaked);
      expect(out).not.toMatch(/AIza[0-9A-Za-z_-]{20,}/);
      expect(out).toContain('[redacted');
    });

    it('module contexts for AI never include contact details or grades', async () => {
      // (The resume module context deliberately carries contact details: a resume needs them.)
      for (const mod of ['tutor', 'agent', 'notes', 'quiz', 'coding', 'career']) {
        const r = await api.call('GET', `/profile/me/context/${mod}`, A.token);
        if (r.status !== 200) continue;
        const s = JSON.stringify(r.body.data);
        expect(s, mod).not.toContain(A.email);
        expect(s, mod).not.toMatch(/"phone"|"cgpa"|"firebase_uid"|password/);
      }
    });
  });
  describe('Test 9: snapshot to Supabase migration pre-flight', () => {
    it('reports duplicate emails instead of migrating them, and writes nothing in a dry run', async () => {
      const students = (db as any).students as Map<string, any>;
      const original = students.get(A.id);
      const dupId = `std_p5dup_${uniq()}`;
      students.set(dupId, { ...original, id: dupId, email: original.email.toUpperCase(), firebase_uid: undefined });
      try {
        const report = await migrateSnapshotToSupabase({ apply: false, includeDemo: false });
        expect(report.migrated).toBe(0);
        const flagged = report.problems.filter((p) => p.student_id === A.id || p.student_id === dupId);
        expect(flagged).toHaveLength(2);
        expect(flagged[0].problem).toMatch(/duplicate email/);
        expect(JSON.stringify(report)).not.toContain(original.email);
        expect(report.eligible).toBeGreaterThan(0);
      } finally {
        students.delete(dupId);
      }
    });
  });
});
