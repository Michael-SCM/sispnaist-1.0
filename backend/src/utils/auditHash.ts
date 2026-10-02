import crypto from 'crypto';

/**
 * Cadeia de integridade dos logs de auditoria.
 *
 * Cada registro guarda:
 *   - `hashAnterior`  hash do registro imediatamente anterior (ou 'GENESIS')
 *   - `hash`          sha256(hashAnterior || conteúdo normalizado do registro)
 *
 * Alterar, inserir retroativamente ou remover um registro no meio da cadeia
 * quebra a conferência do registro seguinte. Para a rastreabilidade ser
 * verificável é preciso rodar `verificarCadeiaAuditLog()` periodicamente —
 * o hash sozinho, guardado no mesmo banco, não prova nada contra um
 * administrador com acesso de escrita.
 *
 * ATENÇÃO: a cadeia protege contra alteração ACIDENTAL/retroativa por parte de
 * quem tem acesso de leitura ou de aplicação; não substitui exportação
 * periódica para storage externo (ver `npm run audit:export`).
 */

export const GENESIS = 'GENESIS';

/** Stringify estável (chaves ordenadas) — mesmo objeto => sempre o mesmo texto. */
export function stringifyEstavel(valor: any): string {
  if (valor === null || valor === undefined) return 'null';

  if (Array.isArray(valor)) {
    return `[${valor.map((v) => stringifyEstavel(v)).join(',')}]`;
  }

  if (typeof valor === 'object') {
    if (typeof (valor as any).toISOString === 'function' && valor instanceof Date) {
      return JSON.stringify(valor.toISOString());
    }
    if (typeof (valor as any).toHexString === 'function') {
      return JSON.stringify(String((valor as any).toHexString()));
    }
    const chaves = Object.keys(valor).sort();
    const partes = chaves
      .filter((k) => valor[k] !== undefined)
      .map((k) => `${JSON.stringify(k)}:${stringifyEstavel(valor[k])}`);
    return `{${partes.join(',')}}`;
  }

  return JSON.stringify(valor);
}

export interface PayloadHashAudit {
  usuarioId?: string | null;
  acao: string;
  entidade: string;
  entidadeId: string;
  resultado?: string;
  camposAlterados?: string[] | null;
  detalhes?: any;
  ip?: string | null;
  userAgent?: string | null;
  dataCriacao?: Date | string | null;
}

/** Normaliza um documento (do mongoose ou puro) para o payload do hash. */
export function normalizarParaHash(doc: any): PayloadHashAudit {
  const get = (chave: string) =>
    doc?.[chave] !== undefined ? doc[chave] : doc?.get?.(chave);

  const usuarioId = get('usuarioId');
  const dataCriacao = get('dataCriacao');

  return {
    usuarioId:
      usuarioId === null || usuarioId === undefined
        ? null
        : String(typeof usuarioId === 'object' && usuarioId.toString ? usuarioId.toString() : usuarioId),
    acao: String(get('acao') ?? ''),
    entidade: String(get('entidade') ?? ''),
    entidadeId: String(get('entidadeId') ?? ''),
    resultado: String(get('resultado') ?? ''),
    camposAlterados: Array.isArray(get('camposAlterados'))
      ? [...(get('camposAlterados') as string[])].sort()
      : null,
    detalhes: get('detalhes') ?? null,
    ip: get('ip') === undefined || get('ip') === null ? null : String(get('ip')),
    userAgent:
      get('userAgent') === undefined || get('userAgent') === null
        ? null
        : String(get('userAgent')),
    dataCriacao:
      dataCriacao instanceof Date
        ? dataCriacao.toISOString()
        : dataCriacao
          ? String(dataCriacao)
          : null,
  };
}

/** Calcula o hash do registro dado o hash do anterior. */
export function calcularHashRegistro(doc: any, hashAnterior: string): string {
  const payload = stringifyEstavel({
    v: 2,
    prev: hashAnterior,
    corpo: normalizarParaHash(doc),
  });
  return crypto.createHash('sha256').update(payload, 'utf8').digest('hex');
}
