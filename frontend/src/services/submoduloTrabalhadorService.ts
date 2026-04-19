import api from './api.js';
import { ITrabalhadorDependente, ITrabalhadorAfastamento, ITrabalhadorOcorrenciaViolencia, ITrabalhadorReadaptacao, ITrabalhadorProcessoTrabalho } from '../types';

const SUBMODULOS = {
  dependentes: 'dependentes',
  afastamentos: 'afastamentos',
  ocorrenciasViolencia: 'ocorrenciasViolencia',
  readaptacoes: 'readaptacoes',
  processosTrabalho: 'processosTrabalho'
} as const;

export const submoduloTrabalhadorService = {
  // DEPENDENTES
  listarDependentes: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorDependente[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<{ data: ITrabalhadorDependente[] }>(
      `/trabalhadores/${trabalhadorId}/dependentes?${params.toString()}`
    );
    return response.data.data;
  },

  criarDependente: async (trabalhadorId: string, data: Partial<ITrabalhadorDependente>): Promise<ITrabalhadorDependente> => {
    const response = await api.post<{ data: ITrabalhadorDependente }>(
      `/trabalhadores/${trabalhadorId}/dependentes`,
      data
    );
    return response.data.data;
  },

  atualizarDependente: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorDependente>): Promise<ITrabalhadorDependente> => {
    const response = await api.put<{ data: ITrabalhadorDependente }>(
      `/trabalhadores/${trabalhadorId}/dependentes/${itemId}`,
      data
    );
    return response.data.data;
  },

  deletarDependente: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/dependentes/${itemId}`);
  },

  // AFASTAMENTOS
  listarAfastamentos: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorAfastamento[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<{ data: ITrabalhadorAfastamento[] }>(
      `/trabalhadores/${trabalhadorId}/afastamentos?${params.toString()}`
    );
    return response.data.data;
  },

  criarAfastamento: async (trabalhadorId: string, data: Partial<ITrabalhadorAfastamento>): Promise<ITrabalhadorAfastamento> => {
    const response = await api.post<{ data: ITrabalhadorAfastamento }>(
      `/trabalhadores/${trabalhadorId}/afastamentos`,
      data
    );
    return response.data.data;
  },

  atualizarAfastamento: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorAfastamento>): Promise<ITrabalhadorAfastamento> => {
    const response = await api.put<{ data: ITrabalhadorAfastamento }>(
      `/trabalhadores/${trabalhadorId}/afastamentos/${itemId}`,
      data
    );
    return response.data.data;
  },

  deletarAfastamento: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/afastamentos/${itemId}`);
  },

  // OCORRÊNCIAS DE VIOLÊNCIA
  listarOcorrenciasViolencia: async (trabalhadorId: string): Promise<ITrabalhadorOcorrenciaViolencia[]> => {
    const response = await api.get<{ data: ITrabalhadorOcorrenciaViolencia[] }>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia`
    );
    return response.data.data;
  },

  criarOcorrenciaViolencia: async (trabalhadorId: string, data: Partial<ITrabalhadorOcorrenciaViolencia>): Promise<ITrabalhadorOcorrenciaViolencia> => {
    const response = await api.post<{ data: ITrabalhadorOcorrenciaViolencia }>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia`,
      data
    );
    return response.data.data;
  },

  atualizarOcorrenciaViolencia: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorOcorrenciaViolencia>): Promise<ITrabalhadorOcorrenciaViolencia> => {
    const response = await api.put<{ data: ITrabalhadorOcorrenciaViolencia }>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia/${itemId}`,
      data
    );
    return response.data.data;
  },

  deletarOcorrenciaViolencia: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/ocorrenciasViolencia/${itemId}`);
  },

  // READAPTAÇÕES
  listarReadaptacoes: async (trabalhadorId: string): Promise<ITrabalhadorReadaptacao[]> => {
    const response = await api.get<{ data: ITrabalhadorReadaptacao[] }>(
      `/trabalhadores/${trabalhadorId}/readaptacoes`
    );
    return response.data.data;
  },

  criarReadaptacao: async (trabalhadorId: string, data: Partial<ITrabalhadorReadaptacao>): Promise<ITrabalhadorReadaptacao> => {
    const response = await api.post<{ data: ITrabalhadorReadaptacao }>(
      `/trabalhadores/${trabalhadorId}/readaptacoes`,
      data
    );
    return response.data.data;
  },

  atualizarReadaptacao: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorReadaptacao>): Promise<ITrabalhadorReadaptacao> => {
    const response = await api.put<{ data: ITrabalhadorReadaptacao }>(
      `/trabalhadores/${trabalhadorId}/readaptacoes/${itemId}`,
      data
    );
    return response.data.data;
  },

  deletarReadaptacao: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/readaptacoes/${itemId}`);
  },

  // PROCESSOS DE TRABALHO
  listarProcessosTrabalho: async (trabalhadorId: string): Promise<ITrabalhadorProcessoTrabalho[]> => {
    const response = await api.get<{ data: ITrabalhadorProcessoTrabalho[] }>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho`
    );
    return response.data.data;
  },

  criarProcessoTrabalho: async (trabalhadorId: string, data: Partial<ITrabalhadorProcessoTrabalho>): Promise<ITrabalhadorProcessoTrabalho> => {
    const response = await api.post<{ data: ITrabalhadorProcessoTrabalho }>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho`,
      data
    );
    return response.data.data;
  },

  atualizarProcessoTrabalho: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorProcessoTrabalho>): Promise<ITrabalhadorProcessoTrabalho> => {
    const response = await api.put<{ data: ITrabalhadorProcessoTrabalho }>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho/${itemId}`,
      data
    );
    return response.data.data;
  },

  deletarProcessoTrabalho: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/processosTrabalho/${itemId}`);
  },
};
