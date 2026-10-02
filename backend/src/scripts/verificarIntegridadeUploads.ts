/**
 * Verificação de integridade dos uploads.
 *
 * Detecta documentos MongoDB sem o arquivo correspondente no storage — o risco
 * concreto do filesystem efêmero do Render free, que perde arquivos a cada
 * deploy/reinício enquanto o Atlas mantém os documentos.
 *
 * Uso:
 *   npm run uploads:integrity              relatório no stdout
 *   npm run uploads:integrity -- --json    relatório em JSON (para automação)
 *   npm run uploads:integrity -- --fix     remove arquivos órfãos em disco
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import config from '../config/config.js';
import uploadMaintenance from '../services/UploadMaintenanceService.js';

async function main() {
  const args = process.argv.slice(2);
  const asJson = args.includes('--json');
  const fix = args.includes('--fix');

  await mongoose.connect(config.mongodbUri);

  const relatorio = await uploadMaintenance.verificarIntegridade();
  const orfaos = await uploadMaintenance.limparOrfaoEmDisco(!fix);

  if (asJson) {
    console.log(JSON.stringify({ ...relatorio, orfaosEmDisco: orfaos }, null, 2));
  } else {
    console.log('\n=== Integridade dos uploads ===');
    console.log(`Gerado em:            ${relatorio.geradoEm}`);
    console.log(`Storage backend:      ${relatorio.storageBackend}`);
    console.log(`Criptografia em repouso: ${relatorio.criptografiaAtiva ? 'ATIVA' : 'desativada'}`);
    console.log(`Documentos no banco:   ${relatorio.totalDocumentos}`);
    console.log(`Integros:              ${relatorio.integros}`);
    console.log(`Com problema:          ${relatorio.comProblema}`);
    console.log(`Órfãos em disco${fix ? ' (removidos)' : ' (dry-run)'}: ${orfaos.removidos}`);

    if (relatorio.problemas.length > 0) {
      console.log('\n--- Problemas ---');
      for (const p of relatorio.problemas) {
        console.log(`[${p.motivo}] ${p.uploadId} ${p.nomeArmazenado} (${p.entidade})${p.detalhe ? ` — ${p.detalhe}` : ''}`);
      }
    }

    if (relatorio.comProblema === 0) {
      console.log('\nNenhuma inconsistência encontrada.');
    } else {
      console.log(
        '\nAção sugerida: restaure o arquivo do backup do bucket S3, ou remova a referência ' +
          'órfã do banco após validar com o responsável pelo registro.'
      );
    }
  }

  await mongoose.disconnect();
  process.exit(relatorio.comProblema > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Falha na verificação de integridade:', err);
  process.exit(2);
});
