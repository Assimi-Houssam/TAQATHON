# Use standard Node.js 18 (not Alpine) for better native module compatibility
FROM node:18

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package*.json ./

# Clean install to avoid architecture mismatches
RUN rm -rf node_modules package-lock.json
RUN npm cache clean --force
RUN npm install --no-package-lock --platform=linux --arch=x64

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN groupadd -r nodejs && useradd -r -g nodejs nestjs

# Change ownership of app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose ports for API and WebSockets
EXPOSE 1337 4800 5140

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:1337/api || exit 1

# Start the application
CMD ["npm", "run", "start:prod"] 