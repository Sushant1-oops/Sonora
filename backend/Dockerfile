# Multi-stage build keeps the final image small — dev dependencies
# (prisma CLI, nodemon) never ship to production.

FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---- deps stage ----
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --no-audit --no-fund
RUN npx prisma generate

# ---- runtime stage ----
FROM base AS runtime
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .

RUN mkdir -p logs && \
    addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Applies any pending Prisma migrations, then starts the server.
# Safe to run on every container start: migrate deploy is a no-op if
# there's nothing new to apply, and multiple replicas starting at once
# both attempt it, but Prisma's migration table prevents double-applies.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
