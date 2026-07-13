import api from './api.js';

export interface Internacao {
  numeroAih: string;
  cnesHospital: string;
  nomeHospital: string;
  dataInternacao: string;
  dataAlta: string;
  cidPrincipal: string;
  descricaoCid: string;
  caraterAtendimento: string;
  valorTotalAih: number;
}

export interface DadosSih {
  cartaoSus: string;
  nome: string;
  internacoes: Internacao[];
}

export const sihService = {
  buscarPorCns: async (cns: string): Promise<DadosSih> => {
    const response = await api.get(`/integracao/sih/${encodeURIComponent(cns)}`);
    return response.data.data;
  },
};
