import { Request } from 'express';
import AuditLog, { AcaoAudit, ResultadoAudit } from '../models/AuditLog.js';
import { criarComCadeia, obterEstatisticasFila } from './auditChain.js';
import { redigirDetalhes } from './auditRedaction.js';

/**
 * Registro central de auditoria.
 *
 * O que é gravado por evento:
 *   acao, entidade, entidadeId, resultado, camposAlterados (NOMES),
 *   detalhes (redigidos), ip, userAgent, sensivel + cadeia de hash.
 *
 * O que NUNCA é gravado:
 *   CPF, e-mail, telefone, endereço, credenciais/tokens e conteúdo clínico.
 *   A redação é feita por `redigirDetalhes()` — lista permitida de campos
 *   + lista bloqueada + máscara de valor — e vale para TODAS as chamadas,
 *   inclusive as que recebem um documento Mongoose inteiro.
 *
 * Falhas de gravação não bloqueiam a operação de negócio, mas também não são
 * silenciosas: são registradas em console.error e contadas em
 * `obterEstatisticasAudit()`. Defina AUDIT_STRICT=true para que a falha
 * propague e interrompa a operação.
 */

let falhasAuditoria = 0;
let sucessosAuditoria = 0;

export function obterEstatisticasAudit(): {
  sucessos: number;
  falhas: number;
  fila: { escritas: number; falhas: number };
} {
  return {
    sucessos: sucessosAuditoria,
    falhas: falhasAuditoria,
    fila: obterEstatisticasFila(),
  };
}

export interface OpcoesLog {
  sensivel?: boolean;
  /** Resultado da operação. Padrão: 'sucesso'. */
  resultado?: ResultadoAudit;
  /** Nomes de campo alterados; se omitidos, extraídos de `detalhes.camposMudados`. */
  camposAlterados?: string[];
  /** Resumo curto não-identificante a gravar em `detalhes.resumo`. */
  resumo?: string;
  /**
   * Usuário responsável. Usado quando `req.user` ainda não existe — por
   * exemplo, no LOGIN (falha ou sucesso) antes do middleware de auth.
   */
  usuarioId?: string;
}

/**
 * Chaves cujo conteúdo NUNCA deve ir para o log, mesmo quando vierem embutidas
 * em um objeto de comparação. Removidas antes da redação (segunda camada).
 */
const CHAVES_REMOVIDAS_ANTES_DA_REDACAO = new Set([
  'mudancas', // {antes, depois} de cada campo — só os nomes interessam
  'data',
  'buffer',
  'corpo',
  'body',
  'payload',
  'arquivo',
  'files',
  'file',
]);

function prepararDetalhes(detalhes: unknown): { detalhes: Record<string, any>; campos: string[] } {
  if (detalhes === null || detalhes === undefined) {
    return { detalhes: {}, campos: [] };
  }

  const bruto: any =
    typeof (detalhes as any)?.toObject === 'function'
      ? (detalhes as any).toObject({ flattenObjectIds: true, depopulate: true })
      : typeof detalhes === 'object'
        ? { ...(detalhes as any) }
        : { valor: detalhes };

  // Nomes de campo alterados saem da comparação e viram um campo dedicado.
  const campos: string[] = Array.isArray(bruto.camposMudados)
    ? bruto.camposMudados.filter((c: unknown) => typeof c === 'string').slice(0, 60)
    : [];
  delete bruto.camposMudados;

  // Remove estruturas com valores antes/depois e buffers antes de qualquer coisa.
  for (const chave of CHAVES_REMOVIDAS_ANTES_DA_REDACAO) {
    if (chave in bruto) delete bruto[chave];
  }

  return { detalhes: redigirDetalhes(bruto), campos };
}

/**
 * Registra uma ação no audit log com dados estruturados.
 *
 * Exemplos:
 *   await logAction(req, 'CREATE', 'Empresa', id, { razaoSocial, cnpj });
 *   await logAction(req, 'UPDATE', 'Empresa', id, compararDados(antes, depois));
 *   await logAction(req, 'READ', 'TrabalhadorExameSaude', id, {}, { sensivel: true });
 *   await logAction(req, 'LOGIN', 'User', userId, {}, { resultado: 'falha' });
 */
export const logAction = async (
  req: Request | any,
  acao: AcaoAudit,
  entidade: string,
  entidadeId: string,
  detalhes?: Record<string, any>,
  opcoes?: OpcoesLog
) => {
  const { detalhes: detalhesRedigidos, campos } = prepararDetalhes(detalhes);
  const camposAlterados = opcoes?.camposAlterados?.slice(0, 60) ?? campos;

  const usuarioId =
    opcoes?.usuarioId ||
    req?.user?.id ||
    req?.user?._id ||
    req?.body?.usuarioId;
  const ip = String(req?.ip || req?.connection?.remoteAddress || '0.0.0.0').replace('::ffff:', '');
  const userAgent = String(req?.get?.('User-Agent') || req?.userAgent || 'Unknown').slice(0, 300);

  const registro: any = {
    usuarioId,
    acao,
    entidade,
    entidadeId: String(entidadeId),
    resultado: opcoes?.resultado ?? 'sucesso',
    detalhes: detalhesRedigidos,
    ip,
    userAgent,
    sensivel: opcoes?.sensivel ?? false,
  };

  if (camposAlterados.length > 0) {
    registro.camposAlterados = camposAlterados;
  }
  if (opcoes?.resumo) {
    registro.detalhes = { ...registro.detalhes, resumo: opcoes.resumo };
  }

  try {
    await criarComCadeia(registro);
    sucessosAuditoria++;
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[AUDIT] ${acao} - ${entidade}:${registro.entidadeId} (${registro.resultado}) by ${
          usuarioId || 'system'
        }${opcoes?.sensivel ? ' (SENSÍVEL)' : ''}`
      );
    }
  } catch (error: any) {
    falhasAuditoria++;
    // Falha visível: uma trilha de auditoria com buracos silenciosos é inútil.
    console.error('[AUDIT] FALHA ao gravar evento de auditoria', {
      acao,
      entidade,
      entidadeId: registro.entidadeId,
      motivo: error?.message,
      falhasAcumuladas: falhasAuditoria,
    });

    if (process.env.AUDIT_STRICT === 'true') {
      throw error;
    }
  }
};

/** Atalho para logar acesso (READ) a dados sensíveis. */
export const logReadSensivel = async (
  req: Request | any,
  entidade: string,
  entidadeId: string,
  detalhes?: Record<string, any>
) => {
  return logAction(req, 'READ', entidade, entidadeId, detalhes, { sensivel: true });
};

/** Atalho para logar exportação de dados sensíveis. */
export const logExport = async (
  req: Request | any,
  entidade: string,
  formato: string,
  detalhes?: Record<string, any>
) => {
  return logAction(req, 'EXPORT', entidade, formato, detalhes, { sensivel: true });
};

/**
 * Compara dois documentos e devolve APENAS os nomes dos campos alterados.
 *
 * Os valores (antes/depois) são deliberadamente descartados aqui: o audit log
 * precisa dizer O QUE mudou, não reproduzir CPF, endereço ou relato clínico.
 */
export const compararDados = (
  datosAntigosRaw: Record<string, any>,
  datosNovosRaw: Record<string, any>
): { resumo: string; camposMudados: string[] } => {
  const dadosAntigos =
    typeof datosAntigosRaw?.toObject === 'function'
      ? datosAntigosRaw.toObject()
      : JSON.parse(JSON.stringify(datosAntigosRaw || {}));
  const dadosNovos =
    typeof datosNovosRaw?.toObject === 'function'
      ? datosNovosRaw.toObject()
      : JSON.parse(JSON.stringify(datosNovosRaw || {}));

  const ignoreFields = ['_id', '__v', 'createdAt', 'updatedAt', 'dataCriacao', 'dataAtualizacao'];
  const camposMudados: string[] = [];

  const registrar = (campo: string) => {
    if (!camposMudados.includes(campo) && !ignoreFields.includes(campo)) {
      camposMudados.push(campo);
    }
  };

  for (const campo in dadosNovos) {
    if (ignoreFields.includes(campo)) continue;
    if (JSON.stringify(dadosAntigos[campo]) !== JSON.stringify(dadosNovos[campo])) {
      registrar(campo);
    }
  }

  for (const campo in dadosAntigos) {
    if (ignoreFields.includes(campo)) continue;
    if (!(campo in dadosNovos)) registrar(campo);
  }

  return {
    resumo: `${camposMudados.length} campo(s) alterado(s)`,
    camposMudados,
  };
};

/** Zera contadores (usado em testes). */
export function resetarEstatisticasAudit(): void {
  falhasAuditoria = 0;
  sucessosAuditoria = 0;
}

export { AuditLog };
