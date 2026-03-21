# ============================================================
# Stage 1 — Dependency Installation
# ============================================================
FROM node:20-alpine AS deps

WORKDIR /app

# openssl required by Prisma query engine on Alpine
RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci 

# ============================================================
# Stage 2 - Prisma + Nest JS production build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client for Alpine (linux-musl-openssl-3.0.x)
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npm run build

# ============================================================
# Stage 3 — Runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

# Non-root user for security hardening
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy production node_modules (reinstall prod-only to trim dev deps)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY prisma.config.ts ./

# Set ownership before switching user
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3010

# Healthcheck — aligns with K8s readiness probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3010/health || exit 1

# Run migrations then start the server
# migrations are idempotent — safe to run on every startup
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]