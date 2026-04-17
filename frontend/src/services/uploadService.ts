import api from './api.js';
import { IArquivoUpload } from '../types/index.js';

interface ListarUploadsResponse {
  data: IArquivoUpload[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const uploadService = {
  listar: async (
    page: number = 1,
    limit: number = 20,
    filtros?: { entidade?: string; entidadeId?: string }
  ): Promise<ListarUploadsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (filtros?.entidade) params.append('entidade', filtros.entidade);
    if (filtros?.entidadeId) params.append('entidadeId', filtros.entidadeId);

    const response = await api.get<{ data: ListarUploadsResponse }>(
      `/uploads?${params.toString()}`
    );
    return response.data.data;
  },

  obter: async (id: string): Promise<IArquivoUpload> => {
    const response = await api.get<{ data: IArquivoUpload }>(`/uploads/${id}`);
    return response.data.data;
  },

  // Upload de arquivo (multipart/form-data)
  criar: async (
    file: File,
    entidade: string,
    entidadeId: string,
    descricao?: string
  ): Promise<IArquivoUpload> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entidade', entidade);
    formData.append('entidadeId', entidadeId);
    if (descricao) formData.append('descricao', descricao);

    const response = await api.post<{ data: IArquivoUpload }>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Download
  download: async (id: string): Promise<void> => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/uploads/${id}/download`, '_blank');
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/uploads/${id}`);
  },
};
