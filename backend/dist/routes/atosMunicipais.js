"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AtoMunicipalInovacaoController_js_1 = __importDefault(require("../controllers/AtoMunicipalInovacaoController.js"));
const auth_js_1 = require("../middleware/auth.js");
const router = (0, express_1.Router)();
// Todas as rotas exigem autenticação
router.use(auth_js_1.authMiddleware);
router.get('/', AtoMunicipalInovacaoController_js_1.default.listar);
router.get('/:id', AtoMunicipalInovacaoController_js_1.default.obter);
router.post('/', AtoMunicipalInovacaoController_js_1.default.criar);
router.put('/:id', AtoMunicipalInovacaoController_js_1.default.atualizar);
router.delete('/:id', AtoMunicipalInovacaoController_js_1.default.deletar);
exports.default = router;
