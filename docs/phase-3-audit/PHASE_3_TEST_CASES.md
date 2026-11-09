# Phase 3 Test Cases

Every row below was executed; nothing is listed that was only planned. Two kinds of tests:

1. **HTTP and browser probes** (`scripts/audit/phase3-*.cjs`) against a running server with synthetic students A and B.
   `create` runs first, the server is restarted on the same snapshot, then `verify` reads the data back. Raw output is in
   `docs/phase-3-audit/evidence/`. TC ids below are numbered from that output.
2. **Unit and service tests** (`src/tests/*.test.ts`, Vitest). Full run: **931/931 passed** in 60 files.

No AI provider is configured in this environment. AI paths are tested two ways: without a model they must answer
503 `AI_UNAVAILABLE` and save nothing (probes), and with a stubbed model (`stubModel` in `src/tests/helpers/mockAIModel.ts`)
for parsing, validation and prompt isolation (unit tests). Live calls to GitHub, Codeforces, OpenAlex and Remotive are
blocked by this container's network; only their failure paths and mocked responses are tested.

## How to run

```bash
npx tsc --noEmit -p .          # type check
npx vitest run                 # unit and service tests
# server for the probes
PORT=3400 DATA_SNAPSHOT_PATH=/tmp/p3/snap.json npx tsx server.ts
BASE=http://localhost:3400 node scripts/audit/phase3-batch1.cjs create   # ...batch2, batch3, batch4
# restart the server with the same DATA_SNAPSHOT_PATH, then
BASE=http://localhost:3400 node scripts/audit/phase3-batch1.cjs verify
# everything at once (needs a restart script that keeps DATA_SNAPSHOT_PATH; "fresh" as $1 deletes it)
BASE=http://localhost:3400 RESTART=./restart.sh scripts/audit/phase3-regression.sh
```

Other probes: `phase3-integration.cjs`, `phase3-e2e-extra.cjs`, `phase3-demo-account.cjs`, `phase3-unauth-sweep.cjs`,
`phase3-responsive.cjs`, `phase3-batch4-ui.cjs`, `phase3-resume-ui.cjs`, `phase3-gitlab-ui.cjs`, and the RAG evaluation
`scripts/audit/phase3-rag-eval.ts`.

## Probe test cases (228 executed, 228 PASS, 0 FAIL)

| ID | Module | Check | Result | Source |
|---|---|---|---|---|
| TC-001 | Mock Interviews | MI types list | PASS | `phase3-batch1.cjs create` |
| TC-002 | Mock Interviews | MI resume interview without a resume is refused (400) | PASS | `phase3-batch1.cjs create` |
| TC-003 | Mock Interviews | MI DSA interview asks a coding question (was a fixed microservices question) | PASS | `phase3-batch1.cjs create` |
| TC-004 | Mock Interviews | MI create CODING session | PASS | `phase3-batch1.cjs create` |
| TC-005 | Mock Interviews | MI report before finishing is 409 and does not complete the session | PASS | `phase3-batch1.cjs create` |
| TC-006 | Mock Interviews | MI student B cannot open the session (403) | PASS | `phase3-batch1.cjs create` |
| TC-007 | Mock Interviews | MI junk answer scores 0 (no length bonus or minimum) | PASS | `phase3-batch1.cjs create` |
| TC-008 | Mock Interviews | MI re-answering the same question is refused | PASS | `phase3-batch1.cjs create` |
| TC-009 | Mock Interviews | MI answer naming the reference concepts gets full keyword coverage | PASS | `phase3-batch1.cjs create` |
| TC-010 | Mock Interviews | MI no question repeated within the interview | PASS | `phase3-batch1.cjs create` |
| TC-011 | Mock Interviews | MI interview completes | PASS | `phase3-batch1.cjs create` |
| TC-012 | Mock Interviews | MI report labelled as keyword check, not a hiring assessment | PASS | `phase3-batch1.cjs create` |
| TC-013 | Mock Interviews | MI report has no canned communication observations | PASS | `phase3-batch1.cjs create` |
| TC-014 | Mock Interviews | MI report duration comes from answer timings (no 30-min default) | PASS | `phase3-batch1.cjs create` |
| TC-015 | Mock Interviews / Placement | Placement interview endpoint creates a session in the same history | PASS | `phase3-batch1.cjs create` |
| TC-016 | Mock Interviews / Placement | Placement interview uses the same honest evaluator | PASS | `phase3-batch1.cjs create` |
| TC-017 | Mock Interviews / Placement | Placement feedback before completion is 409 | PASS | `phase3-batch1.cjs create` |
| TC-018 | Projects | PRJ create with repository URL and start date | PASS | `phase3-batch1.cjs create` |
| TC-019 | Projects | PRJ no invented description or target users | PASS | `phase3-batch1.cjs create` |
| TC-020 | Projects | PRJ invalid repository URL is refused | PASS | `phase3-batch1.cjs create` |
| TC-021 | Projects | PRJ title is required | PASS | `phase3-batch1.cjs create` |
| TC-022 | Projects | PRJ PATCH ignores student_id and progress (mass assignment closed) | PASS | `phase3-batch1.cjs create` |
| TC-023 | Projects | PRJ student B cannot read the project | PASS | `phase3-batch1.cjs create` |
| TC-024 | Projects | PRJ add module and two tasks | PASS | `phase3-batch1.cjs create` |
| TC-025 | Projects | PRJ progress computed from tasks | PASS | `phase3-batch1.cjs create` |
| TC-026 | Projects | PRJ empty architecture is not filled with a template | PASS | `phase3-batch1.cjs create` |
| TC-027 | Projects | PRJ AI generate-plan without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-028 | Projects | PRJ AI generate-architecture without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-029 | Projects | PRJ AI analyze-scope without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-030 | Projects | PRJ AI analyze-risks without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-031 | Projects | PRJ AI suggest-technologies without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-032 | Projects | PRJ AI ask-ai without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-033 | Projects | PRJ AI ideas without a model answers 503 | PASS | `phase3-batch1.cjs create` |
| TC-034 | Projects | PRJ doc generation 503 saves nothing | PASS | `phase3-batch1.cjs create` |
| TC-035 | GitHub | GH OAuth start without an OAuth app answers 503 (no hard-coded client id) | PASS | `phase3-batch1.cjs create` |
| TC-036 | GitHub | GH callback with only a username no longer connects an account | PASS | `phase3-batch1.cjs create` |
| TC-037 | GitHub | GH status stays not connected | PASS | `phase3-batch1.cjs create` |
| TC-038 | GitHub | GH invalid or unreachable PAT connects nothing | PASS | `phase3-batch1.cjs create` |
| TC-039 | GitHub | GH sync without a connection is 404 | PASS | `phase3-batch1.cjs create` |
| TC-040 | GitHub | GH invalid username refused | PASS | `phase3-batch1.cjs create` |
| TC-041 | Mock Interviews | after restart: MI session in history as COMPLETED with the same score | PASS | `phase3-batch1.cjs verify (after restart)` |
| TC-042 | Mock Interviews | after restart: MI report retrievable | PASS | `phase3-batch1.cjs verify (after restart)` |
| TC-043 | Mock Interviews | after restart: B still cannot read A's report | PASS | `phase3-batch1.cjs verify (after restart)` |
| TC-044 | Projects | after restart: project keeps repository URL and status | PASS | `phase3-batch1.cjs verify (after restart)` |
| TC-045 | Projects | after restart: project tasks kept with status | PASS | `phase3-batch1.cjs verify (after restart)` |
| TC-046 | Research | RS create project | PASS | `phase3-batch2.cjs create` |
| TC-047 | Research | RS no invented methodology on a new project | PASS | `phase3-batch2.cjs create` |
| TC-048 | Research | RS search answers and names its source | PASS | `phase3-batch2.cjs create` |
| TC-049 | Research | RS curated results are labelled CURATED with a note (live search unavailable) | PASS | `phase3-batch2.cjs create` |
| TC-050 | Research | RS student B cannot search in A's project | PASS | `phase3-batch2.cjs create` |
| TC-051 | Research | RS result has a source link to open | PASS | `phase3-batch2.cjs create` |
| TC-052 | Research | RS save paper (server id, client id ignored) | PASS | `phase3-batch2.cjs create` |
| TC-053 | Research | RS saving the same paper again does not duplicate it | PASS | `phase3-batch2.cjs create` |
| TC-054 | Research | RS empty title is refused | PASS | `phase3-batch2.cjs create` |
| TC-055 | Research | RS save notes and reading status | PASS | `phase3-batch2.cjs create` |
| TC-056 | Research | RS invalid reading status refused | PASS | `phase3-batch2.cjs create` |
| TC-057 | Research | RS student B cannot read or edit A's paper | PASS | `phase3-batch2.cjs create` |
| TC-058 | Research | RS analysis without an AI provider is 503 (no template analysis) | PASS | `phase3-batch2.cjs create` |
| TC-059 | Research | RS gaps without an AI provider is 503 | PASS | `phase3-batch2.cjs create` |
| TC-060 | Research | RS literature review without an AI provider is 503 | PASS | `phase3-batch2.cjs create` |
| TC-061 | Research | RS compare uses saved metadata only, no ranking | PASS | `phase3-batch2.cjs create` |
| TC-062 | Research | RS APA citation from saved metadata | PASS | `phase3-batch2.cjs create` |
| TC-063 | Git | GL lessons list (13 topics) | PASS | `phase3-batch2.cjs create` |
| TC-064 | Git | GL lessons need auth | PASS | `phase3-batch2.cjs create` |
| TC-065 | Git | GL mark lesson read | PASS | `phase3-batch2.cjs create` |
| TC-066 | Git | GL open conflict exercise (starts from a prepared repository) | PASS | `phase3-batch2.cjs create` |
| TC-067 | Git | GL host command chaining refused | PASS | `phase3-batch2.cjs create` |
| TC-068 | Git | GL non-simulated programs refused | PASS | `phase3-batch2.cjs create` |
| TC-069 | Git | GL merge produces a conflict | PASS | `phase3-batch2.cjs create` |
| TC-070 | Git | GL commit with unresolved conflict refused | PASS | `phase3-batch2.cjs create` |
| TC-071 | Git | GL solution locked before hints are used | PASS | `phase3-batch2.cjs create` |
| TC-072 | Git | GL hint | PASS | `phase3-batch2.cjs create` |
| TC-073 | Git | GL exercise graded complete from the repository state  -- | PASS | `phase3-batch2.cjs create` |
| TC-074 | Git | GL student B has their own untouched repository | PASS | `phase3-batch2.cjs create` |
| TC-075 | Git | GL sandbox works | PASS | `phase3-batch2.cjs create` |
| TC-076 | Git | GL progress counts the completion | PASS | `phase3-batch2.cjs create` |
| TC-077 | Knowledge Base | KB upload accepted (QUEUED) | PASS | `phase3-batch2.cjs create` |
| TC-078 | Knowledge Base | KB processed and indexed (READY, content_indexed) | PASS | `phase3-batch2.cjs create` |
| TC-079 | Knowledge Base | KB extracted text is the file text (not base64) | PASS | `phase3-batch2.cjs create` |
| TC-080 | Knowledge Base | KB same content uploaded again is reported as a duplicate | PASS | `phase3-batch2.cjs create` |
| TC-081 | Knowledge Base | KB executable rejected | PASS | `phase3-batch2.cjs create` |
| TC-082 | Knowledge Base | KB create collection | PASS | `phase3-batch2.cjs create` |
| TC-083 | Knowledge Base | KB assign document to collection | PASS | `phase3-batch2.cjs create` |
| TC-084 | Knowledge Base | KB student B cannot add their view of A's collection | PASS | `phase3-batch2.cjs create` |
| TC-085 | Knowledge Base | KB search finds the document by its text | PASS | `phase3-batch2.cjs create` |
| TC-086 | Knowledge Base | KB collection-scoped search | PASS | `phase3-batch2.cjs create` |
| TC-087 | Knowledge Base | KB student B search does not see A's document | PASS | `phase3-batch2.cjs create` |
| TC-088 | Knowledge Base | KB question without AI returns cited passages, labelled extractive | PASS | `phase3-batch2.cjs create` |
| TC-089 | Knowledge Base | KB unrelated question: no answer invented, no citations | PASS | `phase3-batch2.cjs create` |
| TC-090 | Knowledge Base | KB student B cannot ask about A's document | PASS | `phase3-batch2.cjs create` |
| TC-091 | Knowledge Base | KB study material without AI is 503 and saves nothing | PASS | `phase3-batch2.cjs create` |
| TC-092 | Knowledge Base | KB document text with instructions is only quoted as a passage (no AI here; model prompt isolation is unit-tested) | PASS | `phase3-batch2.cjs create` |
| TC-093 | Knowledge Base | KB reindex keeps it READY | PASS | `phase3-batch2.cjs create` |
| TC-094 | Knowledge Base | KB deleted document is no longer searchable | PASS | `phase3-batch2.cjs create` |
| TC-095 | Research | RS after restart: saved paper still there | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-096 | Research | RS after restart: notes and reading status kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-097 | Research | RS after restart: search history kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-098 | Git | GL after restart: lesson and exercise completion kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-099 | Git | GL after restart: exercise repository and hint usage kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-100 | Git | GL after restart: sandbox repository kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-101 | Git | GL unified progress shows the Git lab | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-102 | Knowledge Base | KB after restart: document still found by its text (vectors persisted) | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-103 | Knowledge Base | KB after restart: question still gets cited passages | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-104 | Knowledge Base | KB after restart: collection and its document kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-105 | Knowledge Base | KB after restart: question history kept | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-106 | Research | RS remove a paper | PASS | `phase3-batch2.cjs verify (after restart)` |
| TC-107 | RAG | RAG question cites the matching document only | PASS | `phase3-batch3.cjs create` |
| TC-108 | RAG | RAG confidence is labelled as retrieval similarity | PASS | `phase3-batch3.cjs create` |
| TC-109 | RAG | RAG second topic routes to the TCP document | PASS | `phase3-batch3.cjs create` |
| TC-110 | RAG | RAG out-of-scope question: NO_SOURCES, no citations | PASS | `phase3-batch3.cjs create` |
| TC-111 | RAG | RAG student B gets nothing from A's documents | PASS | `phase3-batch3.cjs create` |
| TC-112 | RAG | RAG scoped to one document does not cite others | PASS | `phase3-batch3.cjs create` |
| TC-113 | Career | CR new student: no invented alignment, no target role | PASS | `phase3-batch3.cjs create` |
| TC-114 | Career | CR role catalogue loads | PASS | `phase3-batch3.cjs create` |
| TC-115 | Career | CR profile rejects bad values | PASS | `phase3-batch3.cjs create` |
| TC-116 | Career | CR profile saves own fields and ignores others | PASS | `phase3-batch3.cjs create` |
| TC-117 | Career | CR recommendations answer | PASS | `phase3-batch3.cjs create` |
| TC-118 | Career | CR roadmap generated from the role learning path | PASS | `phase3-batch3.cjs create` |
| TC-119 | Career | CR mark a roadmap step complete | PASS | `phase3-batch3.cjs create` |
| TC-120 | Career | CR student B cannot read A's roadmap | PASS | `phase3-batch3.cjs create` |
| TC-121 | Career | CR roadmap without role_id is refused | PASS | `phase3-batch3.cjs create` |
| TC-122 | Resume | RS create resume with no invented target role | PASS | `phase3-batch3.cjs create` |
| TC-123 | Resume | RS student B cannot open A's resume | PASS | `phase3-batch3.cjs create` |
| TC-124 | Resume | RS student B cannot ask AI on A's resume | PASS | `phase3-batch3.cjs create` |
| TC-125 | Resume | RS import the student's own project | PASS | `phase3-batch3.cjs create` |
| TC-126 | Resume | RS importing the same project twice does not duplicate it | PASS | `phase3-batch3.cjs create` |
| TC-127 | Resume | RS cannot import another student's project | PASS | `phase3-batch3.cjs create` |
| TC-128 | Resume | RS analysis compares against the target role skills | PASS | `phase3-batch3.cjs create` |
| TC-129 | Resume | RS contact score counts the 2 of 4 fields given | PASS | `phase3-batch3.cjs create` |
| TC-130 | Resume | RS weak phrasing flagged without a rewritten claim | PASS | `phase3-batch3.cjs create` |
| TC-131 | Resume | RS analysis is not labelled an ATS score | PASS | `phase3-batch3.cjs create` |
| TC-132 | Resume | RS tailoring: gaps listed, no summary rewrite | PASS | `phase3-batch3.cjs create` |
| TC-133 | Resume | RS tailoring without a job description is refused | PASS | `phase3-batch3.cjs create` |
| TC-134 | Resume | RS AI summary without an AI provider is 503 AI_UNAVAILABLE | PASS | `phase3-batch3.cjs create` |
| TC-135 | Resume | RS AI bullet without an AI provider is 503 AI_UNAVAILABLE | PASS | `phase3-batch3.cjs create` |
| TC-136 | Resume | RS AI improve without an AI provider is 503 AI_UNAVAILABLE | PASS | `phase3-batch3.cjs create` |
| TC-137 | Resume | RS AI bullet without a task is refused | PASS | `phase3-batch3.cjs create` |
| TC-138 | Resume | RS save a version | PASS | `phase3-batch3.cjs create` |
| TC-139 | RAG | RAG after restart: still cites the paging document | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-140 | Career | CR after restart: target role kept | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-141 | Career | CR after restart: roadmap and completed step kept | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-142 | Career | CR after restart: dashboard alignment now measured | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-143 | Resume | RS after restart: resume, project and skills kept | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-144 | Resume | RS after restart: same analysis score (deterministic) | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-145 | Resume | RS after restart: version kept | PASS | `phase3-batch3.cjs verify (after restart)` |
| TC-146 | Applications | AP javascript: application URL refused | PASS | `phase3-batch4.cjs create` |
| TC-147 | Applications | AP unknown status refused | PASS | `phase3-batch4.cjs create` |
| TC-148 | Applications | AP create saved application | PASS | `phase3-batch4.cjs create` |
| TC-149 | Applications | AP no invented location, deadline or notes | PASS | `phase3-batch4.cjs create` |
| TC-150 | Applications | AP JD analysis lists catalogue skills named in the JD | PASS | `phase3-batch4.cjs create` |
| TC-151 | Applications | AP new student has no evidence, readiness 0 | PASS | `phase3-batch4.cjs create` |
| TC-152 | Applications | AP status change adds a timeline entry | PASS | `phase3-batch4.cjs create` |
| TC-153 | Applications | AP student B cannot read A's application | PASS | `phase3-batch4.cjs create` |
| TC-154 | Applications | AP student B cannot change A's application | PASS | `phase3-batch4.cjs create` |
| TC-155 | Applications | AP B's list does not contain A's application | PASS | `phase3-batch4.cjs create` |
| TC-156 | Placement Prep | PL readiness answers | PASS | `phase3-batch4.cjs create` |
| TC-157 | Placement Prep | PL recommendations name their basis | PASS | `phase3-batch4.cjs create` |
| TC-158 | Placement Prep | PL question bank has at least 30 questions | PASS | `phase3-batch4.cjs create` |
| TC-159 | Placement Prep | PL empty assessment refused | PASS | `phase3-batch4.cjs create` |
| TC-160 | Placement Prep | PL unknown question id refused | PASS | `phase3-batch4.cjs create` |
| TC-161 | Placement Prep | PL assessment scored from real answers (wrong answer gives 0%) | PASS | `phase3-batch4.cjs create` |
| TC-162 | Placement Prep | PL assessment saved in history | PASS | `phase3-batch4.cjs create` |
| TC-163 | Placement Prep | PL AI coach without a model: 503, nothing generated | PASS | `phase3-batch4.cjs create` |
| TC-164 | Placement Prep | PL STAR improver without a model: 503 | PASS | `phase3-batch4.cjs create` |
| TC-165 | Connected Platforms | CP GitHub link with a client "oauth_verified" claim is LINKED, not CONNECTED | PASS | `phase3-batch4.cjs create` |
| TC-166 | Connected Platforms | CP A sees the profile | PASS | `phase3-batch4.cjs create` |
| TC-167 | Connected Platforms | CP B does not see A's profile (was all saved under the demo student) | PASS | `phase3-batch4.cjs create` |
| TC-168 | Connected Platforms | CP B cannot read A's profile by id | PASS | `phase3-batch4.cjs create` |
| TC-169 | Connected Platforms | CP sync of an unverified GitHub link stays LINKED and counts only imported repositories | PASS | `phase3-batch4.cjs create` |
| TC-170 | Connected Platforms | CP LeetCode link saved as LINKED | PASS | `phase3-batch4.cjs create` |
| TC-171 | Connected Platforms | CP LeetCode offers no fake verification challenge | PASS | `phase3-batch4.cjs create` |
| TC-172 | Connected Platforms | CP integrations connect gives LINKED with no scopes | PASS | `phase3-batch4.cjs create` |
| TC-173 | Connected Platforms | CP integrations refuse a client-supplied OAuth code | PASS | `phase3-batch4.cjs create` |
| TC-174 | Connected Platforms | CP no OAuth start for LinkedIn (no app registered) | PASS | `phase3-batch4.cjs create` |
| TC-175 | Connected Platforms | CP LeetCode sync reports ERROR, imports nothing | PASS | `phase3-batch4.cjs create` |
| TC-176 | Connected Platforms | CP B does not see A's integration | PASS | `phase3-batch4.cjs create` |
| TC-177 | Connected Platforms | CP jobs list requires sign-in | PASS | `phase3-batch4.cjs create` |
| TC-178 | Connected Platforms | CP job import saved for A | PASS | `phase3-batch4.cjs create` |
| TC-179 | Connected Platforms | CP job analysis: fit from listed skills with a stated basis | PASS | `phase3-batch4.cjs create` |
| TC-180 | Connected Platforms | CP B cannot analyse A's job | PASS | `phase3-batch4.cjs create` |
| TC-181 | Connected Platforms | CP B's job list is empty of A's imports | PASS | `phase3-batch4.cjs create` |
| TC-182 | Connected Platforms | CP consistency claims no score | PASS | `phase3-batch4.cjs create` |
| TC-183 | Jobs Discovery | JD no hand-written seed listings are served | PASS | `phase3-batch4.cjs create` |
| TC-184 | Jobs Discovery | JD only Remotive is enabled; no source claims HEALTHY before a sync | PASS | `phase3-batch4.cjs create` |
| TC-185 | Jobs Discovery | JD sync with no outbound access: FAILED run, nothing added, error reported | PASS | `phase3-batch4.cjs create` |
| TC-186 | Jobs Discovery | JD analyze-jd requires sign-in | PASS | `phase3-batch4.cjs create` |
| TC-187 | Jobs Discovery | JD analysis without a model: catalogue skills only, no summary | PASS | `phase3-batch4.cjs create` |
| TC-188 | Jobs Discovery | JD stats: matching count not invented | PASS | `phase3-batch4.cjs create` |
| TC-189 | Applications | AP application and JD analysis survive a restart | PASS | `phase3-batch4.cjs verify (after restart)` |
| TC-190 | Placement Prep | PL assessment history survives a restart | PASS | `phase3-batch4.cjs verify (after restart)` |
| TC-191 | Connected Platforms | CP profile survives a restart, still LINKED and owned by A | PASS | `phase3-batch4.cjs verify (after restart)` |
| TC-192 | Connected Platforms | CP B still cannot see A's profile after restart | PASS | `phase3-batch4.cjs verify (after restart)` |
| TC-193 | Connected Platforms | CP integration link survives a restart as LINKED | PASS | `phase3-batch4.cjs verify (after restart)` |
| TC-194 | Connected Platforms | CP imported job survives a restart | PASS | `phase3-batch4.cjs verify (after restart)` |
| TC-195 | Integration | INT skill catalogue has Python | PASS | `phase3-integration.cjs` |
| TC-196 | Integration | INT declare Python on the profile | PASS | `phase3-integration.cjs` |
| TC-197 | Integration | INT create project | PASS | `phase3-integration.cjs` |
| TC-198 | Integration | INT add Python to the project | PASS | `phase3-integration.cjs` |
| TC-199 | Integration | INT resume holds the project with its technology | PASS | `phase3-integration.cjs` |
| TC-200 | Integration | INT B cannot import A's project into B's resume | PASS | `phase3-integration.cjs` |
| TC-201 | Integration | INT application JD analysis sees the declared Python skill, without calling the declaration evidence | PASS | `phase3-integration.cjs` |
| TC-202 | Integration | INT and reports Docker as not on the profile | PASS | `phase3-integration.cjs` |
| TC-203 | Integration | INT B's analysis is not affected by A's skills | PASS | `phase3-integration.cjs` |
| TC-204 | Integration | INT imported job fit uses the profile and the project | PASS | `phase3-integration.cjs` |
| TC-205 | Integration | INT knowledge base answers from the uploaded document | PASS | `phase3-integration.cjs` |
| TC-206 | Integration | INT B gets no citation from A's document | PASS | `phase3-integration.cjs` |
| TC-207 | Integration | INT career dashboard answers for a student with records | PASS | `phase3-integration.cjs` |
| TC-208 | Resume | E2E9 add education | PASS | `phase3-e2e-extra.cjs` |
| TC-209 | Resume | E2E9 add skills | PASS | `phase3-e2e-extra.cjs` |
| TC-210 | Resume | E2E9 add project | PASS | `phase3-e2e-extra.cjs` |
| TC-211 | Resume | E2E9 preview shows education, skills and project  -- | PASS | `phase3-e2e-extra.cjs` |
| TC-212 | Resume | E2E9 printed PDF contains the resume content | PASS | `phase3-e2e-extra.cjs` |
| TC-213 | Resume | E2E9 printed PDF has no app navigation chrome | PASS | `phase3-e2e-extra.cjs` |
| TC-214 | Resume | E2E9 B cannot read A's resume | PASS | `phase3-e2e-extra.cjs` |
| TC-215 | Placement Prep | E2E11 plan created for a real role | PASS | `phase3-e2e-extra.cjs` |
| TC-216 | Placement Prep | E2E11 unknown role refused (no "Software Engineer" fallback) | PASS | `phase3-e2e-extra.cjs` |
| TC-217 | Placement Prep | E2E11 B cannot read A's plan | PASS | `phase3-e2e-extra.cjs` |
| TC-218 | Connected Platforms | E2E12 link Codeforces profile: saved, not CONNECTED, sync failure explained | PASS | `phase3-e2e-extra.cjs` |
| TC-219 | Connected Platforms | E2E12 verification challenge issued | PASS | `phase3-e2e-extra.cjs` |
| TC-220 | Connected Platforms | E2E12 live check cannot reach Codeforces here: not verified, says why | PASS | `phase3-e2e-extra.cjs` |
| TC-221 | Connected Platforms | E2E12 disconnect | PASS | `phase3-e2e-extra.cjs` |
| TC-222 | Connected Platforms | E2E12 B cannot disconnect A's profile | PASS | `phase3-e2e-extra.cjs` |
| TC-223 | Demo account | DEMO login works | PASS | `phase3-demo-account.cjs` |
| TC-224 | Demo account | DEMO no external profile is CONNECTED/VERIFIED by seed | PASS | `phase3-demo-account.cjs` |
| TC-225 | Demo account | DEMO GitHub is not connected by seed | PASS | `phase3-demo-account.cjs` |
| TC-226 | Demo account | DEMO no seeded mock interview score | PASS | `phase3-demo-account.cjs` |
| TC-227 | Demo account | DEMO no seeded internship applications | PASS | `phase3-demo-account.cjs` |
| TC-228 | Demo account | DEMO no seeded integration connections | PASS | `phase3-demo-account.cjs` |

## Other executed checks

| Check | Result | Evidence |
|---|---|---|
| Every /api/v1 route called without a token | 859 routes: 800 answer 401; the 59 that answer are health, auth and catalogue reads (reviewed one by one in `PHASE_3_SECURITY_REPORT.md`) | `batch5-unauth-sweep.txt` |
| 14 module pages at 390, 768 and 1366 px | 42/42 with no horizontal overflow, no uncaught page error, no API 5xx; each has a `main` landmark and one `h1` | `batch5-responsive.txt`, `resp-*.png` |
| Batch 4 pages for an unverified student | 12/12 page/width runs with no "Connected" claim, no overflow, no page error | `batch4-ui.txt`, `b4-*.png` |
| Resume editor and project import picker (1366, 390) | PASS | `resume-ui.txt`, `resume-editor-*.png` |
| Git lab page (1366, 390) | PASS after fixing P3-031 | `gitlab-*.png` |
| RAG evaluation, 8 documents, 25 queries | see `PHASE_3_RAG_EVALUATION.md` | `rag-eval.json` |
| Phase 1 and 2 probes against the Phase 3 build | 0 FAIL | `batch5-regression.txt` |
| `vite build` | builds (one 4.35 MB chunk, P3-089) | `batch5-regression.txt` |

## Unit and service test files touched in Phase 3

| File | Passed |
|---|---|
| `src/tests/applications_phase3.test.ts` | 6/6 |
| `src/tests/career_phase3.test.ts` | 4/4 |
| `src/tests/git_lab.test.ts` | 22/22 |
| `src/tests/placement_phase3.test.ts` | 7/7 |
| `src/tests/platforms_phase3.test.ts` | 11/11 |
| `src/tests/resume_phase3.test.ts` | 5/5 |
| `src/tests/rag_retrieval.test.ts` | 6/6 |
| `src/tests/jobs_discovery_master.test.ts` | 16/16 |
| `src/tests/external_profiles_master.test.ts` | 18/18 |
| `src/tests/mock_interviews_master.test.ts` | 20/20 |
| `src/tests/projects.test.ts` | 12/12 |
| `src/tests/knowledge_base_master.test.ts` | 26/26 |
| `src/tests/research_github.test.ts` | 33/33 |
| `src/tests/github_workspace_master.test.ts` | 27/27 |
| `src/tests/career_integrated_system_master.test.ts` | 28/28 |
| `src/tests/resume_career_skills.test.ts` | 30/30 |
| `src/tests/placements.test.ts` | 28/28 |
| `src/tests/documents_workspace_master.test.ts` | 24/24 |

## New Phase 3 unit tests (titles)

| File | Test | Result |
|---|---|---|
| `applications_phase3.test.ts` | a new application has no invented location, deadline, notes or skill analysis | PASSED |
| `applications_phase3.test.ts` | a pasted job description is compared with the profile skills and their evidence | PASSED |
| `applications_phase3.test.ts` | a job description that names no known skill gets no analysis | PASSED |
| `applications_phase3.test.ts` | rejects unsafe links, bad dates and unknown statuses | PASSED |
| `applications_phase3.test.ts` | status changes are recorded on the timeline and other students cannot see or change the application | PASSED |
| `applications_phase3.test.ts` | the demo accounts start with an empty tracker and old sample entries are removed | PASSED |
| `career_phase3.test.ts` | skill matching uses whole words and alternatives, not substrings | PASSED |
| `career_phase3.test.ts` | every role recommends courses that exist in the catalogue | PASSED |
| `career_phase3.test.ts` | roadmaps differ by role and link only to courses that exist | PASSED |
| `career_phase3.test.ts` | a student with no target role gets no invented alignment or topic counts | PASSED |
| `placement_phase3.test.ts` | a new student has zero readiness, no invented weak topics, and no interview score of 70 | PASSED |
| `placement_phase3.test.ts` | category totals come from the question bank | PASSED |
| `placement_phase3.test.ts` | weak areas come from the student’s own practice accuracy | PASSED |
| `placement_phase3.test.ts` | recommendations exist in the catalogues and skip solved work | PASSED |
| `placement_phase3.test.ts` | assessment submissions are validated (no empty or unknown questions, no invented time) | PASSED |
| `placement_phase3.test.ts` | coach and STAR need the model (503) and STAR keeps only the student’s facts | PASSED |
| `placement_phase3.test.ts` | exported notes contain only the student’s text | PASSED |
| `platforms_phase3.test.ts` | a client cannot claim OAuth: the profile is saved as a link, not connected | PASSED |
| `platforms_phase3.test.ts` | LeetCode and Kaggle import nothing and verify nothing (no invented statistics) | PASSED |
| `platforms_phase3.test.ts` | catalogue flags match what is implemented | PASSED |
| `platforms_phase3.test.ts` | Codeforces sync reads the official API and reports failure honestly | PASSED |
| `platforms_phase3.test.ts` | the page check refuses private addresses and non-https URLs | PASSED |
| `platforms_phase3.test.ts` | links are LINKED with no scopes; usernames and URLs are validated | PASSED |
| `platforms_phase3.test.ts` | imported jobs are private to the student and analysed against real profile skills | PASSED |
| `platforms_phase3.test.ts` | the demo account has no seeded CONNECTED platforms, activity, evidence or sample jobs | PASSED |
| `platforms_phase3.test.ts` | registry providers no longer produce sample sync data or fake OAuth URLs | PASSED |
| `platforms_phase3.test.ts` | no external profiles, GitHub connection, repositories or scored mock interview for std_01j8k9x2p4 | PASSED |
| `platforms_phase3.test.ts` | retireFabricatedDemoData removes such records left in an old snapshot | PASSED |
| `resume_phase3.test.ts` | a new resume does not get an invented target role | PASSED |
| `resume_phase3.test.ts` | without a catalogue target role, keyword and role checks are null and not scored | PASSED |
| `resume_phase3.test.ts` | keyword coverage is measured against the target role skills, and the total equals the listed parts | PASSED |
| `resume_phase3.test.ts` | weak phrasing is flagged without rewriting it into a stronger claim | PASSED |
| `resume_phase3.test.ts` | tailoring does not template-rewrite the summary and is owner-checked | PASSED |
| `git_lab.test.ts` | never runs host commands: shell features and unknown programs are refused | PASSED |
| `git_lab.test.ts` | tracks working directory, staging area and commits | PASSED |
| `git_lab.test.ts` | a failed command leaves the repository unchanged | PASSED |
| `git_lab.test.ts` | produces a real conflict with markers and blocks commit until resolved | PASSED |
| `git_lab.test.ts` | switching branches with uncommitted conflicting changes is refused | PASSED |
| `git_lab.test.ts` | first-commit: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | stage-selectively: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | feature-branch: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | fast-forward-merge: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | resolve-conflict: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | rebase-feature: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | cherry-pick-fix: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | stash-and-switch: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | tag-release: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | reset-bad-commit: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | revert-shared-commit: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | push-feature-branch: not solved at start, solved by the reference solution | PASSED |
| `git_lab.test.ts` | a wrong approach is not graded as complete (merge instead of cherry-pick) | PASSED |
| `git_lab.test.ts` | every lesson exercise exists | PASSED |
| `git_lab.test.ts` | records completion once, keeps students separate, and logs an activity | PASSED |
| `git_lab.test.ts` | hints are given one at a time and the solution stays locked until hints run out | PASSED |
| `git_lab.test.ts` | rejects unknown exercises and non-text commands | PASSED |
| `jobs_discovery_master.test.ts` | 1. catalogs contain comprehensive government and private subcategories | PASSED |
| `jobs_discovery_master.test.ts` | 2. seeds no job listings and no fake healthy sources | PASSED |
| `jobs_discovery_master.test.ts` | 3. filters stored listings by category, remote flag and text | PASSED |
| `jobs_discovery_master.test.ts` | 4. a failed Remotive request stores nothing and reports the error (no cached fallback) | PASSED |
| `jobs_discovery_master.test.ts` | 5. a Remotive answer is stored as given, skipping incomplete entries and inventing nothing | PASSED |
| `jobs_discovery_master.test.ts` | 6. sources with no adapter are not synced and keep NOT_CONFIGURED | PASSED |
| `jobs_discovery_master.test.ts` | 7. retireFabricatedJobData removes old hand-written listings left in a snapshot | PASSED |
| `jobs_discovery_master.test.ts` | 8. normalizes raw payloads with valid https protocols and no invented fields | PASSED |
| `jobs_discovery_master.test.ts` | 9. prevents duplicate listings during batch saves | PASSED |
| `jobs_discovery_master.test.ts` | 10. match percentage is the plain share of listed skills on the profile | PASSED |
| `jobs_discovery_master.test.ts` | 11. manages student saved jobs bookmarks | PASSED |
| `jobs_discovery_master.test.ts` | 12. manages student job alerts | PASSED |
| `jobs_discovery_master.test.ts` | 13. dashboard statistics count stored listings only | PASSED |
| `jobs_discovery_master.test.ts` | 14. expands search queries deterministically or via AI | PASSED |
| `jobs_discovery_master.test.ts` | 15. JD analysis without a model gives catalogue skills only and no invented summary | PASSED |
| `jobs_discovery_master.test.ts` | 16. JD analysis with a model keeps only valid fields and marks the text untrusted | PASSED |
