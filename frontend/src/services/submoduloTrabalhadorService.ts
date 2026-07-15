import api from './api.js';
import { ITrabalhadorDependente, ITrabalhadorAfastamento, ITrabalhadorVinculo, ITrabalhadorOcorrenciaViolencia, ITrabalhadorReadaptacao, ITrabalhadorProcessoTrabalho, ITrabalhadorHistoricoPPP, ITrabalhadorRiscoOcupacional, ITrabalhadorExameSaude, ITrabalhadorInternacao } from '../types';

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) return entry.data as T;
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

const SUBMODULOS = {
  dependentes: 'dependentes',
  afastamentos: 'afastamentos',
  ocorrenciasViolencia: 'ocorrenciasViolencia',
  readaptacoes: 'readaptacoes',
  processosTrabalho: 'processosTrabalho',
  vinculos: 'vinculos',
  historicoPPP: 'historicoPPP'
} as const;

const SUBMODULOS_CRUD = {
  examesSaude: 'examesSaude',
  internacoes: 'internacoes',
} as const;

export const submoduloTrabalhadorService = {
  // HISTÓRICO LABORAL / PPP
  obterHistoricoPPP: async (trabalhadorId: string, itemId: string): Promise<ITrabalhadorHistoricoPPP> => {
    const response = await api.get<ITrabalhadorHistoricoPPP>(
      `/trabalhadores/${trabalhadorId}/historicoPPP/${itemId}`
    );
    return response.data;
  },

  listarHistoricoPPP: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorHistoricoPPP[]> => {
    const key = `historicoPPP-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorHistoricoPPP[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorHistoricoPPP[]>(
      `/trabalhadores/${trabalhadorId}/historicoPPP?${params.toString()}`
    );
    setCache(key, response.data);
    return response.data;
  },

  criarHistoricoPPP: async (trabalhadorId: string, data: Partial<ITrabalhadorHistoricoPPP>): Promise<ITrabalhadorHistoricoPPP> => {
    const response = await api.post<ITrabalhadorHistoricoPPP>(
      `/trabalhadores/${trabalhadorId}/historicoPPP`,
      data
    );
    return response.data;
  },

  atualizarHistoricoPPP: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorHistoricoPPP>): Promise<ITrabalhadorHistoricoPPP> => {
    const response = await api.put<ITrabalhadorHistoricoPPP>(
      `/trabalhadores/${trabalhadorId}/historicoPPP/${itemId}`,
      data
    );
    return response.data;
  },

  deletarHistoricoPPP: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/historicoPPP/${itemId}`);
  },

  // DEPENDENTES
  // DEPENDENTES
  listarDependentes: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorDependente[]> => {
    const key = `dependentes-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorDependente[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorDependente[]>(
      `/trabalhadores/${trabalhadorId}/dependentes?${params.toString()}`
    );
    setCache(key, response.data);
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
    const key = `afastamentos-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorAfastamento[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorAfastamento[]>(
      `/trabalhadores/${trabalhadorId}/afastamentos?${params.toString()}`
    );
    setCache(key, response.data);
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
  obterVinculo: async (trabalhadorId: string, vinculoId: string): Promise<ITrabalhadorVinculo> => {
    const response = await api.get<ITrabalhadorVinculo>(
      `/trabalhadores/${trabalhadorId}/vinculos/${vinculoId}`
    );
    return response.data;
  },

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
    const key = `ocorrenciasViolencia-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorOcorrenciaViolencia[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorOcorrenciaViolencia[]>(
      `/trabalhadores/${trabalhadorId}/ocorrenciasViolencia?${params.toString()}`
    );
    setCache(key, response.data);
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
    const key = `readaptacoes-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorReadaptacao[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorReadaptacao[]>(
      `/trabalhadores/${trabalhadorId}/readaptacoes?${params.toString()}`
    );
    setCache(key, response.data);
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
    const key = `processosTrabalho-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorProcessoTrabalho[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorProcessoTrabalho[]>(
      `/trabalhadores/${trabalhadorId}/processosTrabalho?${params.toString()}`
    );
    setCache(key, response.data);
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

  // RISCOS OCUPACIONAIS
  listarRiscosOcupacionais: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorRiscoOcupacional[]> => {
    const key = `riscosOcupacionais-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorRiscoOcupacional[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorRiscoOcupacional[]>(
      `/trabalhadores/${trabalhadorId}/riscosOcupacionais?${params.toString()}`
    );
    setCache(key, response.data);
    return response.data;
  },

  criarRiscoOcupacional: async (trabalhadorId: string, data: Partial<ITrabalhadorRiscoOcupacional>): Promise<ITrabalhadorRiscoOcupacional> => {
    const response = await api.post<ITrabalhadorRiscoOcupacional>(
      `/trabalhadores/${trabalhadorId}/riscosOcupacionais`,
      data
    );
    return response.data;
  },

  atualizarRiscoOcupacional: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorRiscoOcupacional>): Promise<ITrabalhadorRiscoOcupacional> => {
    const response = await api.put<ITrabalhadorRiscoOcupacional>(
      `/trabalhadores/${trabalhadorId}/riscosOcupacionais/${itemId}`,
      data
    );
    return response.data;
  },

  deletarRiscoOcupacional: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/riscosOcupacionais/${itemId}`);
  },

  // EXAMES DE SAÚDE (ASO / S-2220)
  obterExameSaude: async (trabalhadorId: string, itemId: string): Promise<ITrabalhadorExameSaude> => {
    const response = await api.get<ITrabalhadorExameSaude>(
      `/trabalhadores/${trabalhadorId}/examesSaude/${itemId}`
    );
    return response.data;
  },

  listarExamesSaude: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorExameSaude[]> => {
    const key = `examesSaude-${trabalhadorId}-${ativo}`;
    const cached = getCached<ITrabalhadorExameSaude[]>(key);
    if (cached) return cached;
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorExameSaude[]>(
      `/trabalhadores/${trabalhadorId}/examesSaude?${params.toString()}`
    );
    setCache(key, response.data);
    return response.data;
  },

  criarExameSaude: async (trabalhadorId: string, data: Partial<ITrabalhadorExameSaude>): Promise<ITrabalhadorExameSaude> => {
    const response = await api.post<ITrabalhadorExameSaude>(
      `/trabalhadores/${trabalhadorId}/examesSaude`,
      data
    );
    return response.data;
  },

  atualizarExameSaude: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorExameSaude>): Promise<ITrabalhadorExameSaude> => {
    const response = await api.put<ITrabalhadorExameSaude>(
      `/trabalhadores/${trabalhadorId}/examesSaude/${itemId}`,
      data
    );
    return response.data;
  },

  deletarExameSaude: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/examesSaude/${itemId}`);
  },

  // INTERNAÇÕES (SIH)
  obterInternacao: async (trabalhadorId: string, itemId: string): Promise<ITrabalhadorInternacao> => {
    const response = await api.get<ITrabalhadorInternacao>(
      `/trabalhadores/${trabalhadorId}/internacoes/${itemId}`
    );
    return response.data;
  },

  listarInternacoes: async (trabalhadorId: string, ativo?: boolean): Promise<ITrabalhadorInternacao[]> => {
    const params = new URLSearchParams();
    if (ativo !== undefined) params.append('ativo', ativo.toString());
    const response = await api.get<ITrabalhadorInternacao[]>(
      `/trabalhadores/${trabalhadorId}/internacoes?${params.toString()}`
    );
    return response.data;
  },

  criarInternacao: async (trabalhadorId: string, data: Partial<ITrabalhadorInternacao>): Promise<ITrabalhadorInternacao> => {
    const response = await api.post<ITrabalhadorInternacao>(
      `/trabalhadores/${trabalhadorId}/internacoes`,
      data
    );
    return response.data;
  },

  atualizarInternacao: async (trabalhadorId: string, itemId: string, data: Partial<ITrabalhadorInternacao>): Promise<ITrabalhadorInternacao> => {
    const response = await api.put<ITrabalhadorInternacao>(
      `/trabalhadores/${trabalhadorId}/internacoes/${itemId}`,
      data
    );
    return response.data;
  },

  deletarInternacao: async (trabalhadorId: string, itemId: string): Promise<void> => {
    await api.delete(`/trabalhadores/${trabalhadorId}/internacoes/${itemId}`);
  },
};
