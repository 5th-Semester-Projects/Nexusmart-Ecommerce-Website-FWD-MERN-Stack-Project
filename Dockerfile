# Multi-stage build for production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production
WORKDIR /app/client
RUN npm ci --only=production
WORKDIR /app/server
RUN npm ci --only=production

# Build the frontend
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY . .

WORKDIR /app/client
RUN npm run build

# Production image for server
FROM base AS server
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/server/node_modules ./node_modules
COPY --chown=appuser:nodejs server/ ./
COPY --from=builder --chown=appuser:nodejs /app/client/dist ./public

USER appuser

EXPOSE 5000

CMD ["node", "server.js"]

# Production image for frontend (Nginx)
FROM nginx:alpine AS frontend

COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
