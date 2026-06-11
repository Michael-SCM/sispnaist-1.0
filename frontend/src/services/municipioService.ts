import api from './api.js';

export interface Municipio {
  n: string;
  u: string;
}

export const municipioService = {
  buscar: async (q: string): Promise<Municipio[]> => {
    if (!q || q.length < 2) return [];
    const response = await api.get<Municipio[]>(`/municipios?q=${encodeURIComponent(q)}`);
    return response.data;
  },
};
