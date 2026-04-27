const mongoose = require('mongoose');

// Schema do Catalogo (inline para evitar problemas de import ES module)
const CatalogoSchema = new mongoose.Schema({
  entidade: { type: String, required: true, index: true },
  nome: { type: String, required: true, trim: true },
  sigla: { type: String, trim: true },
  descricao: { type: String, trim: true },
  ativo: { type: Boolean, default: true },
  ordem: { type: Number, default: 0 }
}, {
  timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
  collection: 'catalogos'
});

CatalogoSchema.index({ entidade: 1, ativo: 1 });
CatalogoSchema.index({ entidade: 1, ordem: 1 });

const Catalogo = mongoose.model('Catalogo', CatalogoSchema);

const CATALOGO_DADOS = [
  { entidade: 'sexo', itens: [
    { nome: 'Masculino', sigla: 'M', ordem: 1 },
    { nome: 'Feminino', sigla: 'F', ordem: 2 },
  ]},
  { entidade: 'racaCor', itens: [
    { nome: 'Branca', ordem: 1 },
    { nome: 'Preta', ordem: 2 },
    { nome: 'Parda', ordem: 3 },
    { nome: 'Amarela', ordem: 4 },
    { nome: 'Indígena', ordem: 5 },
    { nome: 'Não informada', ordem: 6 },
  ]},
  { entidade: 'escolaridade', itens: [
    { nome: 'Analfabeto', ordem: 1 },
    { nome: 'Fundamental Incompleto', ordem: 2 },
    { nome: 'Fundamental Completo', ordem: 3 },
    { nome: 'Médio Incompleto', ordem: 4 },
    { nome: 'Médio Completo', ordem: 5 },
    { nome: 'Superior Incompleto', ordem: 6 },
    { nome: 'Superior Completo', ordem: 7 },
    { nome: 'Pós-graduação', ordem: 8 },
    { nome: 'Mestrado', ordem: 9 },
    { nome: 'Doutorado', ordem: 10 },
  ]},
  { entidade: 'estadoCivil', itens: [
    { nome: 'Solteiro(a)', sigla: 'S', ordem: 1 },
    { nome: 'Casado(a)', sigla: 'C', ordem: 2 },
    { nome: 'Divorciado(a)', sigla: 'D', ordem: 3 },
    { nome: 'Viúvo(a)', sigla: 'V', ordem: 4 },
    { nome: 'Separado(a)', sigla: 'SE', ordem: 5 },
    { nome: 'União Estável', sigla: 'UE', ordem: 6 },
  ]},
  { entidade: 'tipoSanguineo', itens: [
    { nome: 'A Positivo', sigla: 'A+', ordem: 1 },
    { nome: 'A Negativo', sigla: 'A-', ordem: 2 },
    { nome: 'B Positivo', sigla: 'B+', ordem: 3 },
    { nome: 'B Negativo', sigla: 'B-', ordem: 4 },
    { nome: 'AB Positivo', sigla: 'AB+', ordem: 5 },
    { nome: 'AB Negativo', sigla: 'AB-', ordem: 6 },
    { nome: 'O Positivo', sigla: 'O+', ordem: 7 },
    { nome: 'O Negativo', sigla: 'O-', ordem: 8 },
  ]},
  { entidade: 'situacaoTrabalho', itens: [
    { nome: 'Ativo', ordem: 1 },
    { nome: 'Afastado', ordem: 2 },
    { nome: 'Desligado', ordem: 3 },
    { nome: 'Aposentado', ordem: 4 },
    { nome: 'Transferido', ordem: 5 },
    { nome: 'Licenciado', ordem: 6 },
  ]},
  { entidade: 'tipoVinculo', itens: [
    { nome: 'Efetivo', ordem: 1 },
    { nome: 'CLT', ordem: 2 },
    { nome: 'Estágio', ordem: 3 },
    { nome: 'Temporário', ordem: 4 },
    { nome: 'Terceirizado', ordem: 5 },
    { nome: 'Comissionado', ordem: 6 },
    { nome: 'Pensionista', ordem: 7 },
  ]},
  { entidade: 'funcao', itens: [
    { nome: 'Médico(a)', ordem: 1 },
    { nome: 'Enfermeiro(a)', ordem: 2 },
    { nome: 'Técnico(a) de Enfermagem', ordem: 3 },
    { nome: 'Auxiliar de Enfermagem', ordem: 4 },
    { nome: 'Dentista', ordem: 5 },
    { nome: 'Farmacêutico(a)', ordem: 6 },
    { nome: 'Fisioterapeuta', ordem: 7 },
    { nome: 'Nutricionista', ordem: 8 },
    { nome: 'Psicólogo(a)', ordem: 9 },
    { nome: 'Assistente Social', ordem: 10 },
    { nome: 'Técnico(a) em Saúde Bucal', ordem: 11 },
    { nome: 'Agente Comunitário de Saúde', ordem: 12 },
    { nome: 'Administrativo', ordem: 13 },
    { nome: 'Motorista', ordem: 14 },
    { nome: 'Segurança', ordem: 15 },
    { nome: 'Serviços Gerais', ordem: 16 },
    { nome: 'Outro', ordem: 99 },
  ]},
  { entidade: 'jornadaTrabalho', itens: [
    { nome: '20 horas semanais', sigla: '20h', ordem: 1 },
    { nome: '30 horas semanais', sigla: '30h', ordem: 2 },
    { nome: '40 horas semanais', sigla: '40h', ordem: 3 },
    { nome: '44 horas semanais', sigla: '44h', ordem: 4 },
  ]},
  { entidade: 'turnoTrabalho', itens: [
    { nome: 'Diurno', ordem: 1 },
    { nome: 'Noturno', ordem: 2 },
    { nome: 'Misto', ordem: 3 },
    { nome: 'Plantão 12h', ordem: 4 },
    { nome: 'Plantão 24h', ordem: 5 },
    { nome: 'Rodízio', ordem: 6 },
  ]},
  { entidade: 'parentesco', itens: [
    { nome: 'Cônjuge', sigla: 'conjuge', ordem: 1 },
    { nome: 'Filho(a)', sigla: 'filho', ordem: 2 },
    { nome: 'Enteado(a)', sigla: 'enteado', ordem: 3 },
    { nome: 'Irmão(ã)', sigla: 'irmao', ordem: 4 },
    { nome: 'Mãe', sigla: 'mae', ordem: 5 },
    { nome: 'Pai', sigla: 'pai', ordem: 6 },
    { nome: 'Neto(a)', sigla: 'neto', ordem: 7 },
    { nome: 'Sobrinho(a)', sigla: 'sobrinho', ordem: 8 },
    { nome: 'Tutor(a)', sigla: 'tutor', ordem: 9 },
    { nome: 'Outro', sigla: 'outro', ordem: 99 },
  ]},
];

async function seedCatalogos() {
  console.log('🌱 Iniciando seed de catálogos...');

  let criados = 0;
  let pulados = 0;

  for (const catalogo of CATALOGO_DADOS) {
    for (const item of catalogo.itens) {
      try {
        const existente = await Catalogo.findOne({
          entidade: catalogo.entidade,
          nome: item.nome,
        });

        if (existente) {
          pulados++;
          continue;
        }

        await Catalogo.create({
          entidade: catalogo.entidade,
          nome: item.nome,
          sigla: item.sigla || undefined,
          ordem: item.ordem,
          ativo: true,
        });
        criados++;
      } catch (error) {
        console.error(`Erro ao criar ${catalogo.entidade} - ${item.nome}:`, error.message);
      }
    }
  }

  console.log(`✅ Seed concluído! ${criados} itens criados, ${pulados} pulados (já existiam).`);
}

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sispatnaist';
    await mongoose.connect(mongoUri);
    console.log('✓ MongoDB connected successfully');

    await seedCatalogos();

    console.log('🚀 Seed finalizado. Fechando conexão...');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Erro:', error.message);
    process.exit(1);
  }
}

main();

