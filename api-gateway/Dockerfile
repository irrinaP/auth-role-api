FROM node:22-slim

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
RUN npm install
CMD ["npm", "run", "dev"]
