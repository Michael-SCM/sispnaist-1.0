import api from './api';

const getFilenameFromContentDisposition = (contentDisposition?: string | null): string | null => {
  if (!contentDisposition) return null;

  // ex: attachment; filename="relatorio_2026-01-01.pdf"
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
  if (match?.[1]) return decodeURIComponent(match[1]);

  const match2 = contentDisposition.match(/filename=["']?([^"';\n]+)["']?/i);
  return match2?.[1] ?? null;
};

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

export const exportAcidentes = async (): Promise<void> => {
  const response = await api.get('/export/acidentes', { responseType: 'blob' });

  const filename =
    getFilenameFromContentDisposition(response.headers['content-disposition']) ??
    `acidentes_${new Date().toISOString().split('T')[0]}`;

  downloadBlob(response.data, filename);
};

export const exportTrabalhadores = async (): Promise<void> => {
  const response = await api.get('/export/trabalhadores', { responseType: 'blob' });

  const filename =
    getFilenameFromContentDisposition(response.headers['content-disposition']) ??
    `trabalhadores_${new Date().toISOString().split('T')[0]}`;

  downloadBlob(response.data, filename);
};
