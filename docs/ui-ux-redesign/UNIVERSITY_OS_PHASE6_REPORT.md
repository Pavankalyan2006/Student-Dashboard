# University OS: Phase 6 (Research and Innovation)

Phase 6 extends the existing Research Assistant (`/research`), Document AI and ML Lab. No new dashboard or duplicate module was added. Brief modules 18 (Research Intelligence), 19 (Research Idea Lab) and 20 (AI Model Playground) map onto these existing features.

## What changed

### Research Intelligence (module 18)

| Area | Before | Now |
|---|---|---|
| Importing an uploaded PDF | Authors were set to the uploader's own id, the year was the current year, the venue was "Uploaded Academic Document", and the abstract was a made-up sentence. | Title, authors, abstract, year, DOI, keywords and references are read from the PDF's text (`server/services/paperMetadataExtractor.ts`). Each field records the page it came from. A field that is not found stays empty. Authors, title and year read from the layout are flagged "please check". |
| DOI | Not checked | When a DOI is found, it is looked up on OpenAlex (`ResearchProviderService.lookupDoi`). The record fills fields only if its title agrees with the PDF. A mismatch, a DOI that isn't found, or OpenAlex being unreachable is shown as such. |
| Correcting details | Not possible | "Correct details" on a paper. Each edited field is marked "entered by you". |
| Asking a paper | Not available | Each saved paper has an "Ask" box (`POST /research/papers/:id/ask`). With an uploaded file it uses the existing Document AI retrieval and cites page numbers. Without one, it answers from the abstract only and says so. "From the paper" passages and the "AI interpretation" are shown in separate boxes. A quoted passage is kept only if it really appears in the source. |
| Citations (APA, IEEE, MLA, BibTeX) | Missing data was filled with "Academic Contributor", "Academic Proceedings", the current year or 2024. | Missing parts are left out (APA uses "n.d."). All citation builders share one formatter. |
| Document AI fallback | When the AI failed, it wrote an invented sentence ("covers essential curriculum specifications…"). A model's quote was accepted without checking. | When the AI fails, the closest passages are shown and the app says no explanation was written. A quote that is not on the cited page is replaced by that page's real text. |
| Research AI assistant panel | It always showed "Attention Is All You Need" and "BERT" as sources and context. When the AI failed, it showed a made-up answer and claimed tool steps that never ran. | It starts with no context. Sources are listed only when they were sent with the question. If the AI fails, the panel says so. |

### Research Idea Lab (module 19)

- **Ideas panel ("Research Idea Lab"):** you can write your own idea or ask the AI for suggestions. AI suggestions are labelled "Suggested by AI".
- **Idea workspace:** each idea has a workspace with:
  - problem, motivation and approach
  - hypothesis, research questions and evaluation metrics
  - datasets and evaluation plan
  - a timeline with dates you choose
  - an outline and a stage (Draft, Developing, Ready for guide)
- **No pre-filled defaults:** new ideas used to arrive with "Python, PostgreSQL" and "Novel architecture or method" already filled in. Now these fields start empty.
- **"Check overlap with published papers":**
  - The check searches OpenAlex live and also uses the papers saved in the project.
  - For each paper it shows the share of your idea's key terms that also appear in the paper's title and abstract, plus the shared terms and a link to the paper.
  - It never says an idea is "novel" or "patentable". A disclaimer explains why.
  - If OpenAlex can't be reached, it shows an error and no result.
  - The last 5 checks are kept on the idea.

### AI Model Playground (module 20)

The existing ML Lab already trains real models on held-out splits: k-NN, decision tree, random forest, and logistic and linear regression. It reports accuracy, precision, recall, F1, the confusion matrix, MAE, RMSE and R², and keeps an experiment history. Phase 6 fixed what wasn't real and connected it to research:

- **Sample dataset statistics:** the min, max, mean and std of the built-in sample datasets were typed in by hand. They are now computed from the generated rows.
- **Starter code:** the starter `train_model.py` returned a hardcoded `accuracy: 0.96` and a "setosa" prediction. It now has TODO stubs that state the app does not run Python files.
- **Log message:** the training log said runs happen "in a sandboxed worker". It now says what is true: runs use the built-in engine with row and column limits, and no student code is executed.
- **"ML Experiments" tab:** a new tab in each research project links your own ML Lab runs to the project. It shows the metrics those runs recorded, and the export includes them. You cannot link another student's run, and setting link ids through the project update is ignored.

## Not done, and why

- **Deep learning, GPUs and running student Python code:** none of these are connected. The brief requires isolated environments with resource limits, and this deployment (Vercel functions) has no such sandbox. The app says so instead of pretending to train.
- **Patent search:** not available. The overlap check covers OpenAlex works only.
- **Scanned PDFs:** these still need OCR, which is not available (same as Phase 3). Metadata extraction needs a text PDF.
- **AI provider and OpenAlex in local tests:** neither is reachable from the build sandbox, so locally "Ask" and the overlap check return honest 503 errors. They are verified on the live site after merge.

## Testing

- **`src/tests/phase6_research.test.ts` (14 tests):**
  - metadata extraction, including that missing fields stay empty
  - citations with missing data
  - DOI title agreement
  - overlap scoring and the disclaimer
  - quote checking
  - sample dataset statistics and starter code
  - import over HTTP, which never names the uploader as author
  - metadata edits, the idea workspace, owner checks, and experiment linking
- **`research_github.test.ts`:** a paper imported through the alias `doc_seed_1` now stores the real document id.
- **Full suite:** 1,157 passed and 10 skipped. `tsc --noEmit` is clean and `npm run build` passes.
- **Browser check:** a real two-page PDF was generated, uploaded and imported. The importer read the title, 3 authors, the year 2021, the DOI, 3 keywords and 2 references, with page numbers. Saving an idea workspace and linking an ML run (random forest on Iris, held-out accuracy shown) both worked, with no page errors.

Screenshots: `screenshots/research-paper-provenance.png`, `screenshots/research-idea-workspace.png`, `screenshots/research-ml-experiments.png`.

## Next phases

- Phase 7 (Cross-platform): global search, explained recommendations, briefing, analytics, notifications and personalisation.
- Phase 8 (QA).
