# Student Personalization Modules: Audit, Architecture, & Integration Plan
**B.Tech Student AI Learning Platform**
*Date: 2026-10-17*

---

## 1. Executive Overview & Scope

This specification and audit document governs the end-to-end implementation and integration of the five core student personalization modules:

1. **Unified Progress** (`/progress`, `/progress/:subsystem`)
2. **Learning Goals** (`/goals`, `/goals/:id`, `/learning-goals`)
3. **Student Profile** (`/profile`, `/profile/edit`, `/profile/settings`)
4. **Notifications** (`/notifications`)
5. **Settings** (`/settings`, `/profile/settings`)

These five subsystems form a unified personalization feedback loop. When a student registers, completes onboarding, or updates their profile, the academic and career context immediately personalizes their goals, drives their learning progress metrics, generates relevant notifications, and respects their configured settings.

---

## 2. Initial Repository Audit

### 2.1 Existing Routes & Navigation
- `/progress`: Rendered by `ProgressDashboardPage.tsx`. Provides weekly charts and category breakdown. Needs student header, date range filter (7d, 30d, 90d, semester, all), overview cards, academic progress, chronological activity timeline, and zero-fabrication metrics.
- `/progress/:subsystem`: Rendered by `SubsystemProgressPage.tsx`. Covers `courses`, `skills`, `quiz`, `coding`, `dsa`, `projects`, `placement`, `research`.
- `/goals`: Rendered by `GoalsPage.tsx`. Supports basic list and creation. Needs search, category/status/priority filters, milestone builder, and status transitions (Active, Completed, Paused, Archived).
- `/goals/:id`: Rendered by `GoalDetailPage.tsx`. Supports viewing goal and toggling milestones.
- `/profile`: Rendered by `ProfilePage.tsx`. Displays student header, stats, and tabs.
- `/profile/edit`: Rendered by `ProfileEditPage.tsx`.
- `/profile/settings` & `/settings`: Rendered by `ProfileSettingsPage.tsx`. Contains Privacy, Notifications, AI Preferences, and Accounts. Needs password change modal, data export, and appearance settings.
- `/notifications`: Rendered by `NotificationsPage.tsx`. Handles list, mark read, mark all read. Needs delete/dismiss, category filtering, and real reminder generation.

### 2.2 Existing Backend APIs & Services
| Domain | Router | Service | Database Model / Store |
| :--- | :--- | :--- | :--- |
| **Progress** | `server/api/routes/progress.ts` | `ProgressService` | `db.activities`, `db.course_progress`, `db.quiz_attempts`, `db.coding_submissions` |
| **Goals** | `server/api/routes/goals.ts` | `GoalService` | `db.learning_goals` (Map) |
| **Profile** | `server/api/routes/profile.ts` | `ProfileService` | `db.students`, `db.education_profiles`, `db.career_goals`, `db.learning_preferences` |
| **Notifications** | `server/api/routes/notifications.ts` | `NotificationService` | `db.notifications`, `db.notification_preferences` |
| **Settings** | `server/api/routes/profile.ts` | `ProfileService` | `db.privacy_settings`, `db.student_preferences`, `db.notification_preferences` |

### 2.3 Identified Gaps & Required Fixes
1. **Zero-Fabrication in Progress**: `ProgressService.getUnifiedProgress()` contained fallback hardcoded integers (`idx === 0 ? 1 : ...`, `courses_completed: 2`, `quiz_average_accuracy: 88`) for students without real activity. Must aggregate real records and return truthful 0s with descriptive empty states.
2. **Date Range Filtering in Progress**: Need backend and frontend support for `7d`, `30d`, `90d`, `semester`, and `all` time windows.
3. **Chronological Activity Timeline**: Must surface real student events with links, source modules, and timestamps.
4. **Learning Goals Lifecycle**: Need priority field, dynamic milestone adding/removing, status management (`ACTIVE`, `IN_PROGRESS`, `COMPLETED`, `PAUSED`, `ARCHIVED`), and search/filter.
5. **Notification Operations**: Add notification dismissal (`DELETE /api/v1/notifications/:id`), route aliases for `/notifications/preferences`, and reminder generation (`POST /api/v1/notifications/generate-reminders`).
6. **Password Change & Data Export in Settings**: Add `POST /api/v1/auth/change-password` and `GET /api/v1/student/data-export`.
7. **Single Source of Truth**: Synchronize student onboarding records (`education_profiles`, `career_goals`, `study_constraints`) directly with Profile, Progress, and Settings.

---

## 3. Shared Student Context & Data Isolation

All five modules enforce:
- Ownership derived strictly from `req.user!.userId` via JWT.
- Zero reliance on client-supplied student IDs for data modification.
- Multi-tenant boundary checks: two distinct students (`std_A` and `std_B`) cannot read, edit, or delete each other's profiles, goals, progress, or notifications.

---

## 4. Test Strategy

Automated test suite (`src/tests/unified_personalization_modules_e2e.test.ts`) covering:
1. **Unified Progress**: Real metric calculation, date range filtering, empty state messages, data export.
2. **Learning Goals**: Creation, milestone toggling, status transitions, filtering, deletion, and recommendation grounding.
3. **Student Profile**: Field validation, persistence, completion breakdown, and academic synchronization.
4. **Notifications**: Retrieval, unread tracking, filtering, mark read, mark all read, dismissal, reminder generation, preference enforcement.
5. **Settings**: Appearance, privacy, AI preferences, notification toggles, password change, data export.
6. **Cross-Module Integrations & Security**: End-to-end data propagation and isolation verification.
