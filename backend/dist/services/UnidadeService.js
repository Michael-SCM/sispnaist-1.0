import Unidade from '../models/Unidade.js';
import { AppError } from '../middleware/errorHandler.js';
export class UnidadeService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.nome) {
            query.nome = { $regex: filtros.nome, $options: 'i' };
        }
        if (filtros?.empresaId) {
            query.empresaId = filtros.empresaId;
        }
        const total = await Unidade.countDocuments(query);
        const unidades = await Unidade.find(query)
            .populate('empresaId', 'razaoSocial nomeFantasia')
            .sort({ nome: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            unidades: unidades,
            total,
            pages,
        };
    }
    async obter(id) {
        const unidade = await Unidade.findById(id)
            .populate('empresaId', 'razaoSocial nomeFantasia')
            .lean();
        if (!unidade) {
            throw new AppError('Unidade não encontrada', 404);
        }
        return unidade;
    }
    async criar(unidadeData) {
        const unidade = new Unidade(unidadeData);
        await unidade.save();
        // Popular para retornar completo
        const populada = await Unidade.findById(unidade._id)
            .populate('empresaId', 'razaoSocial nomeFantasia')
            .lean();
        return populada;
    }
    async atualizar(id, unidadeData) {
        const unidade = await Unidade.findByIdAndUpdate(id, { $set: unidadeData }, { new: true, runValidators: true }).populate('empresaId', 'razaoSocial nomeFantasia').lean();
        if (!unidade) {
            throw new AppError('Unidade não encontrada', 404);
        }
        return unidade;
    }
    async deletar(id) {
        const result = await Unidade.findByIdAndDelete(id);
        if (!result) {
            throw new AppError('Unidade não encontrada', 404);
        }
    }
    async listarPorEmpresa(empresaId) {
        const unidades = await Unidade.find({ empresaId, ativa: true })
            .sort({ nome: 1 })
            .lean();
        return unidades;
    }
}
export default new UnidadeService();
//# sourceMappingURL=UnidadeService.js.map