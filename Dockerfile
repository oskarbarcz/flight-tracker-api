FROM node:22 AS development
WORKDIR /app
COPY --chown=node:node package*.json ./
#COPY --chown=node:node prisma ./prisma
RUN npm ci
COPY --chown=node:node . .
ENTRYPOINT ["./docker/dev/entrypoint"]

FROM node:22 AS build
WORKDIR /app
COPY --chown=node:node package*.json ./
#COPY --chown=node:node prisma ./prisma
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN npm run build
ENV NODE_ENV="production"
RUN npm ci --only=production && npm cache clean --force
USER node

FROM node:22 AS production
COPY --chown=node:node docker/prod ./docker/prod
#COPY --chown=node:node prisma ./prisma
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
ENTRYPOINT ["./docker/prod/entrypoint"]
