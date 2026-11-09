# Phase 5 Student Isolation Report

Two synthetic students (A and B) were used throughout. No real student data.

| Check | Result | Test |
|---|---|---|
| Every profile route needs authentication (401 without) | PASS | Test 3 |
| Profile routes take the student only from the verified token; no id in path/body | PASS | design + Test 3 |
| B never sees A's profile, projects or email | PASS | Test 3 |
| B's edits do not change A | PASS | Test 3 |
| B cannot read A's notes or read/delete A's goals | PASS | Test 3 |
| Protected fields (`firebase_uid`, `role`, `email`, `student_id`, `email_verified`, version) rejected | PASS | Test 3 |
| Postgres RLS: own rows only; other student invisible; client writes and role changes refused; anon refused | PASS | `phase5_supabase_pg.test.ts` |
| A second Firebase identity cannot take over an account | PASS | Test 6, PG test |
| AI contexts exclude contact details and grades | PASS | Test 8 |

Existing Phase 2/3 isolation tests for documents, resumes, applications, knowledge base and projects still pass
(full suite 963 tests, 955 passed, 8 skipped = the Postgres suite when `PHASE5_PG_URL` is not set).
