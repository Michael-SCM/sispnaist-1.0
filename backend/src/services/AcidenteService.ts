import Acidente, { IAcidenteDocument } from '../models/Acidente.js';
import User from '../models/User.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import { IAcidente } from '../types/index.js';
import mongoose from 'mongoose';
import MaterialBiologico from '../models/MaterialBiologico.js';

export class AcidenteService {
  /**
   * Resolve trabalhadorId de CPF para ObjectId
   * Se o valor já for um ObjectId válido, retorna como está
   * Se for um CPF, busca o usuário ou trabalhador e retorna seu ObjectId
   */
  private async resolverTrabalhadorId(identifier: string): Promise<string> {
    // Se já for um ObjectId válido, retorna como está
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      return identifier;
    }

    // Tentar buscar na coleção de usuários e trabalhadores em paralelo
    const [usuario, trabalhador] = await Promise.all([
      User.findOne({ cpf: identifier }).select('_id').lean(),
      Trabalhador.findOne({ cpf: identifier }).select('_id').lean()
    ]);

    if (usuario) return usuario._id.toString();
    if (trabalhador) return trabalhador._id.toString();

    throw new AppError(`Trabalhador com CPF ${identifier} não encontrado`, 404);
  }

  async criar(acidenteData: Partial<IAcidente>): Promise<IAcidente> {
    console.log('[AcidenteService.criar] === START ===');
    console.log('[AcidenteService.criar] Received keys:', Object.keys(acidenteData));
    console.log('[AcidenteService.criar] tipoTrauma:', acidenteData.tipoTrauma);
    console.log('[AcidenteService.criar] horarioAposInicioJornada:', acidenteData.horarioAposInicioJornada);

    // Resolver trabalhadorId se for CPF
    if (acidenteData.trabalhadorId && !mongoose.Types.ObjectId.isValid(acidenteData.trabalhadorId as string)) {
      acidenteData.trabalhadorId = await this.resolverTrabalhadorId(acidenteData.trabalhadorId as string);
    }

    // Criar objeto com todos os campos explicitamente
    const dataToSave: any = {
      dataAcidente: acidenteData.dataAcidente,
      horario: acidenteData.horario || '',
      horarioAposInicioJornada: acidenteData.horarioAposInicioJornada || '',
      trabalhadorId: acidenteData.trabalhadorId,
      tipoAcidente: acidenteData.tipoAcidente,
      tipoTrauma: acidenteData.tipoTrauma || '',
      agenteCausador: acidenteData.agenteCausador || '',
      parteCorpo: acidenteData.parteCorpo || '',
      descricao: acidenteData.descricao,
      descricaoTrauma: acidenteData.descricaoTrauma || '',
      local: acidenteData.local || '',
      lesoes: acidenteData.lesoes || [],
      feriado: acidenteData.feriado || false,
      comunicado: acidenteData.comunicado || false,
      dataComunicacao: acidenteData.dataComunicacao,
      dataNotificacao: acidenteData.dataNotificacao,
      estado: acidenteData.estado || '',
      atendimentoMedico: acidenteData.atendimentoMedico || false,
      dataAtendimento: acidenteData.dataAtendimento,
      horaAtendimento: acidenteData.horaAtendimento || '',
      unidadeAtendimento: acidenteData.unidadeAtendimento || '',
      internamento: acidenteData.internamento || false,
      duracaoInternamento: acidenteData.duracaoInternamento || 0,
      catNas: acidenteData.catNas || false,
      registroPolicial: acidenteData.registroPolicial || false,
      encaminhamentoJuntaMedica: acidenteData.encaminhamentoJuntaMedica || false,
      afastamento: acidenteData.afastamento || false,
      outrosTrabalhadoresAtingidos: acidenteData.outrosTrabalhadoresAtingidos || false,
      quantidadeTrabalhadoresAtingidos: acidenteData.quantidadeTrabalhadoresAtingidos || 0,
      status: acidenteData.status || 'Aberto',
    };

    console.log('[AcidenteService.criar] Data to save - tipoTrauma:', dataToSave.tipoTrauma);
    console.log('[AcidenteService.criar] Data to save - all keys:', Object.keys(dataToSave));

    const acidente = new Acidente(dataToSave);
    await acidente.save();

    const result = accidente.toObject();
    console.log('[AcidenteService.criar] Saved result - tipoTrauma:', result.tipoTrauma);
    console.log('[AcidenteService.criar] === END ===');

    return result as IAcidente;
  }

  async obter(id: string): Promise<IAcidente> {
    let acidente = await Acidente.findById(id)
      .populate('trabalhadorId', 'nome cpf email empresa unidade')
      .lean();

    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }

    // Se a população falhou (trabalhadorId é nulo ou string de ID não encontrada)
    // Mas o documento original tinha um valor, tentamos buscar manualmente
    if (!acidente.trabalhadorId) {
      // Buscar o documento bruto para ver o que tem no campo trabalhadorId
      const bruto = await Acidente.findById(id).select('trabalhadorId').lean();
      if (bruto && bruto.trabalhadorId) {
        const identifier = bruto.trabalhadorId.toString();
        
        // Tentar buscar por ID ou CPF
        let t = null;
        if (mongoose.Types.ObjectId.isValid(identifier)) {
          t = await Trabalhador.findById(identifier).select('nome cpf').lean();
          if (!t) {
            t = await User.findById(identifier).select('nome cpf').lean();
          }
        } else {
          // É um CPF
          t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf').lean();
          if (!t) {
            t = await User.findOne({ cpf: identifier }).select('nome cpf').lean();
          }
        }

        if (t) {
          (acidente as any).trabalhadorId = t;
        }
      }
    }

    return acidente as unknown as IAcidente;
  }

  async listar(
    page: number = 1,
    limit: number = 10,
    filtros?: {
      tipoAcidente?: string;
      status?: string;
      trabalhadorId?: string;
      dataInicio?: string;
      dataFim?: string;
    }
  ): Promise<{ acidentes: IAcidente[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Aplicar filtros se fornecidos
    if (filtros?.tipoAcidente) {
      query.tipoAcidente = filtros.tipoAcidente;
    }

    if (filtros?.status) {
      query.status = filtros.status;
    }

    if (filtros?.trabalhadorId) {
      query.trabalhadorId = filtros.trabalhadorId;
    }

    if (filtros?.dataInicio || filtros?.dataFim) {
      query.dataAcidente = {};
      if (filtros?.dataInicio) {
        query.dataAcidente.$gte = new Date(filtros.dataInicio);
      }
      if (filtros?.dataFim) {
        query.dataAcidente.$lte = new Date(filtros.dataFim);
      }
    }

    const total = await Acidente.countDocuments(query);
    const acidentesBrutos = await Acidente.find(query)
      .populate('trabalhadorId', 'nome cpf email empresa unidade')
      .sort({ dataAcidente: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Corrigir população falha para cada acidente
    const acidentes = await Promise.all(acidentesBrutos.map(async (acidente: any) => {
      if (!acidente.trabalhadorId) {
        // Buscar o documento bruto original
        const doc = await Acidente.findById(acidente._id).select('trabalhadorId').lean();
        if (doc && doc.trabalhadorId) {
          const identifier = doc.trabalhadorId.toString();
          let t = null;
          if (mongoose.Types.ObjectId.isValid(identifier)) {
            t = await Trabalhador.findById(identifier).select('nome cpf').lean();
            if (!t) t = await User.findById(identifier).select('nome cpf').lean();
          } else {
            t = await Trabalhador.findOne({ cpf: identifier }).select('nome cpf').lean();
            if (!t) t = await User.findOne({ cpf: identifier }).select('nome cpf').lean();
          }
          if (t) acidente.trabalhadorId = t;
        }
      }
      return acidente;
    }));

    const pages = Math.ceil(total / limit);

    return {
      acidentes: acidentes as IAcidente[],
      total,
      pages,
    };
  }

  async atualizar(id: string, acidenteData: Partial<IAcidente>): Promise<IAcidente> {
    console.log('[AcidenteService.atualizar] === START ===');
    console.log('[AcidenteService.atualizar] Received keys:', Object.keys(acidenteData));
    console.log('[AcidenteService.atualizar] tipoTrauma:', acidenteData.tipoTrauma);
    console.log('[AcidenteService.atualizar] horarioAposInicioJornada:', acidenteData.horarioAposInicioJornada);

    // NÃO usar runValidators para evitar problemas com validação mongoose
    // Construir objeto com campos explicitamente definidos
    const dataToUpdate: any = {};

    // Sempre enviar todos os campos para garantir que valores vazios sejam salvos
    if (acidenteData.dataAcidente !== undefined) dataToUpdate.dataAcidente = acidenteData.dataAcidente;
    if (acidenteData.horario !== undefined) dataToUpdate.horario = acidenteData.horario || '';
    if (acidenteData.horarioAposInicioJornada !== undefined) dataToUpdate.horarioAposInicioJornada = acidenteData.horarioAposInicioJornada || '';
    if (acidenteData.trabalhadorId !== undefined) dataToUpdate.trabalhadorId = acidenteData.trabalhadorId;
    if (acidenteData.tipoAcidente !== undefined) dataToUpdate.tipoAcidente = acidenteData.tipoAcidente;
    if (acidenteData.tipoTrauma !== undefined) dataToUpdate.tipoTrauma = acidenteData.tipoTrauma || '';
    if (acidenteData.agenteCausador !== undefined) dataToUpdate.agenteCausador = acidenteData.agenteCausador || '';
    if (acidenteData.parteCorpo !== undefined) dataToUpdate.parteCorpo = acidenteData.parteCorpo || '';
    if (acidenteData.descricao !== undefined) dataToUpdate.descricao = acidenteData.descricao;
    if (acidenteData.descricaoTrauma !== undefined) dataToUpdate.descricaoTrauma = acidenteData.descricaoTrauma || '';
    if (acidenteData.local !== undefined) dataToUpdate.local = acidenteData.local || '';
    if (acidenteData.lesoes !== undefined) dataToUpdate.lesoes = acidenteData.lesoes || [];
    if (acidenteData.feriado !== undefined) dataToUpdate.feriado = acidenteData.feriado;
    if (acidenteData.comunicado !== undefined) dataToUpdate.comunicado = acidenteData.comunicado;
    if (acidenteData.dataComunicacao !== undefined) dataToUpdate.dataComunicacao = acidenteData.dataComunicacao;
    if (acidenteData.dataNotificacao !== undefined) dataToUpdate.dataNotificacao = acidenteData.dataNotificacao;
    if (acidenteData.estado !== undefined) dataToUpdate.estado = acidenteData.estado || '';
    if (acidenteData.atendimentoMedico !== undefined) dataToUpdate.atendimentoMedico = acidenteData.atendimentoMedico;
    if (acidenteData.dataAtendimento !== undefined) dataToUpdate.dataAtendimento = acidenteData.dataAtendimento;
    if (acidenteData.horaAtendimento !== undefined) dataToUpdate.horaAtendimento = acidenteData.horaAtendimento || '';
    if (acidenteData.unidadeAtendimento !== undefined) dataToUpdate.unidadeAtendimento = acidenteData.unidadeAtendimento || '';
    if (acidenteData.internamento !== undefined) dataToUpdate.internamento = acidenteData.internamento;
    if (acidenteData.duracaoInternamento !== undefined) dataToUpdate.duracaoInternamento = acidenteData.duracaoInternamento || 0;
    if (acidenteData.catNas !== undefined) dataToUpdate.catNas = acidenteData.catNas;
    if (acidenteData.registroPolicial !== undefined) dataToUpdate.registroPolicial = acidenteData.registroPolicial;
    if (acidenteData.encaminhamentoJuntaMedica !== undefined) dataToUpdate.encaminhamentoJuntaMedica = acidenteData.encaminhamentoJuntaMedica;
    if (acidenteData.afastamento !== undefined) dataToUpdate.afastamento = acidenteData.afastamento;
    if (acidenteData.outrosTrabalhadoresAtingidos !== undefined) dataToUpdate.outrosTrabalhadoresAtingidos = acidenteData.outrosTrabalhadoresAtingidos;
    if (acidenteData.quantidadeTrabalhadoresAtingidos !== undefined) dataToUpdate.quantidadeTrabalhadoresAtingidos = acidenteData.quantidadeTrabalhadoresAtingidos || 0;
    if (acidenteData.status !== undefined) dataToUpdate.status = acidenteData.status;

    console.log('[AcidenteService.atualizar] Data to update:', Object.keys(dataToUpdate));
    console.log('[AcidenteService.atualizar] tipoTrauma in update:', dataToUpdate.tipoTrauma);

    const acidente = await Acidente.findByIdAndUpdate(
      id,
      { $set: dataToUpdate },
      {
        new: true,
        runValidators: false,
      }
    ).populate('trabalhadorId', 'nome cpf email empresa unidade').lean();

    console.log('[AcidenteService.atualizar] Updated document - tipoTrauma:', acidente?.tipoTrauma);
    console.log('[AcidenteService.atualizar] === END ===');

    if (!acidente) {
      throw new AppError('Acidente não encontrado', 404);
    }

    return acidente as unknown as IAcidente;
  }

  async deletar(id: string): Promise<void> {
    const result = await Acidente.findByIdAndDelete(id);

    if (!result) {
      throw new AppError('Acidente não encontrado', 404);
    }

    // Exclusão em cascata: remover a ficha técnica de material biológico vinculada, se existir
    await MaterialBiologico.findOneAndDelete({ acidenteId: id });
  }

  async obterPorTrabalhador(
    trabalhadorId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ acidentes: IAcidente[]; total: number; pages: number }> {
    const skip = (page - 1) * limit;
    const query = { trabalhadorId };

    const total = await Acidente.countDocuments(query);
    const acidentes = await Acidente.find(query)
      .sort({ dataAcidente: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const pages = Math.ceil(total / limit);

    return {
      acidentes: acidentes as IAcidente[],
      total,
      pages,
    };
  }

  async obterEstatisticas(): Promise<{
    total: number;
    porTipo: { [key: string]: number };
    porStatus: { [key: string]: number };
    ultimosMeses: { mes: string; quantidade: number }[];
  }> {
    const total = await Acidente.countDocuments();

    const porTipo = await Acidente.aggregate([
      {
        $group: {
          _id: '$tipoAcidente',
          quantidade: { $sum: 1 },
        },
      },
    ]);

    const porStatus = await Acidente.aggregate([
      {
        $group: {
          _id: '$status',
          quantidade: { $sum: 1 },
        },
      },
    ]);

    // Últimos 6 meses
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const ultimosMeses = await Acidente.aggregate([
      {
        $match: {
          dataAcidente: { $gte: seisMesesAtras },
        },
      },
      {
        $group: {
          _id: {
            ano: { $year: '$dataAcidente' },
            mes: { $month: '$dataAcidente' },
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
      porTipo: porTipo.reduce(
        (acc: any, item: any) => {
          acc[item._id || 'Não informado'] = item.quantidade;
          return acc;
        },
        {}
      ),
      porStatus: porStatus.reduce(
        (acc: any, item: any) => {
          acc[item._id || 'Não informado'] = item.quantidade;
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

export default new AcidenteService();
