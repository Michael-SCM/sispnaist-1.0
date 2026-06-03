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
const unidadeController = __importStar(require("../controllers/unidadeController.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
// Rota pública para listar unidades ativas (para formulário de trabalhadores)
router.get('/ativas', async (req, res) => {
    try {
        const unidadeService = (await Promise.resolve().then(() => __importStar(require('../services/UnidadeService.js')))).default;
        const result = await unidadeService.listar(1, 1000, {});
        // Filtrar apenas unidades ativas
        const unidadesAtivas = result.unidades.filter((u) => u.ativa !== false);
        res.json({
            status: 'success',
            data: { unidades: unidadesAtivas, total: unidadesAtivas.length },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro ao carregar unidades' });
    }
});
// Todas as rotas requerem autenticação
router.use(auth_js_1.authMiddleware);
// Rota pública para usuários autenticados (usada em dropdowns de cadastro)
router.get('/empresa/:empresaId', unidadeController.getUnidadesPorEmpresa);
// Rotas restritas a Admin
router.get('/', auth_js_1.adminMiddleware, unidadeController.getUnidades);
router.post('/', auth_js_1.adminMiddleware, unidadeController.createUnidade);
router.get('/:id', auth_js_1.adminMiddleware, unidadeController.getUnidade);
router.put('/:id', auth_js_1.adminMiddleware, unidadeController.updateUnidade);
router.delete('/:id', auth_js_1.adminMiddleware, unidadeController.deleteUnidade);
exports.default = router;
