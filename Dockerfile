# syntax=docker/dockerfile:1
FROM node:20-alpine AS base

WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable pnpm && \
    apk add --no-cache bash

# Pre-copy package manifests to optimise layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/sdk/package.json packages/sdk/package.json
COPY packages/api/package.json packages/api/package.json

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter api build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable pnpm && \
    apk add --no-cache bash

COPY --from=base /app /app

# Install only runtime dependencies for the API package
RUN pnpm install --frozen-lockfile --prod

EXPOSE 3000
CMD ["pnpm", "--filter", "api", "start"]
