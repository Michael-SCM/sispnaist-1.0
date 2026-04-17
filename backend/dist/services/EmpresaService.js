import Empresa from '../models/Empresa.js';
import { AppError } from '../middleware/errorHandler.js';
export class EmpresaService {
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        if (filtros?.razaoSocial) {
            query.razaoSocial = { $regex: filtros.razaoSocial, $options: 'i' };
        }
        if (filtros?.cnpj) {
            query.cnpj = filtros.cnpj;
        }
        const total = await Empresa.countDocuments(query);
        const empresas = await Empresa.find(query)
            .sort({ razaoSocial: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            empresas: empresas,
            total,
            pages,
        };
    }
    async obter(id) {
        const empresa = await Empresa.findById(id).lean();
        if (!empresa) {
            throw new AppError('Empresa não encontrada', 404);
        }
        return empresa;
    }
    async criar(empresaData) {
        const existeCnpj = await Empresa.findOne({ cnpj: empresaData.cnpj });
        if (existeCnpj) {
            throw new AppError('Já existe uma empresa cadastrada com este CNPJ', 400);
        }
        const empresa = new Empresa(empresaData);
        await empresa.save();
        return empresa.toObject();
    }
    async atualizar(id, empresaData) {
        if (empresaData.cnpj) {
            const existeCnpj = await Empresa.findOne({
                cnpj: empresaData.cnpj,
                _id: { $ne: id }
            });
            if (existeCnpj) {
                throw new AppError('CNPJ já está em uso por outra empresa', 400);
            }
        }
        const empresa = await Empresa.findByIdAndUpdate(id, { $set: empresaData }, { new: true, runValidators: true }).lean();
        if (!empresa) {
            throw new AppError('Empresa não encontrada', 404);
        }
        return empresa;
    }
    async deletar(id) {
        const result = await Empresa.findByIdAndDelete(id);
        if (!result) {
            throw new AppError('Empresa não encontrada', 404);
        }
    }
}
export default new EmpresaService();
//# sourceMappingURL=EmpresaService.js.map