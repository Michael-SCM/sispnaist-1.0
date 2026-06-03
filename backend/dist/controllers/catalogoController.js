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
const CatalogoService_1 = __importDefault(require("../services/CatalogoService"));
const auditLogger_js_1 = require("../utils/auditLogger.js");
class CatalogoController {
    /**
     * Controller genérico para TODAS as tabelas auxiliares/catalogos.
     * Equivalente ao getdados.php do PHP original, mas com CRUD completo.
     */
    // GET /api/catalogos/:entidade - Lista todos os itens de uma entidade
    async listar(req, res, next) {
        try {
            const { entidade } = req.params;
            const { page = 1, limit = 100, ativo } = req.query;
            const resultado = await CatalogoService_1.default.listar(entidade, Number(page), Number(limit), ativo === 'true' ? true : ativo === 'false' ? false : undefined);
            return res.status(200).json(resultado);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/catalogos/:entidade/ativos - Lista apenas itens ativos (equivalente ao getdados.php)
    async listarAtivos(req, res, next) {
        try {
            const { entidade } = req.params;
            const resultado = await CatalogoService_1.default.listarAtivos(entidade);
            return res.status(200).json(resultado);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/catalogos/:entidade/:id - Obter item específico
    async obter(req, res, next) {
        try {
            const { entidade, id } = req.params;
            const item = await CatalogoService_1.default.obter(entidade, id);
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/catalogos/:entidade - Criar novo item
    async criar(req, res, next) {
        try {
            const { entidade } = req.params;
            const dados = req.body;
            const item = await CatalogoService_1.default.criar(entidade, dados);
            await (0, auditLogger_js_1.logAction)(req, 'CREATE', `Catalogo_${entidade}`, item._id?.toString() || '', item);
            return res.status(201).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/catalogos/:entidade/:id - Atualizar item
    async atualizar(req, res, next) {
        try {
            const { entidade, id } = req.params;
            const dados = req.body;
            const oldItem = await CatalogoService_1.default.obter(entidade, id);
            const item = await CatalogoService_1.default.atualizar(entidade, id, dados);
            const mudancas = (0, auditLogger_js_1.compararDados)(oldItem, item);
            // Registra auditoria
            await (0, auditLogger_js_1.logAction)(req, 'UPDATE', `Catalogo_${entidade}`, id, mudancas);
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/catalogos/:entidade/:id - Deletar item (soft delete)
    async deletar(req, res, next) {
        try {
            const { entidade, id } = req.params;
            const oldItem = await CatalogoService_1.default.obter(entidade, id);
            await CatalogoService_1.default.deletar(entidade, id);
            // Registra auditoria
            await (0, auditLogger_js_1.logAction)(req, 'DELETE', `Catalogo_${entidade}`, id, oldItem);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/catalogos/listar-todos - Lista todas as entidades com contagem
    async listarEntidades(req, res, next) {
        try {
            const entidades = await CatalogoService_1.default.listarEntidades();
            return res.status(200).json(entidades);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/catalogos/seed - Executa seed de catálogos essenciais
    async seed(req, res, next) {
        try {
            const { seedCatalogos } = await Promise.resolve().then(() => __importStar(require('../utils/seedCatalogos')));
            await seedCatalogos();
            return res.status(200).json({ message: 'Seed de catálogos executado com sucesso!' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new CatalogoController();
