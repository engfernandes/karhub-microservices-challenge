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

RUN if [ "$APP_NAME" != "migrations" ]; then \
      echo "--- Building application: ${APP_NAME} ---"; \
      pnpm build ${APP_NAME}; \
    fi && \
    echo "--- Building seed script ---" && \
    pnpm run build:seed

RUN cp -r prisma/mocks dist/prisma/

FROM base AS runner
ARG APP_NAME
ENV APP_NAME=${APP_NAME}

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/prisma ./prisma

COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]

CMD node dist/apps/${APP_NAME}/main.js
