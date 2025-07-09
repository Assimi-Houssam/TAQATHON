# frontend/Dockerfile

# Use an official Node base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy only package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your frontend source code
COPY . .

# Expose the port used by Next.js
EXPOSE 3000

# Start dev server (Turbopack enabled)
CMD ["npm", "run", "dev"]
