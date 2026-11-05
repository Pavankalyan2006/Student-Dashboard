# Phase 1 File Upload Verification

Endpoint: `POST /api/v1/documents`, with new versions sent to `POST /documents/:id/versions`. The body is base64 JSON, and blobs are stored under `data/vault/`, which git ignores.

| Case | Expected | Result |
|---|---|---|
| Valid .txt upload | 201, READY, bytes downloadable by the owner | PASS |
| .exe or .html | 400 | PASS |
| Declared 60 MB | 400 | PASS |
| Empty file | 400 "The file is empty" | PASS (P1-024) |
| Declared size smaller than the bytes sent | Stored size is at least the real bytes | PASS (P1-025) |
| `../../../etc/passwd.txt` | Stored as `passwd.txt`; disk path generated | PASS (P1-026) |
| New version with .exe, empty or oversized file | 400 (version uploads were unchecked before) | PASS (P1-027) |
| Student B: get, download, file, delete | 403 | PASS |
| AI Tutor attach button | Uploads to Documents and selects the file for grounding | PASS (browser) |
| Persisted after server restart and re-login | Listed | PASS (`phase1-persistence.cjs`) |
| PDF and DOCX text extraction with real files | — | PARTIAL: covered by the existing unit tests only; no real-world PDF corpus was tried |

Unit tests: `documents.test.ts` and `storage.test.ts`.
