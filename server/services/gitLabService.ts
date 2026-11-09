// Git practice lab: lessons, graded exercises and a free sandbox, all on the simulated repository engine.
// Progress is stored per authenticated student (the student id always comes from the auth token).
import { AppError, NotFoundError, ValidationError } from '../core/exceptions';
import { ActivityService } from './activityService';
import { SimRepo, buildRepo, describeRepo, emptyRepo, runCommand } from './gitLab/gitSimulator';
import { GIT_EXERCISES, GIT_LESSONS, GitExercise, evaluateExercise } from './gitLab/gitLabContent';

interface ExerciseProgress {
  status: 'IN_PROGRESS' | 'COMPLETED';
  repo: SimRepo;
  commands_run: number;
  hints_used: number;
  started_at: string;
  completed_at?: string;
  best_completed_at?: string;
}

interface StudentGitProgress {
  lessons_completed: string[];
  exercises: Record<string, ExerciseProgress>;
  sandbox: SimRepo;
}

export class GitLabService {
  /** studentId -> progress. Registered with the snapshot persistence in server.ts. */
  public static progress: Map<string, StudentGitProgress> = new Map();

  private static get(studentId: string): StudentGitProgress {
    let p = this.progress.get(studentId);
    if (!p) {
      p = { lessons_completed: [], exercises: {}, sandbox: emptyRepo() };
      this.progress.set(studentId, p);
    }
    return p;
  }

  private static exercise(id: string): GitExercise {
    const ex = GIT_EXERCISES.find((e) => e.id === id);
    if (!ex) throw new NotFoundError(`Git exercise '${id}' not found`);
    return ex;
  }

  private static exerciseView(ex: GitExercise, p?: ExerciseProgress) {
    return {
      id: ex.id,
      lesson_id: ex.lesson_id,
      order: ex.order,
      title: ex.title,
      difficulty: ex.difficulty,
      instructions: ex.instructions,
      checks: ex.checks.map((c) => ({ id: c.id, label: c.label })),
      hint_count: ex.hints.length,
      status: p ? p.status : 'NOT_STARTED',
      completed_at: p?.best_completed_at || null,
    };
  }

  public static listLessons(studentId: string) {
    const p = this.get(studentId);
    return GIT_LESSONS.map((l) => ({
      id: l.id,
      order: l.order,
      title: l.title,
      summary: l.summary,
      exercise_ids: l.exercise_ids,
      completed: p.lessons_completed.includes(l.id),
      exercises_completed: l.exercise_ids.filter((id) => p.exercises[id]?.best_completed_at).length,
    }));
  }

  public static getLesson(studentId: string, lessonId: string) {
    const l = GIT_LESSONS.find((x) => x.id === lessonId);
    if (!l) throw new NotFoundError(`Git lesson '${lessonId}' not found`);
    const p = this.get(studentId);
    return { ...l, completed: p.lessons_completed.includes(l.id), exercises: l.exercise_ids.map((id) => this.exerciseView(this.exercise(id), p.exercises[id])) };
  }

  public static async completeLesson(studentId: string, lessonId: string) {
    const l = GIT_LESSONS.find((x) => x.id === lessonId);
    if (!l) throw new NotFoundError(`Git lesson '${lessonId}' not found`);
    const p = this.get(studentId);
    if (!p.lessons_completed.includes(lessonId)) {
      p.lessons_completed.push(lessonId);
      await ActivityService.recordActivity(studentId, 'GIT_LESSON_COMPLETED', 'GIT_LESSON', lessonId, `Git lesson: ${l.title}`, { lab: 'git' });
    }
    return { lesson_id: lessonId, completed: true };
  }

  public static listExercises(studentId: string) {
    const p = this.get(studentId);
    return GIT_EXERCISES.map((ex) => this.exerciseView(ex, p.exercises[ex.id]));
  }

  /** Returns the exercise with the student's current simulated repository, starting it if needed. */
  public static getExercise(studentId: string, exerciseId: string) {
    const ex = this.exercise(exerciseId);
    const p = this.get(studentId);
    if (!p.exercises[ex.id]) this.startExercise(studentId, ex.id);
    const ep = p.exercises[ex.id];
    return this.workspace(ex, ep);
  }

  public static startExercise(studentId: string, exerciseId: string) {
    const ex = this.exercise(exerciseId);
    const p = this.get(studentId);
    const prev = p.exercises[ex.id];
    p.exercises[ex.id] = {
      status: 'IN_PROGRESS',
      repo: buildRepo(ex.setup),
      commands_run: 0,
      hints_used: 0,
      started_at: new Date().toISOString(),
      best_completed_at: prev?.best_completed_at,
    };
    return this.workspace(ex, p.exercises[ex.id]);
  }

  private static workspace(ex: GitExercise, ep: ExerciseProgress) {
    const evaluation = evaluateExercise(ex, ep.repo);
    return {
      exercise: { ...this.exerciseView(ex, ep), completed_at: ep.best_completed_at || null },
      repo: describeRepo(ep.repo),
      evaluation,
      hints: ex.hints.slice(0, ep.hints_used),
      commands_run: ep.commands_run,
      explanation: ep.status === 'COMPLETED' ? ex.explanation : null,
    };
  }

  public static async runExerciseCommand(studentId: string, exerciseId: string, command: unknown) {
    if (typeof command !== 'string') throw new ValidationError('command must be text');
    const ex = this.exercise(exerciseId);
    const p = this.get(studentId);
    if (!p.exercises[ex.id]) this.startExercise(studentId, ex.id);
    const ep = p.exercises[ex.id];
    const result = runCommand(ep.repo, command);
    ep.commands_run += 1;
    const evaluation = evaluateExercise(ex, ep.repo);
    let newlyCompleted = false;
    if (evaluation.passed && ep.status !== 'COMPLETED') {
      ep.status = 'COMPLETED';
      ep.completed_at = new Date().toISOString();
      newlyCompleted = !ep.best_completed_at;
      ep.best_completed_at = ep.best_completed_at || ep.completed_at;
      if (newlyCompleted) {
        await ActivityService.recordActivity(studentId, 'GIT_EXERCISE_COMPLETED', 'GIT_EXERCISE', ex.id, `Git exercise: ${ex.title}`, {
          lab: 'git',
          commands_run: ep.commands_run,
          hints_used: ep.hints_used,
        });
      }
    }
    return { result, newly_completed: newlyCompleted, ...this.workspace(ex, ep) };
  }

  public static requestHint(studentId: string, exerciseId: string) {
    const ex = this.exercise(exerciseId);
    const p = this.get(studentId);
    if (!p.exercises[ex.id]) this.startExercise(studentId, ex.id);
    const ep = p.exercises[ex.id];
    if (ep.hints_used >= ex.hints.length) throw new AppError('No more hints for this exercise.', 400, 'NO_MORE_HINTS');
    ep.hints_used += 1;
    return { hint: ex.hints[ep.hints_used - 1], hints_used: ep.hints_used, hint_count: ex.hints.length };
  }

  /** The reference solution is only shown once the student has completed the exercise or used every hint. */
  public static getSolution(studentId: string, exerciseId: string) {
    const ex = this.exercise(exerciseId);
    const ep = this.get(studentId).exercises[ex.id];
    if (!ep || (!ep.best_completed_at && ep.hints_used < ex.hints.length)) {
      throw new AppError('Use all the hints or complete the exercise to see the reference solution.', 403, 'SOLUTION_LOCKED');
    }
    return { solution: ex.solution, explanation: ex.explanation };
  }

  public static getSandbox(studentId: string) {
    return { repo: describeRepo(this.get(studentId).sandbox) };
  }

  public static runSandboxCommand(studentId: string, command: unknown) {
    if (typeof command !== 'string') throw new ValidationError('command must be text');
    const p = this.get(studentId);
    const result = runCommand(p.sandbox, command);
    return { result, repo: describeRepo(p.sandbox) };
  }

  public static resetSandbox(studentId: string) {
    this.get(studentId).sandbox = emptyRepo();
    return this.getSandbox(studentId);
  }

  public static getProgress(studentId: string) {
    // Read-only: does not create a record for students who never opened the lab.
    const p = this.progress.get(studentId) || { lessons_completed: [], exercises: {} as Record<string, ExerciseProgress> };
    const completed = GIT_EXERCISES.filter((e) => p.exercises[e.id]?.best_completed_at);
    return {
      lessons_total: GIT_LESSONS.length,
      lessons_completed: p.lessons_completed.length,
      exercises_total: GIT_EXERCISES.length,
      exercises_completed: completed.length,
      completed_exercise_ids: completed.map((e) => e.id),
      hints_used: Object.values(p.exercises).reduce((s, e) => s + e.hints_used, 0),
    };
  }
}
