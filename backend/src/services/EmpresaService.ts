import Empresa, { IEmpresaDocument } from '../models/Empresa.js';
import { AppError } from '../middleware/errorHandler.js';
import { IEmpresa } from '../types/index.js';
import Unidade from '../models/Unidade.js';

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class EmpresaService {
  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      razaoSocial?: string;
      cnpj?: string;
    }
  ): Promise<{ empresas: IEmpresa[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filtros?.razaoSocial) {
      query.razaoSocial = { $regex: escapeRegex(filtros.razaoSocial), $options: 'i' };
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
      empresas: empresas as unknown as IEmpresa[],
      total,
      pages,
    };
  }

  async obter(id: string): Promise<IEmpresa> {
    const empresa = await Empresa.findById(id).lean();

    if (!empresa) {
      throw new AppError('Empresa não encontrada', 404);
    }

    return empresa as unknown as IEmpresa;
  }

  async criar(empresaData: Partial<IEmpresa>): Promise<IEmpresa> {
    const existeCnpj = await Empresa.findOne({ cnpj: empresaData.cnpj });
    if (existeCnpj) {
      throw new AppError('Já existe uma empresa cadastrada com este CNPJ', 400);
    }

    const empresa = new Empresa(empresaData);
    await empresa.save();
    return { ...empresa.toObject(), _id: empresa._id?.toString() } as IEmpresa;
  }

  async atualizar(id: string, empresaData: Partial<IEmpresa>): Promise<IEmpresa> {
    if (empresaData.cnpj) {
      const existeCnpj = await Empresa.findOne({ 
        cnpj: empresaData.cnpj, 
        _id: { $ne: id } 
      });
      if (existeCnpj) {
        throw new AppError('CNPJ já está em uso por outra empresa', 400);
      }
    }

    const empresa = await Empresa.findByIdAndUpdate(
      id,
      { $set: empresaData },
      { new: true, runValidators: true }
    ).lean();

    if (!empresa) {
      throw new AppError('Empresa não encontrada', 404);
    }

    return empresa as unknown as IEmpresa;
  }

  async deletar(id: string): Promise<void> {
    const result = await Empresa.findByIdAndDelete(id);

    if (!result) {
      throw new AppError('Empresa não encontrada', 404);
    }

    // Remover em cascata todas as unidades vinculadas a esta empresa
    await Unidade.deleteMany({ empresaId: id });
  }

  async listarPorUnidade(unidadeId: string): Promise<IEmpresa> {
    // Busca a unidade para encontrar qual empresa ela pertence
    const unidade = await Unidade.findById(unidadeId).lean();
    
    if (!unidade) {
      throw new AppError('Unidade não encontrada', 404);
    }

    // Busca a empresa vinculada à unidade
    const empresa = await Empresa.findById(unidade.empresaId).lean();
    
    if (!empresa) {
      throw new AppError('Empresa não encontrada', 404);
    }

    return empresa as unknown as IEmpresa;
  }
}

export default new EmpresaService();
