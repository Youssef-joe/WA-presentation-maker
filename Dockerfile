FROM ghcr.io/puppeteer/puppeteer:21.5.2

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Create directory for WhatsApp Web.js session data
RUN mkdir -p /app/.wwebjs_auth

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "app.js"]
