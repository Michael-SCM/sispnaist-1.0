"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportController_js_1 = require("../controllers/reportController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authMiddleware);
// Relatórios em JSON (base para PDF/XLS no frontend)
router.get('/acidentes', reportController_js_1.gerarRelatorioAcidentes);
router.get('/vacinacoes', reportController_js_1.gerarRelatorioVacinacoes);
router.get('/doencas', reportController_js_1.gerarRelatorioDoencas);
exports.default = router;
