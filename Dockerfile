# Use the official Node.js image as base
 FROM node:latest

 # Set working directory within the container
 WORKDIR /app

 # Copy package.json and package-lock.json to the working directory
 COPY package*.json ./

 # Install dependencies
 RUN npm install

 # Copy the rest of the application code
 COPY . .

 # Start the application
 CMD ["npm run start"]
