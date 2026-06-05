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
exports.VacinacaoService = void 0;
const Vacinacao_js_1 = __importDefault(require("../models/Vacinacao.js"));
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const mongoose_1 = __importStar(require("mongoose"));
class VacinacaoService {
    async criar(data) {
        // Resolver CPF para ObjectId se necessário
        const trabalhadorId = await this.resolverTrabalhadorId(data.trabalhadorId);
        const vacinacao = new Vacinacao_js_1.default({
            ...data,
            trabalhadorId,
        });
        await vacinacao.save();
        return vacinacao.toObject();
    }
    async obter(id) {
        // Validar se é ObjectId válido
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new errorHandler_js_1.AppError('ID de vacinação inválido', 400);
        }
        const vacinacao = await Vacinacao_js_1.default.findById(id).populate('trabalhadorId', 'cpf nome email').lean();
        if (!vacinacao) {
            throw new errorHandler_js_1.AppError('Vacinação não encontrada', 404);
        }
        if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !vacinacao.trabalhadorId.nome) {
            const doc = await Vacinacao_js_1.default.findById(id).select('trabalhadorId').lean();
            if (doc && doc.trabalhadorId) {
                const identifier = doc.trabalhadorId.toString();
                let t = null;
                if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                    t = await Trabalhador_js_1.default.findById(identifier).select('nome cpf email').lean();
                    if (!t)
                        t = await User_js_1.default.findById(identifier).select('nome cpf email').lean();
                }
                else {
                    t = await Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf email').lean();
                    if (!t)
                        t = await User_js_1.default.findOne({ cpf: identifier }).select('nome cpf email').lean();
                }
                if (t)
                    vacinacao.trabalhadorId = t;
            }
        }
        return vacinacao;
    }
    async listar(filtros) {
        const page = filtros.page || 1;
        const limit = filtros.limit || 10;
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros.vacina) {
            const vacina = String(filtros.vacina).trim();
            const pattern = new RegExp('^' + vacina, 'i');
            query.vacina = { $regex: pattern };
        }
        if (filtros.trabalhadorId) {
            // Normaliza CPF de filtro (mascarado ou dígitos) antes de resolver
            const { toCPFMaskedOrDigits } = await Promise.resolve().then(() => __importStar(require('../utils/cpf.js')));
            const cpfNorm = toCPFMaskedOrDigits(filtros.trabalhadorId);
            const trabalhadorId = await this.resolverTrabalhadorId(cpfNorm);
            query.trabalhadorId = trabalhadorId;
        }
        const [vacinacoesBrutas, total] = await Promise.all([
            Vacinacao_js_1.default.find(query)
                .populate('trabalhadorId', 'cpf nome email')
                .sort({ dataVacinacao: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Vacinacao_js_1.default.countDocuments(query),
        ]);
        const vacinacoes = await Promise.all(vacinacoesBrutas.map(async (vacinacao) => {
            if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !vacinacao.trabalhadorId.nome) {
                const doc = await Vacinacao_js_1.default.findById(vacinacao._id).select('trabalhadorId').lean();
                if (doc && doc.trabalhadorId) {
                    const identifier = doc.trabalhadorId.toString();
                    let t = null;
                    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                        t = await Trabalhador_js_1.default.findById(identifier).select('nome cpf email').lean();
                        if (!t)
                            t = await User_js_1.default.findById(identifier).select('nome cpf email').lean();
                    }
                    else {
                        t = await Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf email').lean();
                        if (!t)
                            t = await User_js_1.default.findOne({ cpf: identifier }).select('nome cpf email').lean();
                    }
                    if (t)
                        vacinacao.trabalhadorId = t;
                }
            }
            return vacinacao;
        }));
        return {
            vacinacoes: vacinacoes,
            total,
            pages: Math.ceil(total / limit),
        };
    }
    async atualizar(id, data) {
        // Validar se é ObjectId válido
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new errorHandler_js_1.AppError('ID de vacinação inválido', 400);
        }
        // Se houver trabalhadorId, resolver CPF para ObjectId
        if (data.trabalhadorId) {
            data.trabalhadorId = await this.resolverTrabalhadorId(data.trabalhadorId);
        }
        const vacinacao = await Vacinacao_js_1.default.findByIdAndUpdate(id, { $set: data }, {
            new: true,
            runValidators: true,
        }).populate('trabalhadorId', 'cpf nome email').lean();
        if (!vacinacao) {
            throw new errorHandler_js_1.AppError('Vacinação não encontrada', 404);
        }
        return vacinacao;
    }
    async deletar(id) {
        // Validar se é ObjectId válido
        if (!mongoose_1.Types.ObjectId.isValid(id)) {
            throw new errorHandler_js_1.AppError('ID de vacinação inválido', 400);
        }
        const vacinacao = await Vacinacao_js_1.default.findByIdAndDelete(id);
        if (!vacinacao) {
            throw new errorHandler_js_1.AppError('Vacinação não encontrada', 404);
        }
    }
    async obterPorTrabalhador(trabalhadorId, page = 1, limit = 10) {
        const resolvedId = await this.resolverTrabalhadorId(trabalhadorId);
        const skip = (page - 1) * limit;
        const [vacinacoesBrutas, total] = await Promise.all([
            Vacinacao_js_1.default.find({ trabalhadorId: resolvedId })
                .populate('trabalhadorId', 'cpf nome email')
                .sort({ dataVacinacao: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Vacinacao_js_1.default.countDocuments({ trabalhadorId: resolvedId }),
        ]);
        const vacinacoes = await Promise.all(vacinacoesBrutas.map(async (vacinacao) => {
            if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !vacinacao.trabalhadorId.nome) {
                const doc = await Vacinacao_js_1.default.findById(vacinacao._id).select('trabalhadorId').lean();
                if (doc && doc.trabalhadorId) {
                    const identifier = doc.trabalhadorId.toString();
                    let t = null;
                    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                        t = await Trabalhador_js_1.default.findById(identifier).select('nome cpf email').lean();
                        if (!t)
                            t = await User_js_1.default.findById(identifier).select('nome cpf email').lean();
                    }
                    else {
                        t = await Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf email').lean();
                        if (!t)
                            t = await User_js_1.default.findOne({ cpf: identifier }).select('nome cpf email').lean();
                    }
                    if (t)
                        vacinacao.trabalhadorId = t;
                }
            }
            return vacinacao;
        }));
        const pages = Math.ceil(total / limit);
        return { vacinacoes: vacinacoes, total, pages };
    }
    async obterEstatisticas() {
        const total = await Vacinacao_js_1.default.countDocuments();
        const porVacina = await Vacinacao_js_1.default.aggregate([
            {
                $group: {
                    _id: '$vacina',
                    count: { $sum: 1 },
                },
            },
        ]);
        const hoje = new Date();
        const proximasDoses = await Vacinacao_js_1.default.countDocuments({
            proximoDose: {
                $gte: hoje,
                $lte: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
        });
        return {
            total,
            porVacina: Object.fromEntries(porVacina.map((p) => [p._id, p.count])),
            proximasDoses,
        };
    }
    async resolverTrabalhadorId(trabalhadorId) {
        if (!trabalhadorId) {
            throw new errorHandler_js_1.AppError('Trabalhador é obrigatório', 400);
        }
        // Se já é ObjectId válido, usar direto
        if (mongoose_1.Types.ObjectId.isValid(trabalhadorId)) {
            return trabalhadorId;
        }
        // Tentar buscar por CPF em User e Trabalhador em paralelo
        const [usuario, trabalhador] = await Promise.all([
            User_js_1.default.findOne({ cpf: trabalhadorId }).select('_id').lean(),
            Trabalhador_js_1.default.findOne({ cpf: trabalhadorId }).select('_id').lean()
        ]);
        if (usuario)
            return usuario._id.toString();
        if (trabalhador)
            return trabalhador._id.toString();
        throw new errorHandler_js_1.AppError('Trabalhador não encontrado', 404);
    }
}
exports.VacinacaoService = VacinacaoService;
exports.default = new VacinacaoService();
