import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';
import TrabalhadorVinculo from '../models/TrabalhadorVinculo.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';
import TrabalhadorInformacao from '../models/TrabalhadorInformacao.js';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento.js';
import AtoMunicipalInovacao from '../models/AtoMunicipalInovacao.js';
import HabilitacaoPnaist from '../models/HabilitacaoPnaist.js';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export interface IKPIData {
  totalAcidentes: number;
  acidentesAbertos: number;
  acidentesEmAnalise: number;
  acidentesFechados: number;
  taxaResolucao: number;
  totalTrabalhadores: number;
  totalDoencas: number;
  doencasAtivas: number;
  totalVacinacoes: number;
  proximasVacinacoes: number;
  coberturaVacinal: number;
  totalAbsenteismo: number;
  totalTrabalhadoresComDeficiencia: number;
  percentualDeficiencia: number;
  totalTrabalhadoresAfastadosAcidente: number;
  percentualTrabalhadoresAfastadosAcidente: number;
  totalTrabalhadoresReadaptacao: number;
  percentualReadaptacao: number;
  totalTrabalhadoresAfastadosTranstornoMental: number;
  percentualTrabalhadoresAfastadosTranstornoMental: number;
  totalUnidadesAtivas: number;
  totalUnidadesComPgr: number;
  percentualUnidadesComPgr: number;
  totalMunicipiosHabilitados: number;
  municipiosHabilitadosAnaliseSituacao: number;
  municipiosHabilitadosPlanoPrograma: number;
  percentualMunicipiosHabilitadosAnaliseSituacao: number;
  percentualMunicipiosHabilitadosPlanoPrograma: number;
  drtSusPeriodoAtual: number;
  drtSusPeriodoAnterior: number;
  percentualAumentoDrtSus: number;
  acidentesSusPeriodoAtual: number;
  acidentesSusPeriodoAnterior: number;
  percentualAumentoAcidentesSus: number;
}

export interface IMonitoramentoClinico {
  coberturaVacinal: {
    total: number;
    porEmpresa: { nome: string; cobertura: number }[];
  };
  absenteismo: {
    totalDias: number;
    variacao: number;
    porMes: { mes: string; dias: number }[];
  };
  alertasCriticos: {
    trabalhador: string;
    motivo: string;
    nivel: 'baixo' | 'medio' | 'alto';
  }[];
}

export interface IAnalyticsService {
  obterKPIs(): Promise<IKPIData>;
  obterDadosAcidentes(): Promise<{
    porTipo: { nome: string; valor: number }[];
    porStatus: { nome: string; valor: number }[];
    ultimosMeses: { mes: string; quantidade: number }[];
  }>;
  obterProximasVacinacoes(dias?: number): Promise<any[]>;
  obterUltimosAcidentes(limit?: number): Promise<any[]>;
  obterDadosDashboardAdmin(): Promise<any>;
  obterMonitoramentoClinico(): Promise<IMonitoramentoClinico>;
}

export class AnalyticsService {
  /**
   * Obtém KPIs gerais do sistema
   */
  async obterKPIs(): Promise<IKPIData> {
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() + 30);

    const TrabalhadorAfastamento = (await import('../models/TrabalhadorAfastamento.js')).default;

    const [
      totalAcidentes,
      acidentesAbertos,
      acidentesEmAnalise,
      acidentesFechados,
      totalTrabalhadores,
      totalDoencas,
      doencasAtivas,
      totalVacinacoes,
      proximasVacinacoes,
      trabalhadoresComVacina,
      absenteismoAgg,
      totalTrabalhadoresComDeficiencia,
      trabalhadoresAfastadosAcidenteAgg,
      trabalhadoresReadaptacao,
      trabalhadoresAfastadosTranstornoMentalAgg,
      totalUnidadesAtivas,
      totalUnidadesComPgr,
      totalMunicipiosHabilitados,
      municipiosHabilitadosAnaliseSituacaoAgg,
      municipiosHabilitadosPlanoProgramaAgg,
      drtSusPeriodoAtualAgg,
      drtSusPeriodoAnteriorAgg,
      acidentesSusPeriodoAtualAgg,
      acidentesSusPeriodoAnteriorAgg
    ] = await Promise.all([
      Acidente.countDocuments(),
      Acidente.countDocuments({ status: 'Aberto' }),
      Acidente.countDocuments({ status: 'Em Análise' }),
      Acidente.countDocuments({ status: 'Fechado' }),
      Trabalhador.countDocuments({ 'vinculo.situacao': 'Ativo' }),
      Doenca.countDocuments(),
      Doenca.countDocuments({ ativo: true }),
      Vacinacao.countDocuments(),
      Vacinacao.countDocuments({ proximoDose: { $lte: trintaDias } }),
      Vacinacao.distinct('trabalhadorId'),
      TrabalhadorAfastamento.aggregate([
        {
          $match: {
            dataInicio: { $exists: true, $ne: null },
            dataRetorno: { $exists: true, $ne: null }
          }
        },
        {
          $project: {
            diasAfastamento: {
              $ceil: {
                $divide: [
                  { $subtract: ['$dataRetorno', '$dataInicio'] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$diasAfastamento' }
          }
        }
      ]),
      Trabalhador.countDocuments({
        'vinculo.situacao': 'Ativo',
        'deficiencia.tipo': { $exists: true, $nin: ['', null] }
      }),
      Acidente.aggregate([
        { $match: { tipoAcidente: { $in: ['Típico', 'Trajeto'] }, afastamento: true } },
        { $group: { _id: '$trabalhadorId' } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: '_id',
            foreignField: '_id',
            as: 'trab'
          }
        },
        { $unwind: '$trab' },
        { $match: { 'trab.vinculo.situacao': 'Ativo' } },
        { $count: 'total' }
      ]),
      TrabalhadorInformacao.distinct('trabalhadorId', {
        $or: [
          { readaptacaoProfissional: true },
          { acompanhamentoReabilitacao: true }
        ]
      }),
      TrabalhadorAfastamento.aggregate([
        {
          $match: {
            cid: { $regex: /^F/, $options: 'i' },
            ativo: true
          }
        },
        { $group: { _id: '$trabalhadorId' } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: '_id',
            foreignField: '_id',
            as: 'trab'
          }
        },
        { $unwind: '$trab' },
        { $match: { 'trab.vinculo.situacao': 'Ativo' } },
        { $count: 'total' }
      ]),
      Unidade.countDocuments({ ativa: true }),
      Unidade.countDocuments({ possuiPgr: true, ativa: true }),
      HabilitacaoPnaist.countDocuments({ ativo: true }),
      HabilitacaoPnaist.aggregate([
        { $match: { ativo: true } },
        {
          $lookup: {
            from: 'atos_municipais_inovacao',
            let: { municipio: '$municipio', uf: '$uf' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$nm_cidade', '$$municipio'] },
                      { $eq: ['$nm_estado', '$$uf'] },
                      { $eq: ['$classificacaoSst', 'analise_situacao'] }
                    ]
                  }
                }
              }
            ],
            as: 'atos'
          }
        },
        { $match: { 'atos.0': { $exists: true } } },
        { $count: 'total' }
      ]),
      HabilitacaoPnaist.aggregate([
        { $match: { ativo: true } },
        {
          $lookup: {
            from: 'atos_municipais_inovacao',
            let: { municipio: '$municipio', uf: '$uf' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$nm_cidade', '$$municipio'] },
                      { $eq: ['$nm_estado', '$$uf'] },
                      { $eq: ['$classificacaoSst', 'plano_programa'] }
                    ]
                  }
                }
              }
            ],
            as: 'atos'
          }
        },
        { $match: { 'atos.0': { $exists: true } } },
        { $count: 'total' }
      ]),
      Doenca.aggregate([
        { $match: { relacaoTrabalho: { $in: ['ocupacional', 'acidente'] }, dataInicio: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: '$trabalhadorId' } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: '_id',
            foreignField: '_id',
            as: 'trab'
          }
        },
        { $unwind: '$trab' },
        {
          $lookup: {
            from: 'unidades',
            localField: 'trab.unidade',
            foreignField: '_id',
            as: 'unidade'
          }
        },
        { $unwind: '$unidade' },
        { $match: { 'unidade.esferaAdministrativa': { $in: ['municipal', 'estadual', 'federal', 'misto'] } } },
        { $count: 'total' }
      ]),
      Doenca.aggregate([
        { $match: { relacaoTrabalho: { $in: ['ocupacional', 'acidente'] }, dataInicio: { $gte: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: '$trabalhadorId' } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: '_id',
            foreignField: '_id',
            as: 'trab'
          }
        },
        { $unwind: '$trab' },
        {
          $lookup: {
            from: 'unidades',
            localField: 'trab.unidade',
            foreignField: '_id',
            as: 'unidade'
          }
        },
        { $unwind: '$unidade' },
        { $match: { 'unidade.esferaAdministrativa': { $in: ['municipal', 'estadual', 'federal', 'misto'] } } },
        { $count: 'total' }
      ]),
      Acidente.aggregate([
        { $match: { dataAcidente: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: 'trabalhadorId',
            foreignField: '_id',
            as: 'trab'
          }
        },
        { $unwind: '$trab' },
        {
          $lookup: {
            from: 'unidades',
            localField: 'trab.unidade',
            foreignField: '_id',
            as: 'unidade'
          }
        },
        { $unwind: '$unidade' },
        { $match: { 'unidade.esferaAdministrativa': { $in: ['municipal', 'estadual', 'federal', 'misto'] } } },
        { $count: 'total' }
      ]),
      Acidente.aggregate([
        { $match: { dataAcidente: { $gte: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000), $lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: 'trabalhadorId',
            foreignField: '_id',
            as: 'trab'
          }
        },
        { $unwind: '$trab' },
        {
          $lookup: {
            from: 'unidades',
            localField: 'trab.unidade',
            foreignField: '_id',
            as: 'unidade'
          }
        },
        { $unwind: '$unidade' },
        { $match: { 'unidade.esferaAdministrativa': { $in: ['municipal', 'estadual', 'federal', 'misto'] } } },
        { $count: 'total' }
      ])
    ]);
    
    // Taxa de resolução (acidentes fechados / total * 100)
    const taxaResolucao = totalAcidentes > 0 
      ? Math.round((acidentesFechados / totalAcidentes) * 100) 
      : 0;

    // Cobertura vacinal aproximada
    const coberturaVacinal = totalTrabalhadores > 0 
      ? Math.round((trabalhadoresComVacina.length / totalTrabalhadores) * 100) 
      : 0;

    // Total absenteísmo (dias de afastamento) calculado a partir dos afastamentos reais
    const totalAbsenteismo = absenteismoAgg[0]?.total || 0;

    // Percentual de trabalhadores com deficiência
    const percentualDeficiencia = totalTrabalhadores > 0
      ? Math.round((totalTrabalhadoresComDeficiencia / totalTrabalhadores) * 100)
      : 0;

    // Trabalhadores afastados por acidente Típico ou Trajeto
    const totalTrabalhadoresAfastadosAcidente = trabalhadoresAfastadosAcidenteAgg[0]?.total || 0;
    const percentualTrabalhadoresAfastadosAcidente = totalTrabalhadores > 0
      ? Math.round((totalTrabalhadoresAfastadosAcidente / totalTrabalhadores) * 100)
      : 0;

    // Trabalhadores em readaptação profissional ou reabilitação
    const totalTrabalhadoresReadaptacao = trabalhadoresReadaptacao.length || 0;
    const percentualReadaptacao = totalTrabalhadores > 0
      ? Math.round((totalTrabalhadoresReadaptacao / totalTrabalhadores) * 100)
      : 0;

    // Trabalhadores afastados por transtorno mental (CID F)
    const totalTrabalhadoresAfastadosTranstornoMental = trabalhadoresAfastadosTranstornoMentalAgg[0]?.total || 0;
    const percentualTrabalhadoresAfastadosTranstornoMental = totalTrabalhadores > 0
      ? Math.round((totalTrabalhadoresAfastadosTranstornoMental / totalTrabalhadores) * 100)
      : 0;

    const percentualUnidadesComPgr = totalUnidadesAtivas > 0
      ? Math.round((totalUnidadesComPgr / totalUnidadesAtivas) * 100)
      : 0;

    const municipiosHabilitadosAnaliseSituacao = municipiosHabilitadosAnaliseSituacaoAgg[0]?.total || 0;
    const municipiosHabilitadosPlanoPrograma = municipiosHabilitadosPlanoProgramaAgg[0]?.total || 0;
    const percentualMunicipiosHabilitadosAnaliseSituacao = totalMunicipiosHabilitados > 0
      ? Math.round((municipiosHabilitadosAnaliseSituacao / totalMunicipiosHabilitados) * 100)
      : 0;
    const percentualMunicipiosHabilitadosPlanoPrograma = totalMunicipiosHabilitados > 0
      ? Math.round((municipiosHabilitadosPlanoPrograma / totalMunicipiosHabilitados) * 100)
      : 0;

    const drtSusPeriodoAtual = drtSusPeriodoAtualAgg[0]?.total || 0;
    const drtSusPeriodoAnterior = drtSusPeriodoAnteriorAgg[0]?.total || 0;
    const percentualAumentoDrtSus = drtSusPeriodoAnterior > 0
      ? Math.round(((drtSusPeriodoAtual - drtSusPeriodoAnterior) / drtSusPeriodoAnterior) * 100)
      : drtSusPeriodoAtual > 0 ? 100 : 0;

    const acidentesSusPeriodoAtual = acidentesSusPeriodoAtualAgg[0]?.total || 0;
    const acidentesSusPeriodoAnterior = acidentesSusPeriodoAnteriorAgg[0]?.total || 0;
    const percentualAumentoAcidentesSus = acidentesSusPeriodoAnterior > 0
      ? Math.round(((acidentesSusPeriodoAtual - acidentesSusPeriodoAnterior) / acidentesSusPeriodoAnterior) * 100)
      : acidentesSusPeriodoAtual > 0 ? 100 : 0;

    return {
      totalAcidentes,
      acidentesAbertos,
      acidentesEmAnalise,
      acidentesFechados,
      taxaResolucao,
      totalTrabalhadores,
      totalDoencas,
      doencasAtivas,
      totalVacinacoes,
      proximasVacinacoes,
      coberturaVacinal,
      totalAbsenteismo,
      totalTrabalhadoresComDeficiencia,
      percentualDeficiencia,
      totalTrabalhadoresAfastadosAcidente,
      percentualTrabalhadoresAfastadosAcidente,
      totalTrabalhadoresReadaptacao,
      percentualReadaptacao,
      totalTrabalhadoresAfastadosTranstornoMental,
      percentualTrabalhadoresAfastadosTranstornoMental,
      totalUnidadesAtivas,
      totalUnidadesComPgr,
      percentualUnidadesComPgr,
      totalMunicipiosHabilitados,
      municipiosHabilitadosAnaliseSituacao,
      municipiosHabilitadosPlanoPrograma,
      percentualMunicipiosHabilitadosAnaliseSituacao,
      percentualMunicipiosHabilitadosPlanoPrograma,
      drtSusPeriodoAtual,
      drtSusPeriodoAnterior,
      percentualAumentoDrtSus,
      acidentesSusPeriodoAtual,
      acidentesSusPeriodoAnterior,
      percentualAumentoAcidentesSus
    };
  }

  /**
   * Obtém dados para gráficos de acidentes
   */
  async obterDadosAcidentes() {
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    // Executa as agregações em paralelo
    const [porTipoAgg, porStatusAgg, ultimosMesesAgg] = await Promise.all([
      Acidente.aggregate([
        {
          $group: {
            _id: '$tipoAcidente',
            valor: { $sum: 1 },
          },
        },
        { $sort: { valor: -1 } },
      ]),
      Acidente.aggregate([
        {
          $group: {
            _id: '$status',
            valor: { $sum: 1 },
          },
        },
        { $sort: { valor: -1 } },
      ]),
      Acidente.aggregate([
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
      ])
    ]);

    const porTipo = porTipoAgg.map((item: any) => ({
      nome: item._id || 'Não informado',
      valor: item.valor,
    }));

    const porStatus = porStatusAgg.map((item: any) => ({
      nome: item._id || 'Não informado',
      valor: item.valor,
    }));

    // Gerar array completo dos últimos 6 meses (incluindo meses com 0 acidentes)
    const ultimosMeses: { mes: string; quantidade: number }[] = [];
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mesIndex = data.getMonth();
      const ano = data.getFullYear();
      const mesLabel = `${mesesNomes[mesIndex]}/${ano.toString().slice(2)}`;
      
      const encontrado = ultimosMesesAgg.find(
        (item: any) => item._id.mes === (mesIndex + 1) && item._id.ano === ano
      );
      
      ultimosMeses.push({
        mes: mesLabel,
        quantidade: encontrado ? encontrado.quantidade : 0,
      });
    }

    return {
      porTipo,
      porStatus,
      ultimosMeses,
    };
  }

  /**
   * Obtém próximas vacinações (vencidas ou próximas de vencer)
   */
  async obterProximasVacinacoes(dias: number = 30) {
    const hoje = new Date();
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    const vacinacoes = await Vacinacao.find({
      proximoDose: { $lte: limite },
    })
      .populate('trabalhadorId', 'nome cpf email empresa unidade')
      .sort({ proximoDose: 1 })
      .limit(20)
      .lean();

    return vacinacoes.map((vac: any) => {
      const dataVencimento = new Date(vac.proximoDose);
      const diffDias = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'Em dia';
      if (diffDias < 0) {
        status = 'Vencida';
      } else if (diffDias <= 7) {
        status = 'Vence em breve';
      }

      return {
        ...vac,
        status,
        diasRestantes: diffDias,
      };
    });
  }

  /**
   * Obtém últimos acidentes registrados
   */
  async obterUltimosAcidentes(limit: number = 5): Promise<any[]> {
    const acidentes = await Acidente.find()
      .populate('trabalhadorId', 'nome cpf empresa unidade')
      .sort({ dataAcidente: -1 })
      .limit(limit)
      .lean();

    return acidentes;
  }

  /**
   * Obtém dados completos para dashboard admin
   */
  async obterDadosDashboardAdmin(): Promise<any> {
    const [kpis, dadosAcidentes, proximasVacinacoes, ultimosAcidentes, trabalhadoresPorEmpresa, distribuicaoVinculosRaw, totalTrabalhadores, deficienciaPorTipoAgg, afastadosPorTipoAgg] = await Promise.all([
      this.obterKPIs(),
      this.obterDadosAcidentes(),
      this.obterProximasVacinacoes(30),
      this.obterUltimosAcidentes(5),
      Trabalhador.aggregate([
        {
          $match: {
            empresa: { $exists: true, $ne: null },
            'vinculo.situacao': 'Ativo',
          },
        },
        {
          $project: {
            trabalhadorId: '$_id',
            empresa: '$empresa',
          },
        },
        {
          $unionWith: {
            coll: 'trabalhador_vinculos',
            pipeline: [
              { $match: { empresa: { $exists: true, $ne: null } } },
              {
                $project: {
                  trabalhadorId: '$trabalhadorId',
                  empresa: '$empresa',
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: { trabalhadorId: '$trabalhadorId', empresa: '$empresa' },
          },
        },
        {
          $lookup: {
            from: 'empresas',
            localField: '_id.empresa',
            foreignField: '_id',
            as: 'empresaData',
          },
        },
        { $unwind: { path: '$empresaData', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$empresaData.razaoSocial',
            total: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Trabalhador.aggregate([
        {
          $match: {
            empresa: { $exists: true, $ne: null },
            'vinculo.situacao': 'Ativo',
          },
        },
        {
          $project: {
            trabalhadorId: '$_id',
          },
        },
        {
          $unionWith: {
            coll: 'trabalhador_vinculos',
            pipeline: [
              { $match: { empresa: { $exists: true, $ne: null } } },
              {
                $project: {
                  trabalhadorId: '$trabalhadorId',
                },
              },
            ],
          },
        },
        {
          $group: {
            _id: '$trabalhadorId',
            totalVinculos: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: '$totalVinculos',
            totalTrabalhadores: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Trabalhador.countDocuments({ 'vinculo.situacao': 'Ativo' }),
      Trabalhador.aggregate([
        {
          $match: {
            'vinculo.situacao': 'Ativo',
            'deficiencia.tipo': { $exists: true, $nin: ['', null] }
          }
        },
        {
          $group: {
            _id: '$deficiencia.tipo',
            valor: { $sum: 1 }
          }
        },
        { $sort: { valor: -1 } }
      ]),
      Acidente.aggregate([
        { $match: { afastamento: true } },
        { $group: { _id: '$tipoAcidente', valor: { $sum: 1 } } },
        { $sort: { valor: -1 } }
      ]),
    ]);

    const trabalhadoresMultiplosVinculos = distribuicaoVinculosRaw
      .filter((item: any) => item._id > 1)
      .map((item: any) => ({
        nome: `${item._id} vínculos`,
        total: item.totalTrabalhadores,
        percentual: totalTrabalhadores > 0
          ? Number(((item.totalTrabalhadores / totalTrabalhadores) * 100).toFixed(2))
          : 0,
      }));

    const empresasFormatadas = trabalhadoresPorEmpresa.map((item: any) => ({
      nome: item._id || 'Sem empresa',
      total: item.total,
    }));

    const deficienciaPorTipo = deficienciaPorTipoAgg.map((item: any) => ({
      nome: item._id || 'Não informado',
      valor: item.valor,
    }));

    const afastadosPorTipoAcidente = afastadosPorTipoAgg.map((item: any) => ({
      nome: item._id || 'Não informado',
      valor: item.valor,
    }));

    return {
      kpis,
      graficos: {
        acidentesPorTipo: dadosAcidentes.porTipo,
        acidentesPorStatus: dadosAcidentes.porStatus,
        acidentesUltimosMeses: dadosAcidentes.ultimosMeses,
        trabalhadoresPorEmpresa: empresasFormatadas,
        trabalhadoresMultiplosVinculos,
        deficienciaPorTipo,
        afastadosPorTipoAcidente,
      },
      tabelas: {
        proximasVacinacoes,
        ultimosAcidentes,
      },
    };
  }

  /**
   * Obtém dados resumidos para dashboard do trabalhador
   */
  async obterDadosDashboardTrabalhador(trabalhadorId: string): Promise<any> {
    const acidentes = await Acidente.countDocuments({ trabalhadorId });
    const doencas = await Doenca.countDocuments({ trabalhadorId, ativo: true });
    
    const vacinacoes = await Vacinacao.find({ trabalhadorId })
      .sort({ proximoDose: 1 })
      .lean();

    const proximaVacinacao = vacinacoes.find((vac: any) => {
      if (!vac.proximoDose) return false;
      const data = new Date(vac.proximoDose);
      return data >= new Date();
    });

    const vacinacaoVencida = vacinacoes.find((vac: any) => {
      if (!vac.proximoDose) return false;
      const data = new Date(vac.proximoDose);
      return data < new Date();
    });

    return {
      resumo: {
        acidentes,
        doencasAtivas: doencas,
        totalVacinacoes: vacinacoes.length,
      },
      proximaVacinacao: proximaVacinacao || null,
      vacinacaoVencida: vacinacaoVencida || null,
      ultimosAcidentes: await Acidente.find({ trabalhadorId })
        .sort({ dataAcidente: -1 })
        .limit(3)
        .lean(),
    };
  }

  /**
   * Obtém dados detalhados de monitoramento clínico
   */
  async obterMonitoramentoClinico(): Promise<IMonitoramentoClinico> {
    const cacheKey = 'monitoramento_clinico';
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    const [
      totalTrabalhadores,
      trabalhadoresComVacina,
      absenteismoAgg,
      trabalhadoresEmRisco,
      totalAtivosPorEmpresa,
    ] = await Promise.all([
      Trabalhador.countDocuments({ 'vinculo.situacao': 'Ativo' }),
      Vacinacao.distinct('trabalhadorId'),
      TrabalhadorAfastamento.aggregate([
        {
          $match: {
            dataInicio: { $exists: true },
            $or: [
              { dataFim: { $ne: null } },
              { dataRetorno: { $ne: null } },
            ],
          },
        },
        {
          $addFields: {
            dataFimReal: { $ifNull: ['$dataFim', '$dataRetorno'] },
          },
        },
        {
          $addFields: {
            diffDias: {
              $ceil: {
                $divide: [
                  { $subtract: ['$dataFimReal', '$dataInicio'] },
                  1000 * 60 * 60 * 24,
                ],
              },
            },
          },
        },
        { $match: { diffDias: { $gt: 0 } } },
        {
          $group: {
            _id: {
              ano: { $year: '$dataInicio' },
              mes: { $month: '$dataInicio' },
            },
            totalDias: { $sum: '$diffDias' },
          },
        },
        { $sort: { '_id.ano': 1, '_id.mes': 1 } },
      ]),
      Acidente.aggregate([
        { $group: { _id: '$trabalhadorId', count: { $sum: 1 } } },
        { $match: { count: { $gte: 2 } } },
        {
          $lookup: {
            from: 'trabalhadores',
            localField: '_id',
            foreignField: '_id',
            as: 'trabalhador',
          },
        },
        { $unwind: '$trabalhador' },
        { $project: { nome: '$trabalhador.nome', total: '$count' } },
      ]),
      Trabalhador.aggregate([
        {
          $match: {
            'vinculo.situacao': 'Ativo',
            empresa: { $exists: true, $ne: null },
          },
        },
        { $group: { _id: '$empresa', totalAtivos: { $sum: 1 } } },
        {
          $lookup: {
            from: 'empresas',
            localField: '_id',
            foreignField: '_id',
            as: 'empresaData',
          },
        },
        { $unwind: { path: '$empresaData', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            empresaId: '$_id',
            totalAtivos: 1,
            nomeEmpresa: '$empresaData.razaoSocial',
          },
        },
      ]),
    ]);

    // Alertas Críticos
    const alertasCriticos = trabalhadoresEmRisco.map((t: any) => ({
      trabalhador: t.nome,
      motivo: `${t.total} acidentes registrados`,
      nivel: (t.total > 3 ? 'alto' : 'medio') as 'alto' | 'medio' | 'baixo',
    }));

    // Mapear absenteísmo aggregation para lookup por ano-mês
    const porMesMap: Record<string, number> = {};
    for (const item of absenteismoAgg) {
      const key = `${item._id.ano}-${item._id.mes}`;
      porMesMap[key] = item.totalDias;
    }

    // Gerar últimos 12 meses
    const porMes: { mes: string; dias: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mes = d.getMonth() + 1;
      const ano = d.getFullYear();
      const key = `${ano}-${mes}`;
      const label = `${mesesNomes[mes - 1]}/${ano.toString().slice(2)}`;
      porMes.push({ mes: label, dias: porMesMap[key] || 0 });
    }

    // Cobertura vacinal por empresa
    const ativosComVacinaPorEmpresa = await Vacinacao.aggregate([
      {
        $lookup: {
          from: 'trabalhadores',
          localField: 'trabalhadorId',
          foreignField: '_id',
          as: 'trabalhadorData',
        },
      },
      { $unwind: '$trabalhadorData' },
      {
        $match: {
          'trabalhadorData.vinculo.situacao': 'Ativo',
          'trabalhadorData.empresa': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: { empresa: '$trabalhadorData.empresa', trabalhador: '$trabalhadorId' },
        },
      },
      {
        $group: {
          _id: '$_id.empresa',
          totalComVacina: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'empresas',
          localField: '_id',
          foreignField: '_id',
          as: 'empresaData',
        },
      },
      { $unwind: { path: '$empresaData', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          empresaId: '$_id',
          totalComVacina: 1,
          nomeEmpresa: '$empresaData.razaoSocial',
        },
      },
    ]);

    const mapVacina = new Map<string, number>(
      ativosComVacinaPorEmpresa.map((item: any) => [
        item.empresaId?.toString?.() ?? String(item.empresaId),
        item.totalComVacina,
      ])
    );

    const porEmpresa = totalAtivosPorEmpresa
      .map((item: any) => {
        const empresaKey = item.empresaId?.toString?.() ?? String(item.empresaId);
        const totalAtivos = item.totalAtivos ?? 0;
        const totalComVacina = mapVacina.get(empresaKey) ?? 0;
        const cobertura = totalAtivos > 0 ? Math.round((totalComVacina / totalAtivos) * 100) : 0;
        return { nome: item.nomeEmpresa || 'Sem empresa', cobertura };
      })
      .sort((a: any, b: any) => (b.cobertura ?? 0) - (a.cobertura ?? 0));

    // Mes atual e anterior
    const now = new Date();
    const mesAtual = now.getMonth() + 1;
    const anoAtual = now.getFullYear();
    const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
    const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;

    const diasMesAtual = porMesMap[`${anoAtual}-${mesAtual}`] || 0;
    const diasMesAnterior = porMesMap[`${anoAnterior}-${mesAnterior}`] || 0;

    let variacao = 0;
    if (diasMesAnterior > 0) {
      variacao = Math.round(((diasMesAtual - diasMesAnterior) / diasMesAnterior) * 100);
    } else if (diasMesAtual > 0) {
      variacao = 100;
    }

    const result: IMonitoramentoClinico = {
      coberturaVacinal: {
        total: totalTrabalhadores > 0
          ? Math.round((trabalhadoresComVacina.length / totalTrabalhadores) * 100)
          : 0,
        porEmpresa,
      },
      absenteismo: { totalDias: diasMesAtual, variacao, porMes },
      alertasCriticos,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }

  private async obterIdsTrabalhadoresSus(): Promise<string[]> {
    const unidadesSus = await Unidade.find({
      esferaAdministrativa: { $in: ['municipal', 'estadual', 'federal', 'misto'] },
    }).select('_id').lean();

    const unidadeIds = unidadesSus.map(u => u._id);

    const trabalhadores = await Trabalhador.find({
      unidade: { $in: unidadeIds },
    }).select('_id').lean();

    return trabalhadores.map(t => t._id.toString());
  }
}

export default new AnalyticsService();
