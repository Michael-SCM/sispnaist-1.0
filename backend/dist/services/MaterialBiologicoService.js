"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialBiologicoService = void 0;
const MaterialBiologico_js_1 = __importDefault(require("../models/MaterialBiologico.js"));
const Acidente_js_1 = __importDefault(require("../models/Acidente.js"));
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const errorHandler_js_1 = require("../middleware/errorHandler.js");
const mongoose_1 = __importDefault(require("mongoose"));
class MaterialBiologicoService {
    async criar(data) {
        // Verificar se o acidente existe
        const acidente = await Acidente_js_1.default.findById(data.acidenteId);
        if (!acidente) {
            throw new errorHandler_js_1.AppError('Acidente base não encontrado', 404);
        }
        // Verificar se já existe uma ficha para este acidente
        const existeFicha = await MaterialBiologico_js_1.default.findOne({ acidenteId: data.acidenteId });
        if (existeFicha) {
            throw new errorHandler_js_1.AppError('Já existe uma ficha de material biológico para este acidente', 400);
        }
        const ficha = new MaterialBiologico_js_1.default(data);
        await ficha.save();
        return { ...ficha.toObject(), _id: ficha._id?.toString() };
    }
    async obter(id) {
        const ficha = await MaterialBiologico_js_1.default.findById(id).populate({
            path: 'acidenteId',
            populate: { path: 'trabalhadorId', select: 'nome cpf' }
        }).lean();
        if (!ficha) {
            throw new errorHandler_js_1.AppError('Ficha de material biológico não encontrada', 404);
        }
        // Corrigir população falha de trabalhadorId dentro de acidenteId
        if (ficha.acidenteId && !ficha.acidenteId.trabalhadorId?.nome) {
            const acidenteIdObj = ficha.acidenteId;
            let trabalhadorIdValue = acidenteIdObj.trabalhadorId;
            if (!trabalhadorIdValue) {
                const acidenteDoc = await Acidente_js_1.default.findById(acidenteIdObj._id).select('trabalhadorId').lean();
                if (acidenteDoc)
                    trabalhadorIdValue = acidenteDoc.trabalhadorId;
            }
            if (trabalhadorIdValue) {
                const identifier = trabalhadorIdValue.toString();
                let t = null;
                if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                    t = await Trabalhador_js_1.default.findById(identifier).select('nome cpf').lean();
                    if (!t)
                        t = await User_js_1.default.findById(identifier).select('nome cpf').lean();
                }
                else {
                    t = await Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean();
                    if (!t)
                        t = await User_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean();
                }
                if (t) {
                    acidenteIdObj.trabalhadorId = t;
                }
            }
        }
        return ficha;
    }
    async obterPorAcidente(acidenteId) {
        const ficha = await MaterialBiologico_js_1.default.findOne({ acidenteId }).lean();
        return ficha;
    }
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.tipoExposicao) {
            query.tipoExposicao = filtros.tipoExposicao;
        }
        if (filtros?.agente) {
            query.agente = filtros.agente;
        }
        const total = await MaterialBiologico_js_1.default.countDocuments(query);
        const fichasBrutas = await MaterialBiologico_js_1.default.find(query)
            .populate({
            path: 'acidenteId',
            populate: { path: 'trabalhadorId', select: 'nome cpf' }
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        // Corrigir população falha
        const fichas = await Promise.all(fichasBrutas.map(async (ficha) => {
            if (ficha.acidenteId && !ficha.acidenteId.trabalhadorId?.nome) {
                let trabalhadorIdValue = ficha.acidenteId.trabalhadorId;
                if (!trabalhadorIdValue) {
                    const acidenteDoc = await Acidente_js_1.default.findById(ficha.acidenteId._id).select('trabalhadorId').lean();
                    if (acidenteDoc)
                        trabalhadorIdValue = acidenteDoc.trabalhadorId;
                }
                if (trabalhadorIdValue) {
                    const identifier = trabalhadorIdValue.toString();
                    let t = null;
                    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                        t = await Trabalhador_js_1.default.findById(identifier).select('nome cpf').lean();
                        if (!t)
                            t = await User_js_1.default.findById(identifier).select('nome cpf').lean();
                    }
                    else {
                        t = await Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean();
                        if (!t)
                            t = await User_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean();
                    }
                    if (t) {
                        ficha.acidenteId.trabalhadorId = t;
                    }
                }
            }
            return ficha;
        }));
        const pages = Math.ceil(total / limit);
        return {
            fichas: fichas,
            total,
            pages,
        };
    }
    async atualizar(id, data) {
        const ficha = await MaterialBiologico_js_1.default.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
        if (!ficha) {
            throw new errorHandler_js_1.AppError('Ficha de material biológico não encontrada', 404);
        }
        return ficha;
    }
    async deletar(id) {
        const result = await MaterialBiologico_js_1.default.findByIdAndDelete(id);
        if (!result) {
            throw new errorHandler_js_1.AppError('Ficha de material biológico não encontrada', 404);
        }
    }
}
exports.MaterialBiologicoService = MaterialBiologicoService;
exports.default = new MaterialBiologicoService();
