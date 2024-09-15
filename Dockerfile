# Use the official Node.js 20 image as the base image
FROM node:20

# Set the working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the NestJS application
RUN pnpm run build

# Expose the application port
EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/main.js"]