/**
 * Utilitários centralizados de sanitização de entrada.
 * Use estas funções em vez de duplicar escapeRegex em cada service/controller.
 */

/**
 * Escapa caracteres especiais de expressão regular para uso seguro
 * com new RegExp(userInput).
 *
 * Exemplo: escapeRegex("foo.bar(baz)") → "foo\.bar\(baz\)"
 */
export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Valida se um valor é uma data válida.
 * Retorna a Date se válida, ou null se inválida.
 * Útil para validar req.query.dataInicio/dataFim antes de new Date().
 */
export const safeDate = (value: unknown): Date | null => {
  if (!value || typeof value !== 'string') return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Garante que o valor é uma string não vazia após trim.
 * Retorna undefined se inválido ou vazio.
 */
export const safeString = (value: unknown, maxLength = 500): string | undefined => {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  if (str.length === 0) return undefined;
  return str.slice(0, maxLength);
};

/**
 * Remove campos sensíveis de objetos para logging seguro.
 * Usado pelo errorHandler para não expor senhas/tokens em logs.
 */
export const sanitizeForLogging = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== 'object') return {};

  const sensitiveFields = ['senha', 'password', 'token', 'secret', 'apiKey', 'refreshToken', 'novaSenha', 'senhaAtual'];
  const sanitized = JSON.parse(JSON.stringify(obj));

  const removeSensitive = (o: any) => {
    for (const field of sensitiveFields) {
      if (field in o) o[field] = '[REDACTED]';
    }
    for (const key in o) {
      if (typeof o[key] === 'object' && o[key] !== null) {
        removeSensitive(o[key]);
      }
    }
  };

  removeSensitive(sanitized);
  return sanitized;
};
