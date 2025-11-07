require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Taille max en sortie : 9 MB
const MAX_OUTPUT_SIZE = 9 * 1024 * 1024;

// Configuration CORS
app.use(cors());
app.use(express.json());

// Configuration Multer pour le stockage en mémoire
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // Limite de 500MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'), false);
    }
  }
});

// Fonction pour compresser jusqu'à atteindre 9 MB max
async function compressToMaxSize(buffer, format = 'webp', targetSize = MAX_OUTPUT_SIZE) {
  let quality = 95;
  let compressedBuffer;
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    let sharpInstance = sharp(buffer, { limitInputPixels: false });

    switch (format.toLowerCase()) {
      case 'jpeg':
      case 'jpg':
        sharpInstance = sharpInstance.jpeg({ quality, mozjpeg: true });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ 
          quality, 
          compressionLevel: 9,
          adaptiveFiltering: true
        });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'avif':
        sharpInstance = sharpInstance.avif({ quality });
        break;
      default:
        sharpInstance = sharpInstance.webp({ quality });
    }

    compressedBuffer = await sharpInstance.toBuffer();

    // Si la taille est OK, on retourne
    if (compressedBuffer.length <= targetSize) {
      return {
        buffer: compressedBuffer,
        quality: quality,
        finalSize: compressedBuffer.length
      };
    }

    // Sinon on réduit la qualité
    quality -= 10;
    attempts++;

    // Si on atteint une qualité trop basse, on redimensionne
    if (quality < 30) {
      const metadata = await sharp(buffer, { limitInputPixels: false }).metadata();
      const scaleFactor = Math.sqrt(targetSize / compressedBuffer.length);
      const newWidth = Math.floor(metadata.width * scaleFactor);
      
      sharpInstance = sharp(buffer, { limitInputPixels: false })
        .resize({ width: newWidth, withoutEnlargement: false });

      switch (format.toLowerCase()) {
        case 'jpeg':
        case 'jpg':
          sharpInstance = sharpInstance.jpeg({ quality: 75, mozjpeg: true });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ quality: 75, compressionLevel: 9 });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: 75 });
          break;
        case 'avif':
          sharpInstance = sharpInstance.avif({ quality: 75 });
          break;
        default:
          sharpInstance = sharpInstance.webp({ quality: 75 });
      }

      compressedBuffer = await sharpInstance.toBuffer();
      
      return {
        buffer: compressedBuffer,
        quality: 75,
        finalSize: compressedBuffer.length,
        resized: true
      };
    }
  }

  return {
    buffer: compressedBuffer,
    quality: quality,
    finalSize: compressedBuffer.length
  };
}

// Route de santé
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API d\'optimisation d\'images est active (Max 9 MB en sortie)',
    maxOutputSize: '9 MB',
    endpoints: {
      optimize: 'POST /optimize - Optimiser une image',
      resize: 'POST /resize - Redimensionner et optimiser une image',
      convert: 'POST /convert - Convertir le format d\'une image'
    }
  });
});

// Route pour optimiser une image (MAX 9 MB)
app.post('/optimize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const format = req.body.format || 'webp';
    const originalSize = req.file.buffer.length;

    // Compression automatique jusqu'à 9 MB max
    const result = await compressToMaxSize(req.file.buffer, format);
    
    const reduction = ((originalSize - result.finalSize) / originalSize * 100).toFixed(2);

    res.set('Content-Type', `image/${format}`);
    res.set('X-Original-Size', originalSize);
    res.set('X-Optimized-Size', result.finalSize);
    res.set('X-Size-Reduction', `${reduction}%`);
    res.set('X-Quality-Used', result.quality);
    if (result.resized) {
      res.set('X-Was-Resized', 'true');
    }
    
    // ✅ ON RETOURNE UNIQUEMENT L'IMAGE OPTIMISÉE
    res.send(result.buffer);
  } catch (error) {
    console.error('Erreur lors de l\'optimisation:', error);
    res.status(500).json({ error: 'Erreur lors de l\'optimisation de l\'image' });
  }
});

// Route pour redimensionner et optimiser une image (MAX 9 MB)
app.post('/resize', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const width = parseInt(req.body.width);
    const height = parseInt(req.body.height);
    const format = req.body.format || 'webp';
    const fit = req.body.fit || 'cover';

    let sharpInstance = sharp(req.file.buffer, { limitInputPixels: false });

    // Redimensionner si les dimensions sont fournies
    if (width || height) {
      sharpInstance = sharpInstance.resize({
        width: width || null,
        height: height || null,
        fit: fit,
        withoutEnlargement: true
      });
    }

    const resizedBuffer = await sharpInstance.toBuffer();
    const originalSize = req.file.buffer.length;

    // Compression automatique jusqu'à 9 MB max
    const result = await compressToMaxSize(resizedBuffer, format);
    
    const reduction = ((originalSize - result.finalSize) / originalSize * 100).toFixed(2);

    res.set('Content-Type', `image/${format}`);
    res.set('X-Original-Size', originalSize);
    res.set('X-Optimized-Size', result.finalSize);
    res.set('X-Size-Reduction', `${reduction}%`);
    res.set('X-Quality-Used', result.quality);
    if (result.resized) {
      res.set('X-Was-Resized', 'true');
    }
    
    // ✅ ON RETOURNE UNIQUEMENT L'IMAGE OPTIMISÉE
    res.send(result.buffer);
  } catch (error) {
    console.error('Erreur lors du redimensionnement:', error);
    res.status(500).json({ error: 'Erreur lors du redimensionnement de l\'image' });
  }
});

// Route pour convertir le format d'une image (MAX 9 MB)
app.post('/convert', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const format = req.body.format || 'webp';
    const originalSize = req.file.buffer.length;

    // Compression automatique jusqu'à 9 MB max
    const result = await compressToMaxSize(req.file.buffer, format);
    
    res.set('Content-Type', `image/${format}`);
    res.set('X-Original-Size', originalSize);
    res.set('X-Optimized-Size', result.finalSize);
    res.set('X-Quality-Used', result.quality);
    if (result.resized) {
      res.set('X-Was-Resized', 'true');
    }
    
    // ✅ ON RETOURNE UNIQUEMENT L'IMAGE OPTIMISÉE
    res.send(result.buffer);
  } catch (error) {
    console.error('Erreur lors de la conversion:', error);
    res.status(500).json({ error: 'Erreur lors de la conversion de l\'image' });
  }
});

// Gestion des erreurs
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Le fichier est trop volumineux (max 500MB)' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📦 Taille max en sortie: 9 MB`);
});
