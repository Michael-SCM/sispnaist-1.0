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
 * Exporta trabalhadores em formato PDF corporativo
 * Faz fetch da rota /export/trabalhadores/pdf, recebe o blob de PDF
 * e dispara o download no navegador
 */
export const exportTrabalhadores = async (): Promise<void> => {
  try {
    const response = await api.get('/export/trabalhadores/pdf', {
      responseType: 'blob', // Importante: diz ao axios para tratar como binary
    });

    // Nome do arquivo do header Content-Disposition ou gerado automaticamente
    const filename =
      getFilenameFromContentDisposition(response.headers['content-disposition']) ??
      `relatorio_trabalhadores_${new Date().toISOString().split('T')[0]}.pdf`;

    // Dispara o download no navegador
    downloadBlob(response.data, filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao gerar relatório PDF');
  }
};

/**
 * Exporta acidentes em formato PDF corporativo
 */
export const exportAcidentes = async (): Promise<void> => {
  try {
    const response = await api.get('/export/acidentes/pdf', {
      responseType: 'blob',
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
 */
export const exportDoencas = async (): Promise<void> => {
  try {
    const response = await api.get('/export/doencas/pdf', {
      responseType: 'blob',
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
 * Exporta vaccineções em formato PDF corporativo
 */
export const exportVacinacoes = async (): Promise<void> => {
  try {
    const response = await api.get('/export/vacinacoes/pdf', {
      responseType: 'blob',
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