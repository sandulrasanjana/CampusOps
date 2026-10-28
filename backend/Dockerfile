
# Stage 1: Install production dependencies and compile native modules
FROM node:22-trixie-slim AS builder

WORKDIR /app

RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends \
       python3 \
       make \
       g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm install --global npm@12.2.1 \
    && npm ci --omit=dev --fetch-retries=5 --fetch-timeout=600000 \
    && npm install-scripts approve sqlite3 \
    && npm_config_build_from_source=true npm rebuild sqlite3 \
       --fetch-retries=5 --fetch-timeout=600000 \
    && npm cache clean --force

COPY . .

# Stage 2: Minimal runtime image

# Stage 2: Minimal runtime image
FROM node:22-trixie-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy the application and production dependencies
COPY --from=builder --chown=node:node /app /app

# Remove npm, which is not needed to run the backend
USER root
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

USER node

EXPOSE 5000

CMD ["node", "server.js"]

