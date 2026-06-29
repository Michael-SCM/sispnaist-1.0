import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface IRelatorioConformidade {
  kpis: {
    totalTrabalhadores: number;
    totalAcidentes: number;
    acidentesAbertos: number;
    acidentesFechados: number;
    taxaResolucao: number;
    totalDoencas: number;
    doencasAtivas: number;
    totalVacinacoes: number;
    proximasVacinacoes: number;
    coberturaVacinal: number;
  };
  acidentes: {
    porTipo: { nome: string; valor: number }[];
    porStatus: { nome: string; valor: number }[];
    ultimosMeses: { mes: string; quantidade: number }[];
    porEmpresa: { nome: string; valor: number }[];
  };
  doencas: {
    total: number;
    ativas: number;
    maisFrequentes: { nome: string; valor: number }[];
  };
  coberturaVacinal: {
    total: number;
  };
  dataReferencia: string;
}

export const publicReportService = {
  obterRelatorio: async (): Promise<IRelatorioConformidade> => {
    const response = await axios.get<{ status: string; data: IRelatorioConformidade }>(
      `${API_BASE_URL}/public/reports/conformidade`
    );
    return response.data.data;
  },
};
