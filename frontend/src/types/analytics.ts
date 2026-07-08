// Analytics types para frontend
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
  totalUnidadesSus: number;
  unidadesSusComPgr: number;
  percentualUnidadesSusComPgr: number;
  totalTrabalhadoresSus: number;
  trabalhadoresSusDoencaOcupacional: number;
  percentualTrabalhadoresSusDoencaOcupacional: number;
  municipiosHabilitadosPnaist: number;
  percentualMunicipiosHabilitadosPnaist: number;
  totalAtosMunicipais: number;
  atosMunicipaisClassificadosSst: number;
  percentualAtosMunicipaisClassificadosSst: number;
}

export interface IGraficoDados {
  nome: string;
  valor: number;
}

export interface IMensalDados {
  mes: string;
  quantidade: number;
}

export interface IEmpresaDados {
  nome: string;
  total: number;
  percentual?: number;
}

export interface IAnalyticsDadosAcidentes {
  porTipo: IGraficoDados[];
  porStatus: IGraficoDados[];
  ultimosMeses: IMensalDados[];
}

export interface IVacinacaoProxima {
  _id: string;
  trabalhadorId: any;
  vacina: string;
  dataVacinacao: string;
  proximoDose: string;
  unidadeSaude?: string;
  profissional?: string;
  status: 'Vencida' | 'Vence em breve' | 'Em dia';
  diasRestantes: number;
}

export interface IAnalyticsDashboardAdmin {
  kpis: IKPIData;
  graficos: {
    acidentesPorTipo: IGraficoDados[];
    acidentesPorStatus: IGraficoDados[];
    acidentesUltimosMeses: IMensalDados[];
    trabalhadoresPorEmpresa: IEmpresaDados[];
    trabalhadoresMultiplosVinculos: IEmpresaDados[];
    deficienciaPorTipo: IGraficoDados[];
    afastadosPorTipoAcidente: IGraficoDados[];
  };
  tabelas: {
    proximasVacinacoes: IVacinacaoProxima[];
    ultimosAcidentes: any[];
  };
}

export interface IAnalyticsDashboardTrabalhador {
  resumo: {
    acidentes: number;
    doencasAtivas: number;
    totalVacinacoes: number;
  };
  proximaVacinacao: IVacinacaoProxima | null;
  vacinacaoVencida: IVacinacaoProxima | null;
  ultimosAcidentes: any[];
}
