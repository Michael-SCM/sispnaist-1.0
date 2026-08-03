import { schedule, ScheduledTask } from 'node-cron';
import config from '../config/config.js';
import alertService from './AlertaService.js';

let cronTask: ScheduledTask | null = null;

/**
 * Inicializa o agendador de alertas.
 * Executa a avaliação periódica dos eventos críticos enquanto a instância
 * estiver ativa (observe que no Render free o job só roda com a instância "acordada").
 */
export const initAlertScheduler = (): void => {
  if (process.env.NODE_ENV === 'test') return;

  if (config.alert.cronSchedule) {
    cronTask = schedule(
      config.alert.cronSchedule,
      () => {
        console.log('[Alertas] Executando avaliação agendada de alertas...');
        alertService.avaliarTodos().catch((err) => {
          console.error('[Alertas] Erro na avaliação agendada:', err);
        });
      },
      { timezone: 'America/Sao_Paulo' }
    );
    console.log(`[Alertas] Cron agendado: "${config.alert.cronSchedule}" (America/Sao_Paulo)`);
  }

  if (config.alert.runOnStart) {
    console.log('[Alertas] Executando avaliação inicial de alertas...');
    alertService.avaliarTodos().catch((err) => {
      console.error('[Alertas] Erro na avaliação inicial:', err);
    });
  }
};

export const stopAlertScheduler = (): void => {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
};

export default { initAlertScheduler, stopAlertScheduler };
