import { Router } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import uploadController from '../controllers/uploadController.js';
import { authMiddleware, adminMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation.js';
import config from '../config/config.js';
import { sanitizeAndValidateExtension } from '../utils/fileValidation.js';
import { UPLOAD_FILE_LIMITS, UPLOAD_TIMEOUT_MS } from '../config/uploadLimits.js';

const router = Router();

// O pacote multer 2.x nao publica proprios de tipos; alias local evita depender
// do namespace global Express.Multer (que so existe com @types/multer instalado).
type MulterFile = {
  originalname: string;
  fieldname?: string;
  mimetype?: string;
  size?: number;
  path?: string;
  [key: string]: any;
};


// Diretorio temporario isolado para upload via diskStorage
const TEMP_DIR = path.resolve(process.cwd(), config.uploadDir || './uploads', 'tmp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true, mode: 0o700 });
}

// Rate limit estrito para uploads (maximo 30 uploads a cada 15 minutos por usuario/IP)
const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    status: 'error',
    message: 'Muitas requisicoes de upload. Por favor, aguarde alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuracao do multer com diskStorage (evita consumir RAM em arquivos grandes)
const storage = multer.diskStorage({
  destination: function (req: Request, file: MulterFile, cb: (error: Error | null, destination: string) => void) {
    cb(null, TEMP_DIR);
  },
  filename: function (req: Request, file: MulterFile, cb: (error: Error | null, filename: string) => void) {
    // Nome temporario aleatorio imprevisivel antes da validacao profunda de magic bytes
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueSuffix}.part`);
  },
});

// ---------------------------------------------------------------------------
// Limites de seguranca multer 2.x - defesa em profundidade contra DoS multipart
// Ref: aviso Express/OpenJS 31/08/2026 e CVE correspondente em multer < 2.3.0
// ---------------------------------------------------------------------------
const upload = multer({
  storage,
  limits: { ...UPLOAD_FILE_LIMITS },
  fileFilter: function (req: Request, file: MulterFile, cb: FileFilterCallback) {
    try {
      sanitizeAndValidateExtension(file.originalname);
      cb(null, true);
    } catch (err: any) {
      cb(err);
    }
  },
});

// ---------------------------------------------------------------------------
// Timeout de requisicao de upload: o multer nao expoe timeout proprio, entao
// limita o tempo total de parsing do corpo para nao manter conexoes abertas.
// ---------------------------------------------------------------------------
function uploadTimeout(req: Request, res: Response, next: NextFunction) {
  let settled = false;

  const timer = setTimeout(() => {
    if (settled || res.headersSent) return;
    settled = true;
    res.status(408).json({
      status: 'error',
      message: 'Tempo limite excedido no envio do arquivo.',
    });
    req.destroy();
  }, UPLOAD_TIMEOUT_MS);

  const clear = () => {
    if (settled) return;
    settled = true;
    clearTimeout(timer);
  };

  res.on('finish', clear);
  res.on('close', clear);
  next();
}

// Download via URL assinada temporaria (token carrega autenticacao/expiracao)
router.get('/download-signed', uploadController.downloadAssinado);

// Todas as demais rotas requerem autenticacao
router.use(authMiddleware);

// Leitura de uploads: admin/gestor - filtro por empresa aplicado no controller
router.get('/', adminOuGestorMiddleware, uploadController.listar);
router.get('/:id', validateObjectId('id'), uploadController.obter);

// Geracao de URL assinada temporaria (15 min) para download seguro
router.get('/:id/signed-url', validateObjectId('id'), adminOuGestorMiddleware, uploadController.gerarUrlAssinada);

// Upload: admin/gestor (rate limiter + timeout + diskStorage)
router.post(
  '/',
  adminOuGestorMiddleware,
  uploadRateLimiter,
  uploadTimeout,
  upload.single('file'),
  uploadController.criar
);

// Download/visualizar direto: admin/gestor
router.get('/:id/download', validateObjectId('id'), adminOuGestorMiddleware, uploadController.download);
router.get('/:id/view', validateObjectId('id'), adminOuGestorMiddleware, uploadController.visualizar);

// Delete: apenas admin
router.delete('/:id', validateObjectId('id'), adminMiddleware, uploadController.deletar);

export default router;
