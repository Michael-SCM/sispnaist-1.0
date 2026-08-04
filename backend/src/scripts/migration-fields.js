/**
 * Script de migração — SISPNAIST 1.0
 * 
 * Execute ANS do deploy com:
 *   mongosh <MONGO_URI> --file backend/src/scripts/migration-fields.js
 * 
 * Migrações incluídas:
 *   1. melhormaPontuacao → melhorPontuacao (treinamento_progressos)
 *   2. medicoPcmsmoNome/Crm → medicoPCMSONome/Crm (trabalhadorexamesaudes)
 *   3. ativa → ativo (empresas, unidades)
 *   4. allergy → alergia (trabalhador_informacoes)
 *   5. createdAt/updatedAt → dataCriacao/dataAtualizacao (acidentes, material_biologico, trabalhador_informacoes, audit_logs)
 *   6. trabalhadorId String → ObjectId (trabalhador_informacoes)
 */

print("=== SISPNAIST Migration Script ===");
print("Starting migrations...\n");

// 1. melhormaPontuacao → melhorPontuacao
print("1/6 Renaming melhormaPontuacao → melhorPontuacao...");
db.getCollection('treinamento_progressos').updateMany(
  { melhormaPontuacao: { $exists: true } },
  [
    { $set: { melhorPontuacao: "$melhormaPontuacao" } },
    { $unset: "melhormaPontuacao" }
  ]
);
print("   Done.\n");

// 2. medicoPcmsmoNome/Crm → medicoPCMSONome/Crm
print("2/6 Renaming medicoPcmsmoNome/Crm → medicoPCMSONome/Crm...");
db.getCollection('trabalhadorexamesaudes').updateMany(
  { $or: [{ medicoPcmsmoNome: { $exists: true } }, { medicoPcmsmoCrm: { $exists: true } }] },
  [
    {
      $set: {
        medicoPCMSONome: "$medicoPcmsmoNome",
        medicoPCMSOCrm: "$medicoPcmsmoCrm"
      }
    },
    { $unset: ["medicoPcmsmoNome", "medicoPcmsmoCrm"] }
  ]
);
print("   Done.\n");

// 3. ativa → ativo (empresas)
print("3/6 Renaming ativa → ativo in empresas...");
db.getCollection('empresas').updateMany(
  { ativa: { $exists: true } },
  [
    { $set: { ativo: "$ativa" } },
    { $unset: "ativa" }
  ]
);
print("   Done.\n");

// 3b. ativa → ativo (unidades)
print("3b/6 Renaming ativa → ativo in unidades...");
db.getCollection('unidades').updateMany(
  { ativa: { $exists: true } },
  [
    { $set: { ativo: "$ativa" } },
    { $unset: "ativa" }
  ]
);
print("   Done.\n");

// 4. allergy → alergia
print("4/6 Renaming allergy → alergia...");
db.getCollection('trabalhador_informacoes').updateMany(
  { allergy: { $exists: true } },
  [
    { $set: { alergia: "$allergy" } },
    { $unset: "allergy" }
  ]
);
print("   Done.\n");

// 5. createdAt/updatedAt → dataCriacao/dataAtualizacao
print("5/6 Renaming createdAt/updatedAt → dataCriacao/dataAtualizacao...");
const collectionsToMigrateTimestamps = ['acidentes', 'material_biologico', 'trabalhador_informacoes', 'audit_logs'];
for (const col of collectionsToMigrateTimestamps) {
  print(`   Migrating ${col}...`);
  db.getCollection(col).updateMany(
    { $or: [{ createdAt: { $exists: true } }, { updatedAt: { $exists: true } }] },
    [
      {
        $set: {
          dataCriacao: "$createdAt",
          dataAtualizacao: "$updatedAt"
        }
      },
      { $unset: ["createdAt", "updatedAt"] }
    ]
  );
}
print("   Done.\n");

// 6. trabalhadorId String → ObjectId (trabalhador_informacoes)
print("6/6 Converting trabalhadorId String → ObjectId in trabalhador_informacoes...");
const infoDocs = db.getCollection('trabalhador_informacoes').find({
  trabalhadorId: { $type: "string" }
}).toArray();
let converted = 0;
for (const doc of infoDocs) {
  if (doc.trabalhadorId && doc.trabalhadorId.length === 24) {
    db.getCollection('trabalhador_informacoes').updateOne(
      { _id: doc._id },
      { $set: { trabalhadorId: ObjectId(doc.trabalhadorId) } }
    );
    converted++;
  }
}
print(`   Converted ${converted} documents.\n`);

print("=== All migrations completed ===");
