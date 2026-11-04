# Local Development Guide — B.Tech Student AI Learning Platform

**Version:** 1.0.0  
**Phase:** Phase 1 (Foundation & Architecture)  
**Last Updated:** 2026-10-15  

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Git**

---

## 2. Installation and Environment Setup

1. **Clone & Navigate**:
   ```bash
   cd b.tech-ai-learning-platform
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Key environment variables:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=super_secret_jwt_key_btech_learning_platform_change_in_production
   GEMINI_API_KEY=your_gemini_api_key_here
   CORS_ORIGIN=http://localhost:5173
   ```
   *Note: If `GEMINI_API_KEY` is omitted, the platform gracefully defaults to simulated responses for AI components.*

---

## 3. Running the Application

### Full-Stack Development Mode
Starts both the Express API backend and Vite frontend dev server with hot module reloading:
```bash
npm run dev
```
- Frontend UI: `http://localhost:5173` (or `http://localhost:3000` depending on proxy/tsx configuration)
- API Base: `http://localhost:3000/api/v1`
- Health check: `http://localhost:3000/api/v1/health`

### Seed Credentials for Local Testing
The database initializes with seed users for quick local verification:
- **Super Admin**:
  - Email: `admin@btechlearn.edu`
  - Password: `Password123!`
  - Role: `SUPER_ADMIN`
- **Student**:
  - Email: `alex.chen@btechlearn.edu`
  - Password: `Password123!`
  - Role: `STUDENT`

---

## 4. Verification and Testing

### Run Automated Tests
```bash
npx vitest run
```

### Type Checking & Linting
```bash
npm run lint
```

### Production Build
```bash
npm run build
```
