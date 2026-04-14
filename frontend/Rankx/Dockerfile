FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Custom Nginx Config for React Router & API Gateway Proxy
RUN echo 'server {     listen 80;     location / {         root /usr/share/nginx/html;         index index.html;         try_files $uri $uri/ /index.html;     }     location /api {         proxy_pass http://api-gateway:8080;         proxy_http_version 1.1;         proxy_set_header Upgrade $http_upgrade;         proxy_set_header Connection "upgrade";         proxy_set_header Host $host;     } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
