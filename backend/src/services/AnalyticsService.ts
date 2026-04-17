import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';

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
}

export class AnalyticsService {
  /**
   * Obtém KPIs gerais do sistema
   */
  async obterKPIs(): Promise<IKPIData> {
    const totalAcidentes = await Acidente.countDocuments();
    const acidentesAbertos = await Acidente.countDocuments({ status: 'Aberto' });
    const acidentesEmAnalise = await Acidente.countDocuments({ status: 'Em Análise' });
    const acidentesFechados = await Acidente.countDocuments({ status: 'Fechado' });
    
    // Taxa de resolução (acidentes fechados / total * 100)
    const taxaResolucao = totalAcidentes > 0 
      ? Math.round((acidentesFechados / totalAcidentes) * 100) 
      : 0;

    const totalTrabalhadores = await User.countDocuments({ perfil: 'trabalhador', ativo: true });
    
    const totalDoencas = await Doenca.countDocuments();
    const doencasAtivas = await Doenca.countDocuments({ ativo: true });
    
    const totalVacinacoes = await Vacinacao.countDocuments();
    
    // Próximas vacinações (próximos 30 dias ou já vencidas)
    const hoje = new Date();
    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() + 30);
    
    const proximasVacinacoes = await Vacinacao.countDocuments({
      proximoDose: { $lte: trintaDias },
    });

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
    };
  }

  /**
   * Obtém dados para gráficos de acidentes
   */
  async obterDadosAcidentes() {
    // Acidentes por tipo
    const porTipoAgg = await Acidente.aggregate([
      {
        $group: {
          _id: '$tipoAcidente',
          valor: { $sum: 1 },
        },
      },
      { $sort: { valor: -1 } },
    ]);

    const porTipo = porTipoAgg.map((item: any) => ({
      nome: item._id || 'Não informado',
      valor: item.valor,
    }));

    // Acidentes por status
    const porStatusAgg = await Acidente.aggregate([
      {
        $group: {
          _id: '$status',
          valor: { $sum: 1 },
        },
      },
      { $sort: { valor: -1 } },
    ]);

    const porStatus = porStatusAgg.map((item: any) => ({
      nome: item._id || 'Não informado',
      valor: item.valor,
    }));

    // Últimos 6 meses
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const ultimosMesesAgg = await Acidente.aggregate([
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
    const kpis = await this.obterKPIs();
    const dadosAcidentes = await this.obterDadosAcidentes();
    const proximasVacinacoes = await this.obterProximasVacinacoes(30);
    const ultimosAcidentes = await this.obterUltimosAcidentes(5);

    // Trabalhadores por empresa
    const trabalhadoresPorEmpresa = await User.aggregate([
      { $match: { perfil: 'trabalhador', ativo: true } },
      {
        $lookup: {
          from: 'empresas',
          localField: 'empresa',
          foreignField: '_id',
          as: 'empresaData',
        },
      },
      {
        $group: {
          _id: '$empresaData.razaoSocial',
          total: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    const empresasFormatadas = trabalhadoresPorEmpresa.map((item: any) => ({
      nome: item._id?.[0] || 'Sem empresa',
      total: item.total,
    }));

    return {
      kpis,
      graficos: {
        acidentesPorTipo: dadosAcidentes.porTipo,
        acidentesPorStatus: dadosAcidentes.porStatus,
        acidentesUltimosMeses: dadosAcidentes.ultimosMeses,
        trabalhadoresPorEmpresa: empresasFormatadas,
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
}

export default new AnalyticsService();
