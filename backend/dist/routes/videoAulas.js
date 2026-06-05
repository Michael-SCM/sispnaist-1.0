"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const videoAulaController_1 = __importDefault(require("../controllers/videoAulaController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const videoAulaSchema = joi_1.default.object({
    titulo: joi_1.default.string().trim().min(1).max(200).required(),
    descricao: joi_1.default.string().trim().max(1000).optional(),
    url: joi_1.default.string().uri().required(),
    thumbnail: joi_1.default.string().optional(),
    duracao: joi_1.default.string().optional(),
    categoria: joi_1.default.string().trim().empty('').optional(),
    tags: joi_1.default.array().items(joi_1.default.string()).optional(),
    ordem: joi_1.default.number().integer().min(0).optional()
});
// Listar e obter são públicos para usuários autenticados
router.get('/', auth_1.authMiddleware, videoAulaController_1.default.listar);
router.get('/:id', auth_1.authMiddleware, videoAulaController_1.default.obter);
// Criar, atualizar e deletar requerem admin/gestor
router.post('/', auth_1.authMiddleware, auth_1.adminOuGestorMiddleware, (0, validation_1.validateRequest)(videoAulaSchema), videoAulaController_1.default.criar);
router.put('/:id', auth_1.authMiddleware, auth_1.adminOuGestorMiddleware, videoAulaController_1.default.atualizar);
router.delete('/:id', auth_1.authMiddleware, auth_1.adminOuGestorMiddleware, videoAulaController_1.default.deletar);
exports.default = router;
