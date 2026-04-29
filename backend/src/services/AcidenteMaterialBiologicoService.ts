import AcidenteMaterialBiologico, { IAcidenteMaterialBiologicoDocument } from '../models/AcidenteMaterialBiologico.js';
import { AppError } from '../middleware/errorHandler.js';
import { IAcidenteMaterialBiologico } from '../types/index.js';

export class AcidenteMaterialBiologicoService {
  /**
   * Cria um novo registro de acidente com material biológico
   */
  async criar(data: Partial<IAcidenteMaterialBiologico>): Promise<IAcidenteMaterialBiologico> {
    const registro = new AcidenteMaterialBiologico(data);
    await registro.save();
    return registro.toObject() as IAcidenteMaterialBiologico;
  }

  /**
   * Obtém um registro pelo ID
   */
  async obter(id: string): Promise<IAcidenteMaterialBiologico> {
    const registro = await AcidenteMaterialBiologico.findById(id)
      .populate('acidenteId', 'dataAcidente tipoAcidente descricao status')
      .populate('sorologiaPaciente')
      .populate('sorologiaAcidentado');

    if (!registro) {
      throw new AppError('Registro de material biológico não encontrado', 404);
    }

    return registro.toObject() as IAcidenteMaterialBiologico;
  }

  /**
   * Obtém registro por ID do acidente
   */
  async obterPorAcidente(acidenteId: string): Promise<IAcidenteMaterialBiologico | null> {
    const registro = await AcidenteMaterialBiologico.findOne({ acidenteId, ativo: true })
      .populate('acidenteId', 'dataAcidente tipoAcidente descricao status')
      .populate('sorologiaPaciente')
      .populate('sorologiaAcidentado');

    return registro ? (registro.toObject() as IAcidenteMaterialBiologico) : null;
  }

  /**
   * Lista registros com paginação e filtros
   */
  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      acidenteId?: string;
      tipoExposicao?: string;
      agente?: string;
    }
  ): Promise<{ registros: IAcidenteMaterialBiologico[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;

    // Construir query
    const query: any = { ativo: true };

    if (filtros?.acidenteId) {
      query.acidenteId = filtros.acidenteId;
    }
    if (filtros?.tipoExposicao) {
      query.tipoExposicao = filtros.tipoExposicao;
    }
    if (filtros?.agente) {
      query.agente = filtros.agente;
    }

    const [registros, total] = await Promise.all([
      AcidenteMaterialBiologico.find(query)
        .populate('acidenteId', 'dataAcidente tipoAcidente descricao status trabalhadorId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AcidenteMaterialBiologico.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      registros: registros as IAcidenteMaterialBiologico[],
      total,
      pages,
    };
  }

  /**
   * Atualiza um registro
   */
  async atualizar(
    id: string,
    data: Partial<IAcidenteMaterialBiologico>
  ): Promise<IAcidenteMaterialBiologico> {
    const registro = await AcidenteMaterialBiologico.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .populate('acidenteId', 'dataAcidente tipoAcidente descricao status')
      .populate('sorologiaPaciente')
      .populate('sorologiaAcidentado');

    if (!registro) {
      throw new AppError('Registro de material biológico não encontrado', 404);
    }

    return registro.toObject() as IAcidenteMaterialBiologico;
  }

  /**
   * Remove um registro (soft delete)
   */
  async deletar(id: string): Promise<void> {
    const registro = await AcidenteMaterialBiologico.findByIdAndUpdate(
      id,
      { $set: { ativo: false } },
      { new: true }
    );

    if (!registro) {
      throw new AppError('Registro de material biológico não encontrado', 404);
    }
  }
}

export default new AcidenteMaterialBiologicoService();
