"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const TrabalhadorInformacao_1 = __importDefault(require("../models/TrabalhadorInformacao"));
class TrabalhadorInformacaoService {
    // Listar informações de um trabalhador
    async listarPorTrabalhador(trabalhadorId) {
        const resultados = await TrabalhadorInformacao_1.default.find({
            trabalhadorId,
            ativo: true,
        }).sort({ createdAt: -1 }).lean();
        return resultados;
    }
    async obterPorId(id) {
        const item = await TrabalhadorInformacao_1.default.findById(id).lean();
        return item;
    }
    // Criar nova informação
    async criar(dados) {
        const informacao = await TrabalhadorInformacao_1.default.create(dados);
        return informacao;
    }
    // Atualizar informação
    async atualizar(id, dados) {
        const resultado = await TrabalhadorInformacao_1.default.findByIdAndUpdate(id, dados, { new: true, runValidators: true }).lean();
        return resultado;
    }
    // Deletar informação (hard delete)
    async deletar(id) {
        const resultado = await TrabalhadorInformacao_1.default.deleteOne({ _id: id });
        return resultado.deletedCount > 0;
    }
}
exports.default = new TrabalhadorInformacaoService();
