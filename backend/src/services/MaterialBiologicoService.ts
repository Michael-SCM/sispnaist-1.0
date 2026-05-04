import MaterialBiologico, { IMaterialBiologicoDocument } from '../models/MaterialBiologico.js';
import Acidente from '../models/Acidente.js';
import { AppError } from '../middleware/errorHandler.js';
import { IMaterialBiologico } from '../models/MaterialBiologico.js';

export class MaterialBiologicoService {
  async criar(data: Partial<IMaterialBiologico>): Promise<IMaterialBiologico> {
    // Verificar se o acidente existe
    const acidente = await Acidente.findById(data.acidenteId);
    if (!acidente) {
      throw new AppError('Acidente base não encontrado', 404);
    }

    // Verificar se já existe uma ficha para este acidente
    const existeFicha = await MaterialBiologico.findOne({ acidenteId: data.acidenteId });
    if (existeFicha) {
      throw new AppError('Já existe uma ficha de material biológico para este acidente', 400);
    }

    const ficha = new MaterialBiologico(data);
    await ficha.save();
    return ficha.toObject() as IMaterialBiologico;
  }

  async obter(id: string): Promise<IMaterialBiologico> {
    const ficha = await MaterialBiologico.findById(id).populate({
      path: 'acidenteId',
      populate: { path: 'trabalhadorId', select: 'nome cpf' }
    }).lean();

    if (!ficha) {
      throw new AppError('Ficha de material biológico não encontrada', 404);
    }

    return ficha as unknown as IMaterialBiologico;
  }

  async obterPorAcidente(acidenteId: string): Promise<IMaterialBiologico | null> {
    const ficha = await MaterialBiologico.findOne({ acidenteId }).lean();
    return ficha as unknown as IMaterialBiologico;
  }

  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      tipoExposicao?: string;
      agente?: string;
    }
  ): Promise<{ fichas: IMaterialBiologico[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filtros?.tipoExposicao) {
      query.tipoExposicao = filtros.tipoExposicao;
    }

    if (filtros?.agente) {
      query.agente = filtros.agente;
    }

    const total = await MaterialBiologico.countDocuments(query);
    const fichas = await MaterialBiologico.find(query)
      .populate({
        path: 'acidenteId',
        populate: { path: 'trabalhadorId', select: 'nome cpf' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return {
      fichas: fichas as unknown as IMaterialBiologico[],
      total,
      pages,
    };
  }

  async atualizar(id: string, data: Partial<IMaterialBiologico>): Promise<IMaterialBiologico> {
    const ficha = await MaterialBiologico.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    if (!ficha) {
      throw new AppError('Ficha de material biológico não encontrada', 404);
    }

    return ficha as unknown as IMaterialBiologico;
  }

  async deletar(id: string): Promise<void> {
    const result = await MaterialBiologico.findByIdAndDelete(id);

    if (!result) {
      throw new AppError('Ficha de material biológico não encontrada', 404);
    }
  }
}

export default new MaterialBiologicoService();
