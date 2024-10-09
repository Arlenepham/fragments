# Every docker file must begin with a FROM instruction - specify the parent image
FROM node

# Use node version 18.13.0
FROM node:20.10.0

LABEL maintainer="Arlene Pham <hpham32@myseneca.ca>"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Option 2: relative path - Copy the package.json and package-lock.json
# files into the working dir (/app).  NOTE: this requires that we have
# already set our WORKDIR in a previous step.
COPY package*.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Copy src to /app/src/
COPY ./src ./src

# Start the container by running our server
CMD npm start

# We run our service on port 8080
EXPOSE 8080
