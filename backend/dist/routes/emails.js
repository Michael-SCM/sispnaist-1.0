"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const emailController_1 = __importDefault(require("../controllers/emailController"));
const auth_1 = require("../middleware/auth");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
// Rotas de templates/padrões de email
router.get('/padroes', emailController_1.default.listarPadroes);
router.get('/padroes/:id', emailController_1.default.obterPadrao);
router.post('/padroes', auth_2.adminMiddleware, emailController_1.default.criarPadrao);
router.put('/padroes/:id', auth_2.adminMiddleware, emailController_1.default.atualizarPadrao);
router.delete('/padroes/:id', auth_2.adminMiddleware, emailController_1.default.deletarPadrao);
// Envio de email (placeholder)
router.post('/enviar', emailController_1.default.enviar);
exports.default = router;
