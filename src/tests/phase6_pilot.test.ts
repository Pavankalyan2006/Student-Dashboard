// Phase 6: defects found in Stage 1 synthetic pilot testing, and the private pilot feedback module.
// Synthetic students only.
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { startTestApi, type TestApi } from './helpers/httpApp';
import { corsDecision, isSameOrigin } from '../../server/core/corsPolicy';
import { resetAuthAttemptLimiter } from '../../server/api/routes/auth';
import { pilotFeedbackStores, FEEDBACK_CONSENT_VERSION, cleanFeedbackText } from '../../server/services/pilotFeedbackService';

const uniq = () => `${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
const consent = { consent: true, consent_version: FEEDBACK_CONSENT_VERSION };

describe('Phase 6: Stage 1 pilot defects and pilot feedback', () => {
  let api: TestApi;
  beforeAll(async () => {
    api = await startTestApi();
  });
  afterAll(async () => {
    await api.close();
  });
  afterEach(() => {
    delete process.env.PILOT_FEEDBACK_ENABLED;
    delete process.env.PILOT_FEEDBACK_RETENTION_DAYS;
  });

  describe('P6-001: a double-submitted registration creates one account', () => {
    it('answers 201 once and 409 for the concurrent duplicate, and the account signs in', async () => {
      const email = `p6.dup.${uniq()}@example.test`;
      const body = { email, password: 'Phase6Pass1', confirm_password: 'Phase6Pass1', name: 'Pilot Duplicate', accept_terms: true, accept_privacy: true };
      const results = await Promise.all([1, 2, 3].map(() => api.call('POST', '/auth/register', undefined, body)));
      const statuses = results.map((r) => r.status).sort();
      expect(statuses).toEqual([201, 409, 409]);
      const login = await api.call('POST', '/auth/login', undefined, { email, password: 'Phase6Pass1' });
      expect(login.status).toBe(200);
      // A later retry is still a plain duplicate.
      expect((await api.call('POST', '/auth/register', undefined, body)).status).toBe(409);
    });
  });

  describe('P6-006: a shared campus IP does not lock out a pilot group', () => {
    it('successful sign-ins do not count against the per-IP limit; failed ones still do', async () => {
      const accounts = [];
      for (let i = 0; i < 12; i++) {
        const email = `p6.rl${i}.${uniq()}@example.test`;
        expect((await api.call('POST', '/auth/register', undefined, { email, password: 'Phase6Pass1', name: `Rate ${i}` })).status).toBe(201);
        accounts.push(email);
      }
      process.env.AUTH_RATE_LIMIT_IN_TESTS = '1';
      resetAuthAttemptLimiter();
      try {
        for (const email of accounts) {
          expect((await api.call('POST', '/auth/login', undefined, { email, password: 'Phase6Pass1' })).status).toBe(200);
        }
        const statuses = [];
        for (let i = 0; i < 11; i++) statuses.push((await api.call('POST', '/auth/login', undefined, { email: accounts[0], password: 'WrongPass9' })).status);
        expect(statuses.slice(0, 10).every((x) => x === 401)).toBe(true);
        expect(statuses[10]).toBe(429);
      } finally {
        delete process.env.AUTH_RATE_LIMIT_IN_TESTS;
        resetAuthAttemptLimiter();
      }
    });
  });

  describe('P6-002: skills entered in the Student Profile reach career, resume and skills', () => {
    it('career recommendations, a new resume and the skills profile use the profile skills', async () => {
      const A = await api.register(`p6-skills-${uniq()}`);
      const before = await api.call('GET', '/career/recommendations', A.token);
      expect(before.body.data.potentially_relevant_roles.every((r: any) => r.match_percentage === 0)).toBe(true);

      const put = await api.call('PUT', '/profile/me/skills', A.token, {
        skills: [
          { name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' },
          { name: 'PostgreSQL', category: 'DATABASE', proficiency: 'BEGINNER' },
        ],
      });
      expect(put.status).toBe(200);

      const after = await api.call('GET', '/career/recommendations', A.token);
      const backend = after.body.data.potentially_relevant_roles.find((r: any) => r.role_name === 'Backend Developer');
      expect(backend.match_percentage).toBeGreaterThan(0);
      expect(after.body.data.explanation).toContain('2 skills');

      const resume = await api.call('POST', '/resumes', A.token, { title: 'P6 resume' });
      expect(resume.status).toBe(201);
      expect(resume.body.data.skills.map((s: any) => s.skill)).toEqual(expect.arrayContaining(['Python', 'PostgreSQL']));

      const skills = await api.call('GET', '/skills/profile', A.token);
      const text = JSON.stringify(skills.body);
      expect(text).toContain('PostgreSQL');
      expect(text).toContain('STUDENT_DECLARED');

      // Removing a skill from the profile removes it everywhere; the profile stays the source.
      await api.call('PUT', '/profile/me/skills', A.token, { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }] });
      expect(JSON.stringify((await api.call('GET', '/skills/profile', A.token)).body)).not.toContain('PostgreSQL');
    });

    it('does not leak one student’s profile skills to another', async () => {
      const A = await api.register(`p6-iso-a-${uniq()}`);
      const B = await api.register(`p6-iso-b-${uniq()}`);
      await api.call('PUT', '/profile/me/skills', A.token, { skills: [{ name: 'Haskell', category: 'PROGRAMMING_LANGUAGE', proficiency: 'ADVANCED' }] });
      expect(JSON.stringify((await api.call('GET', '/skills/profile', B.token)).body)).not.toContain('Haskell');
      expect(JSON.stringify((await api.call('GET', '/career/recommendations', B.token)).body)).not.toContain('Haskell');
    });
  });

  describe('P6-003: same-origin requests to a production build are allowed', () => {
    it('allows same-origin, allowlisted and origin-less requests and refuses other origins in production', () => {
      expect(isSameOrigin('https://pilot.example.test', 'pilot.example.test')).toBe(true);
      expect(isSameOrigin('http://localhost:3611', 'localhost:3611')).toBe(true);
      expect(isSameOrigin('https://evil.example', 'pilot.example.test')).toBe(false);
      expect(isSameOrigin('not a url', 'pilot.example.test')).toBe(false);
      expect(corsDecision('http://localhost:3611', 'localhost:3611', ['http://localhost:3000'], true)).toBeNull();
      expect(corsDecision(undefined, 'localhost:3611', [], true)).toBeNull();
      expect(corsDecision('http://localhost:3000', 'api.example.test', ['http://localhost:3000'], true)).toBeNull();
      expect(corsDecision('https://evil.example', 'localhost:3611', ['http://localhost:3000'], true)).toBeInstanceOf(Error);
      expect(corsDecision('https://evil.example', 'localhost:3611', [], false)).toBeNull();
    });
  });

  describe('Pilot feedback', () => {
    it('is closed unless the owner enables it, but students can always list and withdraw', async () => {
      const A = await api.register(`p6-fb-off-${uniq()}`);
      const cfg = await api.call('GET', '/pilot-feedback/config', A.token);
      expect(cfg.status).toBe(200);
      expect(cfg.body.data.enabled).toBe(false);
      const r = await api.call('POST', '/pilot-feedback', A.token, { ...consent, ratings: { overall_satisfaction: 4 } });
      expect(r.status).toBe(403);
      expect((await api.call('GET', '/pilot-feedback/mine', A.token)).status).toBe(200);
      expect((await api.call('GET', '/pilot-feedback/mine')).status).toBe(401);
    });

    it('requires consent, validates ratings and question ids, and redacts contact details', async () => {
      process.env.PILOT_FEEDBACK_ENABLED = 'true';
      const A = await api.register(`p6-fb-a-${uniq()}`);
      expect((await api.call('POST', '/pilot-feedback', A.token, { ratings: { overall_satisfaction: 4 } })).status).toBe(400);
      expect((await api.call('POST', '/pilot-feedback', A.token, { consent: true, consent_version: 'old', ratings: { overall_satisfaction: 4 } })).status).toBe(400);
      expect((await api.call('POST', '/pilot-feedback', A.token, { ...consent, ratings: { overall_satisfaction: 6 } })).status).toBe(400);
      expect((await api.call('POST', '/pilot-feedback', A.token, { ...consent, ratings: { overall_satisfaction: 3.5 } })).status).toBe(400);
      expect((await api.call('POST', '/pilot-feedback', A.token, { ...consent, ratings: { cgpa: 5 } })).status).toBe(400);
      expect((await api.call('POST', '/pilot-feedback', A.token, { ...consent })).status).toBe(400); // nothing answered
      expect((await api.call('POST', '/pilot-feedback', A.token, { ...consent, tasks_attempted: ['WF99'], comments: 'x' })).status).toBe(400);

      const ok = await api.call('POST', '/pilot-feedback', A.token, {
        ...consent,
        ratings: { reg_easy: 4, overall_satisfaction: 3, ux_mobile: null },
        answers: { reg_confusing_fields: 'Academic year vs semester', ux_errors_encountered: false },
        tasks_attempted: ['WF1', 'WF4', 'WF4'],
        device: 'PHONE',
        comments: 'Mail me at someone@example.com or +91 98765 43210',
        // Fields outside the schema are ignored, never stored.
        email: 'leak@example.com',
        cgpa: 9.1,
      });
      expect(ok.status).toBe(201);
      const e = ok.body.data;
      expect(e.ratings).toEqual({ reg_easy: 4, overall_satisfaction: 3 });
      expect(e.tasks_attempted).toEqual(['WF1', 'WF4']);
      expect(e.comments).not.toContain('someone@example.com');
      expect(e.comments).not.toContain('98765');
      expect(JSON.stringify(e)).not.toContain('leak@example.com');
      expect(JSON.stringify(e)).not.toContain('9.1');
    });

    it('records problem reports and privacy concerns', async () => {
      process.env.PILOT_FEEDBACK_ENABLED = 'true';
      const A = await api.register(`p6-fb-p-${uniq()}`);
      expect((await api.call('POST', '/pilot-feedback', A.token, { ...consent, kind: 'PROBLEM', problem: { module: 'Quiz' } })).status).toBe(400);
      const p = await api.call('POST', '/pilot-feedback', A.token, {
        ...consent,
        kind: 'PROBLEM',
        problem: { module: 'Quiz', page: '/quiz', what_happened: 'No quiz to take', expected: 'A quiz', steps: 'Open Quiz', impact: 'BLOCKED_ME' },
      });
      expect(p.status).toBe(201);
      expect(p.body.data.problem.impact).toBe('BLOCKED_ME');
      const c = await api.call('POST', '/pilot-feedback', A.token, { ...consent, kind: 'PRIVACY_CONCERN', problem: { what_happened: 'My name shows on a discussion' } });
      expect(c.status).toBe(201);
      expect((await api.call('GET', '/pilot-feedback/mine', A.token)).body.data).toHaveLength(2);
    });

    it('keeps each student’s feedback private and lets only the author withdraw it', async () => {
      process.env.PILOT_FEEDBACK_ENABLED = 'true';
      const A = await api.register(`p6-fb-iso-a-${uniq()}`);
      const B = await api.register(`p6-fb-iso-b-${uniq()}`);
      const a1 = (await api.call('POST', '/pilot-feedback', A.token, { ...consent, comments: 'A private comment' })).body.data;
      await api.call('POST', '/pilot-feedback', A.token, { ...consent, ratings: { overall_satisfaction: 5 } });
      expect(JSON.stringify((await api.call('GET', '/pilot-feedback/mine', B.token)).body)).not.toContain('A private comment');
      expect((await api.call('DELETE', `/pilot-feedback/mine/${a1.id}`, B.token)).status).toBe(404);
      expect((await api.call('GET', '/pilot-feedback/mine', A.token)).body.data).toHaveLength(2);
      // No listing of everyone's feedback exists.
      expect((await api.call('GET', '/pilot-feedback', A.token)).status).toBe(404);
      expect((await api.call('GET', '/admin/pilot-feedback', A.token)).status).not.toBe(200);

      expect((await api.call('DELETE', `/pilot-feedback/mine/${a1.id}`, A.token)).status).toBe(200);
      expect((await api.call('GET', '/pilot-feedback/mine', A.token)).body.data).toHaveLength(1);
      const all = await api.call('DELETE', '/pilot-feedback/mine', A.token);
      expect(all.body.data.withdrawn_count).toBe(1);
      expect((await api.call('GET', '/pilot-feedback/mine', A.token)).body.data).toHaveLength(0);
    });

    it('deletes entries older than the retention period', async () => {
      process.env.PILOT_FEEDBACK_ENABLED = 'true';
      process.env.PILOT_FEEDBACK_RETENTION_DAYS = '30';
      const A = await api.register(`p6-fb-ret-${uniq()}`);
      const e = (await api.call('POST', '/pilot-feedback', A.token, { ...consent, comments: 'old' })).body.data;
      const list = pilotFeedbackStores.entries.get(A.id)!;
      list.find((x) => x.id === e.id)!.created_at = new Date(Date.now() - 31 * 864e5).toISOString();
      expect((await api.call('GET', '/pilot-feedback/mine', A.token)).body.data).toHaveLength(0);
      expect(pilotFeedbackStores.entries.has(A.id)).toBe(false);
    });

    it('limits free text length', () => {
      expect(() => cleanFeedbackText('x'.repeat(1001), 'comments')).toThrow();
      expect(cleanFeedbackText('  fine  ', 'comments')).toBe('fine');
    });
  });
});
