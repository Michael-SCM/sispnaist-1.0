/**
 * Exporta a trilha de auditoria para arquivo JSONL (um evento por linha).
 *
 * Parte da política: a cadeia de hash é guardada no mesmo banco dos logs, o
 * que detecta adulteração por aplicação, mas não contra administrador com
 * escrita direta. O dump offline cria uma cópia fora do alcance do banco e
 * pode ser conferido depois — o campo `hash` de cada linha permite verificar
 * qualquer trecho exportado com `npm run audit:verify` no banco de destino.
 *
 * Uso:
 *   npm run audit:export                       exporta tudo
 *   npm run audit:export -- --since 2026-01-01
 *   npm run audit:export -- --out ./backup/audit.jsonl
 *
 * O arquivo NÃO é versionado (saia do diretório do repositório ou use um
 * caminho fora dele). Revisar a política de acesso antes de compartilhar.
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
import config from '../config/config.js';
import AuditLog from '../models/AuditLog.js';
import { AUDIT_EXPORT_DIR } from '../config/auditPolicy.js';

function argValue(nome: string): string | undefined {
  const args = process.argv.slice(2);
  const i = args.indexOf(nome);
  return i >= 0 ? args[i + 1] : undefined;
}

async function main() {
  const since = argValue('--since');
  const outDir = argValue('--out') || AUDIT_EXPORT_DIR;

  await mongoose.connect(config.mongodbUri);

  const filtro: any = {};
  if (since) filtro.dataCriacao = { $gte: new Date(since) };

  fs.mkdirSync(outDir, { recursive: true });
  const nomeArquivo = `audit-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`;
  const destino = path.resolve(outDir, nomeArquivo);

  const cursor = AuditLog.find(filtro)
    .sort({ dataCriacao: 1, _id: 1 })
    .lean()
    .cursor();

  let total = 0;
  const stream = fs.createWriteStream(destino, { encoding: 'utf8' });

  for await (const doc of cursor as any) {
    if (!stream.write(`${JSON.stringify(doc)}\n`)) {
      await new Promise<void>((resolve) => stream.once('drain', () => resolve()));
    }
    total++;
  }

  await new Promise<void>((resolve, reject) => {
    stream.end((err?: Error | null) => (err ? reject(err) : resolve()));
  });

  console.log('\n=== Exportação do audit log ===');
  console.log(`Arquivo:  ${destino}`);
  console.log(`Registros: ${total}`);
  console.log(`Filtro:    ${since ? `a partir de ${since}` : 'todos'}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Falha na exportação do audit log:', err);
  process.exit(1);
});
