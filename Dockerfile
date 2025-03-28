FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install Chromium and dependencies required for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn \
    dumb-init \
    bash

# Tell Puppeteer to use the installed Chrome instead of downloading its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# No build step needed for this Node.js application

# Expose the port
EXPOSE 8080

# Start the application with dumb-init to handle signals properly
CMD ["dumb-init", "--", "npm", "start"]