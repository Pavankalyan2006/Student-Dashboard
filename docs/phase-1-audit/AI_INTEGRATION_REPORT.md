# Phase 1 AI Integration Report

**Environment.** No `GEMINI_API_KEY` is set. Real model output is therefore BLOCKED for every AI feature: none of them was tested against a live model, and none is marked PASS for generation quality.

**Rule applied.** When the model gives no usable output, the feature returns 503 `AI_UNAVAILABLE`, or 502 `AI_BAD_RESPONSE` for unparseable output. It saves nothing and tells the student. It must never present template text as AI output.

**Tests.** Tests that need generated content stub `AIService.generate` with well-formed JSON (`src/tests/helpers/mockAIModel.ts` or `vi.spyOn`). Each feature also has a test with the model unavailable.

**Status endpoint.** `GET /ai/status` reports whether a provider is configured and which model it is, without exposing secrets. The AI Tutor header shows "AI not configured".

| Feature | Before | Now, with the model unavailable | Model path |
|---|---|---|---|
| AI Tutor chat | Provider notice | Reply clearly says "AI unavailable" | BLOCKED |
| AI Agent multi-step | Canned agent output with fake sources | Steps marked failed with a reason; only real tool data is shown | BLOCKED |
| Quiz generation | Template questions saved | 503 | Stub-tested |
| Tutor and Notes flashcards, takeaways, quiz | Templates | 503/502 | Stub-tested |
| Document summary | Invented concepts and formulas | Extractive summary, labelled "Extractive Summary (AI unavailable)" | Stub-tested |
| Document chat | — | Most relevant passage, labelled extractive, with page citation | BLOCKED |
| Knowledge-base study material | Unrelated fixed content | 503, nothing saved | Stub-tested |
| Doubt Solver | Same invented answer for every doubt | Saved as OPEN, no answer | Stub-tested |
| Flashcards from topic or course | Template cards | 503 | Stub-tested |
| Language writing feedback | Fixed scores 85/87 | 503, nothing saved | Stub-tested |
| Language AI Partner | Catalog phrase as reply | 503, session unchanged | Stub-tested |
| Language translator | Catalog phrase as translation | 503 | Stub-tested |
| Pronunciation | — | Browser speech APIs only; no score computed or stored | NOT APPLICABLE |

**To unblock.** Set `GEMINI_API_KEY` in the server environment (do not commit it). Then re-run the stubbed scenarios by hand against the real model.
