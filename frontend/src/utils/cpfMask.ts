// Helper específico para máscara e unmask de CPF

export const onlyDigits = (value: string) => (value ?? '').replace(/\D/g, '');

export const maskCPF = (value: string): string => {
  const numbers = onlyDigits(value).slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
};

export const unmaskCPF = (value: string): string => onlyDigits(value).slice(0, 11);

