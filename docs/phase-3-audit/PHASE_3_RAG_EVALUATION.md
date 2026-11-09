# Phase 3 RAG Evaluation

## What the pipeline is

| Stage | Implementation | Notes |
|---|---|---|
| Upload | `POST /documents` (base64 body), `server/services/documents.ts` | Executables refused; duplicates detected by content hash. Bare base64 used to be parsed as text (P3-032, fixed). |
| Extract | `server/processing/processor.ts` | Status QUEUED, then READY with `content_indexed`. |
| Chunk and embed | `server/rag/embeddings.ts` | **Not a semantic model.** A local 128-bucket hashed bag of words and word pairs. The UI and API label it as word matching, not "AI embeddings" (P3-040). |
| Index | `server/rag/vectorStore.ts` | Per-student. Persisted with the snapshot since Phase 3 (P3-033: vectors were lost on restart). |
| Retrieve | `server/rag/retriever.ts` | Vector path (`minScore` 0.15) plus a keyword path. A vector hit must share at least one content word with the query, because hashed buckets collide (P3-039). Always filtered by the signed-in student, and optionally by document or collection. |
| Answer | `server/services/knowledgeBaseService.ts` | With a model: grounded answer over numbered sources, document text wrapped in `<<<...>>>` and declared untrusted. Without a model (this environment): `EXTRACTIVE` mode returns the cited passages themselves. No sources: `NO_SOURCES`, nothing invented. |
| Confidence | same | Labelled `RETRIEVAL_SIMILARITY`: it is the retrieval score, not a measure of answer correctness. |

## Method

`scripts/audit/phase3-rag-eval.ts` runs the real pipeline (upload, extract, chunk, embed, index) on 8 synthetic course
documents (OS deadlocks, paging, scheduling; DBMS normalization, transactions; networks TCP, routing; DSA dynamic
programming) for student A, then asks 25 questions:

- **16 lexical** questions that share words with the expected document.
- **4 paraphrase** questions that ask the same thing in different words.
- **5 out-of-scope** questions that no document answers.
- **5 isolation** questions asked by student B, who owns no documents.

For each question it records the ranked documents from retrieval, the rank of the expected document, the answer mode,
and whether the answer cites the expected document. Output: `docs/phase-3-audit/evidence/rag-eval.json`.

Run: `DATA_PERSISTENCE=off npx tsx scripts/audit/phase3-rag-eval.ts`

## Results

| Set | Queries | Hit@1 | Hit@3 | MRR | Answer cites expected doc |
|---|---|---|---|---|---|
| Lexical | 16 | 16 | 16 | 1.00 | 16 |
| Paraphrase | 4 | 1 | 2 | 0.38 | 2 |

| Check | Result |
|---|---|
| Out-of-scope refused (`NO_SOURCES`, no citation) | 4 of 5. "Explain quantum chromodynamics" matched "time quantum" in the scheduling notes and returned one extractive citation. |
| Isolation (B asks A's questions) | 0 leaks in 5 |
| Prompt injection in a document | The document text is only quoted as a passage (probe check `KB document text with instructions is only quoted`); the model prompt marks document text as untrusted data (unit-tested with a stubbed model in `knowledge_base_master` and `rag_retrieval`). |

### Paraphrase rows

| Question | Expected | Retrieved (ranked) | Rank |
|---|---|---|---|
| How can two programs end up stuck waiting on each other forever? | deadlock | scheduling, deadlock, routing | 2 |
| How is a virtual address turned into a physical one quickly? | paging | paging | 1 |
| How do I avoid storing the same data twice in tables? | normalization | deadlock, paging, tcp | not found |
| How does the sender know data arrived? | tcp | none (`NO_SOURCES`) | not found |

### HTTP checks (running server)

`phase3-batch3.cjs` (create 6/6 RAG checks, verify after restart): the answer cites only the matching document, a second
topic routes to its own document, an unrelated question gets `NO_SOURCES` and no citations, B gets nothing from A, and a
question scoped to one document cites nothing else. After a restart the same question still cites the same document.
`phase3-integration.cjs` adds a fresh upload that is cited in an answer, and B gets no citation from it.

## What was not evaluated

- **Answer generation with a model.** No AI provider is configured here. Faithfulness of generated answers, citation
  accuracy inside generated text and refusal behaviour of the model were not measured. They need `GEMINI_API_KEY` (or the
  configured provider) and a rerun of the evaluation with answer scoring.
- **Large documents and PDFs with layout.** The corpus is short plain text.

## Conclusions

1. Retrieval is reliable when the question uses the document's words, and it does not leak across students.
2. It is weak on paraphrases (1 of 4 at rank 1). This is a property of word matching, not a bug, and the UI says so.
3. One out-of-scope question matched on a shared word. The shared-content-word gate stops most of these but not a real
   word overlap.
4. Recommended for Phase 4: a real embedding model (configured provider) behind the same `EmbeddingService` interface,
   then rerun this evaluation; keep the keyword path for acronyms.
