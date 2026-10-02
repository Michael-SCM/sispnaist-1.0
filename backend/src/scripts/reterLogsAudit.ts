/**
 * Retenção (exclusão) de logs de auditoria antigos.
 *
 * Padrão: DRY-RUN. A exclusão real exige `--confirmar` E `AUDIT_RETENTION_DAYS > 0`.
 * A exclusão em si é auditada — o ato de limpar a trilha deixa trilha.
 *
 * Uso:
 *   AUDIT_RETENTION_DAYS=90 npm run audit:prune              simula
 *   AUDIT_RETENTION_DAYS=90 npm run audit:prune -- --confirmar   executa
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import config from '../config/config.js';
import auditService from '../services/AuditService.js';
import { obterPoliticaRetencao } from '../config/auditPolicy.js';

async function main() {
  const args = process.argv.slice(2);
  const confirmar = args.includes('--confirmar');
  const politica = obterPoliticaRetencao();

  await mongoose.connect(config.mongodbUri);

  if (!politica.retencaoHabilitada) {
    console.log(
      '\nRetenção desabilitada: defina AUDIT_RETENTION_DAYS com um prazo já ' +
        'validado por privacidade/jurídico (ver src/config/auditPolicy.ts).'
    );
    console.log('Nada foi alterado.');
    await mongoose.disconnect();
    return;
  }

  if (!confirmar) {
    console.log(
      `\n[DRY-RUN] Retenção de ${politica.dias} dias. Nada será excluído. ` +
        'Use --confirmar para executar.'
    );
  }

  const resultado = await auditService.aplicarRetencao();

  console.log('\n=== Retenção do audit log ===');
  console.log(`Gerado em:   ${resultado.geradoEm}`);
  console.log(`Prazo:       ${resultado.retencaoDias} dias`);
  console.log(`Corte:       ${resultado.corte}`);
  console.log(`Dry-run:     ${resultado.dryRun ? 'sim' : 'não'}`);
  console.log(`Candidatos:  ${resultado.candidatos}`);
  console.log(`Removidos:   ${resultado.removidos}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Falha na retenção do audit log:', err);
  process.exit(1);
});
