FROM node:20.9.0-alpine3.18 AS base
ENV APP=server

FROM base AS base-pnpm
RUN yarn global add pnpm

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

RUN . /etc/environment && \
  if [ "$PNPMFILE_EXISTS" = "true" ]; then \
  echo ".pnpmfile.cjs existe"; \
  pnpm i --fix-lockfile --no-frozen-lockfile --ignore-scripts; \
  else \
  echo ".pnpmfile.cjs no existe"; \
  pnpm i --fix-lockfile --frozen-lockfile --ignore-scripts; \
  fi

RUN cd shared && pnpm build

RUN sh ./app/lib/install_chevrotain.sh

FROM deps-common AS deps-prod
RUN apk add --no-cache git # Instalar git (no sé por qué, necesita resolver las devDependencies aunque no las instale)

RUN . /etc/environment && \
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
