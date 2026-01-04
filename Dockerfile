#frontend
FROM node:20-alpine as builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

RUN npm run build

#backend
FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --only=production

COPY backend/ .

COPY --from=builder /app/frontend/build ./public

EXPOSE 8080

CMD ["node", "index.js"]