import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import Trabalhador from '../models/Trabalhador.js';

const MIN_CELL = 3;

function suppressSmallValues(data: { nome: string; valor: number }[]): { nome: string; valor: number }[] {
  return data.map((item) => ({
    ...item,
    valor: item.valor < MIN_CELL && item.valor > 0 ? -1 : item.valor,
  }));
}

export class PublicReportService {
  async obterRelatorioConformidade() {
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    const trintaDias = new Date();
    trintaDias.setDate(trintaDias.getDate() + 30);

    const [
      totalTrabalhadores,
      totalAcidentes,
      acidentesAbertos,
      acidentesEmAnalise,
      acidentesFechados,
      totalDoencas,
      doencasAtivas,
      totalVacinacoes,
      proximasVacinacoes,
      trabalhadoresComVacina,
      acidentesPorTipo,
      acidentesPorStatus,
      acidentesUltimosMeses,
      acidentesPorEmpresa,
      doencasPorTipo,
    ] = await Promise.all([
      Trabalhador.countDocuments({ 'vinculo.situacao': 'Ativo' }),
      Acidente.countDocuments(),
      Acidente.countDocuments({ status: 'Aberto' }),
      Acidente.countDocuments({ status: 'Em Análise' }),
      Acidente.countDocuments({ status: 'Fechado' }),
      Doenca.countDocuments(),
      Doenca.countDocuments({ ativo: true }),
      Vacinacao.countDocuments(),
      Vacinacao.countDocuments({ proximoDose: { $lte: trintaDias } }),
      Vacinacao.distinct('trabalhadorId'),
      Acidente.aggregate([
        { $group: { _id: '$tipoAcidente', valor: { $sum: 1 } } },
        { $sort: { valor: -1 } },
      ]),
      Acidente.aggregate([
        { $group: { _id: '$status', valor: { $sum: 1 } } },
        { $sort: { valor: -1 } },
      ]),
      Acidente.aggregate([
        { $match: { dataAcidente: { $gte: seisMesesAtras } } },
        {
          $group: {
            _id: { ano: { $year: '$dataAcidente' }, mes: { $month: '$dataAcidente' } },
            quantidade: { $sum: 1 },
          },
        },
        { $sort: { '_id.ano': 1, '_id.mes': 1 } },
      ]),
      (async () => {
        const acidentes = await Acidente.find()
          .populate({
            path: 'trabalhadorId',
            select: 'empresa',
            populate: { path: 'empresa', select: 'razaoSocial' },
          })
          .lean();

        const mapa: Record<string, { nome: string; valor: number }> = {};
        for (const ac of acidentes as any[]) {
          const nome = ac.trabalhadorId?.empresa?.razaoSocial || 'Sem empresa';
          if (!mapa[nome]) mapa[nome] = { nome, valor: 0 };
          mapa[nome].valor++;
        }

        return Object.values(mapa).sort((a, b) => b.valor - a.valor);
      })(),
      Doenca.aggregate([
        { $group: { _id: '$nomeDoenca', valor: { $sum: 1 } } },
        { $sort: { valor: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const acidentesMeses: { mes: string; quantidade: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const data = new Date();
      data.setMonth(data.getMonth() - i);
      const mesIndex = data.getMonth();
      const ano = data.getFullYear();
      const mesLabel = `${mesesNomes[mesIndex]}/${ano.toString().slice(2)}`;
      const encontrado = acidentesUltimosMeses.find(
        (item: any) => item._id.mes === mesIndex + 1 && item._id.ano === ano
      );
      acidentesMeses.push({
        mes: mesLabel,
        quantidade: encontrado ? encontrado.quantidade : 0,
      });
    }

    const taxaResolucao = totalAcidentes > 0
      ? Math.round((acidentesFechados / totalAcidentes) * 100)
      : 0;

    const coberturaVacinal = totalTrabalhadores > 0
      ? Math.round((trabalhadoresComVacina.length / totalTrabalhadores) * 100)
      : 0;

    const acidentesPorEmpresaFormatado = acidentesPorEmpresa as { nome: string; valor: number }[];

    return {
      kpis: {
        totalTrabalhadores,
        totalAcidentes,
        acidentesAbertos,
        acidentesFechados,
        taxaResolucao,
        totalDoencas,
        doencasAtivas,
        totalVacinacoes,
        proximasVacinacoes,
        coberturaVacinal,
      },
      acidentes: {
        porTipo: suppressSmallValues(
          acidentesPorTipo.map((item: any) => ({ nome: item._id || 'Não informado', valor: item.valor }))
        ),
        porStatus: suppressSmallValues(
          acidentesPorStatus.map((item: any) => ({ nome: item._id || 'Não informado', valor: item.valor }))
        ),
        ultimosMeses: acidentesMeses,
        porEmpresa: acidentesPorEmpresaFormatado,
      },
      doencas: {
        total: totalDoencas,
        ativas: doencasAtivas,
        maisFrequentes: suppressSmallValues(
          doencasPorTipo.map((item: any) => ({ nome: item._id || 'Não informado', valor: item.valor }))
        ),
      },
      coberturaVacinal: {
        total: coberturaVacinal,
      },
      dataReferencia: new Date().toISOString(),
    };
  }
}

export default new PublicReportService();
