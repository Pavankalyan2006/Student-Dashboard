import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../server/db/database';
import { buildRepo, emptyRepo, runCommand, describeRepo } from '../../server/services/gitLab/gitSimulator';
import { GIT_EXERCISES, GIT_LESSONS, evaluateExercise } from '../../server/services/gitLab/gitLabContent';
import { GitLabService } from '../../server/services/gitLabService';

const run = (r: any, cmds: string[]) => cmds.map((c) => runCommand(r, c));

describe('Git practice lab: simulator', () => {
  it('never runs host commands: shell features and unknown programs are refused', () => {
    const r = emptyRepo();
    for (const c of ['ls; rm -rf /', 'git status && whoami', 'echo $(id)', 'curl http://example.test', 'node -e "1"', 'cat /etc/passwd | head', 'echo `id`']) {
      const res = runCommand(r, c);
      expect(res.ok, c).toBe(false);
    }
    expect(runCommand(r, 'cat /etc/passwd').ok).toBe(false); // only simulated files exist
    expect(runCommand(r, 'echo x > ../../evil').ok).toBe(false);
  });

  it('tracks working directory, staging area and commits', () => {
    const r = emptyRepo();
    expect(runCommand(r, 'git status').ok).toBe(false); // not a repository yet
    run(r, ['git init', 'echo "a" > a.txt']);
    expect(describeRepo(r).status!.untracked).toEqual(['a.txt']);
    run(r, ['git add a.txt']);
    expect(describeRepo(r).status!.staged).toEqual([{ path: 'a.txt', change: 'added' }]);
    const c = runCommand(r, 'git commit -m "First"');
    expect(c.ok).toBe(true);
    expect(runCommand(r, 'git commit -m "Empty"').ok).toBe(false);
    expect(runCommand(r, 'git status').output).toContain('working tree clean');
  });

  it('a failed command leaves the repository unchanged', () => {
    const r = buildRepo(['git init', 'echo a > a.txt', 'git add .', 'git commit -m one']);
    const before = JSON.stringify(r.commits);
    expect(runCommand(r, 'git merge nope').ok).toBe(false);
    expect(runCommand(r, 'git reset --hard HEAD~5').ok).toBe(false);
    expect(JSON.stringify(r.commits)).toBe(before);
  });

  it('produces a real conflict with markers and blocks commit until resolved', () => {
    const ex = GIT_EXERCISES.find((e) => e.id === 'resolve-conflict')!;
    const r = buildRepo(ex.setup);
    const m = runCommand(r, 'git merge feature/title');
    expect(m.output).toContain('CONFLICT');
    expect(r.workdir['app.txt']).toContain('<<<<<<< HEAD');
    expect(runCommand(r, 'git commit -m "Merge"').ok).toBe(false);
    expect(runCommand(r, 'git merge --abort').ok).toBe(true);
    expect(r.workdir['app.txt']).toBe('Title: Campus Portal');
  });

  it('switching branches with uncommitted conflicting changes is refused', () => {
    const r = buildRepo(['git init', 'echo a > f', 'git add .', 'git commit -m one', 'git switch -c b', 'echo b > f', 'git commit -am two', 'git switch main', 'echo dirty > f']);
    expect(runCommand(r, 'git switch b').ok).toBe(false);
    expect(runCommand(r, 'git stash').ok).toBe(true);
    expect(runCommand(r, 'git switch b').ok).toBe(true);
  });
});

describe('Git practice lab: exercises', () => {
  for (const ex of GIT_EXERCISES) {
    it(`${ex.id}: not solved at start, solved by the reference solution`, () => {
      const r = buildRepo(ex.setup);
      expect(evaluateExercise(ex, r).passed).toBe(false);
      for (const c of ex.solution) {
        const res = runCommand(r, c);
        expect(res.ok, `${c}: ${res.output}`).toBe(true);
      }
      const ev = evaluateExercise(ex, r);
      expect(ev.checks.filter((c) => !c.passed).map((c) => c.label)).toEqual([]);
    });
  }

  it('a wrong approach is not graded as complete (merge instead of cherry-pick)', () => {
    const ex = GIT_EXERCISES.find((e) => e.id === 'cherry-pick-fix')!;
    const r = buildRepo(ex.setup);
    runCommand(r, 'git merge experiment');
    expect(evaluateExercise(ex, r).passed).toBe(false);
  });

  it('every lesson exercise exists', () => {
    const ids = new Set(GIT_EXERCISES.map((e) => e.id));
    for (const l of GIT_LESSONS) for (const id of l.exercise_ids) expect(ids.has(id)).toBe(true);
    expect(GIT_LESSONS.length).toBeGreaterThanOrEqual(13);
  });
});

describe('Git practice lab: per-student progress', () => {
  const A = 'std_gitlab_a';
  const B = 'std_gitlab_b';
  beforeEach(async () => {
    await db.initialize();
    GitLabService.progress.clear();
  });

  it('records completion once, keeps students separate, and logs an activity', async () => {
    const ex = GIT_EXERCISES.find((e) => e.id === 'tag-release')!;
    GitLabService.getExercise(A, ex.id);
    let last: any;
    for (const c of ex.solution) last = await GitLabService.runExerciseCommand(A, ex.id, c);
    expect(last.newly_completed).toBe(true);
    expect(last.explanation).toBe(ex.explanation);
    expect(GitLabService.getProgress(A).exercises_completed).toBe(1);
    expect(GitLabService.getProgress(B).exercises_completed).toBe(0);
    expect(GitLabService.getExercise(B, ex.id).repo.tags).toEqual([]);
    const acts = await db.getStudentActivities(A);
    expect(acts.filter((a: any) => a.activity_type === 'GIT_EXERCISE_COMPLETED' && a.entity_id === ex.id).length).toBe(1);
    // Resetting and solving again does not log a second completion.
    GitLabService.startExercise(A, ex.id);
    for (const c of ex.solution) last = await GitLabService.runExerciseCommand(A, ex.id, c);
    expect(last.newly_completed).toBe(false);
    expect((await db.getStudentActivities(A)).filter((a: any) => a.activity_type === 'GIT_EXERCISE_COMPLETED' && a.entity_id === ex.id).length).toBe(1);
  });

  it('hints are given one at a time and the solution stays locked until hints run out', () => {
    const ex = GIT_EXERCISES.find((e) => e.id === 'first-commit')!;
    expect(() => GitLabService.getSolution(A, ex.id)).toThrow();
    for (let i = 0; i < ex.hints.length; i++) expect(GitLabService.requestHint(A, ex.id).hint).toBe(ex.hints[i]);
    expect(() => GitLabService.requestHint(A, ex.id)).toThrow();
    expect(GitLabService.getSolution(A, ex.id).solution).toEqual(ex.solution);
  });

  it('rejects unknown exercises and non-text commands', async () => {
    expect(() => GitLabService.getExercise(A, 'nope')).toThrow();
    await expect(GitLabService.runExerciseCommand(A, 'first-commit', { evil: 1 })).rejects.toThrow();
  });
});
