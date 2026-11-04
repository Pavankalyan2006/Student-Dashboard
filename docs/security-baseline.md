# Security Baseline & Governance — B.Tech Student AI Learning Platform

**Version:** 1.0.0  
**Phase:** Phase 1 (Foundation & Architecture)  
**Last Updated:** 2026-10-15  

---

## 1. Authentication Security

1. **Password Hashing**:
   - `bcryptjs` with salt rounds >= 10. Plaintext passwords are never stored or logged.
2. **Session / Token Management**:
   - JSON Web Tokens (JWT) signed with `JWT_SECRET` (configured via environment).
   - Delivered via `httpOnly`, `sameSite: 'lax'`, `secure` cookies (in production) to prevent XSS exfiltration.
   - Fallback `Authorization: Bearer <token>` support for non-browser/mobile clients.
3. **Session Expiry**:
   - Default token validity: 7 days.
   - Graceful session invalidation upon explicit logout (`POST /api/v1/auth/logout`) which clears the auth cookie.

---

## 2. Server-Side Role-Based Access Control (RBAC)

1. **Two Core Application Roles**:
   - `SUPER_ADMIN`: Authorized for administrative governance, student account management, global content, system health, and audit logs.
   - `STUDENT`: Authorized strictly for their own student profile, academic semester, learning progress, AI conversations, and lab submissions.
2. **Strict Middleware Enforcement**:
   - `requireAuth`: Validates JWT token, verifies account status is `ACTIVE`.
   - `requireRole(['SUPER_ADMIN'])`: Rejects any unauthorized student attempting to access `/api/v1/admin/*` with HTTP 403 Forbidden.
   - Client-provided role claims are ignored; roles are extracted directly from the verified token payload.

---

## 3. Tenant Isolation & Resource Ownership

1. **Ownership Enforcement**:
   - Endpoints under `/api/v1/students/me/*` use `req.user.id` to fetch or mutate records.
   - Resource-specific endpoints (e.g., `/api/v1/projects/:id`) assert that the requesting user owns the resource or holds `SUPER_ADMIN` privileges.
2. **IDOR Prevention**:
   - Never trust student IDs passed in request bodies or query parameters when resolving current student records.
   - Student context engine and memory services assert `studentId === req.user.id`.

---

## 4. Input Validation & Defense-in-Depth

1. **Payload Sanitization**:
   - Strict schema validation on input fields (email, names, branch, semester numbers, ratings).
   - Semester values bounded between 1 and 8 for undergraduate B.Tech curriculum.
2. **Rate Limiting**:
   - General API rate limiting (100 req/15 min) and stricter auth rate limiting (10 login attempts/15 min) via in-memory sliding window middleware.
3. **HTTP Security Headers**:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security` (when running over TLS)
4. **AI Safety & Tool Sandboxing**:
   - Server-side tool execution verifies permitted tool scopes in `ToolRegistry`.
   - No arbitrary shell execution or production database queries are exposed to AI models.
