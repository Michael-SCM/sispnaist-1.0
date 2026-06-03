"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const preferenciaController_1 = __importDefault(require("../controllers/preferenciaController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
// Preferências do usuário logado
router.get('/minhas', preferenciaController_1.default.obterMinhas);
router.put('/minhas', preferenciaController_1.default.atualizarMinhas);
// Preferências de outros usuário (requer admin no controller)
router.get('/usuario/:usuarioId', preferenciaController_1.default.obter);
router.put('/usuario/:usuarioId', preferenciaController_1.default.atualizar);
exports.default = router;
