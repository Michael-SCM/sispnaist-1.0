import api from './api.js';
import { ITrabalhadorDependente, ITrabalhadorAfastamento, ITrabalhadorVinculo, ITrabalhadorOcorrenciaViolencia, ITrabalhadorReadaptacao, ITrabalhadorProcessoTrabalho } from '../types';

const SUBMODULOS = {
  dependentes: 'dependentes',
  afastamentos: 'afastamentos',
  ocorrenciasViolencia: 'ocorrenciasViolencia',
  readaptacoes: 'readaptacoes',
  processosTrabalho: 'processosTrabalho',
  vinculos: 'vinculos'
} as const;

export const submoduloTrabalhadorService = {
  // DEPENDENTES
  listarDependentes: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorDependente[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorDependente[]>(
      `/trabalhadores/${trabalhadorId}/dependentes?${params.toString()}`
    );
    return response.data;
  },

  criarDependente: async (trabalhadorId: string, data: Partial<ITrabalhadorDependente>): Promise<ITrabalhadorDependente> => {
    const response = await api.post<ITrabalhadorDependente>(
      `/trabalhadores/${trabalhadorId}/dependentes`,
      data
    );
    return response.data;
  },

  atualizarDependente: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorDependente>): Promise<ITrabalhadorDependente> => {
    const response = await api.put<ITrabalhadorDependente>(
      `/trabalhadores/${trabalhadorId}/dependentes/${itemId}`,
      data
    );
    return response.data;
  },

  deletarDependente: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/dependentes/${itemId}`);
  },

  // AFASTAMENTOS
  listarAfastamentos: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorAfastamento[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorAfastamento[]>(
      `/trabalhadores/${trabalhadorId}/afastamentos?${params.toString()}`
    );
    return response.data;
  },

  criarAfastamento: async (trabalhadorId: string, data: Partial<ITrabalhadorAfastamento>): Promise<ITrabalhadorAfastamento> => {
    const response = await api.post<ITrabalhadorAfastamento>(
      `/trabalhadores/${trabalhadorId}/afastamentos`,
      data
    );
    return response.data;
  },

  atualizarAfastamento: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorAfastamento>): Promise<ITrabalhadorAfastamento> => {
    const response = await api.put<ITrabalhadorAfastamento>(
      `/trabalhadores/${trabalhadorId}/afastamentos/${itemId}`,
      data
    );
    return response.data;
  },

  deletarAfastamento: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/afastamentos/${itemId}`);
  },

  // VÍNCULOS
  listarVinculos: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorVinculo[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorVinculo[]>(
      `/trabalhadores/${trabalhadorId}/vinculos?${params.toString()}`
    );
    return response.data;
  },

  criarVinculo: async (trabalhadorId: string, data: Partial<ITrabalhadorVinculo>): Promise<ITrabalhadorVinculo> => {
    const response = await api.post<ITrabalhadorVinculo>(
      `/trabalhadores/${trabalhadorId}/vinculos`,
      data
    );
    return response.data;
  },

  atualizarVinculo: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorVinculo>): Promise<ITrabalhadorVinculo> => {
    const response = await api.put<ITrabalhadorVinculo>(
      `/trabalhadores/${trabalhadorId}/vinculos/${itemId}`,
      data
    );
    return response.data;
  },

  deletarVinculo: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/vinculos/${itemId}`);
  },

  // OCORRÊNCIAS DE VIOLÊNCIA
  listarOcorrenciasViolencia: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorOcorrenciaViolencia[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorOcorrenciaViolencia[]>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia?${params.toString()}`
    );
    return response.data;
  },

  criarOcorrenciaViolencia: async (trabalhadorId: string, data: Partial<ITrabalhadorOcorrenciaViolencia>): Promise<ITrabalhadorOcorrenciaViolencia> => {
    const response = await api.post<ITrabalhadorOcorrenciaViolencia>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia`,
      data
    );
    return response.data;
  },

  atualizarOcorrenciaViolencia: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorOcorrenciaViolencia>): Promise<ITrabalhadorOcorrenciaViolencia> => {
    const response = await api.put<ITrabalhadorOcorrenciaViolencia>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia/${itemId}`,
      data
    );
    return response.data;
  },

  deletarOcorrenciaViolencia: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/ocorrenciasViolencia/${itemId}`);
  },

  // READAPTAÇÕES
  listarReadaptacoes: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorReadaptacao[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorReadaptacao[]>(
      `/trabalhadores/${trabalhadorId}/readaptacoes?${params.toString()}`
    );
    return response.data;
  },

  criarReadaptacao: async (trabalhadorId: string, data: Partial<ITrabalhadorReadaptacao>): Promise<ITrabalhadorReadaptacao> => {
    const response = await api.post<ITrabalhadorReadaptacao>(
      `/trabalhadores/${trabalhadorId}/readaptacoes`,
      data
    );
    return response.data;
  },

  atualizarReadaptacao: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorReadaptacao>): Promise<ITrabalhadorReadaptacao> => {
    const response = await api.put<ITrabalhadorReadaptacao>(
      `/trabalhadores/${trabalhadorId}/readaptacoes/${itemId}`,
      data
    );
    return response.data;
  },

  deletarReadaptacao: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/readaptacoes/${itemId}`);
  },

  // PROCESSOS DE TRABALHO
  listarProcessosTrabalho: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorProcessoTrabalho[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorProcessoTrabalho[]>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho?${params.toString()}`
    );
    return response.data;
  },

  criarProcessoTrabalho: async (trabalhadorId: string, data: Partial<ITrabalhadorProcessoTrabalho>): Promise<ITrabalhadorProcessoTrabalho> => {
    const response = await api.post<ITrabalhadorProcessoTrabalho>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho`,
      data
    );
    return response.data;
  },

  atualizarProcessoTrabalho: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorProcessoTrabalho>): Promise<ITrabalhadorProcessoTrabalho> => {
    const response = await api.put<ITrabalhadorProcessoTrabalho>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho/${itemId}`,
      data
    );
    return response.data;
  },

  deletarProcessoTrabalho: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/processosTrabalho/${itemId}`);
  },
};
