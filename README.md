<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4cb52fe1-9fbf-4071-ba62-e27c900fd86f

## Run Locally

**Prerequisites:**  Node.js


## Phase 14 — Community, Student Profile, Progress & Student Utilities

Phase 14 delivers a unified student personal productivity, community, and learning analytics layer:

### Architecture Overview

1. **Student Profile (`/profile`, `/profile/edit`)**
   - Academic credentials (Name, Branch, Semester, Graduation Year, Bio, Interests, Skills, Goals, Links).
   - Profile completion score engine distinguishing Required, Recommended, and Optional components.
   - Strict credential privacy: Passwords, internal IDs, and private tokens are never exposed.

2. **Unified Learning Progress (`/progress`, `/progress/:subsystem`)**
   - Separated measurable indicators across Courses, Skills, Quizzes, Coding Lab, DSA Lab, Projects, Placement, and Research.
   - **No single intelligence score** and **no student-to-student ranking**.
   - Recharts-powered distribution with "Not enough activity yet" empty-state fallbacks.

3. **Activity Events & Learning Streak (`/profile/activity`)**
   - Centralized `StudentActivity` event stream tracking verified platform actions (`COURSE_LESSON_COMPLETED`, `CODING_PROBLEM_SOLVED`, etc.).
   - Deterministic qualifying streak counter avoiding unhealthy or fabricated usage patterns.

4. **Learning Goals (`/goals`, `/goals/:goalId`)**
   - Goal creation with measurable milestones, status management, and grounded recommendations using actual platform resources.

5. **Unified Bookmarks (`/profile/bookmarks`)**
   - Unified bookmarking across Courses, Notes, Documents, Research, Coding, Projects, and Community.

6. **Achievements Engine (`/profile/achievements`)**
   - Event-driven deterministic rule evaluation based on actual platform criteria (no LLM-hallucinated achievements).

7. **Verified Certificates & Public Verification (`/profile/certificates`, `/verify/certificate/:id`)**
   - Deterministic eligibility criteria (curriculum completion and evaluations).
   - Tamper-proof digital signature hash generation.
   - Public unauthenticated verification endpoint returning validation status and course metadata without leaking student credentials.

8. **Student Community & Moderation (`/community`)**
   - Peer-to-peer Q&A with Markdown, code snippets, and accepted answer selection by the question author.
   - Topic categorization and follows (`/community/topics/:id`).
   - Project showcase featuring only explicitly student-approved public projects.
   - Moderation reporting pipeline (`CommunityReport`).

9. **AI Integration & Context Boundary Security**
   - 24 registered Phase 14 AI tools with schemas, permissions, timeouts, and mutation confirmation gates.
   - Strict context separation: Untrusted community content cannot override system instructions (`SYSTEM` vs `STUDENT REQUEST` vs `PLATFORM DATA` vs `COMMUNITY CONTENT`).

### Testing & Build Verification
- Unit & Integration Test Suite: 18 test files, 279 tests passing with 100% success (`npm test -- --run`).
- TypeScript: Typecheck passes with zero errors (`npx tsc --noEmit`).
- Production Bundle: Vite production build passes (`npm run build`).

## Deploy to AWS (Free Tier) with GitHub Actions

See [docs/deployment/AWS_DEPLOYMENT.md](docs/deployment/AWS_DEPLOYMENT.md): RDS PostgreSQL, an Application Load
Balancer, an EC2 app server, ECR, CloudWatch, and CI/CD from GitHub Actions through OIDC (no stored AWS keys).

## Deploy to Vercel

See [docs/deployment/VERCEL_DEPLOYMENT.md](docs/deployment/VERCEL_DEPLOYMENT.md).
