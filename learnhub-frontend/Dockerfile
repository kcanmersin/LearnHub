# learnhub-frontend/Dockerfile

  FROM node:16-alpine as build
  WORKDIR /app
  COPY package*.json ./
  RUN rm -rf node_modules
  RUN npm cache clean --force
  RUN npm install
  COPY . .
  RUN npm run build --prod

  FROM nginx:1.21-alpine

  COPY --from=build /app/dist/learnhub-frontend/. /usr/share/nginx/html/

  COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
