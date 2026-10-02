import { schedule, ScheduledTask } from 'node-cron';
import uploadMaintenance, { UPLOAD_RETENTION_DAYS } from './UploadMaintenanceService.js';

let cronTask: ScheduledTask | null = null;

/** Expressão cron de execução (03:00 America/Sao_Paulo por padrão). */
const RETENTION_CRON = process.env.UPLOAD_RETENTION_CRON || '0 3 * * *';

/**
 * Inicializa o agendador de manutenção de uploads (retenção + varredura de órfãos).
 *
 * Desabilitado quando UPLOAD_RETENTION_DAYS=0 (default). No Render free a instância
 * precisa estar acordada para o job disparar.
 */
export const initUploadMaintenanceScheduler = (): void => {
  if (process.env.NODE_ENV === 'test') return;
  if (UPLOAD_RETENTION_DAYS <= 0) {
    console.log(
      '[Uploads] Retenção desabilitada (UPLOAD_RETENTION_DAYS=0). Defina um valor para ativar a limpeza automática.'
    );
    return;
  }

  cronTask = schedule(
    RETENTION_CRON,
    () => {
      console.log('[Uploads] Executando manutenção agendada...');
      uploadMaintenance
        .aplicarRetencao()
        .then((r) => {
          if (r.candidatos > 0) {
            console.log(
              `[Uploads] Retenção ${r.dryRun ? '(dry-run) ' : ''}: ${r.removidos}/${r.candidatos} removidos, ${r.erros} erros.`
            );
          }
          return uploadMaintenance.limparOrfaoEmDisco();
        })
        .then((o) => {
          if (o.removidos > 0) {
            console.log(`[Uploads] Órfãos em disco: ${o.removidos} removidos, ${o.erros} erros.`);
          }
        })
        .catch((err) => console.error('[Uploads] Erro na manutenção agendada:', err));
    },
    { timezone: 'America/Sao_Paulo' }
  );

  console.log(
    `[Uploads] Cron de retenção agendado: "${RETENTION_CRON}" (${UPLOAD_RETENTION_DAYS} dias, America/Sao_Paulo)`
  );
};

export const stopUploadMaintenanceScheduler = (): void => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
};

export default { initUploadMaintenanceScheduler, stopUploadMaintenanceScheduler };
