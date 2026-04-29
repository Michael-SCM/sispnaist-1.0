import { Router } from 'express';
import { 
  criarAcidenteMaterialBiologico, 
  listarAcidentesMaterialBiologico, 
  obterAcidenteMaterialBiologico, 
  atualizarAcidenteMaterialBiologico, 
  deletarAcidenteMaterialBiologico,
  criarSorologiaPaciente,
  obterSorologiaPaciente,
  criarSorologiaAcidentado,
  obterSorologiaAcidentado 
} from '../controllers/acidenteMaterialBiologicoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

router.use(authMiddleware); // Protegido

// Acidentes Material Biológico
router.route('/')
  .get(listarAcidentesMaterialBiologico)
  .post(criarAcidenteMaterialBiologico);

router.route('/:id')
  .get(obterAcidenteMaterialBiologico)
  .put(atualizarAcidenteMaterialBiologico)
  .delete(deletarAcidenteMaterialBiologico);

// Sorologia Paciente
router.route('/sorologia-paciente')
  .post(criarSorologiaPaciente);

router.route('/sorologia-paciente/:id')
  .get(obterSorologiaPaciente);

// Sorologia Acidentado  
router.route('/sorologia-acidentado')
  .post(criarSorologiaAcidentado);

router.route('/sorologia-acidentado/:id')
  .get(obterSorologiaAcidentado);

export default router;

