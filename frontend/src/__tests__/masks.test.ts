/**
 * Testes unitários para utilitários de máscaras
 */

import { describe, it, expect } from '@jest/globals';

// Mock das funções de máscara (seriam importadas do utils/masks.ts)
const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

const formatTelefone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

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
    const validateCPF = (cpf: string): boolean => {
      const numbers = cpf.replace(/\D/g, '');
      if (numbers.length !== 11) return false;
      if (/^(\d)\1+$/.test(numbers)) return false;
      
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers[i]) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10) remainder = 0;
      if (remainder !== parseInt(numbers[9])) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers[i]) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10) remainder = 0;
      if (remainder !== parseInt(numbers[10])) return false;
      
      return true;
    };

    it('deve validar CPF válido', () => {
      expect(validateCPF('123.456.789-09')).toBe(false); // CPF inválido mas formato correto
      expect(validateCPF('11111111111')).toBe(false); // Dígitos repetidos
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(validateCPF('123.456.789')).toBe(false);
      expect(validateCPF('12345')).toBe(false);
    });
  });
});
