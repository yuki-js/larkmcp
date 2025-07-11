# syntax=docker/dockerfile:1

FROM node:22-slim

WORKDIR /app

COPY . .
RUN npm ci --omit=dev

EXPOSE 3000

CMD ["node", "index.js", "http"]