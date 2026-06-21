FROM node:22-alpine AS build

ARG APP_DIR

WORKDIR /workspace
COPY . .
WORKDIR /workspace/${APP_DIR}

RUN npm ci && npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/${APP_DIR}/dist /usr/share/nginx/html

EXPOSE 8080

