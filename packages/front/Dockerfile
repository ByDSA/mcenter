# Fuente: https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:22-alpine3.21 AS base
ARG ENV=local
ENV APP=front

FROM base AS deps-base
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Install dependencies
RUN yarn global add pnpm

WORKDIR /packages
COPY package.json pnpm-lock.yaml* ./

COPY $APP/package.json ./app/

RUN apk --no-cache add jq

# Quitar devDependencies que usen GitHub
RUN jq 'if .devDependencies then .devDependencies |= with_entries(select(.value | startswith("github:") | not)) else . end' ./package.json > ./packageTmp.json && mv ./packageTmp.json ./package.json

FROM deps-base AS deps-prod
COPY <<EOF ./pnpm-workspace.yaml
packages:
  - 'app'
EOF

RUN jq '{ \
  dependencies: { \
  next: .dependencies.next, \
  react: .dependencies.react \
  } \
  }' ./app/package.json > ./app/packageTmp.json \
  && mv ./app/packageTmp.json ./app/package.json
# Nota: si se usa el mismo archivo de entrada y de salida, genera un archivo vacío porque jq aún está leyendo el archivo de entrada cuando va a escribirlo.

RUN pnpm install --prod --fix-lockfile --ignore-scripts

RUN rm -rf /packages/node_modules/.pnpm/@next+swc*

# Install dependencies only when needed
FROM deps-base AS deps-build
COPY ./shared/src ./shared/src
COPY ./shared/tsconfig* ./shared/package.json ./shared/

COPY <<EOF ./pnpm-workspace.yaml
packages:
  - 'shared'
  - 'app'
EOF

# Nota: si se intentan reaprovechar las dependencias instaladas de deps-prod, no instala el resto de dependencias con pnpm i. Mejor instalarlas todas de nuevo que copiarlas y usar luego el flag --force.
RUN pnpm i --fix-lockfile
RUN cd shared && pnpm build
# Nota: No se puede usar sin --fix-lockfile porque da error, porque el lockfile incluye las dependencias de todos los proyectos y sólo estamos usando dos

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /packages
COPY --from=deps-build /packages/node_modules ./node_modules

# Para mostrar la versión global en producción
COPY ./package.json ./

WORKDIR /packages/shared
COPY --from=deps-build /packages/shared ./

WORKDIR /packages/app
COPY ./$APP/app/ ./app
COPY ./$APP/modules/ ./modules
COPY ./$APP/styles ./styles
COPY ./$APP/public ./public
COPY --from=deps-build /packages/app/node_modules ./node_modules
COPY ./$APP/package.json ./$APP/*lock* ./$APP/tsconfig* ./$APP/next.config* ./
COPY ./$APP/.env.docker.$ENV ./.env

# Disable telemetry during the build.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /packages/app

ENV NODE_ENV=production
# Disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /packages/app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /packages/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /packages/app/.next/static ./.next/static

COPY --from=deps-prod /packages/node_modules /packages/node_modules
COPY --from=deps-prod /packages/app/node_modules /packages/app/node_modules

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"


# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]
