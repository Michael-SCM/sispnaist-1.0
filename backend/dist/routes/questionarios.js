"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questionarioController_1 = __importDefault(require("../controllers/questionarioController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Validação básica para questionário
const questionarioSchema = joi_1.default.object({
    nome: joi_1.default.string().trim().min(1).max(200).required(),
    descricao: joi_1.default.string().trim().max(500).optional(),
    tipo: joi_1.default.string().required(),
    ativo: joi_1.default.boolean().optional(),
    dataInicio: joi_1.default.date().optional(),
    dataFim: joi_1.default.date().optional()
});
const questionarioItemSchema = joi_1.default.object({
    pergunta: joi_1.default.string().trim().min(1).max(500).required(),
    tipoResposta: joi_1.default.string().valid('texto', 'unica', 'multipla', 'escala', 'data').required(),
    obrigatorio: joi_1.default.boolean().optional(),
    ordem: joi_1.default.number().integer().min(0).optional(),
    alternativas: joi_1.default.array().items(joi_1.default.object({
        valor: joi_1.default.string().required(),
        texto: joi_1.default.string().required(),
        pontuacao: joi_1.default.number().optional()
    })).optional()
});
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
router.get('/', questionarioController_1.default.listar);
router.get('/:id', questionarioController_1.default.obter);
router.post('/', (0, validation_1.validateRequest)(questionarioSchema), questionarioController_1.default.criar);
router.put('/:id', questionarioController_1.default.atualizar);
router.delete('/:id', questionarioController_1.default.deletar);
// Rotas de itens do questionário
router.post('/:id/itens', (0, validation_1.validateRequest)(questionarioItemSchema), questionarioController_1.default.criarItem);
router.put('/:id/itens/:itemId', questionarioController_1.default.atualizarItem);
router.delete('/:id/itens/:itemId', questionarioController_1.default.deletarItem);
exports.default = router;
