/**
 * Utilitários compartilhados para formulários
 */
export const formatDateBR = (dataString?: string | Date): string => {
  if (!dataString) return '';
  const date = new Date(dataString);
  if (isNaN(date.getTime())) return '';
  const dia = date.getDate().toString().padStart(2, '0');
  const mes = (date.getMonth() + 1).toString().padStart(2, '0');
  const ano = date.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

export const parseDateBR = (dataBR: string): string => {
  if (!dataBR) return '';
  const [dia, mes, ano] = dataBR.split('/');
  return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
};

/**
 * Utilitários compartilhados para páginas de formulários
 */
import React from 'react';
/**
 * Extrai CPF de um objeto trabalhador
 */
export const extrairCPF = (trabalhador: any): string => {
  if (typeof trabalhador === 'string') return trabalhador;
  if (trabalhador && typeof trabalhador === 'object' && trabalhador.cpf) {
    return trabalhador.cpf;
  }
  return '';
};

/**
 * Converte data local (YYYY-MM-DD) para objeto Date
 */
export const converterDataLocal = (dataString: string): string => {
  if (!dataString) return '';
  const data = new Date(dataString + 'T00:00:00');
  return data.toISOString().split('T')[0];
};

/**
 * Tipos de acidente de trabalho
 */
export const TIPOS_ACIDENTE = [
  { value: 'Típico', label: 'Típico' },
  { value: 'Trajeto', label: 'Trajeto' },
  { value: 'Doença Ocupacional', label: 'Doença Ocupacional' },
  { value: 'Violência', label: 'Violência' },
  { value: 'Outro', label: 'Outro' },
];

/**
 * Cores para badges de status
 */
export const STATUS_COLORS = {
  'Aberto': 'bg-yellow-100 text-yellow-800',
  'Em Análise': 'bg-blue-100 text-blue-800',
  'Fechado': 'bg-green-100 text-green-800',
};

/**
 * Opções de status
 */
export const STATUS_OPTIONS = [
  { value: 'Aberto', label: 'Aberto' },
  { value: 'Em Análise', label: 'Em Análise' },
  { value: 'Fechado', label: 'Fechado' },
];

/**
 * Componente Loading Spinner reutilizável
 */
import React from 'react';

export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Carregando...' }) => (
  <div className="flex justify-center items-center h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      <p className="text-gray-500 mt-4">{message}</p>
    </div>
  </div>
);

/**
 * Helper para mostrar loading com MainLayout
 */
export const LoadingWithLayout: React.FC<{ message?: string }> = ({ message }) => (
  <div className="flex justify-center items-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);
