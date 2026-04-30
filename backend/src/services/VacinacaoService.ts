import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';
import { IVacinacao } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { Types } from 'mongoose';

export class VacinacaoService {
  async criar(data: Partial<IVacinacao>): Promise<IVacinacao> {
    // Resolver CPF para ObjectId se necessário
    const trabalhadorId = await this.resolverTrabalhadorId(data.trabalhadorId);

    const vacinacao = new Vacinacao({
      ...data,
      trabalhadorId,
    });

    await vacinacao.save();
    return vacinacao.toObject() as IVacinacao;
  }

  async obter(id: string): Promise<IVacinacao> {
    // Validar se é ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de vacinação inválido', 400);
    }

    const vacinacao = await Vacinacao.findById(id).populate('trabalhadorId', 'cpf nome email').lean();

    if (!vacinacao) {
      throw new AppError('Vacinação não encontrada', 404);
    }

    return vacinacao as unknown as IVacinacao;
  }

  async listar(filtros: {
    page?: number;
    limit?: number;
    vacina?: string;
    trabalhadorId?: string;
  }): Promise<{ vacinacoes: IVacinacao[]; total: number; pages: number }> {
    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (filtros.vacina) {
      query.vacina = { $regex: filtros.vacina, $options: 'i' };
    }

    if (filtros.trabalhadorId) {
      const trabalhadorId = await this.resolverTrabalhadorId(filtros.trabalhadorId);
      query.trabalhadorId = trabalhadorId;
    }

    const [vacinacoes, total] = await Promise.all([
      Vacinacao.find(query)
        .populate('trabalhadorId', 'cpf nome email')
        .sort({ dataVacinacao: -1 })
        .skip(skip)
        .limit(limit),
      Vacinacao.countDocuments(query),
    ]);

    return {
      vacinacoes: vacinacoes.map((v) => v.toObject() as IVacinacao),
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async atualizar(id: string, data: Partial<IVacinacao>): Promise<IVacinacao> {
    // Validar se é ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de vacinação inválido', 400);
    }

    // Se houver trabalhadorId, resolver CPF para ObjectId
    if (data.trabalhadorId) {
      data.trabalhadorId = await this.resolverTrabalhadorId(data.trabalhadorId);
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

    return vacinacao as unknown as IVacinacao;
  }

  async deletar(id: string): Promise<void> {
    // Validar se é ObjectId válido
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('ID de vacinação inválido', 400);
    }

    const vacinacao = await Vacinacao.findByIdAndDelete(id);

    if (!vacinacao) {
      throw new AppError('Vacinação não encontrada', 404);
    }
  }

  async obterPorTrabalhador(trabalhadorId: string): Promise<IVacinacao[]> {
    const resolvedId = await this.resolverTrabalhadorId(trabalhadorId);

    const vacinacoes = await Vacinacao.find({ trabalhadorId: resolvedId })
      .populate('trabalhadorId', 'cpf nome email')
      .sort({ dataVacinacao: -1 });

    return vacinacoes.map((v) => v.toObject() as IVacinacao);
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

  private async resolverTrabalhadorId(trabalhadorId: string | undefined): Promise<string> {
    if (!trabalhadorId) {
      throw new AppError('Trabalhador é obrigatório', 400);
    }

    // Se já é ObjectId válido, usar direto
    if (Types.ObjectId.isValid(trabalhadorId)) {
      return trabalhadorId;
    }

    // Tentar buscar por CPF em User e Trabalhador em paralelo
    const [usuario, trabalhador] = await Promise.all([
      User.findOne({ cpf: trabalhadorId }).select('_id').lean(),
      Trabalhador.findOne({ cpf: trabalhadorId }).select('_id').lean()
    ]);

    if (usuario) return usuario._id.toString();
    if (trabalhador) return trabalhador._id.toString();

    throw new AppError('Trabalhador não encontrado', 404);
  }
}

export default new VacinacaoService();
