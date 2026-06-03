"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vacinacaoController_js_1 = require("../controllers/vacinacaoController.js");
const auth_js_1 = require("../middleware/auth.js");
const validation_js_1 = require("../middleware/validation.js");
const validations_js_1 = require("../utils/validations.js");
const router = express_1.default.Router();
// Proteger todas as rotas com autenticação
router.use(auth_js_1.authMiddleware);
// Middleware para validar MongoDB ObjectId
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
// Estatísticas (antes de rotas com :id)
router.get('/stats/estatisticas', vacinacaoController_js_1.obterEstatisticas);
// Vacinações por Trabalhador
router.get('/trabalhador/:trabalhadorId', vacinacaoController_js_1.obterVacinacoesPorTrabalhador);
// CRUD padrão
router.post('/', (0, validation_js_1.validateRequest)(validations_js_1.criarVacinacaoSchema), vacinacaoController_js_1.criarVacinacao);
router.get('/', vacinacaoController_js_1.listarVacinacoes);
router.get('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, vacinacaoController_js_1.obterVacinacao);
router.put('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, (0, validation_js_1.validateRequest)(validations_js_1.atualizarVacinacaoSchema), vacinacaoController_js_1.atualizarVacinacao);
router.delete('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID inválido' });
    }
    next();
}, vacinacaoController_js_1.deletarVacinacao);
exports.default = router;
