
# Stage 1: Build Stage
FROM node:20.9.0-bullseye-slim as build

# Set environment variables for the build stage
ENV NODE_ENV=development
WORKDIR /app

# Copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

# Install development dependencies (for building, testing, etc.)
RUN npm install

# Copy the rest of the source code
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tests ./tests

# Optionally run tests or build assets
# RUN npm test

# Stage 2: Production Stage
FROM node:20.9.0-bullseye-slim as production

# RUN apt-get update && \
#     apt-get install -y --no-install-recommends wget && \
#     wget http://ftp.debian.org/debian/pool/main/d/dumb-init/dumb-init_1.2.5-3_amd64.deb && \
#     dpkg -i dumb-init_1.2.5-3_amd64.deb && \
#     rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
LABEL maintainer="Arlene Pham <hpham32@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# Default to port 8080 for the service
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Set up the working directory
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/src ./src
COPY --from=build /app/tests/.htpasswd ./tests/.htpasswd

# Install only production dependencies
RUN npm ci --production

# Switch to a non-root user
USER node

# Start the container with dumb-init and run the server
CMD ["node", "server.js"]

# Expose the application port
EXPOSE 8080

