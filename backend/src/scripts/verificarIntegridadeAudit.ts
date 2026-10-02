/**
 * Verificação da cadeia de integridade do log de auditoria.
 *
 * Confere, registro a registro, se `hash` confere com o recálculo a partir de
 * `hashAnterior` e se o vínculo com o registro imediatamente anterior não foi
 * quebrado. Uma divergência indica adulteração, corrupção ou exclusão/edição
 * fora do fluxo normal (inclusive via driver nativo).
 *
 * Uso:
 *   npm run audit:verify                relatório no stdout
 *   npm run audit:verify -- --json      relatório em JSON (para automação)
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import config from '../config/config.js';
import auditService from '../services/AuditService.js';
import { obterPoliticaRetencao } from '../config/auditPolicy.js';

async function main() {
  const asJson = process.argv.slice(2).includes('--json');

  await mongoose.connect(config.mongodbUri);

  const relatorio = await auditService.verificarIntegridadeCadeia();
  const politica = obterPoliticaRetencao();

  if (asJson) {
    console.log(JSON.stringify({ ...relatorio, politica }, null, 2));
  } else {
    console.log('\n=== Cadeia de integridade do audit log ===');
    console.log(`Gerado em:          ${relatorio.geradoEm}`);
    console.log(`Registros:          ${relatorio.totalRegistros}`);
    console.log(`Conferidos:         ${relatorio.conferidos}`);
    console.log(`Integros:             ${relatorio.integros}`);
    console.log(`Quebras:             ${relatorio.quebras}`);
    console.log(`Reinícios aceitos:   ${relatorio.reiniciosAceitos}`);
    console.log(`Retenção (dias):     ${politica.dias}${politica.retencaoHabilitada ? '' : ' (desabilitada)'}`);
    console.log(`Índice TTL ativo:    ${politica.indiceTtlAtivo ? 'SIM' : 'não'}`);

    if (relatorio.primeiroProblema) {
      console.log('\n--- Primeiro problema ---');
      console.log(JSON.stringify(relatorio.primeiroProblema, null, 2));
      console.log(
        '\nAção sugerida: trate como incidente. Rode `npm run audit:export` para ' +
          'preservar cópia da trilha e compare com o último dump offline.'
      );
    } else {
      console.log('\nCadeia íntegra.');
    }
  }

  await mongoose.disconnect();
  process.exit(relatorio.quebras > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Falha na verificação da cadeia de auditoria:', err);
  process.exit(2);
});
