# Etapa 1: Recursos
FROM node:20 AS build

WORKDIR /app

COPY package*json ./

RUN npm install

COPY . .

ARG API_URL

ENV VITE_API_URL=$API_URL

RUN npm run build

#Etapa 2: Imagen

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]