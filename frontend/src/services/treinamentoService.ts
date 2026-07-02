import api from './api';
import { IProgressoTreinamento, ICertificado, IResultadoQuiz } from '../types';

export const treinamentoService = {
  obterProgresso: async (videoAulaId: string): Promise<IProgressoTreinamento> => {
    const response = await api.get<IProgressoTreinamento>(`/treinamento/progresso/${videoAulaId}`);
    return response.data;
  },

  listarProgresso: async (): Promise<IProgressoTreinamento[]> => {
    const response = await api.get<{ data: IProgressoTreinamento[] }>('/treinamento/progresso');
    return response.data.data;
  },

  marcarAssistido: async (videoAulaId: string): Promise<IProgressoTreinamento> => {
    const response = await api.post<IProgressoTreinamento>(`/treinamento/progresso/${videoAulaId}/assistir`);
    return response.data;
  },

  alternarFavorito: async (videoAulaId: string): Promise<IProgressoTreinamento> => {
    const response = await api.post<IProgressoTreinamento>(`/treinamento/progresso/${videoAulaId}/favorito`);
    return response.data;
  },

  submeterQuiz: async (videoAulaId: string, respostas: number[]): Promise<IResultadoQuiz> => {
    const response = await api.post<IResultadoQuiz>(`/treinamento/progresso/${videoAulaId}/quiz`, { respostas });
    return response.data;
  },

  emitirCertificado: async (videoAulaId: string): Promise<ICertificado> => {
    const response = await api.post<ICertificado>(`/treinamento/progresso/${videoAulaId}/certificado`);
    return response.data;
  },

  listarCertificados: async (): Promise<ICertificado[]> => {
    const response = await api.get<{ data: ICertificado[] }>('/treinamento/certificados');
    return response.data.data;
  },

  obterCertificado: async (id: string): Promise<ICertificado> => {
    const response = await api.get<ICertificado>(`/treinamento/certificados/${id}`);
    return response.data;
  }
};
