# Repository Audit — B.Tech Student AI Learning Platform

**Audit Date:** 2026-10-15  
**Auditor:** Phase 1 Implementation Agent

---

## 1. Current Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 19.0.1 |
| Language | TypeScript | 7.0.2 |
| Build Tool | Vite | 8.3.0 |
| CSS | Tailwind CSS | 4.3.3 |
| UI Primitives | Radix UI | Various (dialog, dropdown, tabs, tooltip, etc.) |
| Icons | Lucide React | 0.546.0 |
| State Management | Zustand | 5.0.15 |
| Server State | TanStack Query | 5.104.0 |
| Animation | Motion | 12.23.24 |
| Code Editor | Monaco Editor | 4.7.0 |
| Charts | Recharts | 3.10.1 |
| Math Rendering | KaTeX | 0.18.10 |
| Markdown | React Markdown + remark-gfm + remark-math + rehype-katex |
| Backend | Express.js | 4.21.2 |
| Auth | jsonwebtoken (9.0.3) + bcryptjs (3.0.3) |
| AI Provider | @google/genai | 2.4.0 |
| PDF Parsing | pdf-parse | 2.4.5 |
| Archive Handling | adm-zip | 0.6.1 |
| Testing | Vitest | 5.0.3 |
| Runtime | tsx | 4.21.0 |

## 2. Existing Architecture

### Backend (server/)
- **Entry point:** `server.ts` — Express server with Vite middleware in dev mode
- **API Router:** `server/api/router.ts` — mounts 35 route modules under `/api/v1`
- **Database:** `server/db/database.ts` — **7,878-line in-memory store** using TypeScript Maps
- **Models:** 13 type definition files in `server/models/`
- **Services:** Document processing, onboarding, progress tracking
- **AI:** Gemini provider, student context engine, agent registry, tool registry, orchestration
- **Events:** EventBus singleton with typed event dispatch
- **Middleware:** Auth (JWT), rate limiter, maintenance mode, request ID, logging, error handler
- **Security:** CORS, CSP, HSTS, X-Frame-Options, bcrypt password hashing
- **Storage:** Local file storage abstraction

### Frontend (src/)
- **Entry:** `src/main.tsx` → `src/App.tsx` (987 lines, manual routing)
- **Features:** 25+ feature directories under `src/features/`
- **Pages:** 80+ page components
- **API:** Centralized client (`src/api/client.ts`) with typed API modules
- **Layout:** `AppShell` for students, `AdminLayout` for admin
- **State:** Zustand stores + TanStack Query

### Python Backend (backend/)
- **Status:** Stub only — contains `main.py` with FastAPI setup and model files
- **Not actively used** by the running application
- **No migrations directory content**

## 3. Working Functionality

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication (Login/Logout/Me) | ✅ Working | JWT + cookies + Bearer token |
| Role enforcement (SUPER_ADMIN/STUDENT) | ✅ Working | requireRole middleware |
| Student Dashboard | ✅ Working | Personalized with seed data |
| AI Tutor/Agent | ✅ Working | Gemini integration |
| Courses (list, detail, learning) | ✅ Working | With enrollment |
| Notes (list, detail, generation) | ✅ Working | AI-powered |
| Documents (upload, workspace, chat) | ✅ Working | PDF parsing, RAG |
| Coding Lab | ✅ Working | Editor, test cases, submissions |
| DSA Lab | ✅ Working | 150+ problems, visualizations |
| Quiz System | ✅ Working | Create, play, review, history |
| Projects | ✅ Working | Full CRUD with workspace |
| Placements | ✅ Working | Topics, companies, mock interviews |
| Resume Builder | ✅ Working | Editor, preview, tailor |
| Career Assistant | ✅ Working | Roadmaps, skill gaps |
| Research & GitHub | ✅ Working | Paper discovery, repo analysis |
| Community | ✅ Working | Q&A, discussions |
| Admin Console | ✅ Working | Student management, system health |
| Onboarding Wizard | ✅ Working | 10-step flow |
| Student Profile | ✅ Working | Edit, activity, achievements |
| Notifications | ✅ Working | In-app notifications |
| External Integrations | ✅ Working | Hub page, connection UI |

## 4. Incomplete Functionality

| Item | Issue |
|------|-------|
| PostgreSQL database | Not connected — all data is in-memory Maps |
| Data persistence | Data lost on server restart |
| Alembic migrations | Empty Python backend; no SQL migrations |
| Redis caching | Configured but not used |
| Vector embeddings | VectorStore exists but limited implementation |
| Student memory service | API exists, persistence is in-memory |
| File upload processing | OCR adapter referenced but not fully wired |

## 5. Important Defects

| # | Severity | Description |
|---|----------|-------------|
| 1 | Medium | `onboardingService.ts` line 1: `import { v4 as uuidv4 } from 'crypto'` — Node.js crypto module has no `v4` named export. Uses `generateId()` function instead so this import is dead but causes TypeScript error. |
| 2 | Medium | `server/parsers/pptx.ts` — 5 implicit `any` type errors |
| 3 | Medium | `server/services/documents.ts` — References undefined `EmbeddingService` and `AIService` |
| 4 | Low | Profile completion test expects 9 sections but implementation returns 10 |
| 5 | Low | Student onboarding test creates student with wrong field (`password` instead of `password_hash`) |
| 6 | Low | `AgentRegistry.getAgent` — test calls method that doesn't exist on the class |
| 7 | Low | Test file `practice_labs_e2e.test.ts` — multiple possibly-undefined access errors |
| 8 | Low | Test file `learning_modules_e2e.test.ts` — `is_ai_recommended` not in `StudyPlanTask` type |

## 6. Security Concerns

| # | Level | Item |
|---|-------|------|
| 1 | Info | Default JWT secrets in config.ts (acceptable for dev, must change in production) |
| 2 | Info | Default seed passwords (Password123!, AdminPassword123!) — documented, acceptable for dev |
| 3 | Good | Password hashes (bcrypt) — never exposed in SafeStudent type |
| 4 | Good | HTTP-only secure cookies in production |
| 5 | Good | Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options) |
| 6 | Good | CORS origin validation with explicit allowlist |
| 7 | Good | Rate limiting middleware on API routes |
| 8 | Good | Admin routes protected by requireAuth + requireRole('SUPER_ADMIN') |
| 9 | Warning | In-memory store — no data persistence across restarts |

## 7. Database State

- **Type:** In-memory JavaScript Maps (DatabaseStore class)
- **Size:** 7,878 lines with comprehensive seed data
- **Seed data includes:** 1 student, 1 admin, courses, DSA problems, quiz questions, projects, placement data, resume templates, research data, community content
- **No PostgreSQL connection** — DATABASE_URL in .env but unused by the Express backend
- **No migration files** — the Python backend has an empty alembic directory

## 8. AI Integration Status

- **Provider:** Google Gemini (@google/genai v2.4.0)
- **Model:** gemini-flash-lite-latest (configurable)
- **Agent Registry:** 38 specialized domain agents registered
- **Tool Registry:** 20+ tools with permission enforcement
- **Student Context Engine:** Builds context from profile, education, skills, preferences
- **Streaming:** SSE-based streaming for AI responses
- **Limitations:** Requires GEMINI_API_KEY; graceful fallback when unavailable

## 9. Build and Test Status

### Build
- `npm run build` (vite build): **PASS** — builds successfully in ~31s
- Bundle size: 4,364 KB JS (single chunk, warning for >500 KB)
- CSS: 238 KB

### Type Check
- `npm run lint` (tsc --noEmit): **FAIL** — 19 TypeScript errors
- Main issues: implicit any types in pptx parser, missing imports in document service, onboarding crypto import, test type mismatches

### Tests
- `npm test` (vitest run): **362 passed, 6 failed** out of 368 tests
- 21 test files pass, 2 fail
- Failing: projects.test.ts (1 failure), student_onboarding_intelligence.test.ts (5 failures)

## 10. Phase 1 Implementation Priorities

1. **Fix the 6 failing tests** — repair broken imports and type mismatches
2. **Fix the 19 TypeScript errors** — type annotations and missing imports
3. **Create implementation documentation** — roadmap, architecture, security, local dev
4. **Verify authentication flow** — login, logout, me, role checks
5. **Verify admin provisioning** — seed-based admin creation
6. **Document local development setup** — exact commands
7. **Create implementation status tracker** — acceptance criteria
