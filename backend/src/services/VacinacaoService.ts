import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';
import { IVacinacao } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose, { Types } from 'mongoose';
import { escapeRegex } from '../utils/sanitize.js';
import { resolverTrabalhadorId } from '../utils/resolverTrabalhadorId.js';

export class VacinacaoService {
  async criar(data: Partial<IVacinacao>): Promise<IVacinacao> {
    // Resolver CPF para ObjectId se necessário
    if (!data.trabalhadorId) {
      throw new AppError('Trabalhador é obrigatório', 400);
    }
    const trabalhadorId = await resolverTrabalhadorId(data.trabalhadorId);

    const vacinacao = new Vacinacao({
      ...data,
      trabalhadorId,
    });

    await vacinacao.save();
    return vacinacao.toObject() as unknown as IVacinacao;
  }

  async obter(id: string): Promise<IVacinacao> {
    // Validar se é ObjectId válido
    if (!(Types.ObjectId as any).isValid(id)) {
      throw new AppError('ID de vacinação inválido', 400);
    }

    const vacinacao = await Vacinacao.findById(id).populate('trabalhadorId', 'cpf nome email').lean();

    if (!vacinacao) {
      throw new AppError('Vacinação não encontrada', 404);
    }

    if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !(vacinacao.trabalhadorId as any).nome) {
      const doc = await Vacinacao.findById(id).select('trabalhadorId').lean();
      if (doc && doc.trabalhadorId) {
        const identifier = doc.trabalhadorId.toString();
        let t = null;
        if ((mongoose.Types.ObjectId as any).isValid(identifier)) {
          t = await Trabalhador.findById(identifier).select('nome cpf email').lean();
          if (!t) t = await User.findById(identifier).select('nome cpf email').lean();
        } else {
          t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf email').lean();
          if (!t) t = await User.findOne({ cpf: identifier }).select('nome cpf email').lean();
        }
        if (t) (vacinacao as any).trabalhadorId = t;
      }
    }

    return vacinacao as unknown as unknown as IVacinacao;
  }

  async listar(filtros: {
    page?: number;
    limit?: number;
    vacina?: string;
    trabalhadorId?: string;
    trabalhadorIds?: string[];
    cartaoSus?: string;
  }): Promise<{ vacinacoes: IVacinacao[]; total: number; pages: number }> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};


    if (filtros.vacina) {
      const vacina = escapeRegex(String(filtros.vacina).trim());
      const pattern = new RegExp('^' + vacina, 'i');
      query.vacina = { $regex: pattern };
    }

    // Suporte a ambos os IDs (Trabalhador._id e User._id) para compatibilidade com registros antigos
    if (filtros.trabalhadorIds && filtros.trabalhadorIds.length > 1) {
      query.$or = filtros.trabalhadorIds.map(id => ({ trabalhadorId: id }));
    } else if (filtros.trabalhadorId) {
      // Normaliza CPF de filtro (mascarado ou dígitos) antes de resolver
      const { toCPFMaskedOrDigits } = await import('../utils/cpf.js');
      const cpfNorm = toCPFMaskedOrDigits(filtros.trabalhadorId);
      const trabalhadorId = await resolverTrabalhadorId(cpfNorm);
      query.trabalhadorId = trabalhadorId;
    }

    // Filtro por Cartão SUS
    if (filtros.cartaoSus) {
      const trabalhador = await Trabalhador.findOne({ cartaoSus: filtros.cartaoSus }).select('_id').lean();
      if (trabalhador) {
        query.trabalhadorId = trabalhador._id.toString();
      } else {
        query.trabalhadorId = '000000000000000000000000';
      }
    }

    const [vacinacoesBrutas, total] = await Promise.all([
      Vacinacao.find(query)
        .populate('trabalhadorId', 'cpf nome email')
        .sort({ dataVacinacao: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vacinacao.countDocuments(query),
    ]);

    const vacinacoes = await Promise.all(vacinacoesBrutas.map(async (vacinacao: any) => {
      if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !vacinacao.trabalhadorId.nome) {
        const doc = await Vacinacao.findById(vacinacao._id).select('trabalhadorId').lean();
        if (doc && doc.trabalhadorId) {
          const identifier = doc.trabalhadorId.toString();
          let t = null;
          if ((mongoose.Types.ObjectId as any).isValid(identifier)) {
            t = await Trabalhador.findById(identifier).select('nome cpf email').lean();
            if (!t) t = await User.findById(identifier).select('nome cpf email').lean();
          } else {
            t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf email').lean();
            if (!t) t = await User.findOne({ cpf: identifier }).select('nome cpf email').lean();
          }
          if (t) vacinacao.trabalhadorId = t;
        }
      }
      return vacinacao;
    }));

    return {
      vacinacoes: vacinacoes as unknown as IVacinacao[],
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async atualizar(id: string, data: Partial<IVacinacao>): Promise<IVacinacao> {
    // Validar se é ObjectId válido
    if (!(Types.ObjectId as any).isValid(id)) {
      throw new AppError('ID de vacinação inválido', 400);
    }

    // Se houver trabalhadorId, resolver CPF para ObjectId
    if (data.trabalhadorId) {
      data.trabalhadorId = await resolverTrabalhadorId(data.trabalhadorId);
    }

    const vacinacao = await Vacinacao.findByIdAndUpdate(
      id,
      { $set: data },
      {
        new: true,
        runValidators: true,
      }
    ).populate('trabalhadorId', 'cpf nome email').lean();

    if (!vacinacao) {
      throw new AppError('Vacinação não encontrada', 404);
    }

    return vacinacao as unknown as unknown as IVacinacao;
  }

  async deletar(id: string): Promise<void> {
    // Validar se é ObjectId válido
    if (!(Types.ObjectId as any).isValid(id)) {
      throw new AppError('ID de vacinação inválido', 400);
    }

    const vacinacao = await Vacinacao.findByIdAndDelete(id);

    if (!vacinacao) {
      throw new AppError('Vacinação não encontrada', 404);
    }
  }

  async obterPorTrabalhador(trabalhadorId: string, page = 1, limit = 10): Promise<{ vacinacoes: IVacinacao[]; total: number; pages: number }> {
    const resolvedId = await resolverTrabalhadorId(trabalhadorId);

    const skip = (page - 1) * limit;

    const [vacinacoesBrutas, total] = await Promise.all([
      Vacinacao.find({ trabalhadorId: resolvedId })
        .populate('trabalhadorId', 'cpf nome email')
        .sort({ dataVacinacao: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Vacinacao.countDocuments({ trabalhadorId: resolvedId }),
    ]);

    const vacinacoes = await Promise.all(vacinacoesBrutas.map(async (vacinacao: any) => {
      if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !vacinacao.trabalhadorId.nome) {
        const doc = await Vacinacao.findById(vacinacao._id).select('trabalhadorId').lean();
        if (doc && doc.trabalhadorId) {
          const identifier = doc.trabalhadorId.toString();
          let t = null;
          if ((mongoose.Types.ObjectId as any).isValid(identifier)) {
            t = await Trabalhador.findById(identifier).select('nome cpf email').lean();
            if (!t) t = await User.findById(identifier).select('nome cpf email').lean();
          } else {
            t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf email').lean();
            if (!t) t = await User.findOne({ cpf: identifier }).select('nome cpf email').lean();
          }
          if (t) vacinacao.trabalhadorId = t;
        }
      }
      return vacinacao;
    }));

    const pages = Math.ceil(total / limit);
    return { vacinacoes: vacinacoes as unknown as IVacinacao[], total, pages };
  }

  async obterEstatisticas(): Promise<{
    total: number;
    porVacina: Record<string, number>;
    proximasDoses: number;
  }> {
    const total = await Vacinacao.countDocuments();

    const porVacina = await Vacinacao.aggregate([
      {
        $group: {
          _id: '$vacina',
          count: { $sum: 1 },
        },
      },
    ]);

    const hoje = new Date();
    const proximasDoses = await Vacinacao.countDocuments({
      proximoDose: {
        $gte: hoje,
        $lte: new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      total,
      porVacina: Object.fromEntries(porVacina.map((p) => [p._id, p.count])),
      proximasDoses,
    };
  }
}

export default new VacinacaoService();

