const SENSITIVE_FIELDS = ['senha', 'password', 'novaSenha', 'confirmarSenha', 'senhaAtual', 'currentPassword', 'newPassword', 'refreshToken'];

export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeForLogging);

  const sanitized = JSON.parse(JSON.stringify(data));

  const removeSensitive = (obj: any) => {
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_FIELDS.includes(key)) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        removeSensitive(obj[key]);
      }
    }
  };

  removeSensitive(sanitized);
  return sanitized;
}
