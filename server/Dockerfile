# Specify base image.
FROM node:latest

# PostgreSQL client provides pg_isready, which entrypoint script uses to 
# determine when to run Prisma migrations.
RUN apt-get update && apt-get install -y postgresql-client

# Create app directory inside Docker image.
WORKDIR /server

# Copy app dependencies to Docker app directory. This is done before copying the
# rest of the source code to take advantage of Docker image caching. Wildcard 
# ensures package.json and package-lock.json are both copied.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Bundle source code inside Docker image.
COPY . .

# Ensure entrypoint script is executable.
RUN chmod +x entrypoint.sh

# Expose port 3001.
EXPOSE 3001

# Start server.
ENTRYPOINT ["entrypoint.sh"]
