import api from './api';

/**
 * Extrai o filename do header Content-Disposition
 */
const getFilenameFromContentDisposition = (contentDisposition?: string | null): string | null => {
  if (!contentDisposition) return null;

  // ex: attachment; filename="relatorio_2026-01-01.pdf"
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
  if (match?.[1]) return decodeURIComponent(match[1]);

  const match2 = contentDisposition.match(/filename=["']?([^"';\n]+)["']?/i);
  return match2?.[1] ?? null;
};

/**
 * Dispara o download de um blob no navegador do usuário
 */
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

/**
 * Remove chaves undefined/null/'' de um objeto de filtros
 */
const cleanParams = (filtros?: Record<string, any>): Record<string, any> | undefined => {
  if (!filtros) return undefined;
  const params: Record<string, any> = {};
  for (const [key, value] of Object.entries(filtros)) {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value instanceof Boolean ? value.toString() : value;
    }
  }
  return Object.keys(params).length > 0 ? params : undefined;
};

/**
 * Exporta trabalhadores em formato PDF corporativo
 * Aceita filtros opcionais para restringir os dados exportados
 */
export const exportTrabalhadores = async (filtros?: Record<string, any>): Promise<void> => {
  try {
    const response = await api.get('/export/trabalhadores/pdf', {
      responseType: 'blob',
      params: cleanParams(filtros),
    });

    const filename =
      getFilenameFromContentDisposition(response.headers['content-disposition']) ??
      `relatorio_trabalhadores_${new Date().toISOString().split('T')[0]}.pdf`;

    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF');
  }
};

/**
 * Exporta acidentes em formato PDF corporativo
 * Aceita filtros opcionais para restringir os dados exportados
 */
export const exportAcidentes = async (filtros?: Record<string, any>): Promise<void> => {
  try {
    const response = await api.get('/export/acidentes/pdf', {
      responseType: 'blob',
      params: cleanParams(filtros),
    });

    const filename =
      getFilenameFromContentDisposition(response.headers['content-disposition']) ??
      `relatorio_acidentes_${new Date().toISOString().split('T')[0]}.pdf`;

    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF de acidentes');
  }
};

/**
 * Exporta doenças em formato PDF corporativo
 * Aceita filtros opcionais para restringir os dados exportados
 */
export const exportDoencas = async (filtros?: Record<string, any>): Promise<void> => {
  try {
    const response = await api.get('/export/doencas/pdf', {
      responseType: 'blob',
      params: cleanParams(filtros),
    });

    const filename =
      getFilenameFromContentDisposition(response.headers['content-disposition']) ??
      `relatorio_doencas_${new Date().toISOString().split('T')[0]}.pdf`;

    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF de doenças');
  }
};

/**
 * Exporta vacinações em formato PDF corporativo
 * Aceita filtros opcionais para restringir os dados exportados
 */
export const exportVacinacoes = async (filtros?: Record<string, any>): Promise<void> => {
  try {
    const response = await api.get('/export/vacinacoes/pdf', {
      responseType: 'blob',
      params: cleanParams(filtros),
    });

    const filename =
      getFilenameFromContentDisposition(response.headers['content-disposition']) ??
      `relatorio_vacinacoes_${new Date().toISOString().split('T')[0]}.pdf`;

    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF de vacinações');
  }
};

/**
 * Exporta monitoramento clínico em formato PDF corporativo
 */
export const exportMonitoramento = async (): Promise<void> => {
  try {
    const response = await api.get('/export/monitoramento/pdf', {
      responseType: 'blob',
    });

    const filename =
      getFilenameFromContentDisposition(response.headers['content-disposition']) ??
      `relatorio_monitoramento_${new Date().toISOString().split('T')[0]}.pdf`;

    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF de monitoramento');
  }
};