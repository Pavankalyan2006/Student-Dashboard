# Component Audit

384 `.tsx` files under `src/`. Component-level coverage so far is limited to components
on the paths exercised below; the rest are recorded as untested rather than passing.

| ID | Page | File | Type | Expected | Actual (before) | Test | Defect | Fix | Retest |
|----|------|------|------|----------|-----------------|------|--------|-----|--------|
| C-001 | All | `src/context/StudentContext.tsx` | data provider | Load profile, goals, unread count, progress | 3 × 404, profile never set | crawl | BUG-001 | yes | PASS |
| C-002 | AI Tutor | `src/pages/AiAgentPage.tsx` | page state | Start with no conversation or the student's own | Requested demo `conv_01` → 403 | crawl | BUG-003 | yes | PASS |
| C-003 | AI Tutor | `features/ai-agent/components/ContextPanel.tsx` (via `/ai/tutor/context-options`) | selector panel | List courses, documents, notes | Empty (500) | crawl + API | BUG-002 | yes | PASS |
| C-004 | AI Tutor | `features/ai-agent/hooks/useAIChat.ts` | SSE chat | Stream reply, create conversation | Works; reply was canned text | API (SSE) | BUG-015 | yes | PASS (fallback path) |
| C-005 | Flashcards | `features/flashcards/components/CreateFlashcardsModal.tsx` | source pickers | List student's notes, documents, courses | Always empty | code review | BUG-005 | yes | not clicked through |
| C-006 | Courses | `features/courses/components/CourseAIActions.tsx` | AI result panel | Show result with "Continue in Full AI Agent" | `ReferenceError: Button` | typecheck | BUG-016 | yes | typecheck clean |
| C-007 | Courses | `CourseCard.tsx`, `CourseHero.tsx`, `CourseDetailPage.tsx` | edit controls | Edit only on custom courses | UI gated by `is_custom`, server was not | API | BUG-007 | server fixed | PASS |
| C-008 | Knowledge Base | `features/knowledge-base/api/knowledgeBaseApi.ts` | API module | Filter by document/collection/limit | Filters sent as headers | unit | BUG-004 | yes | PASS |
| C-009 | Shell | `components/navigation/Sidebar.tsx` | 41 nav links | Each opens its page | All 41 render, `/sync` has no nav link | crawl | — | — | PASS |
| C-010 | Shell | top bar | icon button | Accessible name | One visible button without text/aria-label on every page | mobile check | OPEN-003 | no | FAIL |
