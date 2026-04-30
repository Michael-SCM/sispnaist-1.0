import Doenca, { IDoencaDocument } from '../models/Doenca.js';
import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { IDoenca } from '../types/index.js';
import mongoose from 'mongoose';

export class DoencaService {
  /**
   * Resolve trabalhadorId de CPF para ObjectId
   */
  private async resolverTrabalhadorId(identifier: string): Promise<string> {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      return identifier;
    }

    const [usuario, trabalhador] = await Promise.all([
      User.findOne({ cpf: identifier }).select('_id').lean(),
      Trabalhador.findOne({ cpf: identifier }).select('_id').lean()
    ]);

    if (usuario) return usuario._id.toString();
    if (trabalhador) return trabalhador._id.toString();

    throw new AppError(`Trabalhador com CPF ${identifier} não encontrado`, 404);
  }

  async criar(doencaData: Partial<IDoenca>): Promise<IDoenca> {
    // Resolver trabalhadorId se for CPF
    if (doencaData.trabalhadorId && !mongoose.Types.ObjectId.isValid(doencaData.trabalhadorId as string)) {
      doencaData.trabalhadorId = await this.resolverTrabalhadorId(doencaData.trabalhadorId as string);
    }

    const doenca = new Doenca(doencaData);
    await doenca.save();
    return doenca.toObject() as IDoenca;
  }

  async obter(id: string): Promise<IDoenca> {
    const doenca = await Doenca.findById(id)
      .populate('trabalhadorId', 'nome cpf email empresa unidade')
      .lean();

    if (!doenca) {
      throw new AppError('Doença não encontrada', 404);
    }

    return doenca as unknown as IDoenca;
  }

  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      nomeDoenca?: string;
      ativo?: boolean;
      trabalhadorId?: string;
      dataInicio?: string;
      dataFim?: string;
    }
  ): Promise<{ doencas: IDoenca[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filtros?.nomeDoenca) {
      query.nomeDoenca = { $regex: filtros.nomeDoenca, $options: 'i' };
    }

    if (filtros?.ativo !== undefined) {
      query.ativo = filtros.ativo;
    }

    if (filtros?.trabalhadorId) {
      query.trabalhadorId = filtros.trabalhadorId;
    }

    if (filtros?.dataInicio || filtros?.dataFim) {
      query.dataInicio = {};
      if (filtros?.dataInicio) {
        query.dataInicio.$gte = new Date(filtros.dataInicio);
      }
      if (filtros?.dataFim) {
        query.dataInicio.$lte = new Date(filtros.dataFim);
      }
    }

    const total = await Doenca.countDocuments(query);
    const doencas = await Doenca.find(query)
      .populate('trabalhadorId', 'nome cpf email empresa unidade')
      .sort({ dataInicio: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return {
      doencas: doencas as IDoenca[],
      total,
      pages,
    };
  }

  async atualizar(id: string, doencaData: Partial<IDoenca>): Promise<IDoenca> {

    // Não permitir alterar data de criação
    if ('dataCriacao' in doencaData) {
      delete doencaData.dataCriacao;
    }

    // Resolver trabalhadorId se for CPF
    if (doencaData.trabalhadorId && !mongoose.Types.ObjectId.isValid(doencaData.trabalhadorId as string)) {
      doencaData.trabalhadorId = await this.resolverTrabalhadorId(doencaData.trabalhadorId as string);
    }

    const doenca = await Doenca.findByIdAndUpdate(
      id,
      { $set: doencaData },
      {
        new: true,
        runValidators: true,
      }
    ).populate('trabalhadorId', 'nome cpf email empresa unidade').lean();

    if (!doenca) {
      throw new AppError('Doença não encontrada', 404);
    }

    return doenca as unknown as IDoenca;
  }

  async deletar(id: string): Promise<void> {
    const result = await Doenca.findByIdAndDelete(id);

    if (!result) {
      throw new AppError('Doença não encontrada', 404);
    }
  }

  async obterPorTrabalhador(
    trabalhadorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ doencas: IDoenca[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query = { trabalhadorId };

    const total = await Doenca.countDocuments(query);
    const doencas = await Doenca.find(query)
      .sort({ dataInicio: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return {
      doencas: doencas as IDoenca[],
      total,
      pages,
    };
  }

  async obterEstatisticas(): Promise<{
    total: number;
    porNome: { [key: string]: number };
    ativas: number;
    encerradas: number;
    ultimosMeses: { mes: string; quantidade: number }[];
  }> {
    const total = await Doenca.countDocuments();
    const ativas = await Doenca.countDocuments({ ativo: true });
    const encerradas = await Doenca.countDocuments({ ativo: false });

    const porNome = await Doenca.aggregate([
      {
        $group: {
          _id: '$nomeDoenca',
          quantidade: { $sum: 1 },
        },
      },
      {
        $sort: { quantidade: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Últimos 6 meses
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const ultimosMeses = await Doenca.aggregate([
      {
        $match: {
          dataInicio: { $gte: seisMesesAtras },
        },
      },
      {
        $group: {
          _id: {
            ano: { $year: '$dataInicio' },
            mes: { $month: '$dataInicio' },
          },
          quantidade: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.ano': 1, '_id.mes': 1 },
      },
    ]);

    return {
      total,
      ativas,
      encerradas,
      porNome: porNome.reduce(
        (acc: any, item: any) => {
          acc[item._id || 'Não informada'] = item.quantidade;
          return acc;
        },
        {}
      ),
      ultimosMeses: ultimosMeses.map((item: any) => ({
        mes: `${item._id.mes}/${item._id.ano}`,
        quantidade: item.quantidade,
      })),
    };
  }
}

export default new DoencaService();
