#frontend
FROM node:20-alpine as builder

WORKDIR /app/frontend

ARG VITE_API_URL
ARG VITE_MIDTRANS_CLIENT_KEY

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

RUN npm run build && ls -la

#backend
FROM node:20-alpine

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install --only=production

COPY backend/ .

COPY --from=builder /app/frontend/dist ./public

EXPOSE 3000

CMD ["node", "index.js"]