#!/bin/bash

# Your frontend directories
FRONTENDS=("Rankx" "Rankx-admin")

for FE in "${FRONTENDS[@]}"; do
    echo "🛠️ Generating Dockerfile for $FE..."

    cat <<EOF > ./$FE/Dockerfile
# --- Stage 1: Build Stage (Mac M4 Power) ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Production Stage (Lightweight Nginx) ---
FROM nginx:stable-alpine
# Copy the Vite 'dist' folder to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx Config for React Router & Vite
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files \$uri \$uri/ /index.html; \
    } \
    # Proxy API requests to the Gateway \
    location /api { \
        proxy_pass http://api-gateway:8080; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade \$http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host \$host; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

done

echo "✅ Dockerfiles created for Rankx and Rankx-admin!"