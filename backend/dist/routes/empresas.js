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
const empresaController = __importStar(require("../controllers/empresaController.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = express_1.default.Router();
// Rota pública para listar empresas ativas (para formulário de trabalhadores)
router.get('/ativas', async (req, res) => {
    try {
        const empresaService = (await Promise.resolve().then(() => __importStar(require('../services/EmpresaService.js')))).default;
        const result = await empresaService.listar(1, 1000, {});
        // Filtrar apenas empresas ativas
        const empresasAtivas = result.empresas.filter((e) => e.ativa !== false);
        res.json({
            status: 'success',
            data: { empresas: empresasAtivas, total: empresasAtivas.length },
        });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: 'Erro ao carregar empresas' });
    }
});
// Todas as rotas de empresas requerem autenticação de Admin
router.use(auth_js_1.authMiddleware);
// Rota pública para usuários autenticados (usada em dropdowns de cadastro)
router.get('/unidade/:unidadeId', empresaController.getEmpresaPorUnidade);
router.use(auth_js_1.adminMiddleware);
router.get('/', empresaController.getEmpresas);
router.post('/', empresaController.createEmpresa);
router.get('/:id', empresaController.getEmpresa);
router.put('/:id', empresaController.updateEmpresa);
router.delete('/:id', empresaController.deleteEmpresa);
exports.default = router;
