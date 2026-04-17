/**
 * Utilitários para formatação e validação de dados brasileiros
 */

// ============== MÁSCARAS ==============

/**
 * Formata CPF: 12345678900 → 123.456.789-00
 */
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  }
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

/**
 * Formata CNPJ: 12345678000190 → 12.345.678/0001-90
 */
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 14);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
  if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
  }
  if (numbers.length <= 12) {
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
  }
  return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12)}`;
};

/**
 * Formata telefone: 11999999999 → (11) 99999-9999
 */
export const formatTelefone = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

/**
 * Formata CEP: 12345678 → 12345-678
 */
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

/**
 * Formata data: 2024-04-08 → 08/04/2024
 */
export const formatDate = (value: string): string => {
  if (!value) return '';
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  
  return date.toLocaleDateString('pt-BR');
};

/**
 * Formata data/hora: 2024-04-08T14:30:00 → 08/04/2024 14:30
 */
export const formatDateTime = (value: string): string => {
  if (!value) return '';
  
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  
  return date.toLocaleDateString('pt-BR') + ' ' + 
         date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// ============== VALIDAÇÕES ==============

/**
 * Valida CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

/**
 * Valida CNPJ
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Calcula primeiro dígito verificador
  let length = numbers.length - 2;
  let sum = 0;
  let weight = 2;
  
  for (let i = length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  let remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;
  
  if (remainder !== parseInt(numbers[length])) return false;
  
  // Calcula segundo dígito verificador
  length = numbers.length - 1;
  sum = 0;
  weight = 2;
  
  for (let i = length - 1; i >= 0; i--) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  
  remainder = sum % 11;
  if (remainder < 2) remainder = 0;
  else remainder = 11 - remainder;
  
  if (remainder !== parseInt(numbers[length])) return false;
  
  return true;
};

/**
 * Valida email
 */
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ============== HELPERS ==============

/**
 * Remove formatação (retorna apenas números)
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Busca CEP na API ViaCEP
 */
export const buscarCEP = async (cep: string): Promise<{
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
} | null> => {
  const numbers = unmask(cep).slice(0, 8);
  
  if (numbers.length !== 8) return null;
  
  try {
    const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
    const data = await response.json();
    
    if (data.erro) return null;
    
    return {
      logradouro: data.logradouro || '',
      bairro: data.bairro || '',
      cidade: data.localidade || '',
      estado: data.uf || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
};
