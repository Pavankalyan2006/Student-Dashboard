# Personal AI University OS: Phases 0 to 2 report

Date: 2026-11-15. Branch `claude/project-thread-lyg4zq`. This PR covers Phase 0 (audit), Phase 1 (navigation) and Phase 2 (Personal Intelligence) of the "Complete AI-powered university ecosystem" brief. Phases 3 to 8 follow in their own PRs.

## Phase 0: what already exists

The brief asks to extend, not duplicate. These brief modules already exist and will be extended in later phases, not rebuilt:

| Brief module | Existing page |
| --- | --- |
| Architecture Studio | System Design Lab (`/system-design`) |
| AI Interview Arena | Mock Interviews (`/mock-interviews`) |
| Student Digital Portfolio | Portfolio Showcase (`/portfolio`, PR #15) |
| Hackathon & Competition Hub | Codeforces contests on Deadlines (PR #15) |
| Opportunity Intelligence | Jobs Discovery and Applications |
| Research Intelligence | Research (`/research`) and Discover (`/discover`) |
| AI Model Playground | AI/ML Lab (`/ml-lab`) |
| Developer Workspace | Coding Lab (`/coding`) |
| Academic Intelligence | Grades & CGPA and Attendance |
| Smart Notebook | Notes (`/notes`) |
| Career Roadmap Generator | Career Roadmap (`/career/roadmap`) |
| Virtual University Lab | Lab Assistant, DSA Lab, SQL Lab |

## Deliverables for this PR

### 1. New pages

| Page | Route | What it does |
| --- | --- | --- |
| Daily Briefing | `/briefing` | Today's items from the student's own records. Each item can be marked done, added to the study plan (title, minutes and day editable first), postponed by 1, 3 or 7 days, or dismissed. Handled items can be brought back. "Plan my day with AI Tutor" hands the list to the tutor. |
| My AI Brain | `/ai-brain` | Counts of what the platform holds about the student. Answers questions from their own notes, documents (with page numbers), projects, Knowledge Graph topics and mistakes, with numbered sources. AI additions are marked "Suggestion (not from your records)". Exports all AI-related data as JSON. |
| Knowledge Graph | `/knowledge-graph` | An interactive SVG graph per subject. Columns are units and arrows show order. Filter by state, search, and open a topic to see the evidence behind its state, linked notes and decks, and "Ask AI Tutor". Also lists topics needing revision, skipped foundations, next topics and practice outside the syllabus. |
| AI Agent Control Center | `/agents` | Seven specialist agents with an on/off switch each, their tools, the 12 tools that ask first, recent tutor requests with the agents used, and a per-student tool log. |

### 2. Enhanced pages

- **Dashboard:** a compact "Today's briefing" card showing the top three items with Done. The card is hidden when there is nothing to show.
- **AI Tutor:** honours the student's agent switches (see item 7).

### 3. Navigation

- New sidebar section **Personal Intelligence**: Daily Briefing, My AI Brain, Knowledge Graph, AI Agent Control Center, and AI Memory (moved here from Personal Workspace).
- Aliases: `/daily-briefing`, `/knowledge-map` and `/agent-control-center`.
- `/knowledge-graph` is matched before the existing `/knowledge` (Knowledge Base) prefix route, so it does not open the wrong page.

### 4. Components

- `BriefingItemRow`: the four actions, used on the briefing page and the dashboard card.
- `BriefingCard`: the dashboard card.

All four pages use the shared design system (PageHeader, PageSection, MetricCard, LoadingState, ErrorState, EmptyState, Button).

### 5. APIs

All routes are under `/api/v1`, need sign-in, and use `req.user` from the verified session.

- `GET /knowledge-graph/me`
- `GET /briefing/me?tz=`
- `POST /briefing/me/items/:id` with `{action: done|dismissed|postponed, until?}`
- `POST /briefing/me/items/:id/plan` with `{title?, minutes?, date?}`
- `DELETE /briefing/me/items/:id`
- `GET /ai-brain/me`
- `POST /ai-brain/me/ask` (uses the existing AI rate limiter)
- `GET /ai-brain/me/export`
- `GET /agents/me`
- `PATCH /agents/me/:agentId` with `{enabled}`
- `GET /agents/me/activity`

### 6. Database and migrations

There are no schema migrations. Two new persisted stores are registered with the existing state store (Supabase `app_state_entries` in production):

- `agentActivity`: the per-student tool log (last 100 calls) and agent switches.
- `briefing`: per-student item actions, pruned to 60 days and 300 entries.

Row-level isolation is done in code: every read and write is keyed by the signed-in student's id.

### 7. AI integrations and agent workflows

- **Approval before change.** `ToolRegistry.execute` now refuses any tool marked `confirmationRequired` unless the call carries `confirmed: true`. That covers deleting documents, running code, creating projects, editing the resume or profile, goals and bookmarks. The refusal is HTTP 409 `APPROVAL_REQUIRED`. Agents never pass approval, so they cannot run these tools on their own. Before this change the flag existed but was never checked.
- **Tool log.** Every tool call is logged per student with the tool, the calling agent, its category, whether it needed approval, whether it was approved, the outcome and the duration. Parameters and results are not stored.
- **Per-student agent switches.** The master agent removes switched-off agents from the routed intent and from the planned steps. If no agent is left, the core tutor answers. The plan event reports `skipped_agents`.
- **My AI Brain.** The AI answers only from numbered records, through the same citation cleaner as Discover. Nothing is sent to the AI when personalisation is off in AI Memory. When the AI provider is unavailable, the page shows that clearly and still lists the matching records.

### 8. Data rules kept

- **Knowledge Graph states** come from records only:
  - Demonstrated needs at least 3 right answers and at least 70% right.
  - Needs revision means a wrong answer not yet answered right.
  - Opening a lesson never counts.
  - Practice labels that match no syllabus topic are listed separately instead of being guessed onto one.
- **Briefing items** come from:
  - Deadlines: semester events, slip tests, goals, plans, projects and applications.
  - Study plan tasks.
  - Attendance below the student's minimum.
  - Knowledge Graph gaps.
  - Due flashcards and open mistakes.
  - Codeforces rounds within 48 hours.

  Each item names its source. A student with no records gets an empty briefing.

### 9. Security

- All new routes return 401 without a session.
- A student cannot act on another student's briefing items. The item must be in the caller's own briefing, otherwise the route returns 404.
- Inputs are validated: action names, postpone limited to 1 to 14 days, plan day limited to today through 30 days ahead, minutes from 5 to 600, and agent ids must be known.
- The export contains no email, password or name.
- When Codeforces is unreachable, the briefing does not retry it for 5 minutes, so the page stays fast.

### 10. Tests

- New `src/tests/personal_intelligence.test.ts` (16 tests):
  - Knowledge Graph state rules, matching, dependencies and foundations.
  - Briefing building, priorities, hide and postpone rules, and pruning.
  - AI Brain prompt rules.
  - The approval guard: 409 and logged as blocked; runs with approval; no parameters stored.
  - Per-student agent switches.
  - Every specialist maps onto real registry agents.
  - Navigation.
  - **Two real accounts over HTTP:**
    - 401s.
    - Briefing isolation, including B acting on A's item (404).
    - Validation errors.
    - Add to plan.
    - Undo.
    - Agent switches kept separate.
    - The AI Brain refuses when personalisation is off.
    - Exports contain no personal details and no other student's data.
- Updated tests:
  - `admin_security_production.test.ts`: a `confirmationRequired` tool now needs approval for admins too.
  - `navigation.test.ts`: adds the new section.
- Results:
  - `npm test`: **72 files passed, 2 skipped; 1,075 tests passed, 10 skipped, 0 failed.**
  - `tsc --noEmit`: clean.
  - `npm run build`: succeeded.
- **Browser check** (Playwright, seeded account, 1440 px and 390 px):
  - All four pages and the dashboard render with no horizontal overflow and no page errors.
  - Selecting a graph node shows its evidence.
  - The coding agent switched off and back on.
  - A briefing item was postponed (8 → 7 items), then brought back (8).
  - AI Brain found a document with its page number. The AI answer was unavailable on this machine, which has no AI key, and the page said so.

Screenshots: `screenshots/knowledge-graph.png`, `knowledge-graph-mobile.png`, `daily-briefing.png`, `ai-brain.png`, `agent-control-center.png`.

### 11. Known limitations

- The graph's links between a topic and its evidence are made by matching names. This is strict on purpose (the whole topic name, or most of its keywords), so some practice stays under "Practice outside your syllabus" instead of being attached to the wrong topic.
- Topic order comes from the syllabus (the previous topic in the same unit) unless a topic lists explicit prerequisites.
- Turning off an agent changes AI Tutor requests only. Pages that call their own services directly are not affected.
- The briefing is computed when it is opened. No scheduled push is sent, because the Vercel deployment has no scheduler configured.

### 12. Environment variables

None new.

### 13. External configuration

None new. Codeforces is optional; the briefing works without it.

### 14. Run locally

```
PORT=3100 DATA_PERSISTENCE=off AUTH_PROVIDER=legacy JWT_SECRET=<32+ chars> JWT_REFRESH_SECRET=<32+ chars> npm run dev
```

Sign in as the seeded student. AI answers need the usual AI provider key.

### 15. Status by feature

| Feature | Status |
| --- | --- |
| Knowledge Graph | Fully implemented |
| Daily Briefing page and dashboard card | Fully implemented |
| My AI Brain (overview, ask with sources, export) | Fully implemented. AI answers need the configured provider. |
| AI Agent Control Center (switches, tools, log, requests) | Fully implemented |
| Approval before data-changing AI tools | Fully implemented |
| Scheduled or pushed briefings | Infrastructure-dependent (needs a scheduler) |

## Files

- **New, server:**
  - `server/services/knowledgeMapMath.ts`
  - `server/services/knowledgeMapService.ts`
  - `server/services/briefingMath.ts`
  - `server/services/briefingService.ts`
  - `server/services/aiBrainService.ts`
  - `server/services/agentActivityService.ts`
  - `server/ai/orchestration/studentAgents.ts`
  - `server/api/routes/personalIntelligence.ts`
- **New, client:**
  - `src/features/knowledge-graph/pages/KnowledgeGraphPage.tsx`
  - `src/features/briefing/{briefingApi.ts, components/BriefingItemRow.tsx, components/BriefingCard.tsx, pages/BriefingPage.tsx}`
  - `src/features/ai-brain/pages/AiBrainPage.tsx`
  - `src/features/agents/pages/AgentControlCenterPage.tsx`
- **Changed:**
  - `server/ai/tools.ts`: approval guard and log.
  - `server/ai/service.ts`
  - `server/api/routes/ai.ts`: passes `confirmed`.
  - `server/ai/orchestration/master.ts`: agent switches.
  - `server/ai/orchestration/agentHandlers.ts`: passes the agent name.
  - `server/app.ts`: persistence.
  - `server/api/router.ts`
  - `src/App.tsx`
  - `src/components/navigation/navConfig.ts`
  - `src/pages/DashboardPage.tsx`
  - The two tests above.

## Next phases

- **3. Academic:**
  - What-if CGPA on Grades & CGPA.
  - Smart Notebook additions in Notes.
  - Browser-only lab simulators (CPU scheduling, subnetting, logic gates).
  - Previous Papers needs OCR, which is not configured.
- **4. Engineering:**
  - Code review on the existing AI.
  - Educational cybersecurity labs with no real targets.
  - Code execution stays off until an isolated sandbox is configured.
- **5. Career, 6. Research, 7. Cross-platform, 8. QA:** each in its own PR.
