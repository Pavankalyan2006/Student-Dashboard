# Phase 2 Security Report

Every control below was inspected in code and tested against a running server or the in-process HTTP harness. Each
row names its evidence. Controls that were not tested are listed under "Not verified" and are not claimed.

## 1. Code execution sandbox (Coding Lab, Sandbox, DSA Lab, Lab Assistant)

**Before Phase 2 (P0, P2-001):** student code ran with `child_process.spawn` as the server user. It could read the app
directory and `.env`, reach the network, and signal server processes.

**Now (`server/execution/isolation.ts`, `sandbox.ts`):**

- **Isolation levels.** At startup the server probes for `namespace` isolation (`unshare -n -p -f -m --kill-child --mount-proc`, plus `-r` when not root). If namespaces are unavailable it falls back to `rlimit-only`, and failing that to `none`.
- **Namespace level.**
  - No network (an empty network namespace).
  - Own PID namespace: the program is PID 1 and cannot see or signal the server.
  - Empty tmpfs mounts over the app directory, home, `/root`, `/home`, `/srv`, `/var/lib` and any path in `CODE_SANDBOX_HIDE_PATHS`.
  - A private `/tmp`.
  - Drops to `nobody` (via `setpriv`) when the server runs as root.
- **Limits.** ulimits on CPU seconds, file size, open files, processes and address space. A wall-clock timeout per language (5 s for Python in the probe, capped at 20 s) with whole-process-tree kill. Output cap. Memory limit of 128 MB.
- **Environment.** The child gets a sanitized environment with no API keys, database credentials or JWT secret.
- **Production.** In production, unisolated runs are refused unless `CODE_SANDBOX_ALLOW_UNISOLATED=true`. Every result reports its isolation level.

**Test results (`evidence/code-sandbox.txt`, 27 cases, all at `iso=namespace`):**

| Attack | Result |
|---|---|
| List the app directory | `FileNotFoundError` (hidden) |
| Read `/etc/shadow` | `PermissionError` |
| Open a URL | `Network is unreachable` |
| Allocate 1 GB (Python), grow the heap (JS) | `MEMORY_LIMIT` |
| `while True: pass`, `sleep(60)` | `TIMEOUT` after 5 s |
| Print without end | `OUTPUT_LIMIT_EXCEEDED` |
| Fork bomb | Contained by the process limit. The run ended and the server stayed up |
| `os.kill(1, …)` | Hits PID 1 of the student's own namespace |
| `#include "/etc/passwd"` in C | Compile error |
| List environment variables | Only the sanitized environment built in `sandbox.ts` (`PATH`, `HOME`, `TMP*`, `LANG`, ...). The probe output, truncated, starts with `HOME`, `LANG`, `NODE_ENV`, `OLDPWD`. No API key or JWT secret |
| Unauthenticated run | 401 |

Unit tests: `phase2_labs.test.ts`.
- "refuses to run unisolated code in production unless explicitly allowed".
- "namespace wrapper hides /tmp and drops privileges when running as root".

**Limitations:**
- Docker's default seccomp profile blocks `unshare`. Under it, the server detects `rlimit-only`, and production refuses to run code. To run code in production, start the container with a profile that allows user namespaces, or set `CODE_SANDBOX_ALLOW_UNISOLATED=true` and accept the risk. This deployment step was not exercised; nothing was deployed.
- This is a process sandbox, not a VM or gVisor. A kernel exploit inside the namespace is out of its threat model.
- Languages whose toolchain is missing on the host are reported as unavailable and refused (P2-008). The production image does not include every runtime.

## 2. SQL Lab sandbox

- **Engine.** SQLite (sql.js, WASM) in a worker thread. It has no file system or network access.
- **Per-student databases.** Each student has their own in-memory database image. Student B cannot see A's tables or saved queries (batch1).
- **Blocked statements.** `ATTACH`, `DETACH`, `VACUUM`, `REINDEX`, and any `PRAGMA` except table and index introspection (`sqlWorker.cjs`). Evidence: batch5 "SEC SQL Lab blocks ATTACH" returns "disabled".
- **Limits.** 3 s per run; the worker is terminated and restarted on timeout. 500-row result cap. Foreign keys enforced.
- **Never touches the app's data.** The app has no SQL database, and student SQL runs only against the student's own image.

## 3. Authentication and authorization

| Control | Evidence |
|---|---|
| All page APIs require a signed JWT (401 without one) | batch5 SEC: 9 endpoints |
| Unsigned `alg: none` token rejected | batch5 SEC |
| Student id comes from the token; a `student_id` in the body is ignored | batch5 SEC; routes use `req.user!.userId` |
| Unauthenticated DSA run and tutor endpoints closed (P2-002) | `phase2_labs.test.ts` |
| Owner checks return 404 for another student's ML experiment, dataset, prediction, system design project, interview, lab, experiment, report and quiz | b2, b5, T-b3, T-b4 |
| A client-supplied experiment id cannot overwrite another student's experiment (P2-023) | T-b3 |
| Legacy `/labs` routes that served the demo student's data removed (P2-022) | T-b3 |
| No admin role or admin dashboard added | code review of this branch |

## 4. Hidden answers and test cases

| Item | Control | Evidence |
|---|---|---|
| DSA hidden test cases | Removed from list and detail responses; submit results do not echo hidden I/O | b1, T-labs |
| Quiz answers | Questions delivered without `correct_answer`; review and per-question explanation only after submit and only for the owner; generate response without answers | b5 J8, T-b4 |
| GATE answer keys | Stripped from the question bank and bookmarks; returned only after answering or after the mock test is submitted. Mock test and session responses were checked by hand and carry no keys | b5 J10, T-b4 |
| SQL challenge reference queries | Not sent to the browser | T-labs |
| Quiz score | Computed on the server; a client `score` is ignored | b5 J8 |
| GATE timer | Enforced on the server (limit + 120 s) | T-b4 |

## 5. Input limits

| Input | Limit | Evidence |
|---|---|---|
| Any JSON body | 25 MB → 413; malformed → 400 (was 500) | b5 SEC |
| ML CSV upload | 5 MB, 20,000 rows, 100 columns, RFC 4180 | b2 |
| Lab manual upload | PDF, DOCX, TXT or MD; 10 MB | b5 SEC |
| Path-like ids (`..%2F..`) | Treated as unknown ids (404) | b5 SEC |

## 6. Terminal access

No page exposes a server shell. The Coding Lab "terminal" panel shows program output only. Nothing in Phase 2 added a shell.

## Not verified

- **Live AI prompt injection.** No model was available, so prompt-injection resistance of AI features was not tested.
- **Rate limiting** of code runs per student beyond `CODE_SANDBOX_MAX_CONCURRENT`. Not load-tested.
- **The sandbox inside the production Docker image.** Not run; see the limitation above.
- **Snapshot file permissions on a deployed host.** Not in scope; nothing was deployed.
