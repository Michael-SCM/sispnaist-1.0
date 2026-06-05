"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditController_js_1 = require("../controllers/auditController.js");
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação e perfil admin
router.use(auth_js_1.authMiddleware);
router.use((0, auth_js_1.authorize)('admin'));
// Rotas de auditoria (apenas admin)
router.get('/logs', auditController_js_1.obterLogs);
router.get('/stats', auditController_js_1.obterEstatisticas);
exports.default = router;
