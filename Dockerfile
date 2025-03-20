FROM node:20-slim

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install curl and other dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Shopify CLI
RUN npm install -g @shopify/cli @shopify/cli-hydrogen

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma Client and deploy migrations
RUN npx prisma generate && npx prisma migrate deploy

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "start"] 