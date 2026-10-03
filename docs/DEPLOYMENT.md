# Production Deployment & Operational Runbook

This document details the configuration and deployment procedures for the **B.Tech Student AI Learning Platform**.

---

## 1. System Architecture Overview

```
STUDENT APPLICATION                     SUPER ADMIN PORTAL
       |                                        |
  React + Vite                             React + Vite
       |                                        |
       +-------------------+--------------------+
                           |
                           v
               FastAPI / Express API Gateway
         (CORS Allowlist, Rate Limiting, CSP Headers,
                  Request ID Tracking)
                           |
        +------------------+------------------+
        |                                     |
        v                                     v
  Authentication                         AI Agent Core
 (JWT + Refresh,                       (Gemini / OpenAI,
 Least Privilege)                       Tool Registry)
        |                                     |
        +------------------+------------------+
                           |
                           v
        PostgreSQL 16 · Redis 7 · Object Storage Vault
```

---

## 2. Prerequisites & Environment Setup

- **Node.js:** v20.x LTS or higher
- **PostgreSQL:** 16+
- **Redis:** 7+
- **Docker & Docker Compose:** Optional for containerized deployment

### 2.1 Environment Configuration
Copy `.env.example` to `.env` and supply production values:
```bash
cp .env.example .env
```
Ensure all secrets (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `GITHUB_TOKEN_ENCRYPTION_KEY`, `CERTIFICATE_SIGNING_SALT`) are generated using high-entropy random byte generators (minimum 32 bytes).

---

## 3. Production Deployment Methods

### Option A: Docker Compose Deployment (Recommended)

1. Build and launch services in detached mode:
   ```bash
   docker compose up -d --build
   ```

2. Verify container statuses:
   ```bash
   docker compose ps
   ```

3. Confirm liveness and readiness health checks:
   ```bash
   curl http://localhost:3000/health/live
   curl http://localhost:3000/health/ready
   ```

### Option B: Bare-Metal / Systemd Deployment

1. Install production dependencies and build frontend:
   ```bash
   npm ci
   npm run build
   ```

2. Start the production server via process manager (e.g., PM2):
   ```bash
   pm2 start "node --loader tsx server.ts" --name "btech-ai-platform" --instances max
   ```

---

## 4. Super Admin Initial Onboarding

The platform has strictly two user roles:
- `STUDENT`
- `SUPER_ADMIN`

### Default Initial Credentials (Development/Testing):
- **Super Admin Email:** `admin@btech.edu`
- **Password:** `AdminPassword123!`
- **Portal URL:** `https://your-domain.com/admin`

> **CRITICAL PRODUCTION ACTION:**
> On first production launch, immediately change the Super Admin password or initialize via secure environment variables. Never reuse development credentials in production.

---

## 5. Security & Platform Guardrails

1. **Least-Privilege Admin Access:**
   Super Admins have full configuration and oversight capabilities but cannot casually inspect private student documents, raw source codes, or OAuth credentials.
2. **CORS Explicit Allowlist:**
   Wildcard `*` is strictly disabled. Allowed origins are defined in `CORS_ORIGINS`.
3. **Hardened HTTP Headers:**
   `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` are enforced.
4. **Adaptive Rate Limiting:**
   In-memory sliding window limits prevent brute-force attacks and AI credit exhaustion.
5. **Prompt Injection Boundary Isolation:**
   External documents, user uploaded PDFs, and GitHub repository codes are wrapped with rigorous system prompt boundaries before LLM ingestion.

---

## 6. Health Probes & Monitoring Endpoints

| Endpoint | Purpose | Access | Expected Status |
| :--- | :--- | :--- | :--- |
| `/health/live` | Process liveness | Public | `200 OK` |
| `/health/ready` | DB dependency readiness | Public | `200 OK` (or `503` if DB down) |
| `/api/v1/admin/system/health` | Comprehensive diagnostics | SUPER_ADMIN | `200 OK` with JSON telemetry |
| `/api/v1/admin/system/metrics` | Latency & queue depth | SUPER_ADMIN | `200 OK` |
