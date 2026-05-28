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
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento.js';
const DB_DEBUG = true;
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
const ACIDENTES_POR_TRABALHADOR = 4; // volume para Monitoramento
const MATERIAL_BIOLOGICO_PROB = 0.2;
// Para preencher Absenteísmo Total e Tendência (Dias)
// Criamos afastamentos (modelo TrabalhadorAfastamento) quando o acidente tem afastamento.
const PROB_ACIDENTE_COM_AFASTAMENTO = 0.45;
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}
function getRandomDate(daysAgo = 365) {
    const now = new Date();
    const random = Math.floor(Math.random() * daysAgo);
    return new Date(now.getTime() - random * 24 * 60 * 60 * 1000);
}
function clampInt(n, min, max) {
    return Math.max(min, Math.min(max, Math.floor(n)));
}
async function getCatalogoMap() {
    const catalogos = await Catalogo.find({});
    const map = {};
    catalogos.forEach((cat) => {
        if (!map[cat.entidade])
            map[cat.entidade] = [];
        map[cat.entidade].push(cat.nome);
    });
    return map;
}
function pickOrFallback(map, key, fallback) {
    return map[key] && map[key].length > 0 ? map[key] : fallback;
}
function asTipoAcidente(ehMaterialBiologico) {
    if (ehMaterialBiologico)
        return 'Acidente com Material Biológico';
    return getRandomItem(['Típico', 'Trajeto', 'Doença Ocupacional', 'Violência']);
}
function safeLower(s) {
    return (s || '').toLowerCase();
}
async function seedAcidentesDoencasVacinacoes() {
    let timeoutId = null;
    try {
        console.log('🌱 Iniciando seed de Acidentes, Doenças, Vacinações e Afastamentos...');
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
        console.log('🔍 Carregando trabalhadores (até 3000)...');
        const trabalhadores = await Trabalhador.find({}).limit(100);
        if (trabalhadores.length === 0) {
            console.log('❌ Nenhum trabalhador encontrado no banco!');
            console.log('💡 Execute primeiro: npm run seed:trabalhadores');
            process.exit(1);
        }
        if (trabalhadores.length < 3000) {
            console.warn(`⚠️ Apenas ${trabalhadores.length} trabalhadores encontrados. A seed usará o que existir.`);
        }
        console.log(`✅ Trabalhadores para seed: ${trabalhadores.length}`);
        console.log('🧹 Limpando dados antigos (para aparecer no Monitoramento)...');
        const [acidentesDeletados, materialBiologicoDeletados, doencasDeletadas, vacinacoesDeletadas, afastamentosDeletados] = await Promise.all([
            Acidente.deleteMany({}),
            MaterialBiologico.deleteMany({}),
            Doenca.deleteMany({}),
            Vacinacao.deleteMany({}),
            TrabalhadorAfastamento.deleteMany({}),
        ]);
        console.log(`   ✅ Acidentes removidos: ${acidentesDeletados.deletedCount ?? 0}`);
        console.log(`   ✅ Material biológico removido: ${materialBiologicoDeletados.deletedCount ?? 0}`);
        console.log(`   ✅ Doenças removidas: ${doencasDeletadas.deletedCount ?? 0}`);
        console.log(`   ✅ Vacinações removidas: ${vacinacoesDeletadas.deletedCount ?? 0}`);
        console.log(`   ✅ Afastamentos removidos: ${afastamentosDeletados.deletedCount ?? 0}`);
        // Catálogos opcionais para afastamento
        const tiposAfastamento = pickOrFallback(catalogoMap, 'tipoAfastamento', [
            'Doença',
            'Acidente de trabalho',
            'Licença maternidade',
            'Licença para tratamento',
        ]);
        const motivosAfastamento = pickOrFallback(catalogoMap, 'motivoAfastamento', [
            'Doença comum',
            'Doença profissional',
            'COVID-19',
            'Cirurgia',
            'Acidente',
        ]);
        let acidentesCriados = 0;
        let doencasCriadas = 0;
        let vacinacoesCriadas = 0;
        let fichasTecnicas = 0;
        let afastamentosCriados = 0;
        let erros = 0;
        for (let i = 0; i < trabalhadores.length; i++) {
            const trabalhador = trabalhadores[i];
            try {
                if (i % 25 === 0) {
                    console.log(`[${i + 1}/${trabalhadores.length}] Processando: ${trabalhador.nome}`);
                }
                for (let a = 0; a < ACIDENTES_POR_TRABALHADOR; a++) {
                    const ehMaterialBiologico = Math.random() < MATERIAL_BIOLOGICO_PROB;
                    const tipoAcidenteValue = asTipoAcidente(ehMaterialBiologico);
                    const tipoTraumaValue = getRandomItem(pickOrFallback(catalogoMap, 'tipoTrauma', ['Contusão', 'Fratura', 'Entorse']));
                    const parteCorpoValue = getRandomItem(pickOrFallback(catalogoMap, 'parteCorpo', ['Mãos/Dedos', 'Ombro', 'Coluna']));
                    const causadorValue = getRandomItem(pickOrFallback(catalogoMap, 'causadorTrauma', ['Queda de mesmo nível', 'Esforço repetitivo']));
                    const statusValue = getRandomItem(statusAcidente);
                    // Fazemos afastamento em boa parte dos acidentes para alimentar absenteísmo.
                    const comAfastamento = Math.random() < PROB_ACIDENTE_COM_AFASTAMENTO;
                    const acidente = await Acidente.create({
                        dataAcidente: getRandomDate(365),
                        horario: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                        horarioAposInicioJornada: `${Math.floor(Math.random() * 8).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                        trabalhadorId: trabalhador._id,
                        tipoAcidente: tipoAcidenteValue,
                        tipoTrauma: tipoTraumaValue,
                        agenteCausador: causadorValue,
                        parteCorpo: parteCorpoValue,
                        descricao: `Acidente de trabalho envolvendo ${safeLower(causadorValue)} com ${safeLower(tipoTraumaValue)} em ${safeLower(parteCorpoValue)}`,
                        descricaoTrauma: `Descrição detalhada do trauma: ${tipoTraumaValue}`,
                        local: 'Ambiente de trabalho - Unidade de Saúde',
                        lesoes: [tipoTraumaValue],
                        feriado: Math.random() > 0.95,
                        comunicado: Math.random() > 0.2,
                        dataComunicacao: getRandomDate(30),
                        dataNotificacao: getRandomDate(20),
                        estado: 'Notificado',
                        atendimentoMedico: Math.random() > 0.1,
                        dataAtendimento: getRandomDate(7),
                        horaAtendimento: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                        unidadeAtendimento: 'Hospital Central da Saúde',
                        internamento: Math.random() > 0.7,
                        duracaoInternamento: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 1 : undefined,
                        catNas: Math.random() > 0.3,
                        registroPolicial: Math.random() > 0.9,
                        encaminhamentoJuntaMedica: Math.random() > 0.6,
                        afastamento: comAfastamento,
                        outrosTrabalhadoresAtingidos: Math.random() > 0.8,
                        quantidadeTrabalhadoresAtingidos: Math.random() > 0.8 ? Math.floor(Math.random() * 5) + 1 : undefined,
                        status: statusValue,
                    });
                    acidentesCriados++;
                    // Ficha técnica
                    if (ehMaterialBiologico) {
                        try {
                            const tipoExposicaoValue = getRandomItem(pickOrFallback(catalogoMap, 'tipoExposicao', ['Percutânea']));
                            const materialOrganicoValue = getRandomItem(pickOrFallback(catalogoMap, 'materialOrganico', ['Sangue']));
                            const circunstanciaValue = getRandomItem(pickOrFallback(catalogoMap, 'circunstanciaAcidente', ['Durante procedimento cirúrgico']));
                            const agenteValue = getRandomItem(pickOrFallback(catalogoMap, 'agente', ['Biológico']));
                            const condutaValue = getRandomItem(pickOrFallback(catalogoMap, 'conduta', ['Apenas acompanhamento']));
                            const evolucaoValue = getRandomItem(pickOrFallback(catalogoMap, 'evolucaoCaso', ['Alta (Sem soroconversão)']));
                            const sorologiaValue = getRandomItem(pickOrFallback(catalogoMap, 'sorologia', ['Não Reagente (Negativo)']));
                            await MaterialBiologico.create({
                                acidenteId: acidente._id,
                                tipoExposicao: tipoExposicaoValue,
                                materialOrganico: materialOrganicoValue,
                                circunstanciaAcidente: circunstanciaValue,
                                agente: agenteValue,
                                equipamentoProtecao: getRandomItem(pickOrFallback(catalogoMap, 'equipamentoProtecao', ['NÃO UTILIZADO', 'Não utilizado'])) ||
                                    'Não utilizado',
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
                        }
                        catch {
                            // ignore
                        }
                    }
                    // Doença e Vacinação (por acidente)
                    try {
                        const doencaInfo = getRandomItem(doencasOcupacionais);
                        await Doenca.create({
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
                    }
                    catch {
                        erros++;
                    }
                    try {
                        const vacina = getRandomItem(vacinasDisponiveis);
                        const dataVac = getRandomDate(365);
                        await Vacinacao.create({
                            trabalhadorId: trabalhador._id,
                            vacina,
                            dataVacinacao: dataVac,
                            proximoDose: new Date(dataVac.getTime() + 365 * 24 * 60 * 60 * 1000),
                            unidadeSaude: 'Unidade de Saúde Central - SUS',
                            profissional: 'Enfermeiro(a) Vacinador',
                            certificado: `CERT-${Date.now()}-${trabalhador.cpf}`,
                        });
                        vacinacoesCriadas++;
                    }
                    catch {
                        erros++;
                    }
                    // Afastamento para alimentar absenteísmo (Monitoramento)
                    if (comAfastamento) {
                        try {
                            // Simula duração entre 3 e 45 dias
                            const dias = clampInt(3 + Math.random() * 42, 3, 45);
                            // Normaliza para início do dia para evitar ceil resultar em 0 por timezone/milisegundos
                            const rawInicio = getRandomDate(240);
                            const dataInicio = new Date(rawInicio);
                            dataInicio.setHours(0, 0, 0, 0);
                            // Garante sempre dataFimCalc - dataInicio >= 1 dia inteiro
                            const dataRetorno = new Date(dataInicio.getTime() + dias * 24 * 60 * 60 * 1000);
                            await TrabalhadorAfastamento.create({
                                trabalhadorId: trabalhador._id,
                                tipoAfastamento: getRandomItem(tiposAfastamento),
                                motivoAfastamento: getRandomItem(motivosAfastamento),
                                cid: `M${50 + Math.floor(Math.random() * 40)}.${Math.floor(Math.random() * 9)}`,
                                dataInicio,
                                // Garanta dataFim>dataInicio (o Analytics usa dataFim ou dataRetorno)
                                dataFim: new Date(dataInicio.getTime() + dias * 24 * 60 * 60 * 1000),
                                dataRetorno,
                                // Campos obrigatórios do schema (para não falhar o insert)
                                dataPericia: new Date(dataInicio.getTime() + Math.max(1, Math.floor(dias / 2)) * 24 * 60 * 60 * 1000),
                                desfecho: getRandomItem(['Retorno ao trabalho', 'Encaminhamento para avaliação', 'Alta']),
                                tempoAfastamento: `${dias} dias`,
                                ativo: true,
                            });
                            afastamentosCriados++;
                        }
                        catch {
                            erros++;
                        }
                    }
                }
            }
            catch (error) {
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
    }
    catch (error) {
        console.error('❌ Erro no seed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
    finally {
        try {
            if (timeoutId)
                clearTimeout(timeoutId);
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close();
            }
        }
        catch {
            // ignore
        }
    }
}
seedAcidentesDoencasVacinacoes();
export default seedAcidentesDoencasVacinacoes;
