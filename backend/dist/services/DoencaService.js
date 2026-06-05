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
exports.DoencaService = void 0;
const Doenca_js_1 = __importDefault(require("../models/Doenca.js"));
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const mongoose_1 = __importDefault(require("mongoose"));
class DoencaService {
    /**
     * Resolve trabalhadorId de CPF para ObjectId
     */
    async resolverTrabalhadorId(identifier) {
        if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
            return identifier;
        }
        const [usuario, trabalhador] = await Promise.all([
            User_js_1.default.findOne({ cpf: identifier }).select('_id').lean(),
            Trabalhador_js_1.default.findOne({ cpf: identifier }).select('_id').lean()
        ]);
        if (usuario)
            return usuario._id.toString();
        if (trabalhador)
            return trabalhador._id.toString();
        throw new errorHandler_js_1.AppError(`Trabalhador com CPF ${identifier} não encontrado`, 404);
    }
    async criar(doencaData) {
        // Resolver trabalhadorId se for CPF
        if (doencaData.trabalhadorId && !mongoose_1.default.Types.ObjectId.isValid(doencaData.trabalhadorId)) {
            doencaData.trabalhadorId = await this.resolverTrabalhadorId(doencaData.trabalhadorId);
        }
        const doenca = new Doenca_js_1.default(doencaData);
        await doenca.save();
        return { ...doenca.toObject(), _id: doenca._id?.toString() };
    }
    async obter(id) {
        const doenca = await Doenca_js_1.default.findById(id)
            .populate('trabalhadorId', 'nome cpf email empresa unidade')
            .lean();
        if (!doenca) {
            throw new errorHandler_js_1.AppError('Doença não encontrada', 404);
        }
        return doenca;
    }
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.nomeDoenca) {
            const nomeDoenca = String(filtros.nomeDoenca).trim();
            const pattern = new RegExp('^' + nomeDoenca, 'i');
            query.nomeDoenca = { $regex: pattern };
        }
        if (filtros?.ativo !== undefined) {
            query.ativo = filtros.ativo;
        }
        if (filtros?.trabalhadorId) {
            // Normaliza CPF de filtro (mascarado ou dígitos) antes de resolver
            const { toCPFMaskedOrDigits } = await Promise.resolve().then(() => __importStar(require('../utils/cpf.js')));
            const cpfNorm = toCPFMaskedOrDigits(String(filtros.trabalhadorId));
            query.trabalhadorId = await this.resolverTrabalhadorId(cpfNorm);
        }
        if (filtros?.dataInicio || filtros?.dataFim) {
            query.dataInicio = {};
            if (filtros?.dataInicio) {
                query.dataInicio.$gte = new Date(filtros.dataInicio);
            }
            if (filtros?.dataFim) {
                query.dataInicio.$lte = new Date(filtros.dataFim);
            }
        }
        const total = await Doenca_js_1.default.countDocuments(query);
        const doencas = await Doenca_js_1.default.find(query)
            .populate('trabalhadorId', 'nome cpf email empresa unidade')
            .sort({ dataInicio: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            doencas: doencas.map(d => ({ ...d, _id: d._id?.toString() })),
            total,
            pages,
        };
    }
    async atualizar(id, doencaData) {
        // Não permitir alterar data de criação
        if ('dataCriacao' in doencaData) {
            delete doencaData.dataCriacao;
        }
        // Resolver trabalhadorId se for CPF
        if (doencaData.trabalhadorId && !mongoose_1.default.Types.ObjectId.isValid(doencaData.trabalhadorId)) {
            doencaData.trabalhadorId = await this.resolverTrabalhadorId(doencaData.trabalhadorId);
        }
        const doenca = await Doenca_js_1.default.findByIdAndUpdate(id, { $set: doencaData }, {
            new: true,
            runValidators: true,
        }).populate('trabalhadorId', 'nome cpf email empresa unidade').lean();
        if (!doenca) {
            throw new errorHandler_js_1.AppError('Doença não encontrada', 404);
        }
        return doenca;
    }
    async deletar(id) {
        const result = await Doenca_js_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new errorHandler_js_1.AppError('Doença não encontrada', 404);
        }
    }
    async obterPorTrabalhador(trabalhadorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = { trabalhadorId };
        const total = await Doenca_js_1.default.countDocuments(query);
        const doencas = await Doenca_js_1.default.find(query)
            .sort({ dataInicio: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            doencas: doencas.map(d => ({ ...d, _id: d._id?.toString() })),
            total,
            pages,
        };
    }
    async obterEstatisticas() {
        const total = await Doenca_js_1.default.countDocuments();
        const ativas = await Doenca_js_1.default.countDocuments({ ativo: true });
        const encerradas = await Doenca_js_1.default.countDocuments({ ativo: false });
        const porNome = await Doenca_js_1.default.aggregate([
            {
                $group: {
                    _id: '$nomeDoenca',
                    quantidade: { $sum: 1 },
                },
            },
            {
                $sort: { quantidade: -1 },
            },
            {
                $limit: 10,
            },
        ]);
        // Últimos 6 meses
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
        const ultimosMeses = await Doenca_js_1.default.aggregate([
            {
                $match: {
                    dataInicio: { $gte: seisMesesAtras },
                },
            },
            {
                $group: {
                    _id: {
                        ano: { $year: '$dataInicio' },
                        mes: { $month: '$dataInicio' },
                    },
                    quantidade: { $sum: 1 },
                },
            },
            {
                $sort: { '_id.ano': 1, '_id.mes': 1 },
            },
        ]);
        return {
            total,
            ativas,
            encerradas,
            porNome: porNome.reduce((acc, item) => {
                acc[item._id || 'Não informada'] = item.quantidade;
                return acc;
            }, {}),
            ultimosMeses: ultimosMeses.map((item) => ({
                mes: `${item._id.mes}/${item._id.ano}`,
                quantidade: item.quantidade,
            })),
        };
    }
}
exports.DoencaService = DoencaService;
exports.default = new DoencaService();
