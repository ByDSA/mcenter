FROM node:24.10.0-alpine3.22 AS base
ARG TARGETPLATFORM
ARG PNPM_CACHE_PATH=/root/.local/share/pnpm/store
ENV APP=server

FROM base AS base-pnpm
RUN yarn global add pnpm

# Para usar $`[cmd]` en scripts de zx
RUN apk add --no-cache bash

FROM base-pnpm AS deps-common
WORKDIR /packages

COPY ./package.json ./*-lock.* .pnpmfile.cjs ./
COPY <<EOF ./pnpm-workspace.yaml
packages:
  - 'shared'
  - 'app'
EOF

COPY ./shared ./shared
COPY ./$APP ./app

RUN if [ -f .pnpmfile.cjs ]; then \
  rm .pnpmfile.cjs; \
  echo "PNPMFILE_EXISTS=true" >> /etc/environment; \
  else \
  echo "PNPMFILE_EXISTS=false" >> /etc/environment; \
  fi

FROM deps-common AS deps
WORKDIR /packages

RUN apk add --no-cache git # Instalar git, para daproj y chevronatain

RUN --mount=type=cache,target=${PNPM_CACHE_PATH},id=pnpm-${TARGETPLATFORM} \
  . /etc/environment && \
  if [ "$PNPMFILE_EXISTS" = "true" ]; then \
  echo ".pnpmfile.cjs existe"; \
  pnpm i --fix-lockfile --no-frozen-lockfile --ignore-scripts; \
  else \
  echo ".pnpmfile.cjs no existe"; \
  pnpm i --fix-lockfile --frozen-lockfile --ignore-scripts; \
  fi

# Nota: Los artifacts se cachean en el docker build, no en el host.
COPY ./bin/artifacts/lib ./bin/artifacts/lib
RUN --mount=type=cache,target=/packages/bin/artifacts/builds,id=mcenter-artifacts-cache,sharing=locked \
  cd shared && pnpm build:cache

RUN --mount=type=cache,target=/packages/bin/artifacts/builds,id=mcenter-artifacts-cache,sharing=locked \
  sh ./app/lib/install_chevrotain.sh

FROM deps-common AS deps-prod
RUN apk add --no-cache git # Instalar git (no sé por qué, necesita resolver las devDependencies aunque no las instale)

RUN --mount=type=cache,target=${PNPM_CACHE_PATH},id=pnpm-${TARGETPLATFORM} \
  . /etc/environment && \
  if [ "$PNPMFILE_EXISTS" = "true" ]; then \
  echo ".pnpmfile.cjs existe"; \
  pnpm i --prod --fix-lockfile --no-frozen-lockfile --ignore-scripts; \
  else \
  echo ".pnpmfile.cjs no existe"; \
  pnpm i --prod --fix-lockfile --frozen-lockfile --ignore-scripts; \
  fi

FROM deps AS builder
WORKDIR /packages/app
RUN pnpm build

FROM base AS runner

# Instalar ffmpeg y ffprobe
RUN apk add --no-cache ffmpeg && \
  ffmpeg -version

# Instalar yt-dlp
RUN apk add --no-cache python3 && \
  wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
  chmod +x /usr/local/bin/yt-dlp && \
  yt-dlp --version


WORKDIR /packages
COPY --from=builder /packages/shared/build ./shared/build
COPY --from=deps-prod /packages/node_modules ./node_modules
WORKDIR /packages/shared
COPY --from=deps-prod /packages/shared/node_modules ./node_modules
WORKDIR /packages/app
COPY --from=deps /packages/app/lib/chevrotain ./lib/chevrotain
COPY --from=deps-prod /packages/app/node_modules ./node_modules
COPY --from=builder /packages/app/build ./build
COPY --from=builder /packages/app/package.json ./
EXPOSE 8080
CMD [ "yarn", "start" ]
