# ── Build stage ──────────────────────────────────────────────
FROM node:22-alpine AS build

# better-sqlite3 compiles native code via node-gyp — needs these build tools.
RUN apk add --no-cache python3 make g++

# Public-facing origin, baked in at build time for SvelteKit's CSRF check
# (see vite.config.ts). Must match the address the browser actually hits —
# e.g. http://192.168.0.119:5252 if that's the host:port mapped in compose.
ARG PUBLIC_ORIGIN=http://localhost:3000
ENV PUBLIC_ORIGIN=${PUBLIC_ORIGIN}

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
