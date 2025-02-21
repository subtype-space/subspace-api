FROM node:22.10 AS base

USER node
WORKDIR /opt/api
RUN chown -R node:node /opt/api

FROM base AS builder
LABEL stage=build
USER node
WORKDIR /opt/api
COPY --chown=node:node package-lock.json .
COPY --chown=node:node v1 .
COPY --chown=node:node server.js .
RUN npm ci

FROM base AS production
USER node
WORKDIR /opt/api
COPY --chown=node:node --from=builder /opt/api/node_modules ./node_modules

ENTRYPOINT [ "node", "server.js" ]