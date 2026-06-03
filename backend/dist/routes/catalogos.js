"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catalogoController_1 = __importDefault(require("../controllers/catalogoController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validations_1 = require("../utils/validations");
const router = (0, express_1.Router)();
/**
 * Rotas para tabelas auxiliares/catalogos do sistema.
 * Equivalente ao getdados.php do PHP original, mas com CRUD completo.
 *
 * Todas as rotas requerem autenticação.
 */
// Rota especial: listar todas as entidades disponíveis
router.get('/listar-todos', auth_1.authMiddleware, catalogoController_1.default.listarEntidades);
// Rota para executar seed de catálogos (apenas admin)
router.post('/seed', auth_1.authMiddleware, catalogoController_1.default.seed);
// Rota temporária pública para seed (remover após uso)
router.get('/seed-public', catalogoController_1.default.seed);
// Listar apenas itens ativos de uma entidade (equivalente ao getdados.php)
router.get('/:entidade/ativos', auth_1.authMiddleware, catalogoController_1.default.listarAtivos);
// CRUD completo para qualquer catálogo
router.get('/:entidade', auth_1.authMiddleware, catalogoController_1.default.listar);
router.get('/:entidade/:id', auth_1.authMiddleware, catalogoController_1.default.obter);
router.post('/:entidade', auth_1.authMiddleware, (0, validation_1.validateRequest)(validations_1.catalogoSchema), catalogoController_1.default.criar);
router.put('/:entidade/:id', auth_1.authMiddleware, (0, validation_1.validateRequest)(validations_1.catalogoUpdateSchema), catalogoController_1.default.atualizar);
router.delete('/:entidade/:id', auth_1.authMiddleware, catalogoController_1.default.deletar);
exports.default = router;
