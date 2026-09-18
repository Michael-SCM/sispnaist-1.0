import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import uploadController from '../controllers/uploadController.js';
import { authMiddleware, adminMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';
import config from '../config/config.js';
import { sanitizeAndValidateExtension } from '../utils/fileValidation.js';

const router = Router();

// Diretório temporário isolado para upload via diskStorage
const TEMP_DIR = path.resolve(process.cwd(), config.uploadDir || './uploads', 'tmp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true, mode: 0o700 });
}

// Rate limit estrito para uploads (máximo 30 uploads a cada 15 minutos por usuário/IP)
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    status: 'error',
    message: 'Muitas requisições de upload. Por favor, aguarde alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuração do multer com diskStorage (evita consumir RAM em arquivos grandes)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TEMP_DIR);
  },
  filename: function (req, file, cb) {
    // Nome temporário aleatório antes da validação profunda de magic bytes
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `tmp-${uniqueSuffix}.part`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize || 10485760, // 10MB default
    files: 1, // apenas 1 arquivo por requisição
  },
  fileFilter: function (req, file, cb) {
    try {
      // Validação preliminar estrita de extensão (whitelist: pdf, jpg, jpeg, png)
      sanitizeAndValidateExtension(file.originalname);
      cb(null, true);
    } catch (err: any) {
      cb(err);
    }
  },
});

// Download via URL assinada temporária (não requer header Authorization porque o token assinado carrega autenticação/expiração)
router.get('/download-signed', uploadController.downloadAssinado);

// Todas as demais rotas requerem autenticação
router.use(authMiddleware);

// Leitura de uploads: admin/gestor
router.get('/', adminOuGestorMiddleware, uploadController.listar);
router.get('/:id', validateObjectId('id'), uploadController.obter);

// Geração de URL assinada temporária (15 min) para download seguro
router.get('/:id/signed-url', validateObjectId('id'), adminOuGestorMiddleware, uploadController.gerarUrlAssinada);

// Upload: admin/gestor (com rate limiter e diskStorage)
router.post('/', adminOuGestorMiddleware, uploadRateLimiter, upload.single('file'), uploadController.criar);

// Download/visualizar direto: admin/gestor
router.get('/:id/download', validateObjectId('id'), adminOuGestorMiddleware, uploadController.download);
router.get('/:id/view', validateObjectId('id'), adminOuGestorMiddleware, uploadController.visualizar);

// Delete: apenas admin
router.delete('/:id', validateObjectId('id'), adminMiddleware, uploadController.deletar);

export default router;
