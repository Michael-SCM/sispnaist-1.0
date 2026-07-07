import Indicador, { IIndicador, IFormulaIndicador } from '../models/Indicador.js';
import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';

export interface IMetricaDisponivel {
  chave: string;
  nome: string;
  descricao: string;
  categoria: string;
}

const METRICAS_DISPONIVEIS: IMetricaDisponivel[] = [
  { chave: 'totalAcidentes', nome: 'Total de Acidentes', descricao: 'Número total de acidentes registrados', categoria: 'acidente' },
  { chave: 'acidentesAbertos', nome: 'Acidentes Abertos', descricao: 'Acidentes com status "Aberto"', categoria: 'acidente' },
  { chave: 'acidentesEmAnalise', nome: 'Acidentes em Análise', descricao: 'Acidentes com status "Em Análise"', categoria: 'acidente' },
  { chave: 'acidentesFechados', nome: 'Acidentes Fechados', descricao: 'Acidentes com status "Fechado"', categoria: 'acidente' },
  { chave: 'taxaResolucao', nome: 'Taxa de Resolução', descricao: 'Percentual de acidentes fechados sobre total', categoria: 'acidente' },
  { chave: 'totalTrabalhadores', nome: 'Total de Trabalhadores', descricao: 'Total de trabalhadores ativos', categoria: 'geral' },
  { chave: 'totalDoencas', nome: 'Total de Doenças', descricao: 'Número total de doenças registradas', categoria: 'doenca' },
  { chave: 'doencasAtivas', nome: 'Doenças Ativas', descricao: 'Doenças com status ativo', categoria: 'doenca' },
  { chave: 'totalVacinacoes', nome: 'Total de Vacinações', descricao: 'Número total de vacinações registradas', categoria: 'vacinacao' },
  { chave: 'proximasVacinacoes', nome: 'Próximas Vacinações', descricao: 'Vacinações com próximo dose nos próximos 30 dias', categoria: 'vacinacao' },
  { chave: 'coberturaVacinal', nome: 'Cobertura Vacinal', descricao: 'Percentual de trabalhadores com ao menos 1 vacina', categoria: 'vacinacao' },
  { chave: 'totalAbsenteismo', nome: 'Total de Absenteísmo', descricao: 'Total de dias de afastamento', categoria: 'absenteismo' },
  { chave: 'totalTrabalhadoresComDeficiencia', nome: 'Trabalhadores com Deficiência', descricao: 'Total de trabalhadores ativos com deficiência', categoria: 'geral' },
  { chave: 'percentualDeficiencia', nome: '% de Trabalhadores com Deficiência', descricao: 'Percentual de trabalhadores ativos com deficiência', categoria: 'geral' },
];

type MetricValues = Record<string, number>;

export class IndicadorService {
  async listar(filtro: Record<string, any> = {}): Promise<any[]> {
    const query: any = {};
    if (filtro.categoria) query.categoria = filtro.categoria;
    if (filtro.uf) query.uf = filtro.uf?.toString().toUpperCase();
    if (filtro.ativo === 'true') query.ativo = true;
    else if (filtro.ativo === 'false') query.ativo = false;
    if (filtro.nome) query.nome = { $regex: filtro.nome, $options: 'i' };

    return Indicador.find(query).sort({ ordem: 1, nome: 1 }).lean();
  }

  async obter(id: string): Promise<any | null> {
    return Indicador.findById(id).lean();
  }

  async criar(data: Partial<IIndicador>): Promise<IIndicador> {
    return Indicador.create(data);
  }

  async atualizar(id: string, data: Partial<IIndicador>): Promise<IIndicador | null> {
    return Indicador.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deletar(id: string): Promise<IIndicador | null> {
    return Indicador.findByIdAndDelete(id);
  }

  obterMetricasDisponiveis(): IMetricaDisponivel[] {
    return METRICAS_DISPONIVEIS;
  }

  async calcularValoresBase(uf?: string): Promise<MetricValues> {
    const filtroUf: any = {};
    if (uf) {
      filtroUf.$or = [
        { uf: { $exists: false } },
        { uf: null },
        { uf: '' }
      ];
    }

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
      totalTrabalhadoresComDeficiencia
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
      })
    ]);

    const taxaResolucao = totalAcidentes > 0
      ? Math.round((acidentesFechados / totalAcidentes) * 100)
      : 0;

    const coberturaVacinal = totalTrabalhadores > 0
      ? Math.round((trabalhadoresComVacina.length / totalTrabalhadores) * 100)
      : 0;

    const totalAbsenteismo = absenteismoAgg[0]?.total || 0;

    const percentualDeficiencia = totalTrabalhadores > 0
      ? Math.round((totalTrabalhadoresComDeficiencia / totalTrabalhadores) * 100)
      : 0;

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
      percentualDeficiencia
    };
  }

  avaliarFormula(formula: IFormulaIndicador, valores: MetricValues): number {
    switch (formula.type) {
      case 'simple': {
        const val = valores[formula.metric || ''];
        return val ?? 0;
      }
      case 'percentage': {
        const num = valores[formula.numerator || ''] ?? 0;
        const den = valores[formula.denominator || ''] ?? 0;
        if (den === 0) return 0;
        return Math.round((num / den) * 100);
      }
      case 'ratio': {
        const num = valores[formula.numerator || ''] ?? 0;
        const den = valores[formula.denominator || ''] ?? 0;
        if (den === 0) return 0;
        return Math.round((num / den) * 100) / 100;
      }
      case 'difference': {
        const m1 = valores[formula.metric1 || ''] ?? 0;
        const m2 = valores[formula.metric2 || ''] ?? 0;
        return m1 - m2;
      }
      default:
        return 0;
    }
  }

  async calcularIndicador(id: string, uf?: string): Promise<{ indicador: any; valor: number }> {
    const indicador = await Indicador.findById(id).lean();
    if (!indicador) return { indicador: null, valor: 0 };

    const valores = await this.calcularValoresBase(uf);
    const valor = this.avaliarFormula(indicador.formula as IFormulaIndicador, valores);

    return { indicador, valor };
  }

  async calcularTodos(uf?: string): Promise<Array<{ indicador: any; valor: number }>> {
    const indicadores = await Indicador.find({ ativo: true }).sort({ ordem: 1, nome: 1 }).lean();
    if (indicadores.length === 0) return [];

    const valores = await this.calcularValoresBase(uf);

    return indicadores.map(indicador => ({
      indicador,
      valor: this.avaliarFormula(indicador.formula as IFormulaIndicador, valores)
    }));
  }
}

export default new IndicadorService();
