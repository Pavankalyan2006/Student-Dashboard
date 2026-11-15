# Personal AI University OS: Phase 3 (Academic Intelligence) report

Date: 2026-11-15. Branch `claude/project-thread-lyg4zq`. This follows PR #16 (Phases 0 to 2, merged and verified live).

## Phase 3 scope against the brief

| Brief module | What this PR does |
| --- | --- |
| Academic Intelligence (grading rules, what-if) | Extends Grades & CGPA with a **What-if simulator**. The grading rules are already there: the scales, credit weighting, backlogs and the target planner. |
| Previous Papers Intelligence | New **Previous Papers** page. It reads text, text PDFs and `.txt` files. OCR for scanned papers is infrastructure-dependent (see below). |
| Virtual University Lab | New **Virtual Lab** with six simulators: OS (3), Networks, Digital Logic and DBMS. Data structures are already covered by the DSA Lab visualiser, and AI/ML by the AI/ML Lab, so neither is duplicated. |
| Smart Notebook | Not changed in this PR. Notes already exists, with AI actions, and My AI Brain (PR #16) answers questions across notes with citations. Further notebook work goes in a later phase. |

## Deliverables

### 1. New pages

**Virtual Lab** (`/virtual-lab`, alias `/simulators`, under Practice in the sidebar). Every simulator runs in the browser, so no student input is executed on the server. Each one has an "Explain with AI Tutor" button that sends the inputs and the simulator's own results to the tutor.

- **CPU scheduling:** FCFS, SJF, SRTF, Round Robin (with a quantum), and Priority, both preemptive and not. It shows a Gantt chart with idle time, and per-process completion, turnaround, waiting and response times, with averages and CPU busy %.
- **Page replacement:** FIFO, LRU and Optimal side by side. A frame-by-frame table marks each hit and miss.
- **Disk scheduling:** FCFS, SSTF, SCAN, C-SCAN, LOOK and C-LOOK, with total head movement, a head-path chart and the service order.
- **Subnetting:** network, broadcast, mask, wildcard, binary mask, host range, class and RFC 1918 private range. It can split a network into equal subnets.
- **Logic and K-map:** parses AND, OR, NOT, XOR, NAND, NOR and XNOR in symbol and word forms. It shows the truth table and minterms, and simplifies the expression to a sum of products with Quine-McCluskey.
- **Normalization:** attribute closure, candidate keys, and the highest normal form up to BCNF, with each violating dependency explained.

**Previous Papers** (`/previous-papers`, under Assessments in the sidebar). The student adds their own past papers for a subject in their syllabus, by pasting text or uploading a text PDF or `.txt` file of up to 5 MB.

- Questions, unit headings and marks are found automatically.
- Each question is matched to the student's syllabus topics. Combined topic names such as "Paging, Segmentation & Page Replacement" match on any part, plurals and possessives are folded, and filler words are ignored.
- The page shows:
  - topics ranked by how many papers ask them, with years, marks and the questions themselves
  - each topic's Knowledge Graph state
  - "focus topics": asked in at least half the papers but not yet demonstrated
  - topics never asked
  - questions that matched no topic, listed as they are instead of being guessed onto one
- "Plan revision with AI Tutor" hands the ranking to the tutor.

### 2. Enhanced pages

**Grades & CGPA** gets a **What-if simulator** panel:

- Change any subject's grade, or add a future semester's SGPA and credits.
- See the projected CGPA and how much it changes. Nothing is saved, and the "Saved" state of the page does not change.

### 3. Navigation

- Practice → Virtual Lab
- Assessments → Previous Papers

### 4. APIs

All routes need sign-in, and identity comes from the verified session.

- `GET /api/v1/previous-papers/me`: the papers (without question text) and an analysis for each subject that has papers.
- `POST /api/v1/previous-papers/me`, with `{subject_id, title?, year?, exam?, text?}` or `{..., file: {name, data}}`.
- `DELETE /api/v1/previous-papers/me/:paperId`

The simulators and the what-if panel need no API. They use pure modules shared with the tests.

### 5. Database and migrations

There are no migrations. One new persisted store, `previousPapers`, is registered with the existing state store. It keeps at most 40 papers per student, and only the split questions (at most 200 per paper, 600 characters each). The uploaded file itself is not kept.

### 6. AI integrations

Every simulator and the Previous Papers page can prefill the AI Tutor with the student's inputs and the computed results. All numbers come from the deterministic simulators, not the AI.

### 7. Security and validation

- **Uploads:**
  - The data must be base64, at most 5 MB, and either `.pdf` or `.txt`.
  - A PDF must start with `%PDF-`. A `.txt` file containing NUL bytes is refused.
  - Any other type is refused.
- **Scanned PDFs** are detected and refused with a clear message to paste the text instead. The questions are never guessed.
- **Subject ownership:** a paper can only be added to a subject in the caller's own syllabus. Student B using A's subject id gets a 400, and deleting A's paper gets a 404.
- **Other limits:** years from 1990 to next year, and text up to 200,000 characters.
- **Bug fixed in Grades:** when a client saved subjects without ids, two subjects in different semesters could get the same id, because the id was the timestamp plus the row number. Ids are now unique across the whole record. The what-if panel exposed this.

### 8. Tests

- `src/tests/virtual_lab_whatif.test.ts` (13 tests). Results are checked against standard textbook answers:
  - SRTF average waiting time of 6.5 for the classic four-process example.
  - FIFO, LRU and OPT give 15, 12 and 9 faults on the classic reference string with 3 frames.
  - FCFS, SSTF and SCAN head movements of 640, 236 and 236. LOOK moving up gives 299.
  - Subnets of a /26 network.
  - Quine-McCluskey simplification.
  - Candidate keys and 1NF, 2NF, 3NF and BCNF examples.
  - The what-if projections.
  - Unique subject ids.
- `src/tests/previous_papers.test.ts` (6 tests):
  - Splitting questions, units and marks.
  - Matching compound topics.
  - Ranking and focus topics.
  - Over HTTP with two real accounts: 401s, ownership, validation (no questions found, bad year, a fake PDF, a disallowed file type), `.txt` upload, and delete.
- Results:
  - `npm test`: **74 files passed, 2 skipped; 1,094 tests passed, 10 skipped, 0 failed.**
  - `tsc --noEmit`: clean.
  - `npm run build`: succeeds.
- **Browser check** (Playwright, seeded account):
  - All three pages render at 1440 px and 390 px with no horizontal overflow and no page errors.
  - A real text PDF made with Chromium's print-to-PDF was uploaded. It gave 3 questions, two of them matched to OS syllabus topics with their Knowledge Graph state.
  - The what-if panel moved CGPA from 9 to 8.25 for a B in a 4-credit subject, and the page stayed "Saved".

Screenshots:

- `screenshots/virtual-lab-cpu.png`
- `screenshots/virtual-lab-disk.png`
- `screenshots/virtual-lab-normalization.png`
- `screenshots/virtual-lab-mobile.png`
- `screenshots/previous-papers.png`
- `screenshots/what-if-cgpa.png`

### 9. Known limitations

- **Scanned papers need OCR**, which is not configured on this deployment. Such papers are refused with a message.
- **Topic matching:** a question is matched only when it names a topic, or part of one, in words. Questions phrased very differently from the syllabus wording appear under "not matched".
- **Logic simplification:** the Quine-McCluskey cover picks essential prime implicants first, then the fewest extra. For some functions with cyclic covers, a different minimal form of the same size exists.
- **Normalization:** the tool reports the highest normal form and the dependencies that violate it. Decomposition is left to the AI Tutor explanation.

### 10. Environment variables and external configuration

None new.

### 11. Status by feature

| Feature | Status |
| --- | --- |
| What-if CGPA simulator | Fully implemented |
| Virtual Lab (6 simulators) | Fully implemented |
| Previous Papers (text, text PDF, .txt) | Fully implemented |
| Previous Papers from scanned PDFs or photos | Infrastructure-dependent (needs an OCR service) |

## Files

- New:
  - `src/features/virtual-lab/sims/{os,net,logic,dbms}.ts`
  - `src/features/virtual-lab/pages/VirtualLabPage.tsx`
  - `src/features/academics/components/WhatIfPanel.tsx`
  - `server/services/paperMath.ts`
  - `server/services/previousPapersService.ts`
  - `src/features/previous-papers/pages/PreviousPapersPage.tsx`
  - the two test files
  - this report and its screenshots
- Changed:
  - `server/services/academicMath.ts`: adds `whatIfCgpa`.
  - `server/services/academicRecordsService.ts`: unique subject ids.
  - `server/api/routes/personalIntelligence.ts`
  - `server/app.ts`
  - `src/App.tsx`
  - `src/components/navigation/navConfig.ts`
  - `src/features/academics/pages/GradesPage.tsx`

## Next

- **Phase 4, Engineering:**
  - Code review on the existing AI.
  - Architecture Studio extends the System Design Lab.
  - Educational cybersecurity labs with no real targets.
  - Code execution stays off until an isolated sandbox is configured.
- **Phases 5 to 8:** Career, Research, Cross-platform and QA.
