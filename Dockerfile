<<<<<<< HEAD
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup Backend Runtime
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --production

# Copy backend source code
COPY server/ ./

# Copy built frontend assets from Stage 1 to server's public directory
COPY --from=frontend-builder /app/dist ./public

# Configuration
ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
=======
# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
# Note: Currently using mock data, no environment variables required for build
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

>>>>>>> 547bf4b29666d8a4068b92295cae21fc2f742582
