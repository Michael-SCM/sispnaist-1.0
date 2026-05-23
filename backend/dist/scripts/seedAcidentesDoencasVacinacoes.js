import mongoose from 'mongoose';
import dns from 'node:dns';
import 'dotenv/config';
// Force DNS resolution to prioritize IPv4
dns.setDefaultResultOrder('ipv4first');
import Trabalhador from '../models/Trabalhador.js';
import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import MaterialBiologico from '../models/MaterialBiologico.js';
import Catalogo from '../models/Catalogo.js';
// Dados de doenças ocupacionais
const doencasOcupacionais = [
    {
        codigoDoenca: 'B30.9',
        nomeDoenca: 'Alergia a pó ocupacional',
        relato: 'Desenvolvimento de reação alérgica devido à exposição ocupacional contínua',
    },
    {
        codigoDoenca: 'M25.5',
        nomeDoenca: 'Dor articular relacionada ao trabalho',
        relato: 'Dor articular crônica associada às atividades laborais',
    },
    {
        codigoDoenca: 'J30.9',
        nomeDoenca: 'Rinite alérgica ocupacional',
        relato: 'Inflamação nasal alérgica provocada por agentes ocupacionais',
    },
    {
        codigoDoenca: 'L23.9',
        nomeDoenca: 'Dermatite de contato profissional',
        relato: 'Inflamação da pele causada por contato com substâncias químicas no trabalho',
    },
    {
        codigoDoenca: 'G56.1',
        nomeDoenca: 'Síndrome do Túnel do Carpo',
        relato: 'Compressão do nervo mediano no punho relacionada ao trabalho repetitivo',
    },
];
// Vacinas mais comuns para profissionais de saúde
const vacinasDisponiveis = [
    'Hepatite B',
    'Hepatite A',
    'Tétano',
    'Difteria',
    'Coqueluche',
    'Influenza',
    'Sarampo',
    'Caxumba',
    'Rubéola',
    'Varicela',
    'COVID-19',
];
const statusAcidente = ['Aberto', 'Em Análise', 'Fechado'];
const tiposAcidenteValidos = [
    'Típico',
    'Trajeto',
    'Doença Ocupacional',
    'Acidente com Material Biológico',
    'Violência'
];
async function getCatalogoMap() {
    const catalogos = await Catalogo.find({});
    const map = {};
    catalogos.forEach((cat) => {
        if (!map[cat.entidade]) {
            map[cat.entidade] = [];
        }
        map[cat.entidade].push(cat.nome);
    });
    return map;
}
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomDate(daysAgo = 365) {
    const now = new Date();
    const random = Math.floor(Math.random() * daysAgo);
    return new Date(now.getTime() - random * 24 * 60 * 60 * 1000);
}
async function seedAcidentesDoencasVacinacoes() {
    let timeoutId = null;
    try {
        console.log('🌱 Iniciando seed de Acidentes, Doenças e Vacinações...\n');
        console.log('📡 Conectando ao MongoDB...');
        // Configurar timeout de 30 segundos
        timeoutId = setTimeout(() => {
            console.error('❌ Timeout na conexão com MongoDB (30s)');
            process.exit(1);
        }, 30000);
        // Conectar ao banco
        if (mongoose.connection.readyState === 0) {
            console.log('⏳ Aguardando conexão...');
            await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sispnaist', {
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                family: 4,
            });
        }
        clearTimeout(timeoutId);
        console.log('✅ Conectado ao MongoDB!\n');
        console.log('🔍 Buscando catálogos...');
        const catalogoMap = await getCatalogoMap();
        console.log('🔍 Buscando trabalhadores...');
        const trabalhadores = await Trabalhador.find({}).limit(100);
        if (trabalhadores.length === 0) {
            console.log('❌ Nenhum trabalhador encontrado no banco!');
            console.log('💡 Execute primeiro: npm run seed:trabalhadores');
            process.exit(1);
        }
        console.log(`✅ Encontrados ${trabalhadores.length} trabalhadores\n`);
        let acidentesCriados = 0;
        let doencasCriadas = 0;
        let vacinacoesCriadas = 0;
        let fichasTecnicas = 0;
        let erros = 0;
        // Limpar apenas dados que serão recriados por este seed
        // (você pediu para manter Doença e Vacinação existentes)
        console.log('🧹 Limpando dados antigos de Acidentes e Material Biológico...');
        const [acidentesDeletados, fichasDeletadas] = await Promise.all([
            Acidente.deleteMany({}),
            MaterialBiologico.deleteMany({}),
        ]);
        console.log(`   ✅ Acidentes removidos: ${acidentesDeletados.deletedCount ?? 0}`);
        console.log(`   ✅ Materiais biológicos removidos: ${fichasDeletadas.deletedCount ?? 0}`);
        // Validar catálogos necessários
        const catalogosNecessarios = [
            'tipoAcidente', 'tipoTrauma', 'parteCorpo',
            'causadorTrauma', 'tipoExposicao', 'materialOrganico',
            'circunstanciaAcidente', 'agente', 'conduta', 'evolucaoCaso'
        ];
        for (const cat of catalogosNecessarios) {
            if (!catalogoMap[cat] || catalogoMap[cat].length === 0) {
                console.warn(`⚠️ Catálogo não encontrado: ${cat}`);
            }
        }
        console.log('\n');
        for (let i = 0; i < trabalhadores.length; i++) {
            const trabalhador = trabalhadores[i];
            try {
                console.log(`[${i + 1}/${trabalhadores.length}] Processando: ${trabalhador.nome}`);
                // 1. Criar ACIDENTE com dados do catálogo
                // Garantir que ~20% sejam acidentes com material biológico
                const ehMaterialBiologico = (i % 5) === 0;
                const tipoAcidenteValue = ehMaterialBiologico
                    ? 'Acidente com Material Biológico'
                    : getRandomItem(['Típico', 'Trajeto', 'Doença Ocupacional', 'Violência']);
                const tipoTraumaValue = getRandomItem(catalogoMap['tipoTrauma'] || ['Contusão']);
                const parteCorpoValue = getRandomItem(catalogoMap['parteCorpo'] || ['Mãos/Dedos']);
                const causadorValue = getRandomItem(catalogoMap['causadorTrauma'] || ['Queda de mesmo nível']);
                const statusValue = getRandomItem(statusAcidente);
                const acidente = await Acidente.create({
                    dataAcidente: getRandomDate(365),
                    horario: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                    horarioAposInicioJornada: `${Math.floor(Math.random() * 8).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                    trabalhadorId: trabalhador._id,
                    tipoAcidente: tipoAcidenteValue,
                    tipoTrauma: tipoTraumaValue,
                    agenteCausador: causadorValue,
                    parteCorpo: parteCorpoValue,
                    descricao: `Acidente de trabalho envolvendo ${causadorValue.toLowerCase()} com ${tipoTraumaValue.toLowerCase()} em ${parteCorpoValue.toLowerCase()}`,
                    descricaoTrauma: `Descrição detalhada do trauma: ${tipoTraumaValue}`,
                    local: 'Ambiente de trabalho - Unidade de Saúde',
                    lesoes: [tipoTraumaValue],
                    feriado: Math.random() > 0.95,
                    comunicado: Math.random() > 0.2,
                    dataComunicacao: getRandomDate(30),
                    dataNotificacao: getRandomDate(20),
                    estado: 'Notificado',
                    // Campos de atendimento médico
                    atendimentoMedico: Math.random() > 0.1,
                    dataAtendimento: getRandomDate(7),
                    horaAtendimento: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                    unidadeAtendimento: 'Hospital Central da Saúde',
                    // Campos de internamento
                    internamento: Math.random() > 0.7,
                    duracaoInternamento: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 1 : undefined,
                    // CAT/NAS
                    catNas: Math.random() > 0.3,
                    // Registro Policial
                    registroPolicial: Math.random() > 0.9,
                    // Encaminhamento junta médica
                    encaminhamentoJuntaMedica: Math.random() > 0.6,
                    // Afastamento
                    afastamento: Math.random() > 0.5,
                    // Outros trabalhadores atingidos
                    outrosTrabalhadoresAtingidos: Math.random() > 0.8,
                    quantidadeTrabalhadoresAtingidos: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : undefined,
                    status: statusValue,
                });
                acidentesCriados++;
                console.log(`   ✅ Acidente criado (Status: ${statusValue})`);
                // 2. Se for acidente com material biológico, criar FICHA TÉCNICA
                if (ehMaterialBiologico) {
                    try {
                        const tipoExposicaoValue = getRandomItem(catalogoMap['tipoExposicao'] || ['Percutânea']);
                        const materialOrganicoValue = getRandomItem(catalogoMap['materialOrganico'] || ['Sangue']);
                        const circunstanciaValue = getRandomItem(catalogoMap['circunstanciaAcidente'] || ['Durante procedimento cirúrgico']);
                        const agenteValue = getRandomItem(catalogoMap['agente'] || ['Biológico']);
                        const condutaValue = getRandomItem(catalogoMap['conduta'] || ['Apenas acompanhamento']);
                        const evolucaoValue = getRandomItem(catalogoMap['evolucaoCaso'] || ['Alta (Sem soroconversão)']);
                        const sorologiaValue = getRandomItem(catalogoMap['sorologia'] || ['Não Reagente (Negativo)']);
                        const materialBio = await MaterialBiologico.create({
                            acidenteId: acidente._id,
                            tipoExposicao: tipoExposicaoValue,
                            materialOrganico: materialOrganicoValue,
                            circunstanciaAcidente: circunstanciaValue,
                            agente: agenteValue,
                            equipamentoProtecao: getRandomItem(catalogoMap['equipamentoProtecao'] || ['Não utilizado']) || 'Não utilizado',
                            sorologiaPaciente: sorologiaValue,
                            sorologiaAcidentado: sorologiaValue,
                            conduta: condutaValue,
                            evolucaoCaso: evolucaoValue,
                            usoEPI: Math.random() > 0.5,
                            sorologiaFonte: Math.random() > 0.8,
                            acompanhamentoPrEP: Math.random() > 0.7,
                            descAcompanhamentoPrEP: 'Acompanhamento iniciado conforme protocolo',
                            descEncaminhamento: 'Encaminhado para infectologista',
                            dataReavaliacao: getRandomDate(30),
                            efeitoColateralPermanente: Math.random() > 0.95,
                            descEfeitoColateralPermanente: 'Nenhum efeito colateral registrado',
                        });
                        fichasTecnicas++;
                        console.log(`   📋 Ficha técnica criada (${agenteValue})`);
                    }
                    catch (fbError) {
                        console.warn(`   ⚠️ Erro ao criar ficha técnica:`, fbError instanceof Error ? fbError.message : fbError);
                    }
                }
                // 3. Criar DOENÇA
                const doencaInfo = getRandomItem(doencasOcupacionais);
                const doenca = await Doenca.create({
                    dataInicio: getRandomDate(180),
                    dataFim: Math.random() > 0.6 ? getRandomDate(30) : undefined,
                    trabalhadorId: trabalhador._id,
                    codigoDoenca: doencaInfo.codigoDoenca,
                    nomeDoenca: doencaInfo.nomeDoenca,
                    relatoClinico: doencaInfo.relato,
                    profissionalSaude: 'Dra. Maria Silva - Médica do Trabalho',
                    ativo: Math.random() > 0.3,
                });
                doencasCriadas++;
                console.log(`   🏥 Doença criada: ${doencaInfo.nomeDoenca}`);
                // 4. Criar VACINAÇÃO
                const vacina = getRandomItem(vacinasDisponiveis);
                const dataVac = getRandomDate(365);
                const vacinacao = await Vacinacao.create({
                    trabalhadorId: trabalhador._id,
                    vacina: vacina,
                    dataVacinacao: dataVac,
                    proximoDose: new Date(dataVac.getTime() + 365 * 24 * 60 * 60 * 1000),
                    unidadeSaude: 'Unidade de Saúde Central - SUS',
                    profissional: 'Enfermeiro(a) Vacinador',
                    certificado: `CERT-${Date.now()}-${trabalhador.cpf}`,
                });
                vacinacoesCriadas++;
                console.log(`   💉 Vacinação criada: ${vacina}\n`);
            }
            catch (error) {
                erros++;
                console.error(`   ❌ Erro:`, error instanceof Error ? error.message : error);
            }
        }
        console.log('\n✨ Seed concluído com sucesso!\n');
        console.log(`📊 Resumo:`);
        console.log(`   • Acidentes criados: ${acidentesCriados}`);
        console.log(`     - Aberto: ${Math.round(acidentesCriados / 3)}`);
        console.log(`     - Em Análise: ${Math.round(acidentesCriados / 3)}`);
        console.log(`     - Fechado: ${Math.round(acidentesCriados / 3)}`);
        console.log(`   • Fichas técnicas de material biológico: ${fichasTecnicas}`);
        console.log(`   • Doenças criadas: ${doencasCriadas}`);
        console.log(`   • Vacinações criadas: ${vacinacoesCriadas}`);
        console.log(`   • Erros: ${erros}\n`);
    }
    catch (error) {
        console.error('❌ Erro no seed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
    finally {
        if (timeoutId)
            clearTimeout(timeoutId);
        try {
            await mongoose.connection.close();
        }
        catch (e) {
            // Ignorar erro ao fechar
        }
        process.exit(0);
    }
}
// Executar se chamado diretamente
seedAcidentesDoencasVacinacoes();
export default seedAcidentesDoencasVacinacoes;
