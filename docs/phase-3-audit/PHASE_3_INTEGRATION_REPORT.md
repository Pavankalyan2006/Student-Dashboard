# Phase 3 Integration Report

Probe: `scripts/audit/phase3-integration.cjs`, run against a live server with two synthetic students, A and B.
**Result: 13/13 PASS** (`evidence/batch5-integration.txt`).

## Journey

| # | Step | Modules | Result |
|---|---|---|---|
| 1 | The skill catalogue has Python | Skills | PASS |
| 2 | A declares Python on the profile | Skills, Career | PASS (201) |
| 3 | A creates a project | Projects | PASS (201) |
| 4 | A adds Python to the project | Projects | PASS (201) |
| 5 | A's resume imports the project with its technology | Resume, Projects | PASS |
| 6 | B cannot import A's project into B's resume | Resume, isolation | PASS |
| 7 | Job description analysis in the tracker sees A's declared Python and does not count the declaration as evidence | Applications, Skills | PASS (DEVELOPING) |
| 8 | Docker, missing from the profile, is reported as not yet assessed | Applications | PASS |
| 9 | B's analysis is not affected by A's skills | isolation | PASS |
| 10 | An imported job's fit uses A's profile and project | Jobs, Projects | PASS (50%, Python, 1 project) |
| 11 | The knowledge base answers from A's uploaded document | Knowledge Base, RAG | PASS (EXTRACTIVE, cited) |
| 12 | B gets no citation from A's document | RAG, isolation | PASS |
| 13 | The career dashboard answers for a student with records | Career | PASS (200) |

## Other links checked

- **GitHub to Projects and Resume:** export to resume checks the resume's owner (P3-020). The portfolio reads real
  GitHub and resume data. This was unit-tested; live GitHub was blocked.
- **Resume to Career:** a resume score survives a restart, and career alignment is measured only after the student has
  records (batch 3).
- **Applications to Placement Prep:** plan recommendations name their basis (batch 4).
- **Phases 1 and 2:** courses, coding, DSA, SQL lab, the semester command center and the other earlier modules still
  pass their probes (`batch5-regression.txt`: Phase 1 59/59, Phase 2 with 0 failures).

## Data flow

The modules share one store and one identity. Projects, the skill profile and the resume are the sources that Career,
Applications, Jobs and Placement read. No module copies another module's data under a different owner, and every read
is filtered by the signed-in student.
