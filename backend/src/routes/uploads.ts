import { Router } from 'express';
import multer from 'multer';
import uploadController from '../controllers/uploadController';
import { authMiddleware } from '../middleware/auth';
import config from '../config/config.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize || 10485760 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|csv|txt/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
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
router.get('/:id/view', uploadController.visualizar);
router.delete('/:id', uploadController.deletar);

export default router;
