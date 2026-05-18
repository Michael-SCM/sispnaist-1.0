import dns from 'node:dns/promises';

/**
 * Validador de existência do domínio do e-mail.
 * Verifica via DNS se o domínio possui registros MX (Mail Exchange) ou registros de IP (A/AAAA).
 * Isso valida de forma confiável e rápida se o domínio do e-mail é real e capaz de receber mensagens,
 * sem a necessidade de enviar um e-mail de teste.
 */
export async function checkEmailDomainExists(email: string): Promise<boolean> {
  if (!email || typeof email !== 'string') return false;

  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1].trim();

  // Para fins de desenvolvimento local offline ou testes específicos, podemos permitir localhost
  if (domain === 'localhost' || domain === 'test.local') {
    return true;
  }

  try {
    // 1. Tentar resolver registros MX (servidores de e-mail associados ao domínio)
    const mxRecords = await dns.resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      return true;
    }
  } catch (mxError) {
    // Se falhar a resolução de MX, o domínio pode ser pequeno ou usar apenas registros A
    try {
      // 2. Tentar resolver o IP direto do domínio (registro A/AAAA)
      const addresses = await dns.resolve(domain);
      if (addresses && addresses.length > 0) {
        return true;
      }
    } catch (dnsError) {
      // Domínio inexistente ou sem registros válidos
      console.log(`[Email Validator] Falha ao verificar domínio do e-mail: ${domain}`);
      return false;
    }
  }

  return false;
}
