import { schedule, ScheduledTask } from 'node-cron';
import auditService from './AuditService.js';
import {
  AUDIT_RETENTION_DAYS,
  AUDIT_RETENTION_CRON,
} from '../config/auditPolicy.js';

let cronTask: ScheduledTask | null = null;

/**
 * Agendador de retenção do log de auditoria.
 *
 * Desabilitado por padrão (AUDIT_RETENTION_DAYS=0): a exclusão de trilha de
 * auditoria depende de decisão formal de privacidade/jurídico — ver
 * `src/config/auditPolicy.ts`. No Render free a instância precisa estar
 * acordada para o job disparar.
 */
export const initAuditRetentionScheduler = (): void => {
  if (process.env.NODE_ENV === 'test') return;

  if (AUDIT_RETENTION_DAYS <= 0) {
    console.log(
      '[Audit] Retenção desabilitada (AUDIT_RETENTION_DAYS=0). ' +
        'Os logs são mantidos até que privacidade/jurídico defina um prazo.'
    );
    return;
  }

  cronTask = schedule(
    AUDIT_RETENTION_CRON,
    () => {
      console.log('[Audit] Executando retenção agendada...');
      auditService
        .aplicarRetencao()
        .then((r) => {
          if (r.candidatos > 0) {
            console.log(
              `[Audit] Retenção ${r.dryRun ? '(dry-run) ' : ''}: ` +
                `${r.removidos}/${r.candidatos} removidos, corte ${r.corte}.`
            );
          }
        })
        .catch((err) => console.error('[Audit] Erro na retenção agendada:', err));
    },
    { timezone: 'America/Sao_Paulo' }
  );

  console.log(
    `[Audit] Cron de retenção agendado: "${AUDIT_RETENTION_CRON}" ` +
      `(${AUDIT_RETENTION_DAYS} dias${AUDIT_RETENTION_DAYS ? ', America/Sao_Paulo' : ''})`
  );
};

export const stopAuditRetentionScheduler = (): void => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
};

export default { initAuditRetentionScheduler, stopAuditRetentionScheduler };
