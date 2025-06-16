FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

# Set NODE_ENV to development during build to install dev dependencies
ENV NODE_ENV=development

COPY package.json package-lock.json* ./

# Install all dependencies including dev dependencies for build
# Use npm install instead of npm ci since package-lock.json might not exist
RUN npm install && npm cache clean --force

COPY . .

RUN npm run build

# Now set NODE_ENV to production
ENV NODE_ENV=production

# Remove dev dependencies after build to keep image size smaller
RUN npm prune --omit=dev && npm cache clean --force

CMD ["npm", "run", "docker-start"]
