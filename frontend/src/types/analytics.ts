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
