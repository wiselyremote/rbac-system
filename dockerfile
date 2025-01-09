# Step 1: Build the application
FROM node:18 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and yarn.lock into the container to install dependencies
COPY package.json yarn.lock ./

# Set up Yarn with the "Berry" version and other configurations for optimized caching and installation
RUN corepack enable && \
    yarn set version berry && \
    yarn config set nodeLinker pnp && \
    yarn config set enableGlobalCache false && \
    yarn

# Copy all the project files from the local machine into the container (this includes the source code)
COPY . .

# Build the application (e.g., using TypeScript) and list the contents of the dist folder to check the build success
RUN yarn build && ls -la /app/dist

# Step 2: Create the production image
FROM node:18-alpine AS production

# Set the working directory inside the production container
WORKDIR /app

# Copy the build files (from the builder stage) into the production image
COPY --from=builder /app/dist dist
COPY --from=builder /app/package.json /app/yarn.lock .
# Re-enable corepack and install production dependencies using Yarn
RUN corepack enable && \
    yarn

# Expose port 8080 so the application can be accessed from outside the container
EXPOSE 8080

# Define the default command to start the application using Yarn
ENTRYPOINT ["yarn", "start"]
