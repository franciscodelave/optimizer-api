require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const MAX_OUTPUT_SIZE = 9 * 1024 * 1024;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'), false);
    }
  }
});

async function ultraFastOptimize(buffer, format, quality) {
  const startTime = Date.now();
  
  const instance = sharp(buffer, {
    limitInputPixels: false,
    sequentialRead: true,
    density: 72
  });
  
  const metadata = await instance.metadata();
  const originalPixels = metadata.width * metadata.height;
  const inputSizeMB = buffer.length / 1024 / 1024;
  
  let targetWidth;
  let targetQuality = quality;
  
  const pixelsPerMB = originalPixels / inputSizeMB;
  const targetPixels = (MAX_OUTPUT_SIZE * 0.9 / 1024 / 1024) * pixelsPerMB * 0.7;
  targetWidth = Math.floor(Math.sqrt(targetPixels * (metadata.width / metadata.height)));
  
  targetWidth = Math.min(targetWidth, 16000);
  targetWidth = Math.max(targetWidth, 1000);
  
  if (inputSizeMB > 200) {
    targetWidth = Math.min(targetWidth, 8000);
    targetQuality = Math.min(targetQuality, 75);
  } else if (inputSizeMB > 100) {
    targetWidth = Math.min(targetWidth, 10000);
    targetQuality = Math.min(targetQuality, 80);
  } else if (inputSizeMB > 50) {
    targetWidth = Math.min(targetWidth, 12000);
  }
  
  console.log(`📊 Image: ${metadata.width}x${metadata.height} (${inputSizeMB.toFixed(1)}MB) → Cible: ${targetWidth}px, Q:${targetQuality}`);
  
  let pipeline = instance
    .resize({
      width: targetWidth,
      height: Math.floor(targetWidth / (metadata.width / metadata.height)),
      fit: 'inside',
      kernel: 'lanczos3',
      fastShrinkOnLoad: true
    })
    .withMetadata(false)
    .rotate();
  
  switch (format.toLowerCase()) {
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({
        quality: targetQuality,
        progressive: false,
        optimizeCoding: false,
        mozjpeg: false,
        trellisQuantisation: false,
        overshootDeringing: false,
        optimizeScans: false,
        chromaSubsampling: '4:2:0',
        force: true
      });
      break;
    case 'png':
      pipeline = pipeline.png({
        quality: targetQuality,
        compressionLevel: 3,
        palette: true,
        effort: 2,
        colours: 256
      });
      break;
    case 'webp':
      pipeline = pipeline.webp({
        quality: targetQuality,
        effort: 2,
        smartSubsample: true,
        nearLossless: false,
        preset: 'photo',
        force: true
      });
      break;
    case 'avif':
      pipeline = pipeline.avif({
        quality: targetQuality,
        effort: 2,
        chromaSubsampling: '4:2:0'
      });
      break;
  }
  
  const result = await pipeline.toBuffer();
  
  const elapsed = Date.now() - startTime;
  const resultSizeMB = result.length / 1024 / 1024;
  console.log(`⚡ Traité en ${(elapsed / 1000).toFixed(2)}s - Sortie: ${resultSizeMB.toFixed(2)}MB`);
  
  return result;
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API d\'optimisation d\'images ULTRA RAPIDE',
    maxOutputSize: '9 MB',
    version: 'ultra-fast',
    endpoints: {
      optimize: 'POST /optimize',
      resize: 'POST /resize',
      convert: 'POST /convert'
    }
  });
});

app.post('/optimize', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const quality = parseInt(req.body.quality) || 75;
    const format = req.body.format || 'jpeg';

    const optimizedBuffer = await ultraFastOptimize(req.file.buffer, format, quality);
    
    const originalSize = req.file.buffer.length;
    const optimizedSize = optimizedBuffer.length;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    res.set('Content-Type', `image/${format}`);
    res.set('X-Original-Size', originalSize);
    res.set('X-Optimized-Size', optimizedSize);
    res.set('X-Size-Reduction', `${reduction}%`);
    res.set('X-Processing-Time', `${totalTime}s`);
    res.set('X-Under-9MB', optimizedSize <= MAX_OUTPUT_SIZE ? 'true' : 'false');
    
    res.send(optimizedBuffer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'optimisation' });
  }
});

app.post('/resize', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const quality = parseInt(req.body.quality) || 75;
    const format = req.body.format || 'jpeg';

    const optimizedBuffer = await ultraFastOptimize(req.file.buffer, format, quality);
    
    const originalSize = req.file.buffer.length;
    const optimizedSize = optimizedBuffer.length;
    const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    res.set('Content-Type', `image/${format}`);
    res.set('X-Original-Size', originalSize);
    res.set('X-Optimized-Size', optimizedSize);
    res.set('X-Size-Reduction', `${reduction}%`);
    res.set('X-Processing-Time', `${totalTime}s`);
    res.set('X-Under-9MB', optimizedSize <= MAX_OUTPUT_SIZE ? 'true' : 'false');
    
    res.send(optimizedBuffer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du redimensionnement' });
  }
});

app.post('/convert', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const format = req.body.format || 'jpeg';
    const quality = parseInt(req.body.quality) || 75;

    const optimizedBuffer = await ultraFastOptimize(req.file.buffer, format, quality);
    
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    res.set('Content-Type', `image/${format}`);
    res.set('X-Optimized-Size', optimizedBuffer.length);
    res.set('X-Processing-Time', `${totalTime}s`);
    res.set('X-Under-9MB', optimizedBuffer.length <= MAX_OUTPUT_SIZE ? 'true' : 'false');
    
    res.send(optimizedBuffer);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la conversion' });
  }
});

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Fichier trop volumineux (max 500MB)' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`⚡ SERVEUR ULTRA RAPIDE démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`✅ Taille max sortie: 9 MB`);
  console.log(`🚀 Optimisations: calcul prédictif + pipeline unique`);
});
