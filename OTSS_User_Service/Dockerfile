# ============================================================
# Stage 1 — Dependency Installation
# Node 24 required for Prisma 7 (requires >= 20.19 / 22.12+ / 24.0+)
# ============================================================
FROM node:24-alpine AS deps

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

# ============================================================
# Stage 2 — Prisma + NestJS production build
# ============================================================
FROM node:24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# ============================================================
# Stage 3 — Runner
# ============================================================
FROM node:24-alpine AS runner

WORKDIR /app

RUN apk add --no-cache openssl

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3010

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3010/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
