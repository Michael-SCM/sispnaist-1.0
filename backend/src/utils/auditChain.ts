import AuditLog, { IAuditLog, IAuditLogDocument } from '../models/AuditLog.js';

/**
 * Serialização das escritas de auditoria.
 *
 * O encadeamento depende de ler o hash do registro anterior; se duas escritas
 * concorrerem, ambas leem o mesmo anterior e a cadeia bifurca. A fila abaixo
 * serializa as escritas dentro do processo.
 *
 * LIMITAÇÃO: uma fila por processo só garante a cadeia em instância única.
 * Com múltiplas réplicas, ative `AUDIT_REQUIRE_CHAIN=false` ou garanta escrita
 * única (ex.: réplica única no Render) — e valide a cadeia com
 * `npm run audit:verify`.
 */

let fila: Promise<unknown> = Promise.resolve();

let falhas = 0;
let escritas = 0;

export function obterEstatisticasFila(): { escritas: number; falhas: number } {
  return { escritas, falhas };
}

/** Enfileira uma escrita de auditoria; erros anteriores não travam a fila. */
export function criarComCadeia(
  data: Omit<IAuditLog, '_id' | 'dataCriacao'>
): Promise<IAuditLogDocument> {
  const executar = async (): Promise<IAuditLogDocument> => {
    try {
      const doc = await AuditLog.create(data as any);
      escritas++;
      return doc;
    } catch (err) {
      falhas++;
      throw err;
    }
  };

  const resultado = fila.then(executar, executar);
  fila = resultado.then(
    () => undefined,
    () => undefined
  );
  return resultado;
}
