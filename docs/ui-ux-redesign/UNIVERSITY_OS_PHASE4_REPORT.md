# Personal AI University OS: Phase 4 (Engineering workspace) report

Date: 2026-11-15. Branch `claude/project-thread-lyg4zq`. This follows PR #17 (Phase 3, merged and verified live).

## Phase 4 scope against the brief

| Brief module | What this PR does |
| --- | --- |
| Code Review Intelligence (Module 10) | New **Code Review** page. Automated checks with line numbers run on every review. The AI review adds line-level findings, complexity and test ideas when a model is available. The student accepts, rejects or modifies each finding, and reviews are kept as history. |
| Architecture Studio (Module 11) | Extends the **System Design Lab** with an **Architecture Studio** tab. It holds editable class, sequence, flowchart/activity and ER diagrams, and offers AI drafts (an architecture for the existing designer canvas, or a diagram). |
| Developer Workspace (Module 9) | Not changed. The Coding Lab is still the editor (Monaco). Running code depends on the sandbox level the server can provide: in production it runs only with namespace isolation. A multi-file IDE with a terminal is not in this PR. |
| Cybersecurity Lab (Module 12) | **Not done.** Not built in this phase. |

## Deliverables

### 1. New pages

**Code Review** (`/code-review`, under Practice in the sidebar, next to Coding Lab).

- **Sources:**
  - Paste or upload up to 5 files (20,000 characters each, 40,000 in total).
  - Pick the student's own saved Coding Lab code.
  - Pick a file from a GitHub repository they have connected.
- **Automated checks** (deterministic, with line numbers), for Python, JavaScript, TypeScript, Java, C and C++:
  - **Security:** secrets written in code, eval/exec, SQL built by joining strings, `gets`, unbounded `strcpy`/`sprintf`, `scanf("%s")` without a width, `shell=True`/`os.system`, unsafe `pickle`/`yaml.load`, HTML inserted with `innerHTML`, and weak hashes.
  - **Correctness:** `== None`, mutable default arguments, loose `==` in JS, assignment inside a condition, and Java strings compared with `==`.
  - **Error handling:** bare `except`, `except: pass`, and empty `catch`.
  - **Readability and maintenance:** long lines, long functions, deep nesting, TODOs, leftover `console.log`, naming, and missing docstrings.
  - **Testing:** a note when no tests are present.
- **Per-function metrics:**
  - Cyclomatic complexity (above 10 is flagged).
  - Loop nesting, with a time-complexity estimate labelled as a heuristic.
  - Recursion detection.
- **AI review:**
  - An overall summary and a note for each area: correctness, readability, maintainability, performance, error handling, security, testing, documentation and architecture.
  - Line-level findings with severity, explanation, suggestion, a corrected example and the concept behind it.
  - Time and space complexity, and test suggestions with inputs and expected results.
- **Decisions and history:** each finding can be accepted, rejected or marked **Modified** with a note on what the student changed. Each finding has "Ask AI Tutor". The history keeps the last 20 reviews.
- **Honesty:** every review shows the statement that it does not prove the code is correct, secure or bug-free. When the AI is unavailable, the page says so and shows the automated checks. Nothing is substituted for the AI part.

**Architecture Studio** (a new tab in the System Design Lab at `/system-design`). This extends the existing lab; it does not duplicate it.

- **Diagrams** are written in a small text language and drawn live as SVG:
  - **Class (UML):** inheritance, realisation, composition, aggregation, association and dependency, with multiplicities, labels and stereotypes.
  - **Sequence (UML):** participants and actors, calls, replies, async messages, self-calls and notes.
  - **Flowchart / activity:** start/end, steps, decisions, input/output, labelled and dashed arrows.
  - **Entity relationship:** primary and foreign keys and crow's-foot cardinalities.
- **Editing:**
  - The text is the editable source. Each kind starts from an example.
  - Mistakes are reported with their line number.
  - Up to 20 diagrams are saved with the design project.
  - **From my database design** draws the Database Design tab's tables as an ER diagram.
  - Each diagram exports as SVG or PNG.
- **Start from a description:**
  - The student describes an application in plain language.
  - The AI drafts either a system architecture or a diagram of any of the four kinds.
  - An architecture draft lists components and connections, the reasoning, trade-offs, bottlenecks, how to scale and its assumptions.
  - "Open on the canvas" puts it on the existing Architecture Designer canvas, where the student edits it and saves it. Nothing is saved until they press Save.

### 2. Enhanced pages

- System Design Lab: the new Architecture Studio tab, and an optional `diagrams` field on design projects.

### 3. Navigation

- Practice → Code Review.

### 4. APIs

All routes need sign-in, and identity comes from the verified session.

- `GET /api/v1/code-review/me`: review history (summaries).
- `POST /api/v1/code-review/me`, with `{title?, files: [{name, content, language?}]}`, or `{saved_code_id}`, or `{github: {repo_id, path}}`, and optionally `ai: false`.
- `GET /api/v1/code-review/me/:reviewId`
- `PATCH /api/v1/code-review/me/:reviewId/findings/:findingId`, with `{status: accepted|rejected|modified|open, note?}`. A note is required for `modified`.
- `DELETE /api/v1/code-review/me/:reviewId`
- `POST /api/v1/system-design/architecture/propose`, with `{description}`.
- `POST /api/v1/system-design/diagrams/propose`, with `{kind, description}`.
- `PATCH /api/v1/system-design/projects/:id` (existing) now accepts and validates `diagrams`.

The review POST and both `propose` routes count as AI requests for the AI rate limiter.

### 5. Database and migrations

There are no migrations.

- One new persisted store, `codeReview`, is registered with the existing state store. It keeps at most 20 reviews per student, with their files.
- Diagrams are stored inside the existing System Design project record.

### 6. AI integrations

- **Code review:**
  - Passwords and keys are redacted (the existing GitHub secret redactor) before code is sent to the AI.
  - The prompt gives numbered lines and the automated findings, so the AI cites real lines and does not repeat them.
  - Every AI finding is checked: it must name a file that was sent, and a line that does not exist in that file is dropped. Severity and category must come from fixed lists.
- **Architecture drafts:** only known component types and protocols are kept. Connections must join two real components. Components are laid out automatically. Anything dropped is counted and shown.
- **Diagram drafts** must parse. A draft with nothing drawable is refused (502) rather than shown.
- **Agent switch:** all three AI features respect the Coding agent switch in the AI Agent Control Center. With it off, code review runs only the automated checks, and drafts return 409.

### 7. Security and validation

- **Code:** no submitted code is executed. Uploads must be text (NUL bytes are refused). Size limits are enforced on the server.
- **Ownership:**
  - Saved code and GitHub files are read only through the existing ownership-checked services. Student B using A's saved code id is refused.
  - B gets 404 for A's reviews, findings and deletes.
- **Diagrams:** every piece of user text in an SVG is escaped. A test checks that `<script>` and `<img onerror>` in a diagram come out as text.
- **Limits:**
  - At most 60 nodes and 120 edges per diagram, and 10,000 characters of source.
  - Diagram kinds are validated on save.

### 8. Tests

- `src/tests/code_review.test.ts` (13 tests):
  - Rules land on the right lines for Python and C.
  - Text in strings and comments is ignored.
  - Function metrics: complexity, loop nesting (sibling loops are not nested) and recursion.
  - Complexity flags, test detection and language detection.
  - AI output validation.
  - Over HTTP with two accounts: 401s, the rate-limit classification, the AI-unavailable path, redaction before the AI, accept/modify/reject, history, cross-account 404s, saved-code ownership, input limits, and the agent switch.
- `src/tests/architecture_studio.test.ts` (11 tests):
  - All four templates draw.
  - Escaping.
  - Error lines.
  - UML relations and multiplicities.
  - ER cardinalities and conversion from Database Design.
  - Architecture draft validation.
  - Over HTTP: validation, a checked draft, AI unavailable (503), an undrawable diagram (502), the agent switch (409), and diagrams saved and validated on the student's own project.
- Results:
  - `npm test`: **76 files passed, 2 skipped; 1,118 tests passed, 10 skipped, 0 failed.**
  - `npm run lint` (`tsc --noEmit`): clean.
  - `npm run build`: succeeds.
- **Browser check** (Playwright, seeded account, local server without an AI key):
  - Code Review at 1440 px and 390 px, with no horizontal overflow and no page errors.
  - A Python file gave 9 findings on the right lines, and the page stated that the AI review was unavailable.
  - Accepting a finding updated the history.
  - The Architecture Studio drew all four diagram kinds and showed a line error for a bad line. Diagrams saved to the project.
  - "Draft with AI" showed the provider-unavailable message instead of a made-up draft.

Screenshots:

- `screenshots/code-review.png`
- `screenshots/code-review-mobile.png`
- `screenshots/architecture-studio.png`
- `screenshots/architecture-studio-mobile.png`
- `screenshots/architecture-studio-sequence.png`
- `screenshots/architecture-studio-flowchart.png`
- `screenshots/architecture-studio-er.png`

### 9. Known limitations

- **The automated checks are text heuristics, not a compiler or a full static analyser.** No external tools (ESLint, Pylint, cppcheck) are installed on the serverless deployment. Function detection can miss unusual layouts, and a braceless loop nested in another is counted as a sibling.
- **Time complexity** from loop nesting is a hint for the student to check. The AI's complexity notes are its own analysis.
- **Diagrams** are edited as text with a live drawing, not by dragging boxes. Dragging already exists for the Architecture Designer canvas. Layout is automatic, and very dense diagrams can have crossing lines.
- **PDF export** is not offered. SVG and PNG are.
- **A GitHub file** can only be reviewed after the student has connected GitHub and imported the repository.

### 10. Environment variables and external configuration

None new. The AI features use the existing AI provider configuration.

### 11. Status by feature

| Feature | Status |
| --- | --- |
| Code Review: automated checks, metrics, decisions, history | Fully implemented |
| Code Review: AI review | Implemented; needs the configured AI provider (shows a clear message without it) |
| Architecture Studio: class, sequence, flowchart, ER diagrams, save, SVG/PNG export | Fully implemented |
| Architecture Studio: AI architecture and diagram drafts | Implemented; needs the configured AI provider |
| Developer Workspace (multi-file IDE, terminal) | Not in this PR; Coding Lab remains the editor |
| Cybersecurity Lab | Not done |

## Files

- New:
  - `server/services/codeReviewMath.ts`
  - `server/services/codeReviewService.ts`
  - `server/api/routes/codeReview.ts`
  - `server/services/diagramDsl.ts`
  - `server/services/architectureStudioService.ts`
  - `src/features/code-review/pages/CodeReviewPage.tsx`
  - `src/features/system-design/components/ArchitectureStudio.tsx`
  - the two test files
  - this report and its screenshots
- Changed:
  - `server/api/router.ts`
  - `server/api/routes/systemDesign.ts`
  - `server/services/systemDesignService.ts`: validates `diagrams`.
  - `server/models/systemDesignTypes.ts`: `StudioDiagram`.
  - `server/middleware/rateLimiter.ts`
  - `server/app.ts`
  - `src/App.tsx`
  - `src/components/navigation/navConfig.ts`
  - `src/features/system-design/pages/SystemDesignLabPage.tsx`

## Next

- **Phase 5, Career:** Career Roadmap Generator, AI Interview Arena (extends Mock Interviews), Student Digital Portfolio (extends Showcase) and the Hackathon and Competition Hub.
- **Phases 6 to 8:** Research, Cross-platform and QA.
