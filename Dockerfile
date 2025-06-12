FROM node:20-alpine AS base
WORKDIR /usr/src/app
RUN npm install -g pnpm

FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
COPY . .
ARG APP_NAME

RUN pnpm prisma generate

RUN pnpm build ${APP_NAME}

FROM base AS runner
ARG APP_NAME

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist/apps/${APP_NAME} ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["node", "dist/main.js"]