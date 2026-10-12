# ── Build stage ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src/          src/
COPY static/       static/
COPY vite.config.ts tsconfig.json ./

RUN npm run build

# ── Production stage ────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV DATA_DIR=/data

COPY --from=build /app/build  build/
COPY --from=build /app/node_modules  node_modules/

EXPOSE 3000

CMD ["node", "build"]
