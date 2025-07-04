# Use Node.js 18 LTS Alpine for smaller image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files and vendor directory first
COPY package*.json ./
COPY vendor/ ./vendor/

# Install dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Set environment variables for build
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=/api
ENV HOSTNAME=0.0.0.0

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]