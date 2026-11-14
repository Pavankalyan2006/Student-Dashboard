import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { profileDefaultsFrom, levelToDifficulty, levelToStudentLevel } from '../features/profile/hooks/useProfileDefaults';
import { gatePaperFor, studyDaysFor, matchesProfileSubject } from '../../server/db/database';

const src = (p: string) => readFileSync(path.resolve(__dirname, '..', p), 'utf8');

describe('Pages start from the student\'s own profile', () => {
  const p: any = {
    academic: { subjects: ['Operating Systems', ' DBMS ', ''], current_semester: 5, branch: 'Computer Science' },
    career: { target_roles: ['Backend Developer'], competitive_exams: ['GATE 2027'], gate_paper: 'cs' },
    learning: { learning_interests: ['Distributed systems'], difficulty: 'ADVANCED', weekly_study_hours: 14, daily_study_minutes: 60 },
    skills: { skills: [{ name: 'Python' }] },
  };

  it('derives defaults only from real profile data', () => {
    const d = profileDefaultsFrom(p);
    expect(d.subjects).toEqual(['Operating Systems', 'DBMS']);
    expect(d.targetRoles).toEqual(['Backend Developer']);
    expect(d.level).toBe('ADVANCED');
    expect(d.weeklyStudyHours).toBe(14);
    expect(d.gatePaper).toBe('cs');
    const none = profileDefaultsFrom(undefined);
    expect(none).toMatchObject({ ready: false, subjects: [], targetRoles: [], level: null, weeklyStudyHours: null, gatePaper: null });
  });

  it('gives no GATE paper unless the student is preparing for GATE', () => {
    expect(profileDefaultsFrom({ ...p, career: { ...p.career, competitive_exams: [] } }).gatePaper).toBeNull();
  });

  it('maps the profile level onto generator scales', () => {
    expect(levelToDifficulty('FOUNDATIONAL')).toBe('EASY');
    expect(levelToDifficulty('ADVANCED')).toBe('HARD');
    expect(levelToDifficulty('ADAPTIVE')).toBeNull();
    expect(levelToStudentLevel('INTERMEDIATE')).toBe('INTERMEDIATE');
    expect(levelToStudentLevel(null)).toBeNull();
  });

  it('opens GATE on the student\'s paper, from their choice or their branch', () => {
    expect(gatePaperFor('ec', 'Computer Science')).toBe('EC');
    expect(gatePaperFor(null, 'Computer Science & Engineering')).toBe('CS');
    expect(gatePaperFor(null, 'Electronics and Communication')).toBe('EC');
    expect(gatePaperFor(null, 'Mechanical Engineering')).toBe('ME');
    expect(gatePaperFor(null, 'Data Science')).toBe('DA');
    expect(gatePaperFor(null, '')).toBeNull();
    expect(studyDaysFor(['MON', 'WED'])).toEqual(['Monday', 'Wednesday']);
    expect(studyDaysFor([])).toBeNull();
  });

  it('ranks the student\'s listed subjects first in Courses', () => {
    expect(matchesProfileSubject({ title: 'Database Management Systems (DBMS)' }, ['DBMS'])).toBe(true);
    expect(matchesProfileSubject({ title: 'Operating Systems & System Architecture' }, ['Operating Systems'])).toBe(true);
    expect(matchesProfileSubject({ title: 'Computer Networks', code: 'CS305' }, ['cs305'])).toBe(true);
    expect(matchesProfileSubject({ title: 'Computer Networks' }, ['Operating Systems'])).toBe(false);
    expect(matchesProfileSubject({ title: '' }, ['Operating Systems Lab'])).toBe(false);
    expect(matchesProfileSubject({ title: 'Anything' }, [])).toBe(false);
  });

  it('the generators and setup forms read the profile instead of fixed defaults', () => {
    const uses = [
      'features/quiz/pages/QuizCreatePage.tsx',
      'features/notes/components/NotesGenerator.tsx',
      'features/flashcards/components/CreateFlashcardsModal.tsx',
      'features/doubts/pages/DoubtSolverPage.tsx',
      'features/mock-interviews/components/MockInterviewSetupModal.tsx',
      'features/study-planner/pages/StudyPlannerPage.tsx',
      'features/jobs/pages/JobsDiscoveryPage.tsx',
    ];
    for (const f of uses) expect(src(f), f).toMatch(/useProfileDefaults\(\)/);
    expect(src('features/gate/components/GateStudyPlannerView.tsx')).not.toMatch(/paper_code: 'CS'/);
  });

  it('shows the student what the assistant knows, and the old suggestion panel stays gone', () => {
    expect(src('components/navigation/Topbar.tsx')).toMatch(/<PersonalContextChip/);
    expect(src('components/navigation/PersonalContextChip.tsx')).toMatch(/\/profile\/me\/ai-context/);
    expect(src('App.tsx')).not.toMatch(/ProfileRecommendationsPanel/);
    for (const f of ['features/profile/components/ProfileQuickPicks.tsx', 'components/navigation/PersonalContextChip.tsx']) {
      expect(src(f)).not.toMatch(/Recommended for you/);
    }
  });
});
