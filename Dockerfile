FROM node:24-slim AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json schema.graphql ./
COPY abi/ abi/
COPY src/ src/

RUN pnpm run build

FROM node:24-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.30.0 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=build /app/lib/ lib/
COPY db/migrations/ db/migrations/
COPY commands.json ./
