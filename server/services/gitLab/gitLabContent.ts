// Lessons and graded exercises for the Git practice lab.
// Every exercise starts from a repository built by running real simulator commands, and is graded by
// checks that read the resulting simulated repository. Nothing is scored by keyword matching.
import { SimRepo, branchCommits, getStatus, hasMarkers, headCommit, headTree, isClean, ancestors, mergeBase } from './gitSimulator';

export interface GitLesson {
  id: string;
  order: number;
  title: string;
  summary: string;
  sections: { heading: string; body: string; commands?: string[] }[];
  exercise_ids: string[];
}

export interface GitCheck {
  id: string;
  label: string;
  test: (r: SimRepo) => boolean;
}

export interface GitExercise {
  id: string;
  lesson_id: string;
  order: number;
  title: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructions: string;
  setup: string[];
  checks: GitCheck[];
  hints: string[];
  explanation: string;
  solution: string[];
}

const tipMsg = (r: SimRepo, b: string) => {
  const id = r.branches[b];
  return id ? r.commits[id].message : null;
};
const onBranch = (r: SimRepo, b: string) => r.head.type === 'branch' && r.head.name === b;
const fileAt = (r: SimRepo, b: string, path: string) => {
  const id = r.branches[b];
  return id ? r.commits[id].tree[path] : undefined;
};
const msgs = (r: SimRepo, b: string) => branchCommits(r, b).map((c) => c.message);

export const GIT_LESSONS: GitLesson[] = [
  {
    id: 'fundamentals',
    order: 1,
    title: 'Git fundamentals',
    summary: 'What version control is, what a repository holds, and why every commit is a snapshot.',
    sections: [
      { heading: 'Why version control', body: 'Version control records every saved state of a project so you can see who changed what, go back to an earlier state, and work on several changes at once without overwriting each other. Git is a distributed version control system: every clone holds the full history.' },
      { heading: 'Snapshots, not differences', body: 'A commit records a snapshot of all tracked files, a message, an author and a pointer to its parent commit(s). The chain of parent pointers is the history. Each commit is named by a hash of its contents, so history cannot change silently.' },
      { heading: 'Configuring Git (on a real computer)', body: 'Before your first commit on a real machine you set your name and email. The lab does not need this because it is a simulation.', commands: ['git config --global user.name "Your Name"', 'git config --global user.email "you@example.com"'] },
    ],
    exercise_ids: [],
  },
  {
    id: 'init-and-areas',
    order: 2,
    title: 'Repositories and the three areas',
    summary: 'git init, and how files move between the working directory, the staging area, the local repository and a remote.',
    sections: [
      { heading: 'Creating a repository', body: '"git init" turns the current folder into a repository by creating the hidden .git folder. "git clone <url>" copies an existing remote repository instead.', commands: ['git init', 'git status'] },
      { heading: 'Working directory, staging area, repository', body: 'You edit files in the working directory. "git add" copies the current version of a file into the staging area (also called the index). "git commit" saves everything in the staging area as a new commit in the local repository. "git push" sends commits to a remote repository such as GitHub.', commands: ['git add notes.txt', 'git commit -m "Add notes"', 'git push origin main'] },
      { heading: 'Reading git status', body: 'git status shows three groups: changes to be committed (staged), changes not staged for commit (modified since the last add) and untracked files (never added). Staging lets you commit only part of your work.' },
    ],
    exercise_ids: ['first-commit', 'stage-selectively'],
  },
  {
    id: 'commits',
    order: 3,
    title: 'Commits and history',
    summary: 'Writing good commits, reading the log, and comparing versions.',
    sections: [
      { heading: 'Good commits', body: 'Make each commit one logical change with a short message in the imperative mood ("Add login form", not "changes"). Small commits are easier to review, revert and cherry-pick.' },
      { heading: 'Looking at history', body: 'git log lists commits from newest to oldest. "--oneline" shows one line per commit and "--all" includes every branch. git diff shows unstaged changes; "git diff --staged" shows what the next commit will contain.', commands: ['git log --oneline', 'git log --oneline --all', 'git diff', 'git diff --staged'] },
      { heading: 'Undoing local edits', body: '"git restore <file>" throws away unstaged edits to a file. "git restore --staged <file>" takes a file out of the staging area but keeps your edits.', commands: ['git restore app.js', 'git restore --staged app.js'] },
    ],
    exercise_ids: [],
  },
  {
    id: 'branches',
    order: 4,
    title: 'Branches',
    summary: 'Branches are movable labels on commits; HEAD says which one you are on.',
    sections: [
      { heading: 'What a branch is', body: 'A branch is just a name that points at a commit. When you commit on a branch, the name moves forward to the new commit. HEAD points at the branch you have checked out.' },
      { heading: 'Creating and switching', body: '"git switch -c feature" (or "git checkout -b feature") creates a branch at the current commit and switches to it. "git switch main" goes back. "git branch" lists branches; "git branch -d name" deletes a merged branch.', commands: ['git switch -c feature/login', 'git branch', 'git switch main', 'git branch -d feature/login'] },
      { heading: 'Detached HEAD', body: 'Checking out a commit id or tag puts you in "detached HEAD" state: HEAD points at a commit, not a branch. Commits made there are easy to lose; create a branch with "git switch -c <name>" to keep them.' },
    ],
    exercise_ids: ['feature-branch'],
  },
  {
    id: 'merging',
    order: 5,
    title: 'Merging',
    summary: 'Fast-forward merges, merge commits and how Git combines two lines of work.',
    sections: [
      { heading: 'Fast-forward', body: 'If the branch you are on has no new commits since the other branch started, Git just moves your branch label forward. No merge commit is created.', commands: ['git switch main', 'git merge feature/login'] },
      { heading: 'Three-way merge', body: 'If both branches have new commits, Git compares each file in three versions: the common ancestor (merge base), yours and theirs. Changes on only one side are taken automatically, and a merge commit with two parents records the result. "--no-ff" forces a merge commit even when a fast-forward is possible.' },
    ],
    exercise_ids: ['fast-forward-merge'],
  },
  {
    id: 'conflicts',
    order: 6,
    title: 'Merge conflicts',
    summary: 'Why conflicts happen and the steps to resolve one.',
    sections: [
      { heading: 'Why conflicts happen', body: 'A conflict happens when both branches changed the same part of a file differently. Git cannot pick one, so it stops and writes both versions into the file between markers.' },
      { heading: 'The markers', body: 'The text between "<<<<<<< HEAD" and "=======" is your version; the text between "=======" and ">>>>>>> branch" is the incoming version. Edit the file to the content you want and delete all three marker lines.' },
      { heading: 'Finishing the merge', body: 'After editing, "git add <file>" marks it resolved and "git commit" creates the merge commit. "git merge --abort" cancels the merge and returns to the state before it.', commands: ['git status', 'git add app.txt', 'git commit -m "Merge feature into main"', 'git merge --abort'] },
    ],
    exercise_ids: ['resolve-conflict'],
  },
  {
    id: 'rebase',
    order: 7,
    title: 'Rebasing',
    summary: 'Replaying your commits on top of another branch for a straight history.',
    sections: [
      { heading: 'What rebase does', body: '"git rebase main" (run on your feature branch) takes the commits that are only on your branch and replays them one by one on top of main. The result looks as if you had started your work from the latest main. The replayed commits are new commits with new ids.' },
      { heading: 'When to use it, and when not', body: 'Rebase is useful to update a feature branch before opening a pull request. Do not rebase commits that other people already have (for example, a shared branch you have pushed), because it rewrites history they depend on. Merging is always safe for shared branches.' },
      { heading: 'In this simulator', body: 'The simulated rebase runs in one step. If replaying a commit would conflict, it stops and leaves your branch unchanged so you can merge instead.' },
    ],
    exercise_ids: ['rebase-feature'],
  },
  {
    id: 'cherry-pick',
    order: 8,
    title: 'Cherry-pick',
    summary: 'Copying one specific commit onto the current branch.',
    sections: [
      { heading: 'Picking a single change', body: '"git cherry-pick <commit>" applies the change introduced by that one commit onto your current branch as a new commit. It is used to bring a bug fix from one branch to another without merging everything else.', commands: ['git log --oneline --all', 'git cherry-pick 1a2b3c4'] },
    ],
    exercise_ids: ['cherry-pick-fix'],
  },
  {
    id: 'stash',
    order: 9,
    title: 'Stash',
    summary: 'Putting unfinished work aside to switch tasks.',
    sections: [
      { heading: 'Saving work in progress', body: '"git stash" saves your uncommitted changes to tracked files and resets the working directory to the last commit, so you can switch branches. "git stash list" shows saved entries. "git stash pop" restores the newest entry and removes it; "git stash apply" restores it and keeps it.', commands: ['git stash -m "half-done form"', 'git stash list', 'git stash pop'] },
      { heading: 'Untracked files', body: 'By default stash does not include untracked (never added) files. Add them first if you need them stashed.' },
    ],
    exercise_ids: ['stash-and-switch'],
  },
  {
    id: 'tags',
    order: 10,
    title: 'Tags',
    summary: 'Naming releases with tags.',
    sections: [
      { heading: 'Marking a release', body: 'A tag is a fixed name for a commit, usually a release such as v1.0.0. Unlike a branch, a tag does not move. "git tag v1.0.0" tags the current commit; "git tag v0.9.0 <commit>" tags an older one; "git tag" lists tags.', commands: ['git tag v1.0.0', 'git tag v0.9.0 HEAD~1', 'git tag', 'git push origin v1.0.0'] },
    ],
    exercise_ids: ['tag-release'],
  },
  {
    id: 'reset',
    order: 11,
    title: 'Reset',
    summary: 'Moving a branch back, with --soft, --mixed and --hard.',
    sections: [
      { heading: 'Three modes', body: '"git reset --soft <commit>" moves the branch back and keeps the undone changes staged. "--mixed" (the default) keeps them in the working directory but unstaged. "--hard" discards them completely. HEAD~1 means "one commit before HEAD".', commands: ['git reset --soft HEAD~1', 'git reset HEAD~1', 'git reset --hard HEAD~1'] },
      { heading: 'Use reset only on local history', body: 'Reset rewrites history. Use it for commits you have not pushed. For commits others already have, use git revert.' },
    ],
    exercise_ids: ['reset-bad-commit'],
  },
  {
    id: 'revert',
    order: 12,
    title: 'Revert',
    summary: 'Undoing a commit safely by adding a new commit.',
    sections: [
      { heading: 'Undo without rewriting', body: '"git revert <commit>" creates a new commit that applies the opposite of that commit\'s change. The original commit stays in history, which makes revert safe for shared branches.', commands: ['git log --oneline', 'git revert 1a2b3c4'] },
    ],
    exercise_ids: ['revert-shared-commit'],
  },
  {
    id: 'workflows',
    order: 13,
    title: 'Remotes and team workflows',
    summary: 'Pushing, pulling and the feature-branch workflow used with pull requests.',
    sections: [
      { heading: 'Remotes', body: 'A remote is another copy of the repository, such as one on GitHub, usually called origin. "git push origin <branch>" uploads your commits; "git pull" downloads new commits and merges them into your branch. A push is rejected if the remote has commits you do not have; pull first.', commands: ['git remote add origin https://github.com/you/project.git', 'git push -u origin main', 'git pull'] },
      { heading: 'Feature-branch workflow', body: 'Keep main deployable. For each change: update main, create a feature branch, commit small steps, push the branch, open a pull request, get a review, then merge. Delete the branch after merging.' },
      { heading: 'In this simulator', body: 'The remote is simulated inside the lab. Nothing is sent over the network and no GitHub account is used.' },
    ],
    exercise_ids: ['push-feature-branch'],
  },
];

export const GIT_EXERCISES: GitExercise[] = [
  {
    id: 'first-commit',
    lesson_id: 'init-and-areas',
    order: 1,
    title: 'Your first commit',
    difficulty: 'BEGINNER',
    instructions: 'Create a repository, create a file README.md containing any text, stage it and commit it. Finish with a clean working tree.',
    setup: [],
    checks: [
      { id: 'init', label: 'The folder is a Git repository', test: (r) => r.initialized },
      { id: 'commit', label: 'main has at least one commit', test: (r) => !!r.branches.main },
      { id: 'readme', label: 'README.md is in the latest commit', test: (r) => headTree(r)['README.md'] !== undefined },
      { id: 'clean', label: 'Nothing is left uncommitted', test: (r) => r.initialized && isClean(r) },
    ],
    hints: ['Start with "git init".', 'Create the file with: echo "My project" > README.md', 'Stage it with "git add README.md", then commit with: git commit -m "Add README"'],
    explanation: 'git init created the repository, echo created a file in the working directory, git add copied it to the staging area and git commit saved the staged snapshot as the first commit on main.',
    solution: ['git init', 'echo "My project" > README.md', 'git add README.md', 'git commit -m "Add README"'],
  },
  {
    id: 'stage-selectively',
    lesson_id: 'init-and-areas',
    order: 2,
    title: 'Commit only part of your work',
    difficulty: 'BEGINNER',
    instructions: 'You changed two files, login.js and styles.css. Commit only the change to login.js. Leave the change to styles.css uncommitted.',
    setup: ['git init', 'echo "function login() {}" > login.js', 'echo "body { margin: 0 }" > styles.css', 'git add .', 'git commit -m "Initial files"', 'echo "function login(user) { return !!user }" > login.js', 'echo "body { margin: 0; color: navy }" > styles.css'],
    checks: [
      { id: 'new-commit', label: 'A new commit was made on main', test: (r) => msgs(r, 'main').length >= 2 },
      { id: 'login', label: 'The new commit contains the login.js change', test: (r) => fileAt(r, 'main', 'login.js')?.includes('user') === true },
      { id: 'styles-not', label: 'The commit does not contain the styles.css change', test: (r) => fileAt(r, 'main', 'styles.css') === 'body { margin: 0 }' },
      { id: 'styles-kept', label: 'The styles.css change is still in your working directory', test: (r) => (r.workdir['styles.css'] || '').includes('navy') },
    ],
    hints: ['Run "git status" to see both modified files.', 'Stage just one file: git add login.js', 'Then commit: git commit -m "Validate user in login"'],
    explanation: 'Only staged changes go into a commit. Adding login.js alone left styles.css modified but unstaged, ready for a separate commit.',
    solution: ['git add login.js', 'git commit -m "Validate user in login"'],
  },
  {
    id: 'feature-branch',
    lesson_id: 'branches',
    order: 3,
    title: 'Work on a feature branch',
    difficulty: 'BEGINNER',
    instructions: 'Create a branch called feature/signup, switch to it, add a file signup.html and commit it there. main must not change.',
    setup: ['git init', 'echo "<h1>Home</h1>" > index.html', 'git add .', 'git commit -m "Add home page"'],
    checks: [
      { id: 'branch', label: 'Branch feature/signup exists', test: (r) => !!r.branches['feature/signup'] },
      { id: 'on-branch', label: 'You are on feature/signup', test: (r) => onBranch(r, 'feature/signup') },
      { id: 'committed', label: 'signup.html is committed on feature/signup', test: (r) => fileAt(r, 'feature/signup', 'signup.html') !== undefined },
      { id: 'main-same', label: 'main still has only the first commit', test: (r) => msgs(r, 'main').length === 1 },
    ],
    hints: ['Create and switch in one step: git switch -c feature/signup', 'Create the file: echo "<form></form>" > signup.html', 'Then git add signup.html and git commit -m "Add signup page"'],
    explanation: 'The new branch started at the same commit as main. Committing on it moved only the feature/signup label forward, so main stayed where it was.',
    solution: ['git switch -c feature/signup', 'echo "<form></form>" > signup.html', 'git add signup.html', 'git commit -m "Add signup page"'],
  },
  {
    id: 'fast-forward-merge',
    lesson_id: 'merging',
    order: 4,
    title: 'Merge a finished feature',
    difficulty: 'BEGINNER',
    instructions: 'The branch feature/footer is finished. Merge it into main and stay on main.',
    setup: ['git init', 'echo "<h1>Home</h1>" > index.html', 'git add .', 'git commit -m "Add home page"', 'git switch -c feature/footer', 'echo "<footer>2026</footer>" > footer.html', 'git add .', 'git commit -m "Add footer"', 'git switch main'],
    checks: [
      { id: 'on-main', label: 'You are on main', test: (r) => onBranch(r, 'main') },
      { id: 'merged', label: 'main contains the footer commit', test: (r) => !!r.branches['feature/footer'] && ancestors(r, r.branches.main!).has(r.branches['feature/footer']!) },
      { id: 'file', label: 'footer.html is in your working directory', test: (r) => r.workdir['footer.html'] !== undefined },
    ],
    hints: ['Make sure you are on main: git status', 'Merge the branch: git merge feature/footer'],
    explanation: 'main had no new commits since feature/footer started, so Git fast-forwarded: it moved the main label to the footer commit without creating a merge commit.',
    solution: ['git merge feature/footer'],
  },
  {
    id: 'resolve-conflict',
    lesson_id: 'conflicts',
    order: 5,
    title: 'Resolve a merge conflict',
    difficulty: 'INTERMEDIATE',
    instructions: 'Both main and feature/title changed the first line of app.txt. Merge feature/title into main, resolve the conflict so app.txt contains exactly "Title: Student Portal", and finish the merge with a commit.',
    setup: ['git init', 'echo "Title: Portal" > app.txt', 'git add .', 'git commit -m "Add app"', 'git switch -c feature/title', 'echo "Title: Student Portal" > app.txt', 'git commit -am "Rename title"', 'git switch main', 'echo "Title: Campus Portal" > app.txt', 'git commit -am "Change title on main"'],
    checks: [
      { id: 'merge-commit', label: 'main has a merge commit with two parents', test: (r) => { const id = r.branches.main; return !!id && r.commits[id].parents.length === 2; } },
      { id: 'no-markers', label: 'app.txt has no conflict markers', test: (r) => !hasMarkers(fileAt(r, 'main', 'app.txt')) && !hasMarkers(r.workdir['app.txt']) },
      { id: 'content', label: 'app.txt contains exactly "Title: Student Portal"', test: (r) => fileAt(r, 'main', 'app.txt') === 'Title: Student Portal' },
      { id: 'done', label: 'The merge is finished (nothing in progress)', test: (r) => !r.merge },
    ],
    hints: ['Start the merge: git merge feature/title', 'Look at the conflict with "cat app.txt", then overwrite the file: echo "Title: Student Portal" > app.txt', 'Mark it resolved with "git add app.txt", then "git commit -m "Merge feature/title""'],
    explanation: 'Both branches changed the same line, so Git stopped and wrote both versions with markers. Rewriting the file, adding it and committing created a merge commit whose two parents are the tips of main and feature/title.',
    solution: ['git merge feature/title', 'echo "Title: Student Portal" > app.txt', 'git add app.txt', 'git commit -m "Merge feature/title"'],
  },
  {
    id: 'rebase-feature',
    lesson_id: 'rebase',
    order: 6,
    title: 'Update a feature branch with rebase',
    difficulty: 'INTERMEDIATE',
    instructions: 'main moved on after you started feature/search. Rebase feature/search onto main so its history is a straight line on top of main, without a merge commit.',
    setup: ['git init', 'echo "v1" > core.txt', 'git add .', 'git commit -m "Core v1"', 'git switch -c feature/search', 'echo "search()" > search.js', 'git add .', 'git commit -m "Add search"', 'git switch main', 'echo "v2" > core.txt', 'git commit -am "Core v2"', 'git switch feature/search'],
    checks: [
      { id: 'on-branch', label: 'You are on feature/search', test: (r) => onBranch(r, 'feature/search') },
      { id: 'on-top', label: 'feature/search starts from the latest main', test: (r) => !!r.branches.main && !!r.branches['feature/search'] && mergeBase(r, r.branches['feature/search']!, r.branches.main!) === r.branches.main },
      { id: 'linear', label: 'No merge commits on feature/search', test: (r) => branchCommits(r, 'feature/search').every((c) => c.parents.length <= 1) },
      { id: 'kept', label: 'Your search.js commit is still there', test: (r) => fileAt(r, 'feature/search', 'search.js') === 'search()' && fileAt(r, 'feature/search', 'core.txt') === 'v2' },
    ],
    hints: ['Check where branches point: git log --oneline --all', 'While on feature/search run: git rebase main'],
    explanation: 'Rebase replayed the "Add search" commit on top of "Core v2". The replayed commit has a new id because its parent changed, and the branch history is now linear.',
    solution: ['git rebase main'],
  },
  {
    id: 'cherry-pick-fix',
    lesson_id: 'cherry-pick',
    order: 7,
    title: 'Bring one fix to main',
    difficulty: 'INTERMEDIATE',
    instructions: 'The branch experiment has two commits: "Fix typo in about page" and "Try new layout". Bring only the typo fix to main.',
    setup: ['git init', 'echo "Abuot us" > about.txt', 'echo "grid" > layout.txt', 'git add .', 'git commit -m "Add pages"', 'git switch -c experiment', 'echo "About us" > about.txt', 'git commit -am "Fix typo in about page"', 'echo "flex" > layout.txt', 'git commit -am "Try new layout"', 'git switch main'],
    checks: [
      { id: 'on-main', label: 'You are on main', test: (r) => onBranch(r, 'main') },
      { id: 'fixed', label: 'main has the typo fix', test: (r) => fileAt(r, 'main', 'about.txt') === 'About us' },
      { id: 'no-layout', label: 'main does not have the layout experiment', test: (r) => fileAt(r, 'main', 'layout.txt') === 'grid' },
      { id: 'not-merged', label: 'experiment was not merged', test: (r) => !!r.branches.main && r.commits[r.branches.main].parents.length === 1 && !ancestors(r, r.branches.main).has(r.branches.experiment!) },
    ],
    hints: ['Find the fix commit id: git log --oneline --all', 'Copy that one commit: git cherry-pick <first 7 characters of the id>'],
    explanation: 'cherry-pick took the change made by the typo commit (relative to its parent) and applied it to main as a new commit, leaving the layout commit behind.',
    solution: ['git log --oneline --all', 'git cherry-pick experiment~1'],
  },
  {
    id: 'stash-and-switch',
    lesson_id: 'stash',
    order: 8,
    title: 'Pause work for an urgent fix',
    difficulty: 'INTERMEDIATE',
    instructions: 'You have unfinished edits in form.js on main. An urgent fix is needed: put your edits aside, switch to the existing branch hotfix, commit a file fix.txt there, come back to main and restore your edits.',
    setup: ['git init', 'echo "form v1" > form.js', 'git add .', 'git commit -m "Add form"', 'git branch hotfix', 'echo "form v2 (unfinished)" > form.js'],
    checks: [
      { id: 'fix', label: 'fix.txt is committed on hotfix', test: (r) => fileAt(r, 'hotfix', 'fix.txt') !== undefined },
      { id: 'fix-clean', label: 'The hotfix commit does not include your unfinished form.js edit', test: (r) => fileAt(r, 'hotfix', 'form.js') === 'form v1' },
      { id: 'back', label: 'You are back on main', test: (r) => onBranch(r, 'main') },
      { id: 'restored', label: 'Your unfinished form.js edit is restored', test: (r) => r.workdir['form.js'] === 'form v2 (unfinished)' },
      { id: 'stash-empty', label: 'The stash is empty again (you used pop)', test: (r) => r.stash.length === 0 && r.history.some((h) => /^git stash( push| save)?( |$)/.test(h)) },
    ],
    hints: ['Save your edits: git stash', 'git switch hotfix, then create and commit fix.txt', 'git switch main, then git stash pop'],
    explanation: 'git stash saved the form.js edit and cleaned the working directory, so the hotfix commit only had the fix. git stash pop put the edit back on main and removed the stash entry.',
    solution: ['git stash', 'git switch hotfix', 'echo "patched" > fix.txt', 'git add fix.txt', 'git commit -m "Urgent fix"', 'git switch main', 'git stash pop'],
  },
  {
    id: 'tag-release',
    lesson_id: 'tags',
    order: 9,
    title: 'Tag two releases',
    difficulty: 'BEGINNER',
    instructions: 'Tag the latest commit on main as v1.1.0 and the commit before it as v1.0.0.',
    setup: ['git init', 'echo "1.0" > version.txt', 'git add .', 'git commit -m "Release 1.0"', 'echo "1.1" > version.txt', 'git commit -am "Release 1.1"'],
    checks: [
      { id: 'v11', label: 'v1.1.0 points at "Release 1.1"', test: (r) => !!r.tags['v1.1.0'] && r.commits[r.tags['v1.1.0']].message === 'Release 1.1' },
      { id: 'v10', label: 'v1.0.0 points at "Release 1.0"', test: (r) => !!r.tags['v1.0.0'] && r.commits[r.tags['v1.0.0']].message === 'Release 1.0' },
    ],
    hints: ['Tag the current commit: git tag v1.1.0', 'Tag the previous commit: git tag v1.0.0 HEAD~1'],
    explanation: 'Tags are fixed names. HEAD~1 refers to the parent of the current commit, so the older release could be tagged without checking it out.',
    solution: ['git tag v1.1.0', 'git tag v1.0.0 HEAD~1'],
  },
  {
    id: 'reset-bad-commit',
    lesson_id: 'reset',
    order: 10,
    title: 'Throw away a local commit',
    difficulty: 'INTERMEDIATE',
    instructions: 'Your last commit "Add debug logging" was a mistake and was never pushed. Remove it from main completely, including its changes.',
    setup: ['git init', 'echo "app" > app.js', 'git add .', 'git commit -m "Add app"', 'echo "console.log(secret)" > debug.js', 'git add .', 'git commit -m "Add debug logging"'],
    checks: [
      { id: 'gone', label: '"Add debug logging" is no longer on main', test: (r) => !msgs(r, 'main').includes('Add debug logging') },
      { id: 'kept', label: '"Add app" is still the tip of main', test: (r) => tipMsg(r, 'main') === 'Add app' },
      { id: 'clean', label: 'debug.js is gone and the working tree is clean', test: (r) => !('debug.js' in r.workdir) && isClean(r) },
    ],
    hints: ['HEAD~1 is the commit before the current one.', 'Use the mode that also discards the changes: git reset --hard HEAD~1'],
    explanation: 'reset --hard moved main back one commit and made the staging area and working directory match it, so the debug file was discarded. This is fine only because the commit was never shared.',
    solution: ['git reset --hard HEAD~1'],
  },
  {
    id: 'revert-shared-commit',
    lesson_id: 'revert',
    order: 11,
    title: 'Undo a pushed commit safely',
    difficulty: 'INTERMEDIATE',
    instructions: 'The commit "Set timeout to 1" broke the app and is already on the shared main branch. Undo its change without rewriting history.',
    setup: ['git init', 'echo "timeout=30" > config.ini', 'echo "app" > app.js', 'git add .', 'git commit -m "Add config"', 'echo "timeout=1" > config.ini', 'git commit -am "Set timeout to 1"', 'echo "app v2" > app.js', 'git commit -am "Improve app"'],
    checks: [
      { id: 'history', label: 'The original commit is still in history', test: (r) => msgs(r, 'main').includes('Set timeout to 1') },
      { id: 'revert', label: 'A new revert commit is the tip of main', test: (r) => /^Revert "Set timeout to 1"/.test(tipMsg(r, 'main') || '') },
      { id: 'config', label: 'config.ini is back to timeout=30', test: (r) => fileAt(r, 'main', 'config.ini') === 'timeout=30' },
      { id: 'later', label: 'The later "Improve app" change is kept', test: (r) => fileAt(r, 'main', 'app.js') === 'app v2' },
    ],
    hints: ['Find the commit: git log --oneline', 'It is two commits back, so: git revert HEAD~1'],
    explanation: 'revert created a new commit applying the opposite of "Set timeout to 1". History was only added to, so anyone who already pulled main is not affected.',
    solution: ['git revert HEAD~1'],
  },
  {
    id: 'push-feature-branch',
    lesson_id: 'workflows',
    order: 12,
    title: 'Push a feature branch for review',
    difficulty: 'ADVANCED',
    instructions: 'The repository has a simulated remote called origin. Create a branch feature/profile from main, commit a file profile.md on it, and push the branch to origin so it could be opened as a pull request. Do not commit to main.',
    setup: ['git init', 'echo "# App" > README.md', 'git add .', 'git commit -m "Initial commit"', 'git remote add origin https://example.test/student/app.git', 'git push origin main'],
    checks: [
      { id: 'branch', label: 'feature/profile exists and has profile.md', test: (r) => fileAt(r, 'feature/profile', 'profile.md') !== undefined },
      { id: 'pushed', label: 'origin has feature/profile at the same commit', test: (r) => !!r.remote && !!r.branches['feature/profile'] && r.remote.branches['feature/profile'] === r.branches['feature/profile'] },
      { id: 'main', label: 'main was not changed', test: (r) => msgs(r, 'main').length === 1 && r.remote?.branches.main === r.branches.main },
    ],
    hints: ['git switch -c feature/profile', 'Create, add and commit profile.md', 'git push origin feature/profile'],
    explanation: 'Pushing the feature branch made it available on the remote, where a pull request can compare it with main. main stayed untouched until the review is done.',
    solution: ['git switch -c feature/profile', 'echo "profile" > profile.md', 'git add profile.md', 'git commit -m "Add profile page"', 'git push origin feature/profile'],
  },
];

export function evaluateExercise(ex: GitExercise, r: SimRepo) {
  const results = ex.checks.map((c) => {
    let passed = false;
    try {
      passed = !!c.test(r);
    } catch {
      passed = false;
    }
    return { id: c.id, label: c.label, passed };
  });
  return { passed: results.every((c) => c.passed), checks: results };
}

export { getStatus, headCommit };
