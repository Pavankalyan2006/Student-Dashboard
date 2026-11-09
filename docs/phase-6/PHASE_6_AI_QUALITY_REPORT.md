# Phase 6 AI Response Quality Report

**No real AI response has ever been produced by this platform.** No Gemini key has been configured: the previously exposed
key stays revoked and no new one was provided. Every AI quality item is therefore **BLOCKED**. No answer was invented and
no template fallback was counted as an AI answer.

## What was checked in Stage 1 (failure handling, which does not need a key)

| Module | Scenario | Expected | Observed | Assessment |
|---|---|---|---|---|
| AI Tutor (`/ai/chat`) | Concept question, no provider | Honest unavailable message, nothing invented | Streams "AI unavailable. No AI provider is configured…" | PASS (handling). Minor: follow-up actions are still offered (P6-010) |
| AI Flashcards | Generate from a topic | 503 `AI_UNAVAILABLE`, nothing saved | 503 | PASS (handling) |
| Quiz generation | Generate 3 questions | 503, nothing saved | 503 | PASS (handling). Leaves new students without a quiz (P6-007) |
| Knowledge Base / RAG | Question about own uploaded document | Grounded passages with citation, labelled as not AI | Returned the correct passage (FIFO / Belady anomaly), `EXTRACTIVE`, 1 citation to the student's own document | PASS (retrieval and citation); AI synthesis BLOCKED |
| RAG isolation | Student B asks about A's document | Refused | 403 | PASS |
| AI context | Semester change | Tutor context shows the new semester, no contact details or grades | `semester: 6`; no email/CGPA (Phase 5 Test 8) | PASS |

## Sampling plan for Stage 2 (once a key is set)

Per module, sample up to 10 responses per week from **synthetic prompts re-run by the owner**, plus responses a
participant chooses to share through a problem report. Do not export full student conversations. Record only:

| Module | Test scenario | Input category | Expected behaviour | Observed response (summary, no personal data) | Quality (correct / partly / wrong / unsafe) | Defect |
|---|---|---|---|---|---|---|
| AI Tutor, Doubt Solver, Quiz, Flashcards, Resume suggestions, Interview feedback, RAG citations, Research summaries, AI/ML explanations | | concept / numeric / code / citation / career | | | | |
| _awaiting a Gemini key and real student participation_ | | | | | | |

Rules: factual correctness is judged by checking against a source (textbook, the cited document, running the code), never
by participant ratings. A rating of "AI explanations understandable" is a usability signal only.
