# Stage 1: Build the React app
FROM node:20 AS build
WORKDIR /app
COPY . .
COPY .env.docker .env
RUN npm install
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

