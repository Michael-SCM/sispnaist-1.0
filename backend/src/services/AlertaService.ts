import Acidente from '../models/Acidente.js';
import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';
import Alerta, { IAlerta, TipoAlerta, NivelAlerta } from '../models/Alerta.js';
import AlertaRegra, { IAlertaRegra, ICondicaoAlerta } from '../models/AlertaRegra.js';
import RegraValidacao from '../models/RegraValidacao.js';
import PreferenciaUsuario from '../models/PreferenciaUsuario.js';
import Parametro from '../models/Parametro.js';
import config from '../config/config.js';
import { sendAlertaEmail } from '../utils/emailService.js';
import { AppError } from '../middleware/errorHandler.js';

const UM_DIA = 24 * 60 * 60 * 1000;

function somarDias(data: Date, dias: number): Date {
  const d = new Date(data);
  d.setDate(d.getDate() + dias);
  return d;
}

function avaliarCondicao(valorCalculado: number, condicao: ICondicaoAlerta): boolean {
  switch (condicao.operador) {
    case '>=': return valorCalculado >= condicao.valor;
    case '>': return valorCalculado > condicao.valor;
    case '<': return valorCalculado < condicao.valor;
    case '<=': return valorCalculado <= condicao.valor;
    case '==': return valorCalculado === condicao.valor;
    default: return false;
  }
}

function calcularVariacao(atual: number, anterior: number): number {
  if (anterior > 0) return Math.round(((atual - anterior) / anterior) * 100);
  return atual > 0 ? 100 : 0;
}

interface IDadosNovoAlerta {
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  titulo: string;
  descricao: string;
  referencia?: { entidade: string; entidadeId: string };
  empresaId?: string;
  unidadeId?: string;
  uf?: string;
  municipio?: string;
}

export class AlertaService {
  /**
   * Orquestra a avaliação de todos os tipos de alerta.
   */
  async avaliarTodos(): Promise<{ status: string }> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Alertas] Iniciando avaliação de alertas...');
    }
    await Promise.all([
      this.avaliarVacinacoes(),
      this.avaliarPicosAcidentes(),
      this.avaliarMonitoramentoCritico(),
      this.avaliarNaoConformidades(),
    ]);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Alertas] Avaliação concluída.');
    }
    return { status: 'ok' };
  }

  /**
   * Gera alertas de vacinação vencida/próxima de vencer, agregados por empresa.
   */
  async avaliarVacinacoes(): Promise<void> {
    const regras = (await AlertaRegra.find({ tipo: 'VACINA_VENCENDO', ativo: true }).lean()) as unknown as IAlertaRegra[];
    if (regras.length === 0) return;

    const diasAntecedencia = await this.obterParametro('dias_alerta_vacina', config.alert.diasAntecedenciaVacina);
    const hoje = new Date();
    const limite = somarDias(hoje, diasAntecedencia);

    const vacinacoes = await Vacinacao.find({ proximoDose: { $lte: limite } })
      .populate('trabalhadorId', 'nome empresa unidade')
      .lean();

    // Agrupar por empresa
    const porEmpresa = new Map<string, { vacinas: any[]; empresaId?: string; unidadeId?: string }>();
    for (const vac of vacinacoes) {
      const trabalhador: any = vac.trabalhadorId;
      const empresaId = trabalhador?.empresa ? String(trabalhador.empresa) : '';
      const grupo = porEmpresa.get(empresaId) || { vacinas: [], empresaId: empresaId || undefined, unidadeId: trabalhador?.unidade ? String(trabalhador.unidade) : undefined };
      grupo.vacinas.push(vac);
      porEmpresa.set(empresaId, grupo);
    }

    for (const [empresaId, grupo] of porEmpresa) {
      const diasRestantes = grupo.vacinas.map((v) => {
        const venc = new Date(v.proximoDose);
        return Math.ceil((venc.getTime() - hoje.getTime()) / UM_DIA);
      });
      const minimo = Math.min(...diasRestantes);
      const vencidas = diasRestantes.filter((d) => d < 0).length;

      for (const regra of regras) {
        if (regra.empresaId && String(regra.empresaId) !== empresaId) continue;
        if (!avaliarCondicao(minimo, regra.condicao)) continue;

        await this.criarOuAtualizarAlerta(
          {
            tipo: 'VACINA_VENCENDO',
            nivel: regra.nivel,
            titulo: 'Vacinas vencendo — atenção necessária',
            descricao:
              `${grupo.vacinas.length} vacina(s) vencida(s) ou próxima(s) de vencer nos próximos ${diasAntecedencia} dias ` +
              `(sendo ${vencidas} já vencida(s)). Verifique os registros e regularize as doses.`,
            referencia: empresaId ? { entidade: 'Empresa', entidadeId: empresaId } : undefined,
            empresaId: empresaId || undefined,
            unidadeId: grupo.unidadeId,
          },
          regra
        );
        break;
      }
    }
  }

  /**
   * Gera alertas de pico/aumento de acidentes com base nas regras configuradas.
   */
  async avaliarPicosAcidentes(): Promise<void> {
    const regras = (await AlertaRegra.find({ tipo: 'PICO_ACIDENTES', ativo: true }).lean()) as unknown as IAlertaRegra[];
    if (regras.length === 0) return;

    for (const regra of regras) {
      const hoje = new Date();
      const inicioJanela = somarDias(hoje, -regra.janelaDias);
      const inicioAnterior = somarDias(hoje, -(regra.janelaDias + regra.periodoAnteriorDias));

      const escopoMatch = this.montarEscopo(regra);
      const pipelineBase: any[] = [
        { $match: { dataAcidente: { $gte: inicioAnterior } } },
        { $lookup: { from: 'trabalhadores', localField: 'trabalhadorId', foreignField: '_id', as: 'tr' } },
        { $unwind: { path: '$tr', preserveNullAndEmptyArrays: true } },
        { $addFields: { empresaId: '$tr.empresa', uf: '$tr.endereco.estado', municipio: '$tr.endereco.cidade' } },
      ];
      if (escopoMatch) pipelineBase.push({ $match: escopoMatch });

      const escopado = !!regra.empresaId || !!regra.unidadeId || (regra.ufs?.length || 0) > 0 || (regra.municipios?.length || 0) > 0;

      if (escopado) {
        const [atual, anterior] = await Promise.all([
          Acidente.aggregate([...pipelineBase, { $match: { dataAcidente: { $gte: inicioJanela } } }, { $count: 'total' }]),
          Acidente.aggregate([...pipelineBase, { $match: { dataAcidente: { $gte: inicioAnterior, $lt: inicioJanela } } }, { $count: 'total' }]),
        ]);
        const totalAtual = atual[0]?.total || 0;
        const totalAnterior = anterior[0]?.total || 0;
        await this.criarAlertaPico(regra, totalAtual, totalAnterior, {
          empresaId: regra.empresaId ? String(regra.empresaId) : undefined,
          unidadeId: regra.unidadeId ? String(regra.unidadeId) : undefined,
          uf: regra.ufs?.[0],
          municipio: regra.municipios?.[0],
          referencia: regra.empresaId ? { entidade: 'Empresa', entidadeId: String(regra.empresaId) } : undefined,
        });
      } else {
        const [atual, anterior] = await Promise.all([
          Acidente.aggregate([...pipelineBase, { $match: { dataAcidente: { $gte: inicioJanela } } }, { $group: { _id: '$empresaId', total: { $sum: 1 } } }]),
          Acidente.aggregate([...pipelineBase, { $match: { dataAcidente: { $gte: inicioAnterior, $lt: inicioJanela } } }, { $group: { _id: '$empresaId', total: { $sum: 1 } } }]),
        ]);
        const mapaAnterior = new Map<string, number>(anterior.map((x): [string, number] => [x._id ? String(x._id) : '', x.total]));
        for (const item of atual) {
          const empresaId = item._id ? String(item._id) : undefined;
          await this.criarAlertaPico(regra, item.total, mapaAnterior.get(empresaId || '') || 0, {
            empresaId,
            referencia: empresaId ? { entidade: 'Empresa', entidadeId: empresaId } : undefined,
          });
        }
      }
    }
  }

  private async criarAlertaPico(
    regra: IAlertaRegra,
    totalAtual: number,
    totalAnterior: number,
    extras: Pick<IDadosNovoAlerta, 'empresaId' | 'unidadeId' | 'uf' | 'municipio' | 'referencia'>
  ): Promise<void> {
    const variacao = calcularVariacao(totalAtual, totalAnterior);
    const dispara =
      regra.condicao.parametro === 'variacaoPercentual'
        ? avaliarCondicao(variacao, regra.condicao)
        : avaliarCondicao(totalAtual, regra.condicao);

    if (!dispara) return;

    await this.criarOuAtualizarAlerta(
      {
        tipo: 'PICO_ACIDENTES',
        nivel: regra.nivel,
        titulo: 'Aumento no número de acidentes de trabalho',
        descricao:
          `${totalAtual} acidente(s) registrado(s) nos últimos ${regra.janelaDias} dias` +
          (totalAnterior > 0 ? ` — variação de ${variacao >= 0 ? '+' : ''}${variacao}% em relação ao período anterior.` : '.') +
          ' Avalie as causas e adote medidas preventivas.',
        ...extras,
      },
      regra
    );
  }

  /**
   * Gera alertas de monitoramento clínico (trabalhadores com múltiplos acidentes).
   */
  async avaliarMonitoramentoCritico(): Promise<void> {
    const regras = (await AlertaRegra.find({ tipo: 'MONITORAMENTO_CRITICO', ativo: true }).lean()) as unknown as IAlertaRegra[];
    if (regras.length === 0) return;

    const emRisco: any[] = await Acidente.aggregate([
      { $group: { _id: '$trabalhadorId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 2 } } },
      { $lookup: { from: 'trabalhadores', localField: '_id', foreignField: '_id', as: 'tr' } },
      { $unwind: '$tr' },
      { $project: { trabalhadorId: '$_id', nome: '$tr.nome', empresa: '$tr.empresa', unidade: '$tr.unidade', total: '$count' } },
    ]);

    for (const item of emRisco) {
      for (const regra of regras) {
        if (!avaliarCondicao(item.total, regra.condicao)) continue;
        const nivel: NivelAlerta = item.total > 3 ? 'alto' : regra.nivel;
        await this.criarOuAtualizarAlerta(
          {
            tipo: 'MONITORAMENTO_CRITICO',
            nivel,
            titulo: `Trabalhador em risco — ${item.nome}`,
            descricao: `${item.nome} registrou ${item.total} acidentes. Recomenda-se acompanhamento clínico e medidas de prevenção.`,
            referencia: { entidade: 'Trabalhador', entidadeId: String(item.trabalhadorId) },
            empresaId: item.empresa ? String(item.empresa) : undefined,
            unidadeId: item.unidade ? String(item.unidade) : undefined,
          },
          regra
        );
        break;
      }
    }
  }

  /**
   * Gera alertas de não conformidade a partir das regras de validação obrigatórias.
   */
  async avaliarNaoConformidades(): Promise<void> {
    const alertaRegras = (await AlertaRegra.find({ tipo: 'NAO_CONFORMIDADE', ativo: true }).lean()) as unknown as IAlertaRegra[];
    if (alertaRegras.length === 0) return;

    const hoje = new Date();
    const regrasValidacao = await RegraValidacao.find({ ativo: true, tipoValidacao: 'obrigatorio' }).lean();
    const vigentes = regrasValidacao.filter(
      (r) =>
        (!r.dataInicioVigencia || r.dataInicioVigencia <= hoje) &&
        (!r.dataFimVigencia || r.dataFimVigencia >= hoje)
    );

    for (const rv of vigentes) {
      const resultados = await this.contarNaoConformidadesPorEmpresa(rv.entidade, rv.campo);
      for (const item of resultados) {
        for (const regra of alertaRegras) {
          if (regra.empresaId && String(regra.empresaId) !== (item.empresaId || '')) continue;
          await this.criarOuAtualizarAlerta(
            {
              tipo: 'NAO_CONFORMIDADE',
              nivel: regra.nivel,
              titulo: `Não conformidade: ${rv.nome}`,
              descricao: `${item.total} registro(s) de ${rv.entidade} sem o campo "${rv.campo}" preenchido: ${rv.mensagemErro}.`,
              referencia: { entidade: 'RegraValidacao', entidadeId: String(rv._id) },
              empresaId: item.empresaId || undefined,
            },
            regra
          );
          break;
        }
      }
    }
  }

  private async contarNaoConformidadesPorEmpresa(
    entidade: string,
    campo: string
  ): Promise<{ empresaId?: string; total: number }[]> {
    const matchInvalido = { [campo]: { $in: [null, '', undefined] } };

    if (entidade === 'trabalhador') {
      const result: any[] = await Trabalhador.aggregate([
        { $match: matchInvalido },
        { $group: { _id: '$empresa', total: { $sum: 1 } } },
      ]);
      return result.map((r) => ({ empresaId: r._id ? String(r._id) : undefined, total: r.total }));
    }

    if (entidade === 'acidente' || entidade === 'vacinacao') {
      const model = entidade === 'acidente' ? Acidente : Vacinacao;
      const result: any[] = await model.aggregate([
        { $match: matchInvalido },
        { $lookup: { from: 'trabalhadores', localField: 'trabalhadorId', foreignField: '_id', as: 'tr' } },
        { $unwind: { path: '$tr', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$tr.empresa', total: { $sum: 1 } } },
      ]);
      return result.map((r) => ({ empresaId: r._id ? String(r._id) : undefined, total: r.total }));
    }

    return [];
  }

  /**
   * Cria um alerta ou atualiza um alerta ativo já existente (deduplicação).
   */
  private async criarOuAtualizarAlerta(dados: IDadosNovoAlerta, regra: IAlertaRegra): Promise<IAlerta> {
    const filtroExistente: any = {
      tipo: dados.tipo,
      status: { $in: ['ativa', 'reagindo'] },
    };
    if (dados.referencia?.entidadeId) {
      filtroExistente['referencia.entidadeId'] = dados.referencia.entidadeId;
    }
    if (dados.empresaId) {
      filtroExistente.empresaId = dados.empresaId;
    } else if (!dados.referencia?.entidadeId) {
      filtroExistente.empresaId = { $exists: false };
    }

    const existente = await Alerta.findOne(filtroExistente);
    if (existente) {
      existente.titulo = dados.titulo;
      existente.descricao = dados.descricao;
      existente.nivel = dados.nivel;
      existente.dataAlerta = new Date();
      await existente.save();
      return existente;
    }

    const novo = await Alerta.create({
      ...dados,
      status: 'ativa',
      dataAlerta: new Date(),
    });

    if (regra.notificarEmail) {
      await this.notificarDestinatarios(novo);
    }
    return novo;
  }

  /**
   * Notifica admins (todos os alertas) e gestores (somente alertas da sua empresa).
   */
  private async notificarDestinatarios(alerta: IAlerta): Promise<void> {
    const usuarios = await User.find({ perfil: { $in: ['admin', 'gestor'] }, ativo: true })
      .select('_id email perfil empresa')
      .lean();

    const admins = usuarios.filter((u) => u.perfil === 'admin');
    const gestores = usuarios.filter(
      (u) => u.perfil === 'gestor' && alerta.empresaId && u.empresa && String(u.empresa) === String(alerta.empresaId)
    );

    const destinatarios = [...admins, ...gestores];
    if (destinatarios.length === 0) return;

    const prefs = await PreferenciaUsuario.find({ usuarioId: { $in: destinatarios.map((u) => u._id) } })
      .select('usuarioId notificacoesEmail')
      .lean();
    const prefMap = new Map(prefs.map((p) => [String(p.usuarioId), p.notificacoesEmail !== false]));

    const aReceber = destinatarios.filter((u) => prefMap.get(String(u._id)) !== false);
    let enviados = 0;
    for (const u of aReceber) {
      try {
        await sendAlertaEmail(u.email, {
          titulo: alerta.titulo,
          descricao: alerta.descricao,
          nivel: alerta.nivel,
          tipo: alerta.tipo,
          link: `${config.frontendUrl}/alertas`,
        });
        enviados++;
      } catch (err) {
        console.error(`[Alertas] Falha ao enviar e-mail para ${u.email}:`, err);
      }
    }

    if (enviados > 0) {
      await Alerta.updateOne(
        { _id: alerta._id },
        {
          $addToSet: { usuariosNotificados: { $each: aReceber.map((u) => u._id) } },
          ultimoEmailEnviadoEm: new Date(),
        }
      );
    }
  }

  private montarEscopo(regra: IAlertaRegra): Record<string, any> | null {
    const match: Record<string, any> = {};
    if (regra.empresaId) match.empresaId = regra.empresaId;
    if (regra.unidadeId) match['tr.unidade'] = regra.unidadeId;
    if (regra.ufs?.length) match.uf = { $in: regra.ufs };
    if (regra.municipios?.length) match.municipio = { $in: regra.municipios };
    return Object.keys(match).length ? match : null;
  }

  private async obterParametro(chave: string, padrao: number): Promise<number> {
    try {
      const p = await Parametro.findOne({ chave, ativo: true }).lean();
      if (p && !isNaN(Number(p.valor))) return Number(p.valor);
    } catch {
      // ignora erros de leitura e usa o padrão
    }
    return padrao;
  }

  // ============================== CONSULTAS (painel) ==============================

  async listarAlertas(params: {
    userId: string;
    perfil: string;
    empresaId?: string;
    page?: number;
    limit?: number;
    tipo?: string;
    status?: string;
    nivel?: string;
    naoLidos?: boolean;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const filtro: any = {};
    if (params.perfil === 'gestor') {
      if (!params.empresaId) return { data: [], total: 0, page, limit, totalPages: 0 };
      filtro.empresaId = params.empresaId;
    }
    if (params.tipo) filtro.tipo = params.tipo;
    if (params.status) filtro.status = params.status;
    if (params.nivel) filtro.nivel = params.nivel;
    if (params.naoLidos) filtro.lidoPorUsuarios = { $ne: params.userId };

    const [data, total] = await Promise.all([
      Alerta.find(filtro).sort({ dataAlerta: -1 }).skip(skip).limit(limit).lean(),
      Alerta.countDocuments(filtro),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async obterResumo(params: { perfil: string; empresaId?: string; userId?: string }) {
    const base: any = {};
    if (params.perfil === 'gestor') {
      if (!params.empresaId) return { totalAtivos: 0, novos: 0, alto: 0 };
      base.empresaId = params.empresaId;
    }
    if (params.userId) base.lidoPorUsuarios = { $ne: params.userId };
    const ativo = { ...base, status: { $in: ['ativa', 'reagindo'] } };
    const [totalAtivos, novos, alto] = await Promise.all([
      Alerta.countDocuments(ativo),
      Alerta.countDocuments({ ...ativo, dataCriacao: { $gte: new Date(Date.now() - UM_DIA) } }),
      Alerta.countDocuments({ ...ativo, nivel: 'alto' }),
    ]);
    return { totalAtivos, novos, alto };
  }

  async atualizarStatus(
    id: string,
    status: 'lida' | 'arquivada' | 'reagindo',
    params: { perfil: string; empresaId?: string }
  ) {
    const alerta = await Alerta.findById(id);
    if (!alerta) throw new AppError('Alerta não encontrado', 404);

    if (params.perfil === 'gestor' && (!alerta.empresaId || String(alerta.empresaId) !== params.empresaId)) {
      throw new AppError('Sem permissão para acessar este alerta', 403);
    }

    alerta.status = status;
    await alerta.save();
    return alerta;
  }

  /**
   * Registra que um usuário leu/reconheceu um alerta (uso interno do sino, por usuário).
   * Não altera o status global do alerta.
   */
  async marcarLidoParaUsuario(id: string, userId: string, params: { perfil: string; empresaId?: string }) {
    const alerta = await Alerta.findById(id);
    if (!alerta) throw new AppError('Alerta não encontrado', 404);

    if (params.perfil === 'gestor' && (!alerta.empresaId || String(alerta.empresaId) !== params.empresaId)) {
      throw new AppError('Sem permissão para acessar este alerta', 403);
    }

    await Alerta.updateOne({ _id: alerta._id }, { $addToSet: { lidoPorUsuarios: userId } });
    return Alerta.findById(id);
  }

  async marcarTodosLidosParaUsuario(userId: string, params: { perfil: string; empresaId?: string }) {
    const filtro: any = { status: { $in: ['ativa', 'reagindo'] } };
    if (params.perfil === 'gestor') {
      if (!params.empresaId) return { modifiedCount: 0 };
      filtro.empresaId = params.empresaId;
    }
    const result = await Alerta.updateMany(filtro, { $addToSet: { lidoPorUsuarios: userId } });
    return { modifiedCount: result.modifiedCount };
  }

  // ============================== REGRAS (admin) ==============================

  async listarRegras() {
    return AlertaRegra.find().sort({ tipo: 1, nome: 1 }).lean();
  }

  async criarRegra(data: Partial<IAlertaRegra>) {
    return AlertaRegra.create(data);
  }

  async atualizarRegra(id: string, data: Partial<IAlertaRegra>) {
    const regra = await AlertaRegra.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!regra) throw new AppError('Regra de alerta não encontrada', 404);
    return regra;
  }

  async deletarRegra(id: string) {
    const regra = await AlertaRegra.findById(id);
    if (!regra) throw new AppError('Regra de alerta não encontrada', 404);
    regra.ativo = false;
    await regra.save();
    return regra;
  }
}

export default new AlertaService();
