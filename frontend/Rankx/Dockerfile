FROM node:22-alpine AS build

WORKDIR /workspace
COPY Frontend/Rankx/package*.json ./
RUN npm ci

COPY Frontend/Rankx ./
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY docker/nginx/spa.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=5 CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
