import { validateCPF as validarCPF, validateEmail } from './masks.js';

type ValidationRule = (value: string) => string | undefined;

export const required = (msg?: string): ValidationRule => {
  return (value: string) => (!value || !value.trim() ? msg || 'Campo obrigatório' : undefined);
};

export const minLength = (min: number, msg?: string): ValidationRule => {
  return (value: string) =>
    value && value.trim().length < min ? msg || `Mínimo de ${min} caracteres` : undefined;
};

export const maxLength = (max: number, msg?: string): ValidationRule => {
  return (value: string) =>
    value && value.length > max ? msg || `Máximo de ${max} caracteres` : undefined;
};

export const email = (msg?: string): ValidationRule => {
  return (value: string) => (value && !validateEmail(value) ? msg || 'Email inválido' : undefined);
};

export const cpf = (msg?: string): ValidationRule => {
  return (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length !== 11) return msg || 'CPF deve ter 11 dígitos';
    return !validarCPF(value) ? msg || 'CPF inválido' : undefined;
  };
};

export const password = (msg?: string): ValidationRule => {
  return (value: string) => {
    if (!value || value.length < 8) return msg || 'Mínimo de 8 caracteres';
    if (!/[A-Z]/.test(value)) return msg || 'Deve conter letra maiúscula';
    if (!/[a-z]/.test(value)) return msg || 'Deve conter letra minúscula';
    if (!/\d/.test(value)) return msg || 'Deve conter número';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) return msg || 'Deve conter caractere especial';
    return undefined;
  };
};

export const matchField = (compareValue: () => string, fieldName: string): ValidationRule => {
  return (value: string) =>
    value !== compareValue() ? `As senhas não conferem` : undefined;
};

export const dateOfBirth = (msg?: string): ValidationRule => {
  return (value: string) => {
    if (!value) return msg || 'Data de nascimento é obrigatória';
    const date = new Date(value);
    if (isNaN(date.getTime())) return msg || 'Data inválida';
    if (date > new Date()) return msg || 'Data não pode ser futura';
    const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 12) return msg || 'Idade mínima é 12 anos';
    if (age > 150) return msg || 'Idade máxima excedida';
    return undefined;
  };
};

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule[];
};

export function validate<T extends Record<string, any>>(
  values: T,
  schema: ValidationSchema<T>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of Object.keys(schema) as (keyof T)[]) {
    const rules = schema[field];
    if (!rules) continue;
    for (const rule of rules) {
      const error = rule(values[field] || '');
      if (error) {
        errors[field as string] = error;
        break;
      }
    }
  }
  return errors;
}

export function validateField<T extends Record<string, any>>(
  values: T,
  schema: ValidationSchema<T>,
  field: keyof T
): string | undefined {
  const rules = schema[field];
  if (!rules) return undefined;
  for (const rule of rules) {
    const error = rule(values[field] || '');
    if (error) return error;
  }
  return undefined;
}
