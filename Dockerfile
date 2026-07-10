# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g bun
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# mysql2 is pure JS — no native build needed, and the build no longer touches
# the database (all routes render on demand).
RUN bun run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# DB connection comes from the environment at runtime:
#   DATABASE_URL=mysql://user:pass@host:3306/dbname
# or the individual MYSQL_HOST / MYSQL_PORT / MYSQL_USER / MYSQL_PASSWORD / MYSQL_DATABASE vars.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src ./src
EXPOSE 3000
CMD ["npx", "next", "start", "-p", "3000"]
