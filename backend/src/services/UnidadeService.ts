import Unidade, { IUnidadeDocument } from '../models/Unidade.js';
import { AppError } from '../middleware/errorHandler.js';
import { IUnidade } from '../types/index.js';

export class UnidadeService {
  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      nome?: string;
      empresaId?: string;
    }
  ): Promise<{ unidades: IUnidade[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

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
      unidades: unidades as unknown as IUnidade[],
      total,
      pages,
    };
  }

  async obter(id: string): Promise<IUnidade> {
    const unidade = await Unidade.findById(id)
      .populate('empresaId', 'razaoSocial nomeFantasia')
      .lean();

    if (!unidade) {
      throw new AppError('Unidade não encontrada', 404);
    }

    return unidade as unknown as IUnidade;
  }

  async criar(unidadeData: Partial<IUnidade>): Promise<IUnidade> {
    const unidade = new Unidade(unidadeData);
    await unidade.save();
    
    // Popular para retornar completo
    const populada = await Unidade.findById(unidade._id)
      .populate('empresaId', 'razaoSocial nomeFantasia')
      .lean();
      
    return populada as unknown as IUnidade;
  }

  async atualizar(id: string, unidadeData: Partial<IUnidade>): Promise<IUnidade> {
    const unidade = await Unidade.findByIdAndUpdate(
      id,
      { $set: unidadeData },
      { new: true, runValidators: true }
    ).populate('empresaId', 'razaoSocial nomeFantasia').lean();

    if (!unidade) {
      throw new AppError('Unidade não encontrada', 404);
    }

    return unidade as unknown as IUnidade;
  }

  async deletar(id: string): Promise<void> {
    const result = await Unidade.findByIdAndDelete(id);

    if (!result) {
      throw new AppError('Unidade não encontrada', 404);
    }
  }

  async listarPorEmpresa(empresaId: string): Promise<IUnidade[]> {
    const unidades = await Unidade.find({ empresaId, ativa: true })
      .sort({ nome: 1 })
      .lean();
    return unidades as unknown as IUnidade[];
  }
}

export default new UnidadeService();
