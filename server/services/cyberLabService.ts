// Cybersecurity Lab: each student's progress. Answers are checked against the catalogue on the server and
// only a correct answer records an exercise as completed. Levels unlock in order within a track.
import { ValidationError, NotFoundError } from '../core/exceptions';
import { TRACKS, EXERCISES, EXERCISE_BY_ID, checkAnswer, publicExercise, type CyberExercise } from './cyberLabCatalog';

export interface CyberProgress {
  agreed_at?: string;
  completed: Record<string, { at: string; attempts: number }>;
  attempts: Record<string, number>;
}

export const cyberStores: { progress: Map<string, CyberProgress> } = { progress: new Map() };

/** Rules the student accepts before the first attempt. */
export const RULES = [
  'Practise only on the targets in this lab. They run in your own browser and are made to be broken.',
  'Never scan, probe or attack a system you do not own or do not have written permission to test. In India this can be an offence under the IT Act, 2000, and it breaks the university’s acceptable-use policy.',
  'Use what you learn to defend systems and to report problems responsibly.',
];

const MAX_ATTEMPTS_PER_EXERCISE = 200;

const progressOf = (studentId: string): CyberProgress => cyberStores.progress.get(studentId) || { completed: {}, attempts: {} };
const save = (studentId: string, p: CyberProgress) => cyberStores.progress.set(studentId, { ...p, completed: { ...p.completed }, attempts: { ...p.attempts } });

/** A level unlocks once any exercise of the level below in the same track is completed. */
export function isUnlocked(ex: CyberExercise, completed: Record<string, unknown>): boolean {
  if (ex.level === 1) return true;
  const below = EXERCISES.filter((e) => e.track === ex.track && e.level < ex.level);
  if (!below.length) return true;
  const lower = Math.max(...below.map((e) => e.level));
  return below.some((e) => e.level === lower && completed[e.id]);
}

export class CyberLabService {
  static overview(studentId: string) {
    const p = progressOf(studentId);
    const exercises = EXERCISES.map((e) => {
      const done = p.completed[e.id];
      return {
        ...publicExercise(e),
        unlocked: isUnlocked(e, p.completed),
        completed_at: done?.at,
        attempts: p.attempts[e.id] || 0,
        ...(done ? { lesson: e.lesson } : {}),
      };
    });
    const skills = new Map<string, { skill: string; exercises: number; last_at: string }>();
    for (const e of EXERCISES) {
      const done = p.completed[e.id];
      if (!done) continue;
      for (const s of e.skills) {
        const cur = skills.get(s);
        skills.set(s, { skill: s, exercises: (cur?.exercises || 0) + 1, last_at: !cur || done.at > cur.last_at ? done.at : cur.last_at });
      }
    }
    return {
      rules: RULES,
      agreed_at: p.agreed_at,
      tracks: TRACKS.map((t) => {
        const list = EXERCISES.filter((e) => e.track === t.id);
        return { ...t, total: list.length, completed: list.filter((e) => p.completed[e.id]).length };
      }),
      exercises,
      completed: Object.keys(p.completed).length,
      total: EXERCISES.length,
      skills: [...skills.values()].sort((a, b) => b.exercises - a.exercises || a.skill.localeCompare(b.skill)),
    };
  }

  static agree(studentId: string) {
    const p = progressOf(studentId);
    if (!p.agreed_at) save(studentId, { ...p, agreed_at: new Date().toISOString() });
    return { agreed_at: progressOf(studentId).agreed_at };
  }

  static attempt(studentId: string, exerciseId: string, answer: unknown) {
    const ex = EXERCISE_BY_ID.get(exerciseId);
    if (!ex) throw new NotFoundError('That exercise was not found.');
    const p = progressOf(studentId);
    if (!p.agreed_at) throw new ValidationError('Accept the lab rules first.');
    if (!isUnlocked(ex, p.completed)) throw new ValidationError('Finish an easier exercise in this track first.');
    if (typeof answer !== 'string' || !answer.trim() || answer.length > 500) throw new ValidationError('Type your answer.');
    if (p.completed[ex.id]) return { correct: checkAnswer(ex, answer), already_completed: true, lesson: ex.lesson, skills: ex.skills };
    const attempts = (p.attempts[ex.id] || 0) + 1;
    if (attempts > MAX_ATTEMPTS_PER_EXERCISE) throw new ValidationError('Too many attempts on this exercise. Read the hints, then try again later.');
    const correct = checkAnswer(ex, answer);
    const next: CyberProgress = { ...p, attempts: { ...p.attempts, [ex.id]: attempts } };
    if (correct) next.completed = { ...p.completed, [ex.id]: { at: new Date().toISOString(), attempts } };
    save(studentId, next);
    return correct ? { correct: true, lesson: ex.lesson, skills: ex.skills, attempts } : { correct: false, attempts };
  }
}
