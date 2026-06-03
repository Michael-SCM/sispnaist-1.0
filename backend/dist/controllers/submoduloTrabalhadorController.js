"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TrabalhadorDependente_1 = __importDefault(require("../models/TrabalhadorDependente"));
const TrabalhadorAfastamento_1 = __importDefault(require("../models/TrabalhadorAfastamento"));
const TrabalhadorOcorrenciaViolencia_1 = __importDefault(require("../models/TrabalhadorOcorrenciaViolencia"));
const TrabalhadorReadaptacao_1 = __importDefault(require("../models/TrabalhadorReadaptacao"));
const TrabalhadorProcessoTrabalho_1 = __importDefault(require("../models/TrabalhadorProcessoTrabalho"));
const TrabalhadorVinculo_1 = __importDefault(require("../models/TrabalhadorVinculo"));
const Trabalhador_1 = __importDefault(require("../models/Trabalhador"));
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Controller unificado para todos os submódulos do trabalhador.
 * Equivalente aos módulos: trabalhador_dependentes, trabalhador_afastamento,
 * trabalhador_ocorrencia_violencia, trabalhador_readaptacao, trabalhador_processo_trabalho
 */
// Mapeamento de submódulos para models
const SUBMODULO_MODELS = {
    dependentes: TrabalhadorDependente_1.default,
    afastamentos: TrabalhadorAfastamento_1.default,
    ocorrenciasViolencia: TrabalhadorOcorrenciaViolencia_1.default,
    readaptacoes: TrabalhadorReadaptacao_1.default,
    processosTrabalho: TrabalhadorProcessoTrabalho_1.default,
    vinculos: TrabalhadorVinculo_1.default
};
class SubmoduloTrabalhadorController {
    // GET /api/trabalhadores/:id/:submodulo - Lista submódulos de um trabalhador
    async listar(req, res, next) {
        try {
            const { id, submodulo } = req.params;
            const { ativo } = req.query;
            // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
            if (req.user?.perfil === 'trabalhador') {
                const trabalhador = await Trabalhador_1.default.findOne({ cpf: req.user.cpf });
                if (!trabalhador || id !== trabalhador._id.toString()) {
                    throw new errorHandler_1.AppError('Sem permissão para acessar os dados deste trabalhador', 403);
                }
            }
            const Model = SUBMODULO_MODELS[submodulo];
            if (!Model) {
                throw new errorHandler_1.AppError(`Submódulo "${submodulo}" não é válido`, 400);
            }
            const filtro = { trabalhadorId: id };
            if (ativo === 'true')
                filtro.ativo = true;
            else if (ativo === 'false')
                filtro.ativo = false;
            const itens = await Model.find(filtro).sort({ createdAt: -1 }).lean();
            return res.status(200).json(itens);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/trabalhadores/:id/:submodulo/:itemId - Obter item específico
    async obter(req, res, next) {
        try {
            const { id, submodulo, itemId } = req.params;
            // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
            if (req.user?.perfil === 'trabalhador') {
                const trabalhador = await Trabalhador_1.default.findOne({ cpf: req.user.cpf });
                if (!trabalhador || id !== trabalhador._id.toString()) {
                    throw new errorHandler_1.AppError('Sem permissão para acessar os dados deste trabalhador', 403);
                }
            }
            const Model = SUBMODULO_MODELS[submodulo];
            if (!Model) {
                throw new errorHandler_1.AppError(`Submódulo "${submodulo}" não é válido`, 400);
            }
            const item = await Model.findOne({ _id: itemId, trabalhadorId: id });
            if (!item) {
                throw new errorHandler_1.AppError('Item não encontrado', 404);
            }
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/trabalhadores/:id/:submodulo - Criar novo item
    async criar(req, res, next) {
        try {
            const { id, submodulo } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new errorHandler_1.AppError('Sem permissão para cadastrar registros em submódulos de trabalhadores', 403);
            }
            const dados = req.body;
            const Model = SUBMODULO_MODELS[submodulo];
            if (!Model) {
                throw new errorHandler_1.AppError(`Submódulo "${submodulo}" não é válido`, 400);
            }
            // Adiciona o trabalhadorId
            const item = await Model.create({ ...dados, trabalhadorId: id });
            return res.status(201).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/trabalhadores/:id/:submodulo/:itemId - Atualizar item
    async atualizar(req, res, next) {
        try {
            const { id, submodulo, itemId } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new errorHandler_1.AppError('Sem permissão para atualizar registros em submódulos de trabalhadores', 403);
            }
            const dados = req.body;
            const Model = SUBMODULO_MODELS[submodulo];
            if (!Model) {
                throw new errorHandler_1.AppError(`Submódulo "${submodulo}" não é válido`, 400);
            }
            const item = await Model.findOneAndUpdate({ _id: itemId, trabalhadorId: id }, dados, { new: true, runValidators: true });
            if (!item) {
                throw new errorHandler_1.AppError('Item não encontrado', 404);
            }
            return res.status(200).json(item);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/trabalhadores/:id/:submodulo/:itemId - Deletar item
    async deletar(req, res, next) {
        try {
            const { id, submodulo, itemId } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new errorHandler_1.AppError('Sem permissão para deletar registros em submódulos de trabalhadores', 403);
            }
            const Model = SUBMODULO_MODELS[submodulo];
            if (!Model) {
                throw new errorHandler_1.AppError(`Submódulo "${submodulo}" não é válido`, 400);
            }
            // Hard delete - remoção permanente do banco
            const resultado = await Model.deleteOne({ _id: itemId, trabalhadorId: id });
            if (resultado.deletedCount === 0) {
                throw new errorHandler_1.AppError('Item não encontrado', 404);
            }
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new SubmoduloTrabalhadorController();
