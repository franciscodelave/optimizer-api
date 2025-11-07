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
```

---

## **.gitignore**
```
# Dépendances
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Variables d'environnement
.env
.env.local
.env.*.local

# Fichiers de test
test/
*.test.js

# Fichiers temporaires
tmp/
temp/
*.tmp

# Logs
logs/
*.log

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Build
dist/
build/
