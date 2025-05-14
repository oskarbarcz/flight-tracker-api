FROM node:24-alpine AS alpine-node-base
RUN apk --no-cache add curl

FROM alpine-node-base AS development
WORKDIR /app
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
RUN npm ci
COPY --chown=node:node . .
ENTRYPOINT ["./docker/dev/entrypoint"]

FROM alpine-node-base AS build
WORKDIR /app
COPY --chown=node:node package*.json ./
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV="production"
RUN npm ci --only=production && npm cache clean --force
USER node

FROM alpine-node-base AS production
COPY --chown=node:node docker/prod ./docker/prod
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
EXPOSE 3000
ENTRYPOINT ["./docker/prod/entrypoint"]
