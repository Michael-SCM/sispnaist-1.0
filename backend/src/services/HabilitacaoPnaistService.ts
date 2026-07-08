import HabilitacaoPnaist, { IHabilitacaoPnaist } from '../models/HabilitacaoPnaist.js';
import { AppError } from '../middleware/errorHandler.js';

class HabilitacaoPnaistService {
  async listar(page = 1, limit = 50, filtros?: { uf?: string; ativo?: boolean }) {
    const query: any = {};
    if (filtros?.uf) query.uf = filtros.uf;
    if (filtros?.ativo !== undefined) query.ativo = filtros.ativo;

    const total = await HabilitacaoPnaist.countDocuments(query);
    const items = await HabilitacaoPnaist.find(query)
      .sort({ uf: 1, municipio: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      items: items as unknown as IHabilitacaoPnaist[],
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async obter(municipio: string, uf: string) {
    const item = await HabilitacaoPnaist.findOne({ municipio, uf }).lean();
    return item as unknown as IHabilitacaoPnaist | null;
  }

  async upsert(municipio: string, uf: string, data: Record<string, any>) {
    const item = await HabilitacaoPnaist.findOneAndUpdate(
      { municipio, uf },
      { $set: { municipio, uf, ...data } },
      { upsert: true, new: true, runValidators: true }
    ).lean();
    return item as unknown as IHabilitacaoPnaist;
  }

  async habilitar(municipio: string, uf: string) {
    return this.upsert(municipio, uf, { ativo: true, dataHabilitacao: new Date() });
  }

  async desabilitar(municipio: string, uf: string) {
    const item = await HabilitacaoPnaist.findOneAndUpdate(
      { municipio, uf },
      { $set: { ativo: false } },
      { new: true }
    ).lean();
    return item as unknown as IHabilitacaoPnaist;
  }

  async listarHabilitados() {
    return HabilitacaoPnaist.find({ ativo: true }).select('municipio uf').lean();
  }
}

export default new HabilitacaoPnaistService();
