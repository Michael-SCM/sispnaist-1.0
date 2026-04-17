import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import uploadController from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';
import config from '../config/config.js';

const router = Router();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = config.uploadDir || path.join(__dirname, '../../uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(config.maxFileSize || '10485760') // 10MB default
  },
  fileFilter: function (req, file, cb) {
    // Aceita tipos comuns de arquivos
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido'));
    }
  }
});

// Todas as rotas requerem autenticação
router.use(authMiddleware);

router.get('/', uploadController.listar);
router.get('/:id', uploadController.obter);
router.post('/', upload.single('file'), uploadController.criar);
router.get('/:id/download', uploadController.download);
router.delete('/:id', uploadController.deletar);

export default router;
