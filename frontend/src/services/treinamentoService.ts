import api from './api';
import { IProgressoTreinamento, ICertificado, IResultadoQuiz, IInicioQuizResponse } from '../types';

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const getFilenameFromContentDisposition = (contentDisposition?: string | null): string | null => {
  if (!contentDisposition) return null;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
  if (match?.[1]) return decodeURIComponent(match[1]);
  const match2 = contentDisposition.match(/filename=["']?([^"';\n]+)["']?/i);
  return match2?.[1] ?? null;
};

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

  iniciarQuiz: async (videoAulaId: string): Promise<IInicioQuizResponse> => {
    const response = await api.post<IInicioQuizResponse>(`/treinamento/progresso/${videoAulaId}/iniciar-quiz`);
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
  },

  downloadCertificadoPdf: async (id: string): Promise<void> => {
    try {
      const response = await api.get(`/treinamento/certificados/${id}/pdf`, {
        responseType: 'blob',
      });
      const filename =
        getFilenameFromContentDisposition(response.headers['content-disposition']) ??
        `certificado_${id}.pdf`;
      downloadBlob(response.data, filename);
    } catch (error) {
      console.error('Erro ao baixar certificado PDF:', error);
      throw new Error('Falha ao baixar certificado');
    }
  }
};
