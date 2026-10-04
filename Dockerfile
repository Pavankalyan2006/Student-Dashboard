# ============================================================================
# Multi-Stage Production Dockerfile for B.Tech AI Learning Platform
# Non-root user, minimal attack surface, health checks & production bundles
# ============================================================================

# --- Stage 1: Build Frontend and Compile Assets ---
FROM node:20-alpine AS builder

WORKDIR /app

# Ensure compatibility for native binary bindings (esbuild, tailwind, etc.)
RUN apk add --no-cache libc6-compat

# Install build dependencies
COPY package*.json .npmrc* ./
RUN npm ci --legacy-peer-deps

# Copy full application source code
COPY . .

# Build client production bundle (Vite SPA)
RUN npm run build

# --- Stage 2: Minimal Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache libc6-compat wget

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json .npmrc* ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy compiled frontend distribution and backend code from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/index.html ./index.html

# Create data directories and grant permissions to non-root node user
RUN mkdir -p /app/data/vault && chown -R node:node /app

# Switch to non-root user
USER node

# Expose HTTP port
EXPOSE 3000

# Container liveness health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

# Start production server using tsx
CMD ["node", "--loader", "tsx", "server.ts"]
