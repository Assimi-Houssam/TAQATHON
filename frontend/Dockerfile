# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: AMehdiKh <AMehdiKh@protonmail.com>         +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/07/08 17:29:04 by AMehdiKh          #+#    #+#              #
#    Updated: 2025/07/09 08:18:07 by AMehdiKh         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM node:24.3.0-alpine3.22 AS base


FROM base AS dependencies

RUN apk update && apk upgrade && apk add --no-cache libc6-compat

WORKDIR /app
COPY package*.json ./
COPY vendor/ ./vendor/

RUN npm ci --legacy-peer-deps


FROM base AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production \
	NEXT_TELEMETRY_DISABLED=1

RUN npm run build


FROM base AS runner

WORKDIR /app


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

ENV NODE_ENV=production \
	NEXT_TELEMETRY_DISABLED=1 \
	PORT=3000 \
	HOSTNAME=0.0.0.0

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
#   CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1


# RUN chown -R nextjs:nodejs /app
# USER nextjs























# # Install curl for health checks
# RUN apk add --no-cache curl

# # Copy package files and vendor directory first
# COPY package*.json ./
# COPY vendor/ ./vendor/

# # Install dependencies (including dev dependencies for build)
# RUN npm ci && npm cache clean --force

# # Set environment variables for build
# ENV NODE_ENV=production
# ENV NEXT_PUBLIC_API_URL=/api
# ENV HOSTNAME=0.0.0.0

# # Copy source code
# COPY . .

# # Build the application
# RUN npm run build

# # Create non-root user
# RUN addgroup -g 1001 -S nodejs && \
#     adduser -S nextjs -u 1001

# # Change ownership
# RUN chown -R nextjs:nodejs /app
# USER nextjs

# # Expose port
# EXPOSE 3000

# # Health check
# HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
#   CMD curl -f http://localhost:3000 || exit 1

# # Start the application
# CMD ["npm", "start"]