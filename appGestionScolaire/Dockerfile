# ====== Étape 1 : Build Angular ======
FROM node:22 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build Angular
RUN npm run build -- --configuration=production

# ====== Étape 2 : Serveur Nginx ======
FROM nginx:stable-alpine

# Copier UNIQUEMENT le dossier "browser"
COPY --from=build /app/dist/browser/ /usr/share/nginx/html/

# Copier la config Nginx (fichier obligatoire)
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
