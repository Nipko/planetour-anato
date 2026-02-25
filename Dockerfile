FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/ ./

# Copy frontend
COPY public/ ./public/

# Copy logo images into public/img
RUN mkdir -p ./public/img
COPY logo_planetour.png ./public/img/logo_planetour.png
COPY logo_anato.png ./public/img/logo_anato.png

EXPOSE 3000

CMD ["node", "index.js"]
