# Use the official Node.js image as base
 FROM node:lts

 # Set working directory within the container
 WORKDIR /app

 # Copy package.json and package-lock.json to the working directory
 COPY package*.json ./

 # Install dependencies
 RUN npm install

 # Copy the rest of the application code
 COPY . .

 RUN ./write_firestore_key.sh
 # Start the application
 CMD ["npm", "start"]
