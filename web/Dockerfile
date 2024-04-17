# Specify base image.
FROM node:latest

# Create app directory inside Docker image.
WORKDIR /web

# Copy app dependencies to Docker app directory. This is done before copying the
# rest of the source code to take advantage of Docker image caching. Wildcard 
# ensures package.json and package-lock.json are both copied.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Bundle source code inside Docker image.
COPY . .

# Expose port 3000.
EXPOSE 3000

# Start web.
CMD ["npm", "run", "dev"]
