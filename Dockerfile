FROM node:18-alpine

# Installer les dépendances système nécessaires pour Sharp
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    vips-dev

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
