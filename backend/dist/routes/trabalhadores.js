"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trabalhadorController = __importStar(require("../controllers/trabalhadorController.js"));
const TrabalhadorInformacaoController_js_1 = __importDefault(require("../controllers/TrabalhadorInformacaoController.js"));
const validation_js_1 = require("../middleware/validation.js");
const auth_js_1 = require("../middleware/auth.js");
const validations_js_1 = require("../utils/validations.js");
const router = express_1.default.Router();
// Todas as rotas de trabalhadores requerem autenticação
router.use(auth_js_1.authMiddleware);
// Middleware para validar MongoDB ObjectId
const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);
// CRUD de Trabalhadores
router.get('/', trabalhadorController.getTrabalhadores);
router.post('/', (0, validation_js_1.validateRequest)(validations_js_1.criarTrabalhadorSchema), trabalhadorController.createTrabalhador);
// Rota para obter trabalhador com todos os submódulos (deve vir ANTES de /:id)
router.get('/:id/completo', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID de trabalhador inválido' });
    }
    next();
}, trabalhadorController.getTrabalhadorCompleto);
router.get('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID de trabalhador inválido' });
    }
    next();
}, trabalhadorController.getTrabalhador);
router.put('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID de trabalhador inválido' });
    }
    next();
}, (0, validation_js_1.validateRequest)(validations_js_1.atualizarTrabalhadorSchema), trabalhadorController.updateTrabalhador);
router.delete('/:id', (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'ID de trabalhador inválido' });
    }
    next();
}, trabalhadorController.deleteTrabalhador);
// Rotas de Informações Históricas do Trabalhador
router.get('/:id/informacoes', (req, res, next) => TrabalhadorInformacaoController_js_1.default.listar(req, res, next));
router.get('/:id/informacoes/:infoId', (req, res, next) => TrabalhadorInformacaoController_js_1.default.obter(req, res, next));
router.post('/:id/informacoes', (req, res, next) => TrabalhadorInformacaoController_js_1.default.criar(req, res, next));
router.put('/:id/informacoes/:infoId', (req, res, next) => TrabalhadorInformacaoController_js_1.default.atualizar(req, res, next));
router.delete('/:id/informacoes/:infoId', (req, res, next) => TrabalhadorInformacaoController_js_1.default.deletar(req, res, next));
exports.default = router;
