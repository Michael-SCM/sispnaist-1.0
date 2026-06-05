"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const EnderecoController_js_1 = __importDefault(require("../controllers/EnderecoController.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authMiddleware);
router.get('/bairros', EnderecoController_js_1.default.buscarBairros);
router.get('/logradouros', EnderecoController_js_1.default.buscarLogradouros);
router.get('/cep/:cep', EnderecoController_js_1.default.buscarCEP);
exports.default = router;
