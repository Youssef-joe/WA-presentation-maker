FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application if needed
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]