# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:20-alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy local code to the container image.
COPY . .

# Expose the port on which your app runs
EXPOSE 3000

# Run the development script on container startup.
CMD ["npm", "run", "dev"]