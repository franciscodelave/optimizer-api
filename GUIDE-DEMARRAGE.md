# 🚀 Guide de Démarrage Rapide

## Étape 1: Mettre le code sur GitHub
```bash
# Initialiser git dans le dossier
cd image-optimizer-api
git init

# Ajouter tous les fichiers
git add .

# Faire le premier commit
git commit -m "Initial commit - API d'optimisation d'images"

# Créer un nouveau repository sur GitHub
# Puis lier votre repository local:
git remote add origin https://github.com/VOTRE-USERNAME/image-optimizer-api.git
git branch -M main
git push -u origin main
```

## Étape 2: Déployer sur Railway

### Option A: Via l'interface web (Recommandé)

1. Aller sur https://railway.app
2. Cliquer sur **"New Project"**
3. Sélectionner **"Deploy from GitHub repo"**
4. Choisir votre repository `image-optimizer-api`
5. Railway va automatiquement:
   - Détecter que c'est un projet Node.js
   - Installer les dépendances
   - Démarrer votre API
6. Copier l'URL générée (ex: `https://image-optimizer-api-production.up.railway.app`)

### Option B: Via Railway CLI
```bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter à Railway
railway login

# Lier le projet
railway link

# Déployer
railway up

# Obtenir l'URL de votre API
railway domain
```

## Étape 3: Tester votre API

### Test simple avec cURL
```bash
# Remplacer YOUR-URL par votre URL Railway
curl https://YOUR-URL.railway.app/
```

Vous devriez voir:
```json
{
  "status": "ok",
  "message": "API d'optimisation d'images est active"
}
```

### Test d'optimisation d'image
```bash
curl -X POST https://YOUR-URL.railway.app/optimize \
  -F "image=@votre-image.jpg" \
  -F "quality=85" \
  -F "format=webp" \
  --output optimized.webp
```

## Étape 4: Utiliser avec n8n

### Configuration du node HTTP Request dans n8n

1. **Ajouter un node "HTTP Request"**
2. **Configurer:**
   - Method: `POST`
   - URL: `https://YOUR-URL.railway.app/optimize`
   - Authentication: None
   - Send Body: Yes
   - Body Content Type: `Form-Data`

3. **Ajouter les paramètres:**
   - `image` (Type: File) - Votre fichier image
   - `quality` (Type: String) - Valeur: `85`
   - `format` (Type: String) - Valeur: `webp`

4. **Importer le workflow exemple:**
   - Ouvrir n8n
   - Aller dans "Workflows" → "Import from File"
   - Sélectionner `n8n-workflow-example.json`
   - Modifier l'URL avec votre URL Railway

### Workflow simple n8n
```
[Webhook] → [HTTP Request: Upload Image] → [HTTP Request: Optimize] → [Respond]
```

## Exemples d'utilisation

### 1. Optimiser une image

**Endpoint:** `POST /optimize`
```bash
curl -X POST https://YOUR-URL.railway.app/optimize \
  -F "image=@photo.jpg" \
  -F "quality=80" \
  -F "format=webp" \
  --output optimized.webp
```

### 2. Redimensionner une image

**Endpoint:** `POST /resize`
```bash
curl -X POST https://YOUR-URL.railway.app/resize \
  -F "image=@photo.jpg" \
  -F "width=800" \
  -F "height=600" \
  -F "quality=85" \
  --output resized.webp
```

### 3. Convertir le format

**Endpoint:** `POST /convert`
```bash
curl -X POST https://YOUR-URL.railway.app/convert \
  -F "image=@photo.png" \
  -F "format=jpeg" \
  -F "quality=90" \
  --output converted.jpg
```

## Paramètres disponibles

| Paramètre | Type | Description | Valeur par défaut |
|-----------|------|-------------|-------------------|
| `image` | File | L'image à traiter | **Requis** |
| `quality` | Number | Qualité (1-100) | 80 |
| `format` | String | Format de sortie (jpeg, png, webp, avif) | webp |
| `width` | Number | Largeur (resize seulement) | - |
| `height` | Number | Hauteur (resize seulement) | - |
| `fit` | String | Mode d'ajustement (cover, contain, etc.) | cover |

## Vérifier les logs sur Railway
```bash
# Via CLI
railway logs

# Ou via l'interface web:
# Dashboard → Your Project → Deployments → Logs
```

## Troubleshooting

### L'API ne démarre pas
- Vérifier les logs Railway
- S'assurer que `package.json` contient `"start": "node server.js"`

### Erreur "Module not found"
- Railway n'a pas installé les dépendances
- Vérifier que `package.json` est bien présent
- Redéployer: `railway up`

### Erreur lors de l'upload d'image
- Vérifier que la taille < 10MB
- Vérifier que c'est bien un fichier image
- Vérifier le format du Content-Type

## Support

Des questions ? Ouvrez une issue sur GitHub!

---

🎉 Félicitations! Votre API est maintenant en ligne et prête à optimiser des images!
