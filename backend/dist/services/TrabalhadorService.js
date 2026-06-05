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
exports.TrabalhadorService = void 0;
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const TrabalhadorVinculo_js_1 = __importDefault(require("../models/TrabalhadorVinculo.js"));
const TrabalhadorInformacao_js_1 = __importDefault(require("../models/TrabalhadorInformacao.js"));
const TrabalhadorDependente_js_1 = __importDefault(require("../models/TrabalhadorDependente.js"));
const TrabalhadorAfastamento_js_1 = __importDefault(require("../models/TrabalhadorAfastamento.js"));
const TrabalhadorProcessoTrabalho_js_1 = __importDefault(require("../models/TrabalhadorProcessoTrabalho.js"));
const TrabalhadorReadaptacao_js_1 = __importDefault(require("../models/TrabalhadorReadaptacao.js"));
const TrabalhadorOcorrenciaViolencia_js_1 = __importDefault(require("../models/TrabalhadorOcorrenciaViolencia.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
class TrabalhadorService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.nome) {
            // Filtrar começando pelas iniciais do nome (prefixo)
            // Ex: "jo" -> nomes que começam com "Jo" (ignora acentos)
            const nome = String(filtros.nome).trim();
            const pattern = new RegExp('^' + nome, 'i');
            query.nome = { $regex: pattern };
        }
        if (filtros?.cpf) {
            // Normaliza para bater com o padrão do banco (XXX.XXX.XXX-XX) ou pelo menos remove máscara.
            // O backend aceita tanto CPF mascarado quanto apenas dígitos.
            const { toCPFMaskedOrDigits } = await Promise.resolve().then(() => __importStar(require('../utils/cpf.js')));
            query.cpf = toCPFMaskedOrDigits(filtros.cpf);
        }
        if (filtros?.matricula) {
            query.matricula = filtros.matricula;
        }
        if (filtros?.setor) {
            query['trabalho.setor'] = { $regex: filtros.setor, $options: 'i' };
        }
        const [total, trabalhadores] = await Promise.all([
            Trabalhador_js_1.default.countDocuments(query),
            Trabalhador_js_1.default.find(query)
                .sort({ nome: 1 })
                .skip(skip)
                .limit(limit)
                .lean()
        ]);
        const pages = Math.ceil(total / limit);
        return {
            trabalhadores: trabalhadores,
            total,
            pages,
        };
    }
    async obter(id) {
        const trabalhador = await Trabalhador_js_1.default.findById(id).lean();
        if (!trabalhador) {
            throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
        }
        return trabalhador;
    }
    async obterComSubmodulos(id) {
        const trabalhador = await Trabalhador_js_1.default.findById(id).lean();
        if (!trabalhador) {
            throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
        }
        // Buscar todos os submódulos
        const [vinculo, informacao, dependentes, afastamentos, processosTrabalho, readaptacoes, ocorrenciasViolencia] = await Promise.all([
            TrabalhadorVinculo_js_1.default.find({ trabalhadorId: id }).lean(),
            TrabalhadorInformacao_js_1.default.findOne({ trabalhadorId: id.toString() }).lean(),
            TrabalhadorDependente_js_1.default.find({ trabalhadorId: id }).lean(),
            TrabalhadorAfastamento_js_1.default.find({ trabalhadorId: id }).lean(),
            TrabalhadorProcessoTrabalho_js_1.default.find({ trabalhadorId: id }).lean(),
            TrabalhadorReadaptacao_js_1.default.find({ trabalhadorId: id }).lean(),
            TrabalhadorOcorrenciaViolencia_js_1.default.find({ trabalhadorId: id }).lean(),
        ]);
        return {
            ...trabalhador,
            submodulos: {
                vinculos: vinculo || [],
                informacao: informacao || null,
                dependentes: dependentes || [],
                afastamentos: afastamentos || [],
                processosTrabalho: processosTrabalho || [],
                readaptacoes: readaptacoes || [],
                ocorrenciasViolencia: ocorrenciasViolencia || [],
            }
        };
    }
    async obterPorCpf(cpf) {
        const trabalhador = await Trabalhador_js_1.default.findOne({ cpf }).lean();
        if (!trabalhador) {
            throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
        }
        return trabalhador;
    }
    async criar(trabalhadorData) {
        const existeCpf = await Trabalhador_js_1.default.findOne({ cpf: trabalhadorData.cpf });
        if (existeCpf) {
            throw new errorHandler_js_1.AppError('Já existe um trabalhador cadastrado com este CPF', 400);
        }
        const trabalhador = new Trabalhador_js_1.default(trabalhadorData);
        await trabalhador.save();
        return trabalhador.toObject();
    }
    async atualizar(id, trabalhadorData) {
        // Impedir alteração de CPF via atualização simples se CPF já existe em outro registro
        if (trabalhadorData.cpf) {
            const existeCpf = await Trabalhador_js_1.default.findOne({
                cpf: trabalhadorData.cpf,
                _id: { $ne: id }
            });
            if (existeCpf) {
                throw new errorHandler_js_1.AppError('CPF já está em uso por outro trabalhador', 400);
            }
        }
        const trabalhador = await Trabalhador_js_1.default.findByIdAndUpdate(id, { $set: trabalhadorData }, { new: true, runValidators: true }).lean();
        if (!trabalhador) {
            throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
        }
        return trabalhador;
    }
    async deletar(id) {
        const result = await Trabalhador_js_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
        }
    }
}
exports.TrabalhadorService = TrabalhadorService;
exports.default = new TrabalhadorService();
