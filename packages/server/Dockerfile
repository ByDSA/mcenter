FROM node:20.9.0-alpine3.18 AS base
ENV APP=server

FROM base AS base-pnpm
RUN yarn global add pnpm

FROM base-pnpm AS deps-common
WORKDIR /packages

COPY ./package.json ./*-lock.* ./
COPY <<EOF ./pnpm-workspace.yaml
packages:
  - 'shared'
  - 'app'
EOF

COPY ./shared ./shared
COPY ./$APP ./app

FROM deps-common AS deps
WORKDIR /packages

RUN pnpm i --fix-lockfile --frozen-lockfile --ignore-scripts
RUN cd shared && pnpm build

FROM deps-common AS deps-prod
RUN pnpm i --prod --fix-lockfile --frozen-lockfile --ignore-scripts

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
COPY --from=deps-prod /packages/app/node_modules ./node_modules
COPY --from=builder /packages/app/build ./build
COPY --from=builder /packages/app/package.json ./
EXPOSE 8080
CMD [ "yarn", "start" ]