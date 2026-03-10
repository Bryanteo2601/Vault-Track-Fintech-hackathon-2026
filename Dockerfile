# Use Node.js version 18 or later (latest LTS)
FROM node:18.12

# Set working directory inside the container
WORKDIR /app

# Install pnpm globally
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm

# Install the dependencies inside the container
RUN pnpm install

# Copy all app code excluding node_modules
COPY . .

# Expose necessary ports
EXPOSE 8082

# Set the default command to start the app
CMD ["pnpm", "dev:metro"]