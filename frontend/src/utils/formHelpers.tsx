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
