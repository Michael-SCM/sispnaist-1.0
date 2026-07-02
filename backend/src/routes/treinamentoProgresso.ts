import { Router } from 'express';
import {
  obterProgresso,
  listarProgresso,
  marcarAssistido,
  alternarFavorito,
  iniciarQuiz,
  submeterQuiz,
  emitirCertificado,
  listarCertificados,
  obterCertificado,
  listarCertificadosAdmin,
  exportarCertificadoPDF
} from '../controllers/progressoTreinamentoController.js';
import { authMiddleware, adminOuGestorMiddleware } from '../middleware/auth.js';
import { validateObjectId } from '../middleware/validation';

const router = Router();

router.get('/progresso', authMiddleware, listarProgresso);
router.get('/progresso/:videoAulaId', authMiddleware, validateObjectId('videoAulaId'), obterProgresso);
router.post('/progresso/:videoAulaId/assistir', authMiddleware, validateObjectId('videoAulaId'), marcarAssistido);
router.post('/progresso/:videoAulaId/favorito', authMiddleware, validateObjectId('videoAulaId'), alternarFavorito);
router.post('/progresso/:videoAulaId/iniciar-quiz', authMiddleware, validateObjectId('videoAulaId'), iniciarQuiz);
router.post('/progresso/:videoAulaId/quiz', authMiddleware, validateObjectId('videoAulaId'), submeterQuiz);
router.post('/progresso/:videoAulaId/certificado', authMiddleware, validateObjectId('videoAulaId'), emitirCertificado);

router.get('/certificados', authMiddleware, listarCertificados);
router.get('/certificados/:id', authMiddleware, validateObjectId('id'), obterCertificado);
router.get('/certificados/:id/pdf', authMiddleware, validateObjectId('id'), exportarCertificadoPDF);
router.get('/admin/certificados', authMiddleware, adminOuGestorMiddleware, listarCertificadosAdmin);

export default router;
