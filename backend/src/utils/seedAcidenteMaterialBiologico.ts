import mongoose from 'mongoose';
import connectDB from '../config/database.js';
import AcidenteMaterialBiologico from '../models/AcidenteMaterialBiologico.js';
import SorologiaPaciente from '../models/SorologiaPaciente.js';
import SorologiaAcidentado from '../models/SorologiaAcidentado.js';
import Catalogo from '../models/Catalogo.js';
import Acidente from '../models/Acidente.js';
import Trabalhador from '../models/Trabalhador.js';

async function seedAcidenteMaterialBiologico() {
  console.log('🌱 Iniciando seed Acidente Material Biológico...');

  // Primeiro, garantir catálogos necessários
  const catNecessary = ['tipoExposicao', 'materialOrganico', 'circunstanciaAcidente', 'agente', 'equipamentoProtecao'];
  for (const entidade of catNecessary) {
    const count = await Catalogo.countDocuments({ entidade, ativo: true });
    if (count === 0) {
      console.warn(`⚠️  Catálogo ${entidade} vazio - execute seedCatalogos primeiro`);
    }
  }

  // Sample acidente biológico (assume existirem trabalhadores e acidentes)
  const trabalhadores = await Trabalhador.find({ ativo: true }).limit(3);
  const acidentes = await Acidente.find({ ativo: true }).limit(3);

  if (trabalhadores.length === 0 || acidentes.length === 0) {
    console.log('ℹ️ Nenhum trabalhador/acidente encontrado para sample data');
    return;
  }

  let criados = 0;

  for (let i = 0; i < 3; i++) {
    try {
      const tipoExposicao = await Catalogo.findOne({ entidade: 'tipoExposicao', ativo: true });
      const materialOrganico = await Catalogo.findOne({ entidade: 'materialOrganico', ativo: true });
      const circunstancia = await Catalogo.findOne({ entidade: 'circunstanciaAcidente', ativo: true });
      const agente = await Catalogo.findOne({ entidade: 'agente', ativo: true });

      if (!tipoExposicao || !materialOrganico || !circunstancia || !agente) continue;

      const sampleData = {
        acidenteId: acidentes[i % acidentes.length]._id,
        tipoExposicaoId: tipoExposicao._id,
        materialOrganicoId: materialOrganico._id,
        circunstanciaAcidenteId: circunstancia._id,
        agenteId: agente._id,
        usoEpi: i % 2 === 0,
        sorologiaFonte: true,
        acompanhamentoPrep: i === 1,
        dsAcompanhamentoPrep: i === 1 ? 'Profilaxia PrEP iniciada' : undefined,
        dsEncaminhamento: 'Encaminhado para infectologia',
        dtReavaliacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
        efeitoColateralPermanece: false,
        ativo: true,
      };

      await AcidenteMaterialBiologico.create(sampleData);

      // Sample sorologias para alguns
      if (i < 2) {
        await SorologiaPaciente.create({
          acidenteMaterialBiologicoId: (await AcidenteMaterialBiologico.findOne({ agenteId: agente._id }))!._id,
          pacienteFonteNome: `Paciente Fonte ${i + 1}`,
          pacienteFonteCpf: `123.456.789-${i === 0 ? '00' : '01'}`,
          hiv: 'Negativo',
          hbsAg: 'Negativo',
          antiHbc: 'Negativo',
          antiHcv: 'Negativo',
          vdrl: 'Negativo',
          dataColeta: new Date(),
          ativo: true,
        });
      }

      criados++;
    } catch (error) {
      console.error(`Erro sample ${i}:`, error);
    }
  }

  console.log(`✅ Seed Acidente Biológico concluído! ${criados} samples criados.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  connectDB().then(() => {
    seedAcidenteMaterialBiologico().then(() => {
      mongoose.connection.close();
      process.exit(0);
    });
  });
}

