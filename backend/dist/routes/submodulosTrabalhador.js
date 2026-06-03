"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const submoduloTrabalhadorController_1 = __importDefault(require("../controllers/submoduloTrabalhadorController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Rotas para submódulos do trabalhador.
 * Equivalente a: trabalhador_dependentes, trabalhador_afastamento,
 * trabalhador_ocorrencia_violencia, trabalhador_readaptacao, trabalhador_processo_trabalho
 */
// Todas as rotas requerem autenticação
router.use(auth_1.authMiddleware);
// CRUD unificado para todos os submódulos
router.get('/:id/:submodulo', submoduloTrabalhadorController_1.default.listar);
router.get('/:id/:submodulo/:itemId', submoduloTrabalhadorController_1.default.obter);
router.post('/:id/:submodulo', submoduloTrabalhadorController_1.default.criar);
router.put('/:id/:submodulo/:itemId', submoduloTrabalhadorController_1.default.atualizar);
router.delete('/:id/:submodulo/:itemId', submoduloTrabalhadorController_1.default.deletar);
exports.default = router;
