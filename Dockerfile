# Production image for the portfolio (Next.js `next start`, MySQL-backed).
# Not `output: standalone`: the seed/reset scripts run TypeScript from src/ via tsx.

# --- production-only node_modules ---
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g bun
COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# The build does not need a database.
RUN bun run build

# --- runtime ---
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    UPLOAD_DIR=/data/projects
# Runtime env (not baked in): DATABASE_URL=mysql://user:pass@host:3306/db
# Uploads live on a volume at UPLOAD_DIR; named volumes inherit this ownership.
RUN mkdir -p /data/projects && chown node:node /data/projects
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/scripts ./scripts
COPY --from=builder --chown=node:node /app/src ./src
COPY --from=builder --chown=node:node /app/package.json /app/next.config.mjs /app/tsconfig.json ./
USER node
EXPOSE 3000
# Healthcheck lives in docker-compose.coolify.yml (single source of truth).
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
