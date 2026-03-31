FROM node:24-trixie-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json schema.graphql ./
COPY abi/ abi/
COPY src/ src/

RUN pnpm run build

FROM node:24-trixie-slim

WORKDIR /app

RUN corepack enable \
    && corepack prepare pnpm@10.30.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build --chown=1000:1000 /app/lib/ lib/
COPY --chown=1000:1000 db/migrations/ db/migrations/
COPY --chown=1000:1000 commands.json ./

ENV NODE_ENV=production
ENV HOME=/home/node
ENV PATH="/app/node_modules/.bin:$PATH"

RUN chown 1000:1000 /app

USER 1000:1000
