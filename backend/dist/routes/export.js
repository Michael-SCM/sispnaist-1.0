"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExportController_js_1 = __importDefault(require("../controllers/ExportController.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação e privilégios elevados
router.use(auth_js_1.authMiddleware);
router.use((0, auth_js_1.authorize)('admin', 'gestor'));
router.get('/acidentes', ExportController_js_1.default.exportarAcidentesCSV);
router.get('/acidentes/pdf', ExportController_js_1.default.exportarAcidentesPDF);
router.get('/doencas/pdf', ExportController_js_1.default.exportarDoencasPDF);
router.get('/vacinacoes/pdf', ExportController_js_1.default.exportarVacinacoesPDF);
router.get('/monitoramento/pdf', ExportController_js_1.default.exportarMonitoramentoPDF);
router.get('/trabalhadores', ExportController_js_1.default.exportarTrabalhadoresCSV);
router.get('/trabalhadores/pdf', ExportController_js_1.default.exportarTrabalhadoresPDF);
router.get('/material-biologico', ExportController_js_1.default.exportarMaterialBiologicoCSV);
exports.default = router;
