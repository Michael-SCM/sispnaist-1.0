/**
 * Testes unitários para utilitários de máscaras e validações brasileiras
 */

import { describe, it, expect } from 'vitest';
import { formatCPF, formatTelefone, validateCPF } from '../utils/masks.js';

describe('Máscaras - Formatação', () => {
  describe('formatCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatCPF('12345678900')).toBe('123.456.789-00');
    });

    it('deve formatar CPF parcialmente', () => {
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('123456')).toBe('123.456');
      expect(formatCPF('123456789')).toBe('123.456.789');
    });

    it('deve remover caracteres não numéricos', () => {
      expect(formatCPF('123.456.789-00')).toBe('123.456.789-00');
      expect(formatCPF('abc123def456ghi789jkl00')).toBe('123.456.789-00');
    });

    it('deve limitar a 11 dígitos', () => {
      expect(formatCPF('123456789001234')).toBe('123.456.789-00');
    });
  });

  describe('formatTelefone', () => {
    it('deve formatar telefone celular corretamente', () => {
      expect(formatTelefone('11999999999')).toBe('(11) 99999-9999');
    });

    it('deve formatar telefone parcialmente', () => {
      expect(formatTelefone('11')).toBe('11');
      expect(formatTelefone('1199999')).toBe('(11) 99999');
    });

    it('deve remover caracteres não numéricos', () => {
      expect(formatTelefone('(11) 99999-9999')).toBe('(11) 99999-9999');
    });

    it('deve limitar a 11 dígitos', () => {
      expect(formatTelefone('119999999991234')).toBe('(11) 99999-9999');
    });
  });
});

describe('Validações', () => {
  describe('validateCPF', () => {
    it('deve aceitar CPF com dígito verificador correto', () => {
      expect(validateCPF('529.982.247-25')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
    });

    it('deve rejeitar CPF com dígito verificador incorreto', () => {
      expect(validateCPF('123.456.789-00')).toBe(false); // dígito verificador errado
      expect(validateCPF('11111111111')).toBe(false); // dígitos repetidos
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(validateCPF('123.456.789')).toBe(false);
      expect(validateCPF('12345')).toBe(false);
    });
  });
});
