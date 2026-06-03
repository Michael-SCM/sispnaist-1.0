"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const parametroController_1 = __importDefault(require("../controllers/parametroController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const parametroSchema = joi_1.default.object({
    chave: joi_1.default.string().trim().min(1).max(100).required(),
    valor: joi_1.default.string().required(),
    descricao: joi_1.default.string().trim().max(500).optional(),
    categoria: joi_1.default.string().trim().optional(),
    tipo: joi_1.default.string().valid('texto', 'numero', 'data', 'hora', 'boolean', 'json').optional()
});
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
router.get('/', parametroController_1.default.listar);
router.get('/chave/:chave', parametroController_1.default.obterPorChave);
router.get('/:id', parametroController_1.default.obter);
// Criação e atualização requerem admin
router.post('/', auth_1.adminMiddleware, (0, validation_1.validateRequest)(parametroSchema), parametroController_1.default.criar);
router.put('/:id', auth_1.adminMiddleware, parametroController_1.default.atualizar);
router.delete('/:id', auth_1.adminMiddleware, parametroController_1.default.deletar);
exports.default = router;
