# 🖼️ API d'Optimisation d'Images

API REST pour optimiser, compresser et redimensionner des images avec conservation de la qualité.

## ✨ Fonctionnalités

- ✅ Optimisation d'images avec compression intelligente
- ✅ Redimensionnement avec préservation du ratio
- ✅ Conversion de format (JPEG, PNG, WebP, AVIF)
- ✅ Réduction de taille jusqu'à 70% sans perte visible de qualité
- ✅ Compatible avec n8n
- ✅ Déployable sur Railway

## 🚀 Démarrage Rapide

### Installation locale
```bash
# Cloner le repository
git clone https://github.com/tonybZY/image-optimizer-api.git
cd image-optimizer-api

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer le serveur
npm start
```

Le serveur démarre sur `http://localhost:3000`

### Développement
```bash
npm run dev
```

## 📡 Endpoints API

### 1. GET `/`
Vérifier le statut de l'API

**Réponse:**
```json
{
  "status": "ok",
  "message": "API d'optimisation d'images est active",
  "endpoints": { ... }
}
```

### 2. POST `/optimize`
Optimiser une image en conservant les dimensions

**Paramètres:**
- `image` (file, required) - L'image à optimiser
- `quality` (number, optional) - Qualité de 1 à 100 (défaut: 80)
- `format` (string, optional) - Format de sortie: jpeg, png, webp, avif (défaut: webp)

**Exemple avec cURL:**
```bash
curl -X POST http://localhost:3000/optimize \
  -F "image=@photo.jpg" \
  -F "quality=85" \
  -F "format=webp" \
  --output optimized.webp
```

**Exemple n8n:**
- Utiliser le node "HTTP Request"
- Method: POST
- URL: `https://votre-app.railway.app/optimize`
- Body Content Type: Form-Data
- Ajouter `image` (File) et `quality` (Number)

### 3. POST `/resize`
Redimensionner et optimiser une image

**Paramètres:**
- `image` (file, required) - L'image à redimensionner
- `width` (number, optional) - Largeur en pixels
- `height` (number, optional) - Hauteur en pixels
- `quality` (number, optional) - Qualité de 1 à 100 (défaut: 80)
- `format` (string, optional) - Format de sortie (défaut: webp)
- `fit` (string, optional) - Mode d'ajustement: cover, contain, fill, inside, outside (défaut: cover)

**Exemple avec cURL:**
```bash
curl -X POST http://localhost:3000/resize \
  -F "image=@photo.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "quality=85" \
  -F "format=webp" \
  --output resized.webp
```

### 4. POST `/convert`
Convertir le format d'une image

**Paramètres:**
- `image` (file, required) - L'image à convertir
- `format` (string, required) - Format de sortie: jpeg, png, webp, avif
- `quality` (number, optional) - Qualité de 1 à 100 (défaut: 80)

**Exemple avec cURL:**
```bash
curl -X POST http://localhost:3000/convert \
  -F "image=@photo.png" \
  -F "format=webp" \
  -F "quality=90" \
  --output converted.webp
```

## 📊 Headers de Réponse

L'API retourne des informations utiles dans les headers:
- `X-Original-Size` - Taille originale en bytes
- `X-Optimized-Size` - Taille optimisée en bytes
- `X-Size-Reduction` - Pourcentage de réduction

## 🚂 Déploiement sur Railway

### Option 1: Déploiement depuis GitHub

1. Créer un compte sur [Railway.app](https://railway.app)
2. Cliquer sur "New Project"
3. Choisir "Deploy from GitHub repo"
4. Sélectionner votre repository
5. Railway détectera automatiquement Node.js
6. Le déploiement se fait automatiquement!

### Option 2: Utiliser Railway CLI
```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Déployer
railway up
```

### Variables d'environnement sur Railway

Railway configure automatiquement `PORT`, vous n'avez rien à configurer!

## 🔧 Utilisation avec n8n

### Workflow n8n pour optimiser une image

1. **HTTP Request Node**
   - Method: POST
   - URL: `https://votre-app.railway.app/optimize`
   - Body Content Type: Form-Data
   - Body Parameters:
     - Name: `image` | Type: File
     - Name: `quality` | Value: `85`
     - Name: `format` | Value: `webp`

2. **Write Binary File Node** (pour sauvegarder)
   - File Name: `optimized-image.webp`
   - Data Property Name: `data`

### Exemple de workflow complet
```
Webhook → HTTP Request (Upload) → HTTP Request (Optimize) → Save to Cloud
```

## 📦 Formats Supportés

### Input (Entrée)
- JPEG/JPG
- PNG
- WebP
- GIF
- TIFF
- BMP
- SVG

### Output (Sortie)
- JPEG (avec MozJPEG pour meilleure compression)
- PNG (avec compression adaptative)
- WebP (excellent ratio qualité/taille)
- AVIF (format moderne, meilleure compression)

## ⚙️ Configuration

### Limites
- Taille maximale de fichier: 10MB (configurable dans `server.js`)
- Formats acceptés: tous les formats d'image courants

### Personnalisation

Modifier dans `server.js`:
```javascript
limits: {
  fileSize: 10 * 1024 * 1024 // Changer la limite ici
}
```

## 🔒 Sécurité

- Validation du type de fichier
- Limite de taille de fichier
- CORS activé (configurable)
- Pas de stockage permanent des fichiers

## 📝 Licence

MIT

## 🤝 Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou pull request.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.

---

Fait avec ❤️ pour optimiser vos images
