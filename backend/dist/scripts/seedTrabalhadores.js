import mongoose from 'mongoose';
import dns from 'node:dns';
import 'dotenv/config';
// Force DNS resolution to prioritize IPv4.
// This resolves the ENETUNREACH error on Render/local network requests to MongoDB Atlas.
dns.setDefaultResultOrder('ipv4first');
import connectDB from '../config/database.js';
import Trabalhador from '../models/Trabalhador.js';
import TrabalhadorAfastamento from '../models/TrabalhadorAfastamento.js';
import TrabalhadorDependente from '../models/TrabalhadorDependente.js';
import TrabalhadorInformacao from '../models/TrabalhadorInformacao.js';
import TrabalhadorOcorrenciaViolencia from '../models/TrabalhadorOcorrenciaViolencia.js';
import TrabalhadorProcessoTrabalho from '../models/TrabalhadorProcessoTrabalho.js';
import TrabalhadorReadaptacao from '../models/TrabalhadorReadaptacao.js';
import TrabalhadorVinculo from '../models/TrabalhadorVinculo.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';
import Questionario from '../models/Questionario.js';
import Catalogo from '../models/Catalogo.js';
// Listas extensas de nomes para garantir máxima variedade e mínima repetição
const firstNames = [
    'Ana', 'Carlos', 'Juliana', 'Bruno', 'Mariana', 'Lucas', 'Fernanda', 'Gabriel', 'Patrícia', 'Thiago',
    'Beatriz', 'Diego', 'Camila', 'Rodrigo', 'Amanda', 'Felipe', 'Larissa', 'Gustavo', 'Letícia', 'Rafael',
    'Isabela', 'Daniel', 'Aline', 'Marcelo', 'Sofia', 'Renato', 'Carla', 'Eduardo', 'Priscila', 'Leonardo',
    'Vanessa', 'Fábio', 'Natália', 'André', 'Monique', 'Vinicius', 'Cristina', 'Ricardo', 'Débora', 'Leandro',
    'Tatiane', 'Sergio', 'Cintia', 'Paulo', 'Rebeca', 'Márcio', 'Denise', 'Henrique', 'Elaine', 'Arthur',
    'Vera', 'Jorge', 'Jéssica', 'Flávio', 'Bianca', 'Tiago', 'Luciane', 'Rogério', 'Adriana', 'Murilo',
    'Simone', 'Davi', 'Luana', 'Caio', 'Viviane', 'Alex', 'Raquel', 'César', 'Ingrid', 'Matheus',
    'Núbia', 'Evandro', 'Samantha', 'Cláudio', 'Danielle', 'Roberto', 'Gisele', 'Augusto', 'Lorena', 'Edson',
    'Sabrina', 'Wanderson', 'Mônica', 'Breno', 'Giovanna', 'Otávio', 'Érica', 'Humberto', 'Taís', 'Nilton',
    'Keyla', 'Valdir', 'Yasmin', 'Adilson', 'Talita', 'Cleber', 'Suellen', 'Emerson', 'Catarina', 'Jair',
    'Heloise', 'Wagner', 'Rafaela', 'Welton', 'Maísa', 'Ailton', 'Fabiana', 'Manoel', 'Lucélia', 'Ivan',
];
const middleNames = [
    'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
    'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
    'Nascimento', 'Cunha', 'Monteiro', 'Machado', 'Bezerra', 'Ramos', 'Campos', 'Duarte', 'Matos', 'Neto',
    'Xavier', 'Figueiredo', 'Guimarães', 'Moura', 'Siqueira', 'Queiroz', 'Braga', 'Tavares', 'Mesquita', 'Marques',
    'Pires', 'Bueno', 'Meireles', 'Vargas', 'Coelho', 'Freire', 'Leite', 'Rezende', 'Andrade', 'Amaral',
    'Nogueira', 'Melo', 'Assis', 'Viana', 'Brito', 'Lacerda', 'Ávila', 'Pinheiro', 'Corrêa', 'Toledo',
    'Fonseca', 'Faria', 'Cavalcante', 'Pacheco', 'Sá', 'Rangel', 'Rios', 'Brandão', 'Esteves', 'Aguiar',
    'Vasconcelos', 'Parente', 'Lobo', 'Batista', 'Valente', 'Pessoa', 'Serrano', 'Menezes', 'Pilar', 'Godoy',
];
const lastNames = [
    'Mendes', 'Nunes', 'Rocha', 'Cardoso', 'Teixeira', 'Araújo', 'Moreira', 'Melo', 'Barros', 'Correia',
    'Freitas', 'Dantas', 'Cavalcanti', 'Azevedo', 'Castro', 'Pinto', 'Miranda', 'Borges', 'Fonseca', 'Paiva',
    'Belém', 'Furtado', 'Alencar', 'Luz', 'Falcão', 'Porto', 'Sena', 'Fraga', 'Serpa', 'Bastos',
    'Coutinho', 'Novaes', 'Peixoto', 'Vale', 'Lago', 'Chaves', 'Reis', 'Mattos', 'Maia', 'Magalhães',
    'Pontes', 'Medeiros', 'Fleury', 'Dornelas', 'Bretas', 'Sabino', 'Jardim', 'Zago', 'Werneck', 'Caputo',
    'Diniz', 'Trindade', 'Fontenele', 'Leal', 'Menezes', 'Becker', 'Kronbauer', 'Strauss', 'Krause', 'Fuchs',
    'Morais', 'Moraes', 'Godoy', 'Sampaio', 'Berbert', 'Caldas', 'Santana', 'Leandro', 'Sales', 'Barroso',
    'Rolim', 'Osório', 'Assunção', 'Neri', 'Quaresma', 'Aguiar', 'Uchoa', 'Canuto', 'Gadelha', 'Colares',
];
const motherFirstNames = [
    'Maria', 'Regina', 'Helena', 'Teresa', 'Francisca', 'Luciana', 'Sandra', 'Marcia', 'Sonia', 'Rita',
    'Angela', 'Patricia', 'Adriana', 'Claudia', 'Valeria', 'Monica', 'Vera', 'Sueli', 'Aparecida', 'Rosangela',
    'Marta', 'Neide', 'Ivone', 'Lúcia', 'Celia', 'Marlene', 'Irene', 'Nadir', 'Elza', 'Conceição',
    'Fatima', 'Cleide', 'Edna', 'Bernadete', 'Dolores', 'Alzira', 'Geralda', 'Amelia', 'Eunice', 'Nair',
];
// Função que usa múltiplos deslocamentos de primos para evitar padrões repetitivos
// Com 110 primeiros nomes × 80 nomes do meio × 80 sobrenomes = 704.000 combinações únicas possíveis
function buildName(i, fNames, mNames, lNames) {
    // Usa números primos distintos para "embaralhar" o índice entre os três arrays
    const fi = i % fNames.length;
    const mi = (i * 37 + Math.floor(i / fNames.length)) % mNames.length;
    const li = (i * 73 + Math.floor(i / (fNames.length * mNames.length))) % lNames.length;
    return { firstName: fNames[fi], middleName: mNames[mi], lastName: lNames[li] };
}
// Helper para remover acentuação e caracteres especiais de emails
function normalizeEmail(email) {
    return email
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase();
}
// Helper para gerar CPF matematicamente válido (evita erros em validadores mais rígidos)
function generateCPF(index) {
    const num = 100000000 + index;
    const base = String(num);
    const digits = base.split('').map(Number);
    let sum1 = 0;
    for (let i = 0; i < 9; i++) {
        sum1 += digits[i] * (10 - i);
    }
    let d1 = 11 - (sum1 % 11);
    if (d1 >= 10)
        d1 = 0;
    let sum2 = 0;
    for (let i = 0; i < 9; i++) {
        sum2 += digits[i] * (11 - i);
    }
    sum2 += d1 * 2;
    let d2 = 11 - (sum2 % 11);
    if (d2 >= 10)
        d2 = 0;
    return `${base.substring(0, 3)}.${base.substring(3, 6)}.${base.substring(6, 9)}-${d1}${d2}`;
}
export async function seedTrabalhadores(targetCount = 3000) {
    console.log(`🌱 Iniciando seed de ${targetCount} trabalhadores e seus submódulos distribuidos...`);
    // 1. Garantir que temos Empresa 0 cadastrada
    let empresa0 = await Empresa.findOne();
    if (!empresa0) {
        console.log('🏢 Nenhuma empresa encontrada. Criando empresa padrão...');
        empresa0 = await Empresa.create({
            razaoSocial: 'SISPNAIST Saúde e Segurança do Trabalho Ltda',
            nomeFantasia: 'SISPNAIST SST',
            cnpj: '12.345.678/0001-90',
            email: 'contato@sispnaist.com',
            telefone: '(11) 5555-1234',
            endereco: {
                logradouro: 'Avenida Paulista',
                numero: '1000',
                complemento: 'Conjunto 15A',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01310-100',
            },
            ativa: true,
        });
    }
    // Criar mais 5 empresas para distribuição
    const empresasDados = [
        { razaoSocial: 'Clínica Vida & Saúde Ltda', nomeFantasia: 'Clínica Vida', cnpj: '22.333.444/0001-55', email: 'contato@clinicavida.com', telefone: '(11) 5555-2233' },
        { razaoSocial: 'Laboratório Analítico Diagnóstico S/A', nomeFantasia: 'Laboratório Analítico', cnpj: '33.444.555/0001-66', email: 'contato@labanalitico.com', telefone: '(11) 5555-3344' },
        { razaoSocial: 'Serviços Médicos Ocupacionais EIRELI', nomeFantasia: 'Medicina Ocupacional', cnpj: '44.555.666/0001-77', email: 'contato@medocupacional.com', telefone: '(11) 5555-4455' },
        { razaoSocial: 'Instituto de Cardiologia e Diagnóstico Ltda', nomeFantasia: 'Instituto Cardiologia', cnpj: '55.666.777/0001-88', email: 'contato@instcardio.com', telefone: '(11) 5555-5566' },
        { razaoSocial: 'Consultoria e Gestão de Saúde Avançada S/A', nomeFantasia: 'Gestão Saúde Avançada', cnpj: '66.777.888/0001-99', email: 'contato@saudeavancada.com', telefone: '(11) 5555-6677' }
    ];
    const empresas = [empresa0];
    for (const empData of empresasDados) {
        let emp = await Empresa.findOne({ cnpj: empData.cnpj });
        if (!emp) {
            console.log(`🏢 Criando empresa adicional: ${empData.nomeFantasia}...`);
            emp = await Empresa.create({
                ...empData,
                endereco: {
                    logradouro: 'Avenida das Empresas',
                    numero: '500',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '01000-000'
                },
                ativa: true
            });
        }
        empresas.push(emp);
    }
    console.log(`🏢 Total de empresas ativas para distribuição: ${empresas.length}`);
    // 2. Garantir que temos Unidades cadastradas
    const unidades = [];
    // Unidade 0
    let unidade0 = await Unidade.findOne({ empresaId: empresa0._id });
    if (!unidade0) {
        console.log('🏥 Nenhuma unidade encontrada. Criando unidade padrão...');
        unidade0 = await Unidade.create({
            nome: 'Unidade Central de Atendimento',
            empresaId: empresa0._id,
            endereco: {
                logradouro: 'Avenida Paulista',
                numero: '1000',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01310-100',
            },
            gestor: 'Dr. Michael SCM',
            ativa: true,
        });
    }
    unidades.push(unidade0);
    const unidadesDados = [
        { nome: 'Vida - Unidade Zona Sul', gestor: 'Dra. Carla Souza' },
        { nome: 'Analítico - Posto Central', gestor: 'Dr. Roberto Alves' },
        { nome: 'Ocupacional - Filial Industrial', gestor: 'Dra. Patrícia Lima' },
        { nome: 'Cardiologia - Unidade Centro', gestor: 'Dr. Fabio Santos' },
        { nome: 'Avançada - Escritório Norte', gestor: 'Dra. Aline Mendes' }
    ];
    for (let i = 0; i < unidadesDados.length; i++) {
        const unitData = unidadesDados[i];
        const emp = empresas[i + 1];
        let unit = await Unidade.findOne({ nome: unitData.nome, empresaId: emp._id });
        if (!unit) {
            console.log(`🏥 Criando unidade adicional: ${unitData.nome}...`);
            unit = await Unidade.create({
                nome: unitData.nome,
                empresaId: emp._id,
                endereco: {
                    logradouro: 'Avenida das Unidades',
                    numero: String(100 + i),
                    bairro: 'Bairro Novo',
                    cidade: 'São Paulo',
                    estado: 'SP',
                    cep: '02000-000'
                },
                gestor: unitData.gestor,
                ativa: true
            });
        }
        unidades.push(unit);
    }
    console.log(`🏥 Total de unidades ativas para distribuição: ${unidades.length}`);
    // 3. Garantir que temos Questionário cadastrado
    let questionario = await Questionario.findOne();
    if (!questionario) {
        console.log('📝 Nenhum questionário encontrado. Criando questionário padrão...');
        questionario = await Questionario.create({
            nome: 'Questionário Geral de Saúde do Trabalhador',
            descricao: 'Mapeamento de perfil epidemiológico e de processo de trabalho do SISPNAIST',
            tipo: 'saude',
            ativo: true,
        });
    }
    console.log(`📝 Questionário ativo para uso: ${questionario.nome} (ID: ${questionario._id})`);
    // 4. Carregar catálogos para garantir dados reais dos selects
    console.log('🗂️ Carregando opções dos catálogos cadastrados no banco...');
    const catalogos = await Catalogo.find({ ativo: true });
    const getOptions = (entidade, fallback) => {
        const list = catalogos.filter(c => c.entidade === entidade).map(c => c.nome);
        return list.length > 0 ? list : fallback;
    };
    const sexos = getOptions('sexo', ['Masculino', 'Feminino']);
    const generos = getOptions('genero', ['Mulher cisgênero', 'Homem cisgênero', 'Não-binário', 'Outro']);
    const racas = getOptions('racaCor', ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena']);
    const escolaridades = getOptions('escolaridade', ['Fundamental Completo', 'Médio Completo', 'Superior Completo', 'Pós-graduação']);
    const estadosCivis = getOptions('estadoCivil', ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']);
    const tiposSanguineos = getOptions('tipoSanguineo', ['A Positivo', 'B Positivo', 'AB Positivo', 'O Positivo', 'O Negativo']);
    const deficienciaTipos = getOptions('tipoDeficiencia', ['Física', 'Visual', 'Auditiva', 'Intelectual', 'Múltipla', 'Psicossocial']);
    const deficienciaTempos = getOptions('tempoDeficiencia', ['Congênita', 'Adquirida', 'Temporária', 'Permanente']);
    const deficienciaGraus = getOptions('grauDeficiencia', ['Leve', 'Moderada', 'Severa', 'Profunda']);
    const vinculoTipos = getOptions('tipoVinculo', ['Efetivo', 'CLT', 'Estágio', 'Temporário', 'Terceirizado', 'Comissionado']);
    const turnos = getOptions('turnoTrabalho', ['Diurno', 'Noturno', 'Misto', 'Plantão 12h', 'Plantão 24h']);
    const jornadas = getOptions('jornadaTrabalho', ['20 horas semanais', '30 horas semanais', '40 horas semanais', '44 horas semanais']);
    const situacoes = getOptions('situacaoTrabalho', ['Ativo', 'Afastado', 'Desligado', 'Aposentado']);
    const funcoes = getOptions('funcao', ['Médico(a)', 'Enfermeiro(a)', 'Técnico(a) de Enfermagem', 'Administrativo', 'Serviços Gerais']);
    const afastamentoTipos = getOptions('tipoAfastamento', ['Doença', 'Acidente de trabalho', 'Licença maternidade', 'Licença para tratamento']);
    const afastamentoMotivos = getOptions('motivoAfastamento', ['Doença común', 'Doença profissional', 'COVID-19', 'Cirurgia', 'Acidente']);
    const parentescos = getOptions('parentesco', ['Cônjuge', 'Filho(a)', 'Enteado(a)', 'Mãe', 'Pai']);
    const violenciaTipos = getOptions('tipoViolencia', ['Física', 'Psicológica/Moral', 'Sexual', 'Outro']);
    const violenciaSexuais = getOptions('tipoViolenciaSexual', ['Não se aplica', 'Assédio Sexual']);
    const violenciaMotivos = getOptions('motivoViolencia', ['Conflito no trabalho', 'Discriminação', 'Retaliação', 'Outro']);
    const violenciaMeios = getOptions('meioAgressao', ['Força física/Espancamento', 'Ameaça', 'Outro']);
    const violenciaAutores = getOptions('tipoAutorViolencia', ['Superior hierárquico', 'Colega de trabalho', 'Paciente', 'Outro']);
    const readaptacaoMotivos = getOptions('motivoReadaptacao', ['Limitação física', 'Limitação visual', 'Limitação auditiva', 'Reabilitação']);
    const readaptacaoTempos = getOptions('tempoReadaptacao', ['30 dias', '60 dias', '90 dias', '120 dias', '180 dias', 'Indeterminado']);
    const readaptacaoAcompanhamentos = getOptions('acompanhamentoReadaptacao', ['Semanal', 'Quinzenal', 'Mensal', 'Trimestral']);
    const satisfacoes = getOptions('grauSatisfacao', ['Muito Satisfeito', 'Satisfeito', 'Indiferente', 'Insatisfeito']);
    // Limpar trabalhadores e submódulos antigos para evitar conflitos de CPF e duplicados
    console.log('🧹 Limpando dados antigos de trabalhadores e submódulos...');
    await Trabalhador.deleteMany({});
    await TrabalhadorAfastamento.deleteMany({});
    await TrabalhadorDependente.deleteMany({});
    await TrabalhadorInformacao.deleteMany({});
    await TrabalhadorOcorrenciaViolencia.deleteMany({});
    await TrabalhadorProcessoTrabalho.deleteMany({});
    await TrabalhadorReadaptacao.deleteMany({});
    await TrabalhadorVinculo.deleteMany({});
    console.log('🧹 Limpeza concluída.');
    console.log(`📝 Preparando ${targetCount} registros em memória para inserção em lote...`);
    const workersToInsert = [];
    const afastamentosToInsert = [];
    const dependentesToInsert = [];
    const informacoesToInsert = [];
    const ocorrenciasToInsert = [];
    const processosToInsert = [];
    const readaptacoesToInsert = [];
    const vinculosToInsert = [];
    for (let i = 1; i <= targetCount; i++) {
        const workerId = new mongoose.Types.ObjectId();
        // Geração de nomes com combinação única por deslocamentos de primos
        const { firstName, middleName, lastName } = buildName(i, firstNames, middleNames, lastNames);
        const nome = `${firstName} ${middleName} ${lastName}`;
        const maeFirstName = motherFirstNames[(i * 11) % motherFirstNames.length];
        const maeMiddleName = middleNames[(i * 53) % middleNames.length];
        const nomeMae = `${maeFirstName} ${maeMiddleName} ${lastName}`;
        const cpf = generateCPF(i);
        const cartaoSus = String(700000000000000 + i);
        const matricula = `MAT-${String(i).padStart(6, '0')}`;
        const email = normalizeEmail(`${firstName}.${lastName}.${i}@sispnaist.com`);
        // Datas realistas
        const birthYear = 1965 + (i % 38);
        const birthMonth = i % 12;
        const birthDay = 1 + (i % 28);
        const dataNascimento = new Date(birthYear, birthMonth, birthDay);
        const entradaYear = 2012 + (i % 12);
        const entradaMonth = i % 12;
        const entradaDay = 1 + (i % 28);
        const dataEntrada = new Date(entradaYear, entradaMonth, entradaDay);
        // Selecionar valores dos catálogos
        const sexoStr = sexos[i % sexos.length];
        const generoStr = generos[i % generos.length];
        const racaStr = racas[i % racas.length];
        const escolaridadeStr = escolaridades[i % escolaridades.length];
        const estadoCivilStr = estadosCivis[i % estadosCivis.length];
        const tipoSanguineoStr = tiposSanguineos[i % tiposSanguineos.length];
        // Deficiência ocasional (ex. 10% dos casos)
        const hasDeficiency = i % 10 === 0;
        const deficiencia = {
            tipo: hasDeficiency ? deficienciaTipos[i % deficienciaTipos.length] : '',
            tempo: hasDeficiency ? deficienciaTempos[i % deficienciaTempos.length] : '',
            grau: hasDeficiency ? deficienciaGraus[i % deficienciaGraus.length] : ''
        };
        const vinculoTipoStr = vinculoTipos[i % vinculoTipos.length];
        const turnoStr = turnos[i % turnos.length];
        const jornadaStr = jornadas[i % jornadas.length];
        const situacaoStr = situacoes[i % situacoes.length];
        const funcaoStr = funcoes[i % funcoes.length];
        // Distribuição de empresas e unidades
        // Primeiro 1500 vinculados à empresa0 / unidade0
        // Próximos 1500 distribuídos entre as outras 5 empresas / unidades
        let currentEmpresa = empresas[0];
        let currentUnidade = unidades[0];
        if (i > 1500) {
            const subIndex = 1 + ((i - 1501) % 5);
            currentEmpresa = empresas[subIndex];
            currentUnidade = unidades[subIndex];
        }
        // Criar documento do Trabalhador
        workersToInsert.push({
            _id: workerId,
            cpf,
            nome,
            nomeMae,
            matricula,
            cartaoSus,
            celular: `(11) 9${String(90000000 + i).substring(0, 4)}-${String(90000000 + i).substring(4, 8)}`,
            telefoneContato: i % 3 === 0 ? `(11) 3333-${String(1000 + i).substring(0, 4)}` : '',
            email,
            dataNascimento,
            empresa: currentEmpresa._id,
            unidade: currentUnidade._id,
            sexo: sexoStr,
            genero: generoStr,
            raca: racaStr,
            escolaridade: escolaridadeStr,
            estadoCivil: estadoCivilStr,
            tipoSanguineo: tipoSanguineoStr,
            deficiencia,
            vinculo: {
                tipo: vinculoTipoStr,
                outro: '',
                turno: turnoStr,
                jornada: jornadaStr,
                jornadaOutro: '',
                situacao: situacaoStr
            },
            endereco: {
                logradouro: `Avenida das Nações`,
                numero: String(100 + (i % 800)),
                complemento: i % 2 === 0 ? `Apto ${i % 100}` : '',
                bairro: `Jardim das Oliveiras`,
                cidade: `São Paulo`,
                estado: `SP`,
                cep: `04500-${String(100 + (i % 800)).padStart(3, '0')}`
            },
            trabalho: {
                dataPosse: vinculoTipoStr === 'Efetivo' ? dataEntrada : null,
                empresaTerceirizada: vinculoTipoStr === 'Terceirizado' ? 'Terceiriza SST S/A' : '',
                dataEntrada,
                setor: `Setor de ${funcaoStr}s`,
                cargo: funcaoStr,
                funcao: funcaoStr,
                ocupacao: `CBO-${2000 + (i % 1000)}`
            },
            historico: {
                dataAposentadoria: situacaoStr === 'Aposentado' ? new Date() : null,
                dataObito: null,
                dataRemocao: null,
                novoServico: '',
                dataRetorno: null,
                dataRelotacao: null,
                dataDesligamento: situacaoStr === 'Desligado' ? new Date() : null,
                dataAfastamento: situacaoStr === 'Afastado' ? new Date() : null,
                tipoAfastamento: situacaoStr === 'Afastado' ? 'Doença' : ''
            }
        });
        // Submódulo 1: Afastamento
        const dataInicioAfast = new Date(entradaYear + 1, 1, 1);
        const dataRetornoAfast = new Date(entradaYear + 1, 1, 15);
        afastamentosToInsert.push({
            trabalhadorId: workerId,
            tipoAfastamento: afastamentoTipos[i % afastamentoTipos.length],
            motivoAfastamento: afastamentoMotivos[i % afastamentoMotivos.length],
            cid: `M${50 + (i % 40)}.${i % 9}`,
            dataInicio: dataInicioAfast,
            dataFim: dataRetornoAfast,
            dataRetorno: new Date(dataRetornoAfast.getTime() + 86400000), // Retorno no dia seguinte
            dataPericia: new Date(dataInicioAfast.getTime() + 86400000 * 2), // Perícia 2 dias após início
            desfecho: 'Alta médica e retorno integral ao serviço',
            tempoAfastamento: '14 dias',
            laudoMedico: 'Tratamento clínico com repouso recomendado.',
            observacoes: 'Afastamento regularizado sem pendências.',
            ativo: true
        });
        // Submódulo 2: Dependentes
        dependentesToInsert.push({
            trabalhadorId: workerId,
            nome: `Dependente de ${firstName} ${i}`,
            cpf: generateCPF(4000 + i),
            dataNascimento: new Date(2010 + (i % 15), i % 12, 1 + (i % 28)),
            parentesco: parentescos[i % parentescos.length],
            dependentIR: i % 2 === 0,
            ativo: true
        });
        // Submódulo 3: Informações de Saúde
        informacoesToInsert.push({
            trabalhadorId: workerId.toString(),
            doencaBase: i % 4 === 0 ? 'Nenhuma' : getOptions('doencaBase', ['Diabetes'])[i % getOptions('doencaBase', ['Diabetes']).length],
            estadoVacinal: getOptions('estadoVacinal', ['Vacinado'])[i % getOptions('estadoVacinal', ['Vacinado']).length],
            tipoDroga: i % 3 === 0 ? 'Nenhuma' : getOptions('tipoDroga', ['Álcool'])[i % getOptions('tipoDroga', ['Álcool']).length],
            tipoSanguineo: tipoSanguineoStr,
            medicamentos: i % 4 === 0 ? 'Uso contínuo de anti-hipertensivo' : 'Nenhum',
            allergy: i % 5 === 0,
            descricaoAlergia: i % 5 === 0 ? 'Alergia a Medicamento Dipirona' : '',
            acompanhamentoMedico: i % 2 === 0,
            acompanhamentoReabilitacao: false,
            usoAlcool: i % 3 === 0,
            dosesAlcool: i % 3 === 0 ? 2 : 0,
            usoCigarro: i % 6 === 0,
            macosCigarro: i % 6 === 0 ? 1 : 0,
            usoOutraDroga: false,
            frequenciaUso: i % 3 === 0 ? 'Ocasional' : '',
            ativo: true
        });
        // Submódulo 4: Ocorrência de Violência
        ocorrenciasToInsert.push({
            trabalhadorId: workerId,
            dataOcorrencia: new Date(entradaYear + 1, 5, 10),
            localOcorrencia: `Posto de Trabalho - Sala ${i}`,
            tipoViolencia: violenciaTipos[i % violenciaTipos.length],
            tipoViolenciaSexual: violenciaSexuais[i % violenciaSexuais.length],
            motivoViolencia: violenciaMotivos[i % violenciaMotivos.length],
            meioAgressao: violenciaMeios[i % violenciaMeios.length],
            tipoAutorViolencia: violenciaAutores[i % violenciaAutores.length],
            descricaoOcorrencia: `Registro de conflito verbal ocorrido durante o expediente do trabalhador no atendimento de rotina.`,
            reincidencia: false,
            atendimentoRealizado: 'Acolhimento da coordenação imediata do setor.',
            condutaViolencia: 'Registro de ata administrativa e orientação interna.',
            pessoasEnvolvidas: 'Colaboradores envolvidos e chefia.',
            emissaoCatNas: i % 4 === 0,
            boletimOcorrencia: i % 4 === 0 ? `BO-${10000 + i}/2025` : '',
            medidasTomadas: 'Remanejamento preventivo ou conversas de alinhamento.',
            acompanhamentos: 'Orientação geral.',
            ativo: true
        });
        // Submódulo 5: Processo de Trabalho
        processosToInsert.push({
            trabalhadorId: workerId,
            setor: `Setor de ${funcaoStr}s`,
            cargo: funcaoStr,
            funcao: funcaoStr,
            jornadaTrabalho: jornadaStr,
            turnoTrabalho: turnoStr,
            jornadaSemanal: jornadaStr.substring(0, 3).trim(),
            questionarioId: questionario._id,
            dataInicio: dataEntrada,
            dataFim: null,
            observacoes: 'Desenvolve atividades relativas à sua função no setor designado.',
            ativo: true
        });
        // Submódulo 6: Readaptação Funcional
        readaptacoesToInsert.push({
            trabalhadorId: workerId,
            dataReadaptacao: new Date(entradaYear + 2, 2, 10),
            motivo: readaptacaoMotivos[i % readaptacaoMotivos.length],
            cid: `M${40 + (i % 30)}.${i % 9}`,
            mudancaSetor: i % 2 === 0,
            setorOrigem: `Setor de ${funcaoStr}s`,
            setorReadaptacao: i % 2 === 0 ? 'Administrativo Central' : `Setor de ${funcaoStr}s`,
            mudancaFuncao: i % 3 === 0,
            funcaoAnterior: funcaoStr,
            funcaoNova: i % 3 === 0 ? 'Auxiliar de Suporte Administrativo' : funcaoStr,
            tempoReadaptacao: readaptacaoTempos[i % readaptacaoTempos.length],
            restricao: 'Evitar esforços repetitivos severos e posturas inadequadas.',
            novasAtribuicoes: 'Auxílio na digitação de planilhas e atendimento telefônico geral.',
            acompanhamento: readaptacaoAcompanhamentos[i % readaptacaoAcompanhamentos.length],
            grauSatisfacao: satisfacoes[i % satisfacoes.length],
            laudoMedico: 'Recomendação por junta médica interna para alívio ergométrico temporário.',
            dataRetorno: new Date(entradaYear + 2, 5, 10),
            observacoes: 'Acompanhamento do caso em andamento sem incidentes.',
            ativo: true
        });
        // Submódulo 7: Vínculo Empregatício
        vinculosToInsert.push({
            trabalhadorId: workerId,
            tipoVinculo: vinculoTipoStr,
            matricula,
            funcao: funcaoStr,
            jornadaTrabalho: jornadaStr,
            turnoTrabalho: turnoStr,
            dataInicio: dataEntrada,
            dataFim: null,
            situacao: situacaoStr,
            empresaTerceirizada: vinculoTipoStr === 'Terceirizado' ? 'Terceiriza SST S/A' : '',
            setor: `Setor de ${funcaoStr}s`,
            cargo: funcaoStr,
            ocupacao: `CBO-${2000 + (i % 1000)}`,
            cargaHoraria: jornadaStr.startsWith('40') ? 40 : (jornadaStr.startsWith('30') ? 30 : 20),
            salario: 2500 + (i % 15) * 500,
            observacoes: 'Contrato cadastrado no sistema.',
            ativo: true
        });
    }
    // 5. Inserir todos em lote no banco
    console.log('⚡ Enviando dados para o MongoDB Atlas...');
    console.log('  ▸ Inserindo Trabalhadores...');
    await Trabalhador.insertMany(workersToInsert);
    console.log('  ▸ Inserindo Afastamentos...');
    await TrabalhadorAfastamento.insertMany(afastamentosToInsert);
    console.log('  ▸ Inserindo Dependentes...');
    await TrabalhadorDependente.insertMany(dependentesToInsert);
    console.log('  ▸ Inserindo Informações...');
    await TrabalhadorInformacao.insertMany(informacoesToInsert);
    console.log('  ▸ Inserindo Ocorrências de Violência...');
    await TrabalhadorOcorrenciaViolencia.insertMany(ocorrenciasToInsert);
    console.log('  ▸ Inserindo Processos de Trabalho...');
    await TrabalhadorProcessoTrabalho.insertMany(processosToInsert);
    console.log('  ▸ Inserindo Readaptações...');
    await TrabalhadorReadaptacao.insertMany(readaptacoesToInsert);
    console.log('  ▸ Inserindo Vínculos...');
    await TrabalhadorVinculo.insertMany(vinculosToInsert);
    console.log(`✅ Concluído com sucesso! ${targetCount} trabalhadores e submódulos cadastrados no banco.`);
}
// Executa diretamente ao ser chamado pelo npm run
connectDB().then(() => {
    seedTrabalhadores(3000).then(() => {
        console.log('🚀 Seed de trabalhadores concluído. Fechando conexão...');
        mongoose.connection.close();
        process.exit(0);
    });
}).catch((err) => {
    console.error('❌ Erro na conexão com o banco de dados:', err);
    process.exit(1);
});
