# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# Copy source and build
COPY . .
RUN yarn build

# Production stage - ultra-small busybox image
FROM busybox:1.36-musl AS production
COPY --from=builder /app/out /var/www/html
WORKDIR /var/www/html

EXPOSE 8080
CMD ["busybox", "httpd", "-f", "-p", "8080", "-h", "/var/www/html"]
