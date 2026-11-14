import { describe, it, expect, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import {
  formatStudentContext,
  moduleForPath,
  apiPathForPage,
  withStudentContext,
  STUDENT_CONTEXT_MARKER,
  studentContextForCurrentRequest,
} from '../../server/ai/personalization';
import { runWithRequestContext } from '../../server/core/requestContext';
import { AIService } from '../../server/ai/service';
import type { AIProvider, AIGenerateOptions } from '../../server/ai/provider';

function profile(overrides: any = {}): any {
  return {
    identity: { full_name: 'Asha Rao', display_name: 'Asha', email: 'asha@example.test', phone: '9999999999' },
    academic: {
      degree: 'B.Tech', branch: 'Computer Science', specialization: 'AI & ML', academic_year: 3, current_semester: 5,
      subjects: ['Operating Systems', 'DBMS'], college: 'Example College', university: 'Example University', cgpa: 9.1,
    },
    skills: { skills: [{ name: 'Python', category: 'PROGRAMMING_LANGUAGE', proficiency: 'INTERMEDIATE' }] },
    experience: { projects: [{ title: 'Chat app', technologies: ['React', 'Node'] }], experience: [], certifications: [], research_interests: ['NLP'] },
    career: {
      target_roles: ['Backend Developer'], career_interests: [], preferred_industries: ['Fintech'], preferred_locations: [],
      internship_interests: [], placement_goals: 'Product company', higher_education_interests: [], competitive_exams: ['GATE'],
      gate_paper: 'CS', short_term_goals: 'Finish DSA sheet', long_term_goals: null,
    },
    learning: {
      preferred_languages: ['Telugu'], explanation_style: 'DEEP_DIVE', learning_style: 'VISUAL', difficulty: 'INTERMEDIATE',
      learning_interests: ['Distributed systems'], weekly_study_hours: 12, preferred_study_days: ['MON', 'WED'],
      daily_study_minutes: 90, preferred_study_time: 'EVENING', revision_preference: 'WEEKLY', notifications: {},
    },
    account: { student_id: 'stu_1', profile_version: 3 },
    ...overrides,
  };
}

describe('One student context for every AI feature', () => {
  it('describes the student from their own profile and live state', () => {
    const text = formatStudentContext(profile(), 'tutor', { weak_areas: ['Deadlocks'], current_course: 'Operating Systems' });
    expect(text).toContain(STUDENT_CONTEXT_MARKER);
    expect(text).toMatch(/B\.Tech in Computer Science/);
    expect(text).toMatch(/semester 5/);
    expect(text).toMatch(/Operating Systems, DBMS/);
    expect(text).toMatch(/Python \(intermediate\)/);
    expect(text).toMatch(/explain in Telugu/);
    expect(text).toMatch(/Target roles: Backend Developer/);
    expect(text).toMatch(/GATE paper CS/);
    expect(text).toMatch(/Weak areas from their results: Deadlocks/);
  });

  it('never includes personal identifiers', () => {
    const text = formatStudentContext(profile(), 'career', {});
    for (const secret of ['Asha', 'asha@example.test', '9999999999', 'Example College', 'Example University', '9.1', 'stu_1']) {
      expect(text, secret).not.toContain(secret);
    }
  });

  it('adds module-specific detail only where it matters', () => {
    expect(formatStudentContext(profile(), 'planner')).toMatch(/Study availability: 12 h per week, 90 min per day/);
    expect(formatStudentContext(profile(), 'tutor')).not.toMatch(/Study availability/);
    expect(formatStudentContext(profile(), 'interview')).toMatch(/Projects: Chat app \[React, Node\]/);
    expect(formatStudentContext(profile(), 'notes')).not.toMatch(/Projects:/);
  });

  it('returns nothing for an empty profile instead of inventing context', () => {
    const empty = profile({
      academic: { subjects: [] },
      skills: { skills: [] },
      career: { target_roles: [], competitive_exams: [], preferred_industries: [] },
      learning: { preferred_languages: [], preferred_study_days: [], learning_interests: [] },
      experience: { projects: [], experience: [] },
    });
    expect(formatStudentContext(empty, 'tutor')).toBe('');
  });

  it('maps API areas and pages to modules', () => {
    expect(moduleForPath('/api/v1/notes/generate')).toBe('notes');
    expect(moduleForPath('/api/v1/mock-interviews/sessions')).toBe('interview');
    expect(moduleForPath('/api/v1/learning-modules/study-planner/plans')).toBe('planner');
    expect(moduleForPath('/api/v1/gate/mock')).toBe('gate');
    expect(moduleForPath('/api/v1/jobs/analyze')).toBe('jobs');
    expect(moduleForPath('/api/v1/ai/chat')).toBe('tutor');
    expect(moduleForPath(apiPathForPage('/career/jobs'))).toBe('jobs');
    expect(moduleForPath(apiPathForPage('/assessment/gate-preparation'))).toBe('gate');
    expect(moduleForPath(apiPathForPage('/focus'))).toBe('planner');
  });

  it('adds the block once', () => {
    const once = withStudentContext('You are a tutor.', `${STUDENT_CONTEXT_MARKER}...`);
    expect(withStudentContext(once, `${STUDENT_CONTEXT_MARKER}...`)).toBe(once);
    expect(withStudentContext('x', '')).toBe('x');
  });

  it('is empty outside a signed-in student request', async () => {
    expect(await studentContextForCurrentRequest()).toBe('');
    expect(await runWithRequestContext({ path: '/api/v1/notes' }, () => studentContextForCurrentRequest())).toBe('');
  });
});

describe('AIService passes the context to the model', () => {
  const original = (AIService as any).provider;
  afterEach(() => AIService.setProvider(original));

  it('every AI call made for a student carries that student\'s context', async () => {
    const seen: AIGenerateOptions[] = [];
    const capture: AIProvider = {
      name: 'capture',
      generate: async (o) => (seen.push(o), { text: 'ok' }),
      stream: async (o, onChunk) => (seen.push(o), onChunk('ok')),
    };
    AIService.setProvider(capture);
    const block = `${STUDENT_CONTEXT_MARKER}'s own profile...)`;
    // Stand-in for the profile lookup: the request context decides; formatting is tested above.
    const mod = await import('../../server/ai/personalization');
    const spy = (await import('vitest')).vi.spyOn(mod, 'studentContextForCurrentRequest').mockResolvedValue(block);
    try {
      await AIService.generate([{ role: 'system', content: 'Make notes.' }, { role: 'user', content: 'Paging' }]);
      await AIService.stream([{ role: 'user', content: 'Paging' }], () => {});
    } finally {
      spy.mockRestore();
    }
    expect(seen[0].systemInstruction).toContain('Make notes.');
    expect(seen[0].systemInstruction).toContain(STUDENT_CONTEXT_MARKER);
    expect(seen[1].systemInstruction).toContain(STUDENT_CONTEXT_MARKER);
  });

  it('is wired after authentication for every API request', () => {
    const app = readFileSync(path.resolve(__dirname, '../../server/app.ts'), 'utf8');
    expect(app.indexOf('app.use(requestContextMiddleware)')).toBeGreaterThan(app.indexOf('app.use(authenticate)'));
    const svc = readFileSync(path.resolve(__dirname, '../../server/ai/service.ts'), 'utf8');
    expect(svc.match(/studentContextForCurrentRequest\(\)/g)?.length).toBe(2);
  });
});
