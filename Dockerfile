# Production Dockerfile for Crackers POS Billing System
FROM node:20-alpine

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build Vite frontend assets
RUN npm run build

# Expose production port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Start Express & static React web server
CMD ["node", "server/index.cjs"]
