import api from './api.js';
import { IPadraoEmail } from '../types/index.js';

interface ListarPadroesResponse {
  data: IPadraoEmail[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const emailService = {
  listarPadroes: async (
    page: number = 1,
    limit: number = 20,
    filtros?: { ativo?: boolean; categoria?: string }
  ): Promise<ListarPadroesResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());
    if (filtros?.categoria) params.append('categoria', filtros.categoria);

    const response = await api.get<{ data: ListarPadroesResponse }>(
      `/emails/padroes?${params.toString()}`
    );
    return response.data.data;
  },

  obterPadrao: async (id: string): Promise<IPadraoEmail> => {
    const response = await api.get<{ data: IPadraoEmail }>(`/emails/padroes/${id}`);
    return response.data.data;
  },

  criarPadrao: async (data: Partial<IPadraoEmail>): Promise<IPadraoEmail> => {
    const response = await api.post<{ data: IPadraoEmail }>('/emails/padroes', data);
    return response.data.data;
  },

  atualizarPadrao: async (id: string, data: Partial<IPadraoEmail>): Promise<IPadraoEmail> => {
    const response = await api.put<{ data: IPadraoEmail }>(`/emails/padroes/${id}`, data);
    return response.data.data;
  },

  deletarPadrao: async (id: string): Promise<void> => {
    await api.delete(`/emails/padroes/${id}`);
  },

  // Envio de email (placeholder)
  enviar: async (destinatario: string, assunto: string, conteudo: string): Promise<{ mensagem: string }> => {
    const response = await api.post<{ mensagem: string }>('/emails/enviar', {
      destinatario,
      assunto,
      conteudo,
    });
    return response.data;
  },
};
