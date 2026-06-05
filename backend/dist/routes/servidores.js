"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const servidorFuncionarioController_1 = __importDefault(require("../controllers/servidorFuncionarioController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const servidorSchema = joi_1.default.object({
    trabalhadorId: joi_1.default.string().required(),
    matriculaFuncional: joi_1.default.string().trim().min(1).max(50).required(),
    dataPosse: joi_1.default.date().required(),
    dataExercicio: joi_1.default.date().required(),
    regimeJuridico: joi_1.default.string().trim().optional(),
    cargoEfetivo: joi_1.default.string().trim().optional(),
    cargoComissionado: joi_1.default.string().trim().optional(),
    lotacao: joi_1.default.string().trim().optional(),
    situacaoFuncional: joi_1.default.string().trim().optional(),
    atoNomeacao: joi_1.default.string().trim().optional(),
    dataNomeacao: joi_1.default.date().optional(),
    dataAposentadoria: joi_1.default.date().optional(),
    observacoes: joi_1.default.string().trim().optional()
});
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
router.get('/', servidorFuncionarioController_1.default.listar);
router.get('/:id', servidorFuncionarioController_1.default.obter);
router.post('/', (0, validation_1.validateRequest)(servidorSchema), servidorFuncionarioController_1.default.criar);
router.put('/:id', servidorFuncionarioController_1.default.atualizar);
router.delete('/:id', servidorFuncionarioController_1.default.deletar);
exports.default = router;
