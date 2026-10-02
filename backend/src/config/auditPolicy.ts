/**
 * Política de retenção e proteção dos logs de auditoria — constantes
 * IMPLEMENTADAS pelo código.
 *
 * ---------------------------------------------------------------------------
 * AVISO: este arquivo descreve o que o software faz. Ele NÃO é parecer jurídico.
 * Os prazos abaixo precisam ser validados com o responsável de privacidade/DPO
 * e com o jurídico antes de qualquer habilitação, considerando:
 *   - LGPD (Lei 13.709/2018): finalidade, necessidade e minimização
 *   - NR-1/GRO: guarda de documentos de saúde ocupacional (até 20 anos)
 *   - Prazos de defesa trabalhista e responsabilização civil/administrativa
 *   - Lei de Acesso à Informação, se aplicável ao órgão gestor
 * ---------------------------------------------------------------------------
 *
 * DIVERGÊNCIA DOCUMENTADO x IMPLEMENTADO (auditoria de 2026-10-01):
 *
 *   Doc/AUDITORIA_IMPLEMENTACAO.md, seção "TTL (Time To Live)", sugere:
 *       db.audit_logs.createIndex({dataCriacao:1},{expireAfterSeconds: 7776000})
 *     -> 90 dias de retenção automática.
 *
 *   O que está IMPLEMENTADO:
 *     - Nenhum índice TTL existe em `audit_logs`. A exclusão automática de
 *       logs NÃO está ativa.
 *     - A retenção é um processo explícito (`npm run audit:prune` ou o cron
 *       `auditRetentionScheduler`) condicionado a `AUDIT_RETENTION_DAYS`.
 *     - `AUDIT_RETENTION_DAYS` tem default **0 = retenção desabilitada**;
 *       sem decisão formal de privacidade/jurídico, os logs são mantidos.
 *     - A exclusão usa o driver nativo (fora dos hooks de imutabilidade) e gera
 *       um registro de auditoria do próprio ato de exclusão.
 *
 *   Ou seja: os 90 dias sugeridos na documentação NÃO são o comportamento real.
 *   A documentação precisa ser atualizada ou a política habilitada — decisão
 *   que depende de validação jurídica.
 *
 * Variáveis de ambiente:
 *   AUDIT_RETENTION_DAYS   0 (default) = nunca excluir. >0 = excluir logs
 *                          anteriores a N dias.
 *   AUDIT_RETENTION_CRON   expressão cron (default '0 4 * * *', 04:00 BRT).
 *   AUDIT_RETENTION_DRY_RUN '1' = simula sem excluir (default '1' como trava).
 *   AUDIT_STRICT           'true' = falha ao gravar auditoria propaga erro.
 *   AUDIT_READ_AWAIT       'true' = middleware de leitura aguarda a gravação.
 *   AUDIT_EXPORT_DIR       diretório do dump offline (default './audit-exports').
 */

export const AUDIT_RETENTION_DAYS = Number(process.env.AUDIT_RETENTION_DAYS) || 0;
export const AUDIT_RETENTION_CRON = process.env.AUDIT_RETENTION_CRON || '0 4 * * *';
export const AUDIT_RETENTION_DRY_RUN = process.env.AUDIT_RETENTION_DRY_RUN !== '0';
export const AUDIT_STRICT = process.env.AUDIT_STRICT === 'true';
export const AUDIT_READ_AWAIT = process.env.AUDIT_READ_AWAIT === 'true';
export const AUDIT_EXPORT_DIR = process.env.AUDIT_EXPORT_DIR || './audit-exports';

/** Campos que NUNCA podem aparecer em um evento de auditoria. */
export const CATEGORIAS_PROTEGIDAS = [
  'credenciais e tokens (senha, JWT, API key, cookie, código 2FA)',
  'identificadores pessoais (CPF, CNS, RG, PIS, título de eleitor)',
  'contato (e-mail, telefone, WhatsApp)',
  'endereço (logradouro, bairro, município, CEP)',
  'dados cadastrais da pessoa (nome, data de nascimento, nome da mãe)',
  'conteúdo clínico (relato, diagnóstico, laudo, ASO, evolução, CID-10)',
] as const;

/** Resumo da política para exibição/verificação automatizada. */
export function obterPoliticaRetencao(): {
  retencaoHabilitada: boolean;
  dias: number;
  dryRun: boolean;
  indiceTtlAtivo: boolean;
  cadeiaIntegridade: boolean;
  categoriesProtegidas: readonly string[];
  exigiaValidacaoJuridica: boolean;
  divergenciaDocumentada: string;
} {
  return {
    retencaoHabilitada: AUDIT_RETENTION_DAYS > 0,
    dias: AUDIT_RETENTION_DAYS,
    dryRun: AUDIT_RETENTION_DRY_RUN,
    indiceTtlAtivo: false,
    cadeiaIntegridade: true,
    categoriesProtegidas: CATEGORIAS_PROTEGIDAS,
    exigiaValidacaoJuridica: true,
    divergenciaDocumentada:
      'Doc/AUDITORIA_IMPLEMENTACAO.md sugere TTL de 90 dias; nenhum índice TTL existe em audit_logs e a retenção está desabilitada por padrão.',
  };
}
