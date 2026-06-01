import mongoose from 'mongoose';
import dns from 'node:dns';
import 'dotenv/config';

dns.setDefaultResultOrder('ipv4first');

import Trabalhador from '../models/Trabalhador.js';
import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import MaterialBiologico from '../models/MaterialBiologico.js';
import Catalogo from '../models/Catalogo.js';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento.js';

interface CatalogoMap {
  [key: string]: string[];
}

// Seeded PRNG
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

const doencasOcupacionais = [
  { codigoDoenca: 'B30.9', nomeDoenca: 'Alergia a pó ocupacional', relato: 'Desenvolvimento de reação alérgica devido à exposição ocupacional contínua a partículas suspensas no ambiente de trabalho.' },
  { codigoDoenca: 'M25.5', nomeDoenca: 'Dor articular relacionada ao trabalho', relato: 'Dor articular crônica associada às atividades laborais repetitivas, com piora progressiva ao longo da jornada.' },
  { codigoDoenca: 'J30.9', nomeDoenca: 'Rinite alérgica ocupacional', relato: 'Inflamação nasal alérgica provocada por agentes ocupacionais presentes no ambiente laboral.' },
  { codigoDoenca: 'L23.9', nomeDoenca: 'Dermatite de contato profissional', relato: 'Inflamação da pele causada por contato com substâncias químicas utilizadas no processo de trabalho.' },
  { codigoDoenca: 'G56.1', nomeDoenca: 'Síndrome do Túnel do Carpo', relato: 'Compressão do nervo mediano no punho relacionada ao trabalho repetitivo com movimentos de flexão e extensão.' },
  { codigoDoenca: 'M54.5', nomeDoenca: 'Lombalgia ocupacional', relato: 'Dor lombar crônica decorrente de esforço físico excessivo e posturas inadequadas no ambiente de trabalho.' },
  { codigoDoenca: 'H83.3', nomeDoenca: 'Perda auditiva induzida por ruído', relato: 'Diminuição da acuidade auditiva devido à exposição prolongada a ruídos elevados no ambiente ocupacional.' },
  { codigoDoenca: 'F43.2', nomeDoenca: 'Transtorno de adaptação ao trabalho', relato: 'Sintomas de ansiedade e depressão relacionados a situações estressantes no ambiente profissional.' },
  { codigoDoenca: 'J45.0', nomeDoenca: 'Asma ocupacional', relato: 'Crise de broncoespasmo desencadeada por agentes sensibilizantes presentes no ambiente de trabalho.' },
  { codigoDoenca: 'M70.2', nomeDoenca: 'Bursite do ombro relacionada ao trabalho', relato: 'Inflamação da bursa subacromial devido a movimentos repetitivos de elevação dos membros superiores.' },
  { codigoDoenca: 'Z57.9', nomeDoenca: 'Exposição a fatores de risco ocupacional', relato: 'Trabalhador exposto a agentes nocivos à saúde durante o exercício de sua função laboral.' },
  { codigoDoenca: 'I10', nomeDoenca: 'Hipertensão arterial relacionada ao trabalho', relato: 'Elevação dos níveis pressóricos associada ao estresse ocupacional crônico.' },
];

const vacinasDisponiveis = [
  { vacina: 'Hepatite B', doseUnica: false, intervaloDias: 30 },
  { vacina: 'Hepatite A', doseUnica: false, intervaloDias: 180 },
  { vacina: 'Tétano', doseUnica: false, intervaloDias: 365 },
  { vacina: 'Difteria', doseUnica: false, intervaloDias: 365 },
  { vacina: 'Coqueluche', doseUnica: false, intervaloDias: 365 },
  { vacina: 'Influenza', doseUnica: true, intervaloDias: 365 },
  { vacina: 'Sarampo', doseUnica: false, intervaloDias: 30 },
  { vacina: 'Caxumba', doseUnica: false, intervaloDias: 30 },
  { vacina: 'Rubéola', doseUnica: false, intervaloDias: 30 },
  { vacina: 'Varicela', doseUnica: false, intervaloDias: 30 },
  { vacina: 'COVID-19', doseUnica: false, intervaloDias: 90 },
  { vacina: 'Febre Amarela', doseUnica: true, intervaloDias: 365 },
  { vacina: 'Tríplice Viral', doseUnica: false, intervaloDias: 30 },
  { vacina: 'Meningocócica', doseUnica: false, intervaloDias: 60 },
  { vacina: 'Pneumocócica', doseUnica: false, intervaloDias: 365 },
];

const statusAcidente = ['Aberto', 'Em Análise', 'Fechado'];

const MATERIAL_BIOLOGICO_PROB = 0.18;
const PROB_ACIDENTE_COM_AFASTAMENTO = 0.40;

const unidadesSaude = [
  'Hospital Central da Saúde', 'UPA - Unidade de Pronto Atendimento Zona Sul',
  'Pronto Socorro Municipal', 'Hospital Geral do Servidor',
  'Centro de Saúde do Trabalhador', 'Hospital Universitário',
  'Unidade Básica de Saúde - Jardim América', 'Santa Casa de Misericórdia',
  'Hospital Regional do Trabalhador', 'Clínica de Saúde Ocupacional',
];

const profissionaisSaude = [
  'Dr. Ricardo Almeida - Médico do Trabalho', 'Dra. Fernanda Martins - Médica do Trabalho',
  'Dr. Carlos Eduardo - Ortopedista', 'Dra. Patrícia Oliveira - Clínica Geral',
  'Dr. Marcelo Santos - Infectologista', 'Enf. Ana Beatriz - Enfermeira do Trabalho',
  'Enf. Juliana Costa - Enfermeira', 'Dr. Roberto Lima - Cardiologista',
  'Dra. Camila Rocha - Dermatologista', 'Dr. Thiago Nunes - Otorrino',
  'Dr. André Moura - Neurologista', 'Dra. Renata Xavier - Psiquiatra',
  'Enf. Paulo Sérgio - Enfermeiro Vacinador', 'Téc. Maria Aparecida - Técnica de Enfermagem',
];

function getRandomDate(daysAgo: number = 365, baseDate?: Date): Date {
  const now = baseDate || new Date();
  const random = Math.floor(Math.random() * daysAgo);
  return new Date(now.getTime() - random * 24 * 60 * 60 * 1000);
}

function clampInt(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(n)));
}

async function getCatalogoMap(): Promise<CatalogoMap> {
  const catalogos = await Catalogo.find({});
  const map: CatalogoMap = {};
  catalogos.forEach((cat) => {
    if (!map[cat.entidade]) map[cat.entidade] = [];
    map[cat.entidade].push(cat.nome);
  });
  return map;
}

function pickOrFallback(map: CatalogoMap, key: string, fallback: string[]) {
  return map[key] && map[key].length > 0 ? map[key] : fallback;
}

function asTipoAcidente(ehMaterialBiologico: boolean) {
  if (ehMaterialBiologico) return 'Acidente com Material Biológico';
  const r = Math.random();
  if (r < 0.55) return 'Típico';
  if (r < 0.80) return 'Trajeto';
  if (r < 0.92) return 'Violência';
  return 'Doença Ocupacional';
}

function safeLower(s: string) {
  return (s || '').toLowerCase();
}

const descricoesAcidente = [
  'Durante o desempenho de suas atividades laborais, o trabalhador sofreu {causa} resultando em {trauma} na região {parte}.',
  'No exercício de sua função, o colaborador foi vítima de {causa} com consequente {trauma} em {parte}.',
  'O trabalhador relata que, ao realizar suas atividades rotineiras, ocorreu {causa} causando {trauma} em {parte}.',
  'Registro de acidente de trabalho típico: durante a jornada, o trabalhador experienciou {causa} com {trauma} localizado em {parte}.',
  'Acidente ocupacional registrado: {causa} durante o expediente, provocando {trauma} na região de {parte}.',
  'Comunicado de acidente de trabalho: o funcionário sofreu {causa} enquanto desempenhava suas funções, ocasionando {trauma} em {parte}.',
  'Ocorrência laboral: {causa} no ambiente de trabalho com {trauma} na {parte}. Necessitou de atendimento imediato.',
];

const descricoesTrauma = [
  'Paciente apresenta {trauma} na região de {parte} com limitação funcional parcial. Necessita de afastamento para recuperação.',
  '{trauma} em {parte} com edema local e dor à palpação. Recomendado repouso e acompanhamento ambulatorial.',
  'Diagnóstico clínico de {trauma} em {parte}. Paciente consciente e orientado, com sinais vitais estáveis.',
  'Avaliação médica constata {trauma} em {parte}. Realizado curativo e prescrita medicação analgésica e anti-inflamatória.',
  'Exame físico revela {trauma} em {parte} com hematoma local. Solicitados exames complementares para avaliação.',
];

function gerarDescricao(causador: string, trauma: string, parte: string): string {
  const template = pick(descricoesAcidente, Math.random);
  return template
    .replace('{causa}', safeLower(causador))
    .replace('{trauma}', safeLower(trauma))
    .replace('{parte}', safeLower(parte))
    .replace('{trauma}', safeLower(trauma))
    .replace('{parte}', safeLower(parte));
}

const locaisAcidente = [
  'Ambiente de trabalho - Setor Administrativo', 'Almoxarifado Central',
  'Área de produção industrial', 'Corredor de acesso ao refeitório',
  'Escadaria do prédio administrativo', 'Estacionamento da empresa',
  'Laboratório de análises clínicas', 'Posto de enfermagem',
  'Sala de cirurgia/ procedimentos', 'Centro cirúrgico',
  'Rua - Trajeto residência-trabalho', 'Rua - Trajeto trabalho-residência',
  'Depósito de materiais', 'Cozina industrial',
  'Câmera fria / refrigeração', 'Área externa - Jardim',
  'Sala de reuniões', 'Auditório',
  'Arquivo central', 'Central de esterilização',
];

async function seedAcidentesDoencasVacinacoes() {
  let timeoutId: NodeJS.Timeout | null = null;

  try {
    console.log('🌱 Iniciando seed de Acidentes, Doenças e Vacinações...');
    console.log('📡 Conectando ao MongoDB...');

    timeoutId = setTimeout(() => {
      console.error('❌ Timeout na conexão com MongoDB (30s)');
      process.exit(1);
    }, 30000);

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sispnaist', {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
      });
    }

    clearTimeout(timeoutId);
    console.log('✅ Conectado ao MongoDB!');

    console.log('🔍 Carregando catálogos...');
    const catalogoMap = await getCatalogoMap();

    console.log('🔍 Carregando trabalhadores...');
    const trabalhadores = await Trabalhador.find({});

    if (trabalhadores.length === 0) {
      console.log('❌ Nenhum trabalhador encontrado no banco!');
      console.log('💡 Execute primeiro: npm run seed:trabalhadores');
      process.exit(1);
    }

    console.log(`✅ Trabalhadores encontrados: ${trabalhadores.length}`);

    console.log('🧹 Limpando dados antigos...');
    const [acidentesDeletados, materialBiologicoDeletados, doencasDeletadas, vacinacoesDeletadas, afastamentosDeletados] =
      await Promise.all([
        Acidente.deleteMany({}),
        MaterialBiologico.deleteMany({}),
        Doenca.deleteMany({}),
        Vacinacao.deleteMany({}),
        TrabalhadorAfastamento.deleteMany({}),
      ]);

    console.log(`   ✅ Acidentes removidos: ${acidentesDeletados.deletedCount ?? 0}`);
    console.log(`   ✅ Material biológico: ${materialBiologicoDeletados.deletedCount ?? 0}`);
    console.log(`   ✅ Doenças: ${doencasDeletadas.deletedCount ?? 0}`);
    console.log(`   ✅ Vacinações: ${vacinacoesDeletadas.deletedCount ?? 0}`);
    console.log(`   ✅ Afastamentos: ${afastamentosDeletados.deletedCount ?? 0}`);

    const tiposAfastamento = pickOrFallback(catalogoMap, 'tipoAfastamento', [
      'Doença', 'Acidente de trabalho', 'Licença maternidade', 'Licença para tratamento',
    ]);
    const motivosAfastamento = pickOrFallback(catalogoMap, 'motivoAfastamento', [
      'Doença comum', 'Doença profissional', 'COVID-19', 'Cirurgia', 'Acidente',
    ]);

    let acidentesCriados = 0;
    let doencasCriadas = 0;
    let vacinacoesCriadas = 0;
    let fichasTecnicas = 0;
    let afastamentosCriados = 0;
    let erros = 0;

    for (let i = 0; i < trabalhadores.length; i++) {
      const trabalhador = trabalhadores[i];
      const seedRand = mulberry32(i * 7919 + 12347);
      const dateOffset = i * 7; // cada trabalhador com datas ligeiramente diferentes

      try {
        if (i % 50 === 0) {
          console.log(`[${i + 1}/${trabalhadores.length}] ${trabalhador.nome}`);
        }

        // ========================================
        // 1. CRIAR 1 DOENÇA POR TRABALHADOR
        // ========================================
        const doencaInfo = pick(doencasOcupacionais, seedRand);
        const dataInicioDoenca = getRandomDate(545, new Date(2026, 5, 1));
        const isAtiva = seedRand() > 0.35;

        await Doenca.create({
          dataInicio: dataInicioDoenca,
          dataFim: isAtiva ? undefined : getRandomDate(30),
          trabalhadorId: trabalhador._id,
          codigoDoenca: doencaInfo.codigoDoenca,
          nomeDoenca: doencaInfo.nomeDoenca,
          relatoClinico: doencaInfo.relato,
          profissionalSaude: pick(profissionaisSaude, seedRand),
          ativo: isAtiva,
        });
        doencasCriadas++;

        // ========================================
        // 2. CRIAR 2 VACINAS POR TRABALHADOR
        // ========================================
        const vacinasEscolhidas: string[] = [];
        for (let v = 0; v < 2; v++) {
          let vacinaInfo = pick(vacinasDisponiveis, mulberry32(i * 100 + v * 13 + 777));
          // Evitar repetir a mesma vacina para o mesmo trabalhador
          let tentativas = 0;
          while (vacinasEscolhidas.includes(vacinaInfo.vacina) && tentativas < 10) {
            vacinaInfo = pick(vacinasDisponiveis, mulberry32(i * 100 + v * 13 + 777 + tentativas));
            tentativas++;
          }
          vacinasEscolhidas.push(vacinaInfo.vacina);

          const dataVac = getRandomDate(425, new Date(2026, 5, 1));
          const dataProxDose = vacinaInfo.doseUnica
            ? undefined
            : new Date(dataVac.getTime() + vacinaInfo.intervaloDias * 24 * 60 * 60 * 1000);

          await Vacinacao.create({
            trabalhadorId: trabalhador._id,
            vacina: vacinaInfo.vacina,
            dataVacinacao: dataVac,
            proximoDose: dataProxDose,
            unidadeSaude: pick(unidadesSaude, mulberry32(i * 100 + v * 37 + 555)),
            profissional: pick(profissionaisSaude, mulberry32(i * 100 + v * 53 + 333)),
            certificado: `CERT-${String(20250000 + i).padStart(8, '0')}-${String(v + 1)}`,
          });
          vacinacoesCriadas++;
        }

        // ========================================
        // 3. CRIAR 1-4 ACIDENTES POR TRABALHADOR
        // ========================================
        const numAcidentes = 1 + Math.floor(seedRand() * 4); // 1 a 4

        for (let a = 0; a < numAcidentes; a++) {
          const acRand = mulberry32(i * 10000 + a * 997 + 3333);
          const ehMaterialBiologico = acRand() < MATERIAL_BIOLOGICO_PROB;
          const tipoAcidenteValue = asTipoAcidente(ehMaterialBiologico);

          const tiposTrauma = pickOrFallback(catalogoMap, 'tipoTrauma', ['Contusão', 'Fratura', 'Entorse', 'Laceração', 'Escoriação', 'Queimadura']);
          const partesCorpo = pickOrFallback(catalogoMap, 'parteCorpo', ['Mãos/Dedos', 'Ombro', 'Coluna', 'Punho', 'Joelho', 'Braço', 'Pé', 'Cabeça']);
          const causadores = pickOrFallback(catalogoMap, 'causadorTrauma', ['Queda de mesmo nível', 'Esforço repetitivo', 'Corte com objeto perfurocortante', 'Impacto contra objeto', 'Movimento brusco', 'Exposição a agente químico']);

          const tipoTraumaValue = pick(tiposTrauma, acRand);
          const parteCorpoValue = pick(partesCorpo, acRand);
          const causadorValue = pick(causadores, acRand);
          const statusValue = pick(statusAcidente, acRand);
          const comAfastamento = acRand() < PROB_ACIDENTE_COM_AFASTAMENTO;

          const dataAcidente = getRandomDate(365, new Date(2026, 5, 1));

          const descricao = gerarDescricao(causadorValue, tipoTraumaValue, parteCorpoValue);
          const descricaoTrauma = pick(descricoesTrauma, acRand)
            .replace('{trauma}', safeLower(tipoTraumaValue))
            .replace('{parte}', safeLower(parteCorpoValue))
            .replace('{parte}', safeLower(parteCorpoValue));

          const local = pick(locaisAcidente, acRand);
          const internou = acRand() > 0.75;
          const teveAtendimento = acRand() > 0.08;

          const acidente = await Acidente.create({
            dataAcidente,
            horario: `${Math.floor(acRand() * 24).toString().padStart(2, '0')}:${Math.floor(acRand() * 60).toString().padStart(2, '0')}`,
            horarioAposInicioJornada: `${Math.floor(acRand() * 8).toString().padStart(2, '0')}:${Math.floor(acRand() * 60).toString().padStart(2, '0')}`,
            trabalhadorId: trabalhador._id,
            tipoAcidente: tipoAcidenteValue,
            tipoTrauma: tipoTraumaValue,
            agenteCausador: causadorValue,
            parteCorpo: parteCorpoValue,
            descricao,
            descricaoTrauma,
            local,
            lesoes: [tipoTraumaValue],
            feriado: acRand() > 0.95,
            comunicado: acRand() > 0.15,
            dataComunicacao: acRand() > 0.15 ? getRandomDate(15, dataAcidente) : undefined,
            dataNotificacao: getRandomDate(10, dataAcidente),

            atendimentoMedico: teveAtendimento,
            dataAtendimento: teveAtendimento ? getRandomDate(2, dataAcidente) : undefined,
            horaAtendimento: `${Math.floor(acRand() * 24).toString().padStart(2, '0')}:${Math.floor(acRand() * 60).toString().padStart(2, '0')}`,
            unidadeAtendimento: teveAtendimento ? pick(unidadesSaude, acRand) : undefined,

            internamento: internou,
            duracaoInternamento: internou ? Math.floor(acRand() * 15) + 1 : undefined,

            catNas: acRand() > 0.25,
            registroPolicial: acRand() > 0.92,
            encaminhamentoJuntaMedica: acRand() > 0.55,
            afastamento: comAfastamento,

            outrosTrabalhadoresAtingidos: acRand() > 0.85,
            quantidadeTrabalhadoresAtingidos: acRand() > 0.85 ? Math.floor(acRand() * 4) + 1 : undefined,

            status: statusValue,
          });

          acidentesCriados++;

          // ---- Ficha Técnica (Material Biológico) ----
          if (ehMaterialBiologico) {
            try {
              const mbRand = mulberry32(i * 1000 + a * 77 + 9999);
              const tipoExposicaoValue = pick(pickOrFallback(catalogoMap, 'tipoExposicao', ['Percutânea', 'Mucosa', 'Pele não íntegra', 'Mordedura humana']), mbRand);
              const materialOrganicoValue = pick(pickOrFallback(catalogoMap, 'materialOrganico', ['Sangue', 'Secreção genital', 'Líquido cefalorraquidiano', 'Líquido amniótico', 'Líquido synovial']), mbRand);
              const circunstanciaValue = pick(pickOrFallback(catalogoMap, 'circunstanciaAcidente', ['Durante procedimento cirúrgico', 'Administração de medicamentos', 'Manuseio de resíduos', 'Acidente com agulha', 'Contato com paciente']), mbRand);
              const agenteValue = pick(pickOrFallback(catalogoMap, 'agente', ['Biológico', 'Vírus HIV', 'Vírus Hepatite B', 'Vírus Hepatite C', 'Bactéria']), mbRand);
              const condutaValue = pick(pickOrFallback(catalogoMap, 'conduta', ['Apenas acompanhamento', 'Quimioprofilaxia', 'vacinação', 'Imunoglobulina']), mbRand);
              const evolucaoValue = pick(pickOrFallback(catalogoMap, 'evolucaoCaso', ['Alta (Sem soroconversão)', 'Alta (Sem intercorrências)', 'Em acompanhamento', 'Soroconversão confirmada']), mbRand);
              const sorologiaValue = pick(pickOrFallback(catalogoMap, 'sorologia', ['Não Reagente (Negativo)', 'Reagente (Positivo)', 'Indeterminado']), mbRand);

              await MaterialBiologico.create({
                acidenteId: acidente._id,
                tipoExposicao: tipoExposicaoValue,
                materialOrganico: materialOrganicoValue,
                circunstanciaAcidente: circunstanciaValue,
                agente: agenteValue,
                equipamentoProtecao: mbRand() > 0.4 ? 'Utilizado corretamente' : 'Não utilizado',
                sorologiaPaciente: sorologiaValue,
                sorologiaAcidentado: sorologiaValue,
                conduta: condutaValue,
                evolucaoCaso: evolucaoValue,
                usoEPI: mbRand() > 0.4,
                sorologiaFonte: mbRand() > 0.75,
                acompanhamentoPrEP: mbRand() > 0.65,
                descAcompanhamentoPrEP: 'Acompanhamento iniciado conforme protocolo do Ministério da Saúde.',
                descEncaminhamento: 'Encaminhado para serviço de infectologia de referência.',
                dataReavaliacao: getRandomDate(60, dataAcidente),
                efeitoColateralPermanente: mbRand() > 0.97,
                descEfeitoColateralPermanente: mbRand() > 0.97 ? 'Paciente relata fadiga persistente após tratamento.' : undefined,
              });
              fichasTecnicas++;
            } catch {
              erros++;
            }
          }

          // ---- Afastamento ----
          if (comAfastamento) {
            try {
              const dias = clampInt(3 + Math.random() * 42, 3, 45);
              const dataInicio = new Date(dataAcidente);
              dataInicio.setHours(0, 0, 0, 0);
              const dataRetorno = new Date(dataInicio.getTime() + dias * 24 * 60 * 60 * 1000);

              await TrabalhadorAfastamento.create({
                trabalhadorId: trabalhador._id,
                tipoAfastamento: pick(tiposAfastamento, () => Math.random()),
                motivoAfastamento: pick(motivosAfastamento, () => Math.random()),
                cid: `M${50 + Math.floor(Math.random() * 40)}.${Math.floor(Math.random() * 9)}`,
                dataInicio,
                dataFim: new Date(dataInicio.getTime() + dias * 24 * 60 * 60 * 1000),
                dataRetorno,
                dataPericia: new Date(dataInicio.getTime() + Math.max(1, Math.floor(dias / 2)) * 24 * 60 * 60 * 1000),
                desfecho: pick(['Retorno ao trabalho', 'Encaminhamento para avaliação', 'Alta', 'Afastamento prorrogado'], () => Math.random()),
                tempoAfastamento: `${dias} dias`,
                ativo: true,
              });
              afastamentosCriados++;
            } catch {
              erros++;
            }
          }
        }
      } catch {
        erros++;
      }
    }

    console.log('\n✨ Seed concluído com sucesso!');
    console.log(`📊 Resumo:`);
    console.log(`   • Acidentes criados: ${acidentesCriados}`);
    console.log(`   • Fichas técnicas (material biológico): ${fichasTecnicas}`);
    console.log(`   • Doenças criadas: ${doencasCriadas}`);
    console.log(`   • Vacinações criadas: ${vacinacoesCriadas}`);
    console.log(`   • Afastamentos criados: ${afastamentosCriados}`);
    console.log(`   • Erros: ${erros}`);
  } catch (error) {
    console.error('❌ Erro no seed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    try {
      if (timeoutId) clearTimeout(timeoutId);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
    } catch {
      // ignore
    }
  }
}

seedAcidentesDoencasVacinacoes();

export default seedAcidentesDoencasVacinacoes;
