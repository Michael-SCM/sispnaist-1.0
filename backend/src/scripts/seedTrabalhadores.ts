import mongoose from 'mongoose';
import dns from 'node:dns';
import 'dotenv/config';

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
import Acidente from '../models/Acidente.js';
import Doenca from '../models/Doenca.js';
import Vacinacao from '../models/Vacinacao.js';
import MaterialBiologico from '../models/MaterialBiologico.js';
import TrabalhadorRiscoOcupacional from '../models/TrabalhadorRiscoOcupacional.js';
import TrabalhadorHistoricoPPP from '../models/TrabalhadorHistoricoPPP.js';
import HabilitacaoPnaist from '../models/HabilitacaoPnaist.js';

// Seeded PRNG (Mulberry32) para distribuição mais natural
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

const firstNames = [
  'Ana', 'Carlos', 'Juliana', 'Bruno', 'Mariana', 'Lucas', 'Fernanda', 'Gabriel', 'Patrícia', 'Thiago',
  'Beatriz', 'Diego', 'Camila', 'Rodrigo', 'Amanda', 'Felipe', 'Larissa', 'Gustavo', 'Letícia', 'Rafael',
  'Isabela', 'Daniel', 'Aline', 'Marcelo', 'Sofia', 'Renato', 'Carla', 'Eduardo', 'Priscila', 'Leonardo',
  'Vanessa', 'Fábio', 'Natália', 'André', 'Monique', 'Vinícius', 'Cristina', 'Ricardo', 'Débora', 'Leandro',
  'Tatiane', 'Sérgio', 'Cíntia', 'Paulo', 'Rebeca', 'Márcio', 'Denise', 'Henrique', 'Elaine', 'Arthur',
  'Vera', 'Jorge', 'Jéssica', 'Flávio', 'Bianca', 'Tiago', 'Luciane', 'Rogério', 'Adriana', 'Murilo',
  'Simone', 'Davi', 'Luana', 'Caio', 'Viviane', 'Alex', 'Raquel', 'César', 'Ingrid', 'Matheus',
  'Núbia', 'Evandro', 'Samantha', 'Cláudio', 'Danielle', 'Roberto', 'Gisele', 'Augusto', 'Lorena', 'Edson',
  'Sabrina', 'Wanderson', 'Mônica', 'Breno', 'Giovanna', 'Otávio', 'Érica', 'Humberto', 'Taís', 'Nilton',
  'Keyla', 'Valdir', 'Yasmin', 'Adilson', 'Talita', 'Cleber', 'Suellen', 'Emerson', 'Catarina', 'Jair',
  'Heloise', 'Wagner', 'Rafaela', 'Welton', 'Maísa', 'Ailton', 'Fabiana', 'Manoel', 'Lucélia', 'Ivan',
  'Ruth', 'Osvaldo', 'Miriam', 'Antônio', 'Joana', 'Francisco', 'Bárbara', 'Pedro', 'Elisa', 'Miguel',
  'Clara', 'Igor', 'Manuela', 'Nelson', 'Valentina', 'Luís', 'Heloísa', 'Samuel', 'Lívia', 'João',
  'Alice', 'Guilherme', 'Laura', 'Enzo', 'Sophia', 'Benício', 'Helena', 'Vicente', 'Emanuelly', 'Ruan',
  'Maysa', 'Kevin', 'Esther', 'Yuri', 'Lavínia', 'Kaique', 'Isis', 'Danilo', 'Ariana', 'Thales',
  'Luna', 'Alexandre', 'Maitê', 'Renan', 'Ana Clara', 'Iago', 'Maria Luísa', 'Erick', 'Melissa', 'Raul',
  'Cecília', 'Mário', 'Ana Laura', 'Josué', 'Alícia', 'Natan', 'Isadora', 'Brayan', 'Marina', 'Luan',
  'Brenda', 'Fábio', 'Lara', 'Raimundo', 'Carolina', 'Túlio', 'Stela', 'Robson', 'Tainá', 'Dalton',
  'Nádia', 'Cauê', 'Dora', 'Anderson', 'Mirian', 'Elias', 'Luciana', 'Tomás', 'Ivone', 'Valter',
  'Marlene', 'Nilson', 'Creuza', 'Adão', 'Eunice', 'Aldo', 'Neusa', 'Cristiano', 'Zélia', 'Ciro',
  'Odete', 'Laércio', 'Geni', 'Firmino', 'Jandira', 'Saulo', 'Célia', 'Hélio', 'Lourdes', 'Jairo',
  'Telma', 'Arnaldo', 'Norma', 'Osmar', 'Dulce', 'José', 'Nair', 'Sebastião', 'Belmira', 'Djalma',
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
  'Dias', 'Aragão', 'Salgado', 'Sardinha', 'Campelo', 'Bittencourt', 'Garcez', 'Lisboa', 'Portela', 'Pádua',
  'Barcelos', 'Lamego', 'Távora', 'Galvão', 'Souto', 'Proença', 'Lins', 'Câmara', 'Coury', 'Cordeiro',
  'Goulart', 'Pedrosa', 'Alcântara', 'Arantes', 'Belo', 'Caires', 'Caldas', 'Castelo', 'Chagas', 'Couto',
  'Escobar', 'Estrada', 'Fagundes', 'Furtado', 'Guerra', 'Lessa', 'Malheiros', 'Mascarenhas', 'Néri', 'Ornelas',
  'Palhares', 'Quadros', 'Rego', 'Salomão', 'Sandoval', 'Sarmento', 'Seixas', 'Serrão', 'Tavares', 'Uchôa',
];

const lastNames = [
  'Mendes', 'Nunes', 'Rocha', 'Cardoso', 'Teixeira', 'Araújo', 'Moreira', 'Barros', 'Correia',
  'Freitas', 'Dantas', 'Cavalcanti', 'Azevedo', 'Castro', 'Pinto', 'Miranda', 'Borges', 'Fonseca', 'Paiva',
  'Belém', 'Furtado', 'Alencar', 'Luz', 'Falcão', 'Porto', 'Sena', 'Fraga', 'Serpa', 'Bastos',
  'Coutinho', 'Novaes', 'Peixoto', 'Vale', 'Lago', 'Chaves', 'Reis', 'Mattos', 'Maia', 'Magalhães',
  'Pontes', 'Medeiros', 'Fleury', 'Dornelas', 'Bretas', 'Sabino', 'Jardim', 'Zago', 'Werneck', 'Caputo',
  'Diniz', 'Trindade', 'Fontenele', 'Leal', 'Sampaio', 'Morais', 'Moraes', 'Godoy', 'Berbert', 'Caldas',
  'Santana', 'Leandro', 'Sales', 'Barroso', 'Rolim', 'Osório', 'Assunção', 'Neri', 'Quaresma', 'Aguiar',
  'Uchôa', 'Canuto', 'Gadelha', 'Colares', 'Fontes', 'Maciel', 'Baldini', 'Pascoal', 'Tomé', 'Mota',
  'Brum', 'Leme', 'Curi', 'Alvarenga', 'Demétrio', 'Tângari', 'Frej', 'Kahwage', 'Haiad', 'Sebe',
  'Bitar', 'Arbex', 'Jafet', 'Maluf', 'Mattar', 'Haddad', 'Saad', 'Miguel', 'Aun', 'Calfat',
  'Racy', 'Tuma', 'Homsi', 'Chedid', 'Abi-Ackel', 'Cury', 'Atalla', 'Khoury', 'Bitar', 'Maia',
];

const motherFirstNames = [
  'Maria', 'Regina', 'Helena', 'Teresa', 'Francisca', 'Luciana', 'Sandra', 'Márcia', 'Sônia', 'Rita',
  'Ângela', 'Patrícia', 'Adriana', 'Cláudia', 'Valéria', 'Mônica', 'Vera', 'Sueli', 'Aparecida', 'Rosângela',
  'Marta', 'Neide', 'Ivone', 'Lúcia', 'Célia', 'Marlene', 'Irene', 'Nadir', 'Elza', 'Conceição',
  'Fátima', 'Cleide', 'Edna', 'Bernadete', 'Dolores', 'Alzira', 'Geralda', 'Amélia', 'Eunice', 'Nair',
  'Raimunda', 'Sebastiana', 'Leila', 'Josefa', 'Carmem', 'Lurdes', 'Margarida', 'Terezinha', 'Luzia', 'Glória',
  'Rosa', 'Benedita', 'Catarina', 'Isabel', 'Joana', 'Madalena', 'Perpétua', 'Escolástica', 'Januária', 'Floripes',
  'Guiomar', 'Inês', 'Jacinta', 'Laura', 'Leonor', 'Marinalva', 'Nilza', 'Odete', 'Otília', 'Quitéria',
  'Silvana', 'Tânia', 'Vilma', 'Zilda', 'Auxiliadora', 'Diva', 'Elvira', 'Hilda', 'Iracema', 'Jurema',
];

function normalizeEmail(email: string): string {
  return email
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function generateCPF(index: number): string {
  const num = 100000000 + index;
  const base = String(num);
  const digits = base.split('').map(Number);

  let sum1 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += digits[i] * (10 - i);
  }
  let d1 = 11 - (sum1 % 11);
  if (d1 >= 10) d1 = 0;

  let sum2 = 0;
  for (let i = 0; i < 9; i++) {
    sum2 += digits[i] * (11 - i);
  }
  sum2 += d1 * 2;
  let d2 = 11 - (sum2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${base.substring(0, 3)}.${base.substring(3, 6)}.${base.substring(6, 9)}-${d1}${d2}`;
}

// Cidades brasileiras com suas UFs e CEPs
interface Cidade {
  cidade: string;
  estado: string;
  cepRange: [number, number];
  logradouros: string[];
  bairros: string[];
}

const cidades: Cidade[] = [
  {
    cidade: 'São Paulo', estado: 'SP', cepRange: [1001000, 59999000],
    logradouros: ['Avenida Paulista', 'Rua Augusta', 'Avenida Brigadeiro Faria Lima', 'Rua Oscar Freire', 'Avenida Rebouças', 'Rua da Consolação', 'Avenida São João', 'Rua 25 de Março', 'Avenida Interlagos', 'Rua Vergueiro', 'Avenida Cruzeiro do Sul', 'Rua Teodoro Sampaio'],
    bairros: ['Bela Vista', 'Jardins', 'Pinheiros', 'Vila Olímpia', 'Moema', 'Itaim Bibi', 'Perdizes', 'Santana', 'Tatuapé', 'Vila Mariana', 'Jabaquara', 'Santo Amaro']
  },
  {
    cidade: 'Rio de Janeiro', estado: 'RJ', cepRange: [20040000, 37990000],
    logradouros: ['Avenida Atlântica', 'Rua Presidente Vargas', 'Avenida Rio Branco', 'Rua do Ouvidor', 'Avenida Nossa Senhora de Copacabana', 'Rua Visconde de Pirajá', 'Avenida Brasil', 'Rua Voluntários da Pátria', 'Avenida das Américas', 'Rua Marquês de Olinda'],
    bairros: ['Copacabana', 'Ipanema', 'Leblon', 'Botafogo', 'Flamengo', 'Tijuca', 'Barra da Tijuca', 'Centro', 'Laranjeiras', 'Jardim Botânico', 'Urca', 'Gávea']
  },
  {
    cidade: 'Belo Horizonte', estado: 'MG', cepRange: [30000000, 39990000],
    logradouros: ['Avenida Afonso Pena', 'Rua da Bahia', 'Avenida do Contorno', 'Rua Pernambuco', 'Avenida Amazonas', 'Rua dos Tupinambás', 'Avenida Cristiano Machado', 'Rua São Paulo', 'Avenida Raja Gabaglia', 'Rua Alvarenga Peixoto'],
    bairros: ['Savassi', 'Funcionários', 'Lourdes', 'Sion', 'Santo Agostinho', 'Cidade Jardim', 'Buritis', 'Pampulha', 'Floresta', 'Barreiro', 'Betânia', 'Gutierrez']
  },
  {
    cidade: 'Salvador', estado: 'BA', cepRange: [40000000, 49990000],
    logradouros: ['Avenida Tancredo Neves', 'Rua Chile', 'Avenida Sete de Setembro', 'Rua do Carmo', 'Avenida Garibaldi', 'Rua do Cabeça', 'Avenida Vasco da Gama', 'Rua Direita do Santo Antônio', 'Avenida Paulo VI', 'Rua do Tijolo'],
    bairros: ['Pelourinho', 'Barra', 'Ondina', 'Rio Vermelho', 'Pituba', 'Itaigara', 'Caminho das Árvores', 'Brotas', 'Graça', 'Vitória', 'Stela Maris', 'Imbuí']
  },
  {
    cidade: 'Curitiba', estado: 'PR', cepRange: [80000000, 87990000],
    logradouros: ['Avenida Batel', 'Rua XV de Novembro', 'Avenida Sete de Setembro', 'Rua Comendador Araújo', 'Avenida República Argentina', 'Rua Marechal Deodoro', 'Avenida Iguaçu', 'Rua Barão do Rio Branco', 'Avenida Cândido Hartmann', 'Rua Dr. Muricy'],
    bairros: ['Batel', 'Centro', 'Alto da XV', 'Mercês', 'Bigorrilho', 'Campo Comprido', 'Cidade Industrial', 'Jardim Botânico', 'Juvevê', 'Cristo Rei', 'Água Verde', 'Portão']
  },
  {
    cidade: 'Fortaleza', estado: 'CE', cepRange: [60000000, 65990000],
    logradouros: ['Avenida Beira Mar', 'Rua Barão do Rio Branco', 'Avenida Domingos Olímpio', 'Rua General Sampaio', 'Avenida Santos Dumont', 'Rua Costa Barros', 'Avenida Washington Soares', 'Rua do Rosário', 'Avenida Antônio Sales', 'Rua Major Facundo'],
    bairros: ['Meireles', 'Aldeota', 'Varjota', 'Praia de Iracema', 'Centro', 'Benfica', 'Mucuripe', 'Papicu', 'Cocó', 'Bairro de Fátima', 'Joaquim Távora', 'Dionísio Torres']
  },
  {
    cidade: 'Recife', estado: 'PE', cepRange: [50000000, 54990000],
    logradouros: ['Avenida Boa Viagem', 'Rua do Bom Jesus', 'Avenida Conde da Boa Vista', 'Rua da Aurora', 'Avenida Agamenon Magalhães', 'Rua Imperial', 'Avenida Norte', 'Rua da União', 'Avenida Caxangá', 'Rua do Hospício'],
    bairros: ['Boa Viagem', 'Recife Antigo', 'Graças', 'Madalena', 'Casa Forte', 'Espinheiro', 'Pina', 'Derby', 'Rosarinho', 'Centro', 'Ipsep', 'Afogados']
  },
  {
    cidade: 'Porto Alegre', estado: 'RS', cepRange: [90000000, 94990000],
    logradouros: ['Avenida Ipiranga', 'Rua da Praia', 'Avenida Borges de Medeiros', 'Rua dos Andradas', 'Avenida Protásio Alves', 'Rua Padre Chagas', 'Avenida Julio de Castilhos', 'Rua Vasco da Gama', 'Avenida Cristóvão Colombo', 'Rua Marquês do Herval'],
    bairros: ['Moinhos de Vento', 'Petrópolis', 'Rio Branco', 'Auxiliadora', 'Bela Vista', 'Cidade Baixa', 'Centro Histórico', 'Bom Fim', 'Floresta', 'Santana', 'Independência', 'Menino Deus']
  },
  {
    cidade: 'Brasília', estado: 'DF', cepRange: [70000000, 77990000],
    logradouros: ['Eixo Monumental', 'SHS Quadra 6', 'CLS 304', 'SGAN 601', 'SQS 308', 'Asa Norte Entrequadra', 'SCS Quadra 8', 'SIG Quadra 2', 'Setor de Clubes Esportivos', 'Via L4'],
    bairros: ['Asa Sul', 'Asa Norte', 'Sudoeste', 'Águas Claras', 'Taguatinga', 'Guará', 'Ceilândia', 'Planaltina', 'Gama', 'Sobradinho', 'Lago Norte', 'Lago Sul']
  },
  {
    cidade: 'Manaus', estado: 'AM', cepRange: [69000000, 69890000],
    logradouros: ['Avenida Eduardo Ribeiro', 'Rua 24 de Maio', 'Avenida Djalma Batista', 'Rua Marcílio Dias', 'Avenida Constantino Nery', 'Rua Joaquim Sarmento', 'Avenida Sete de Setembro', 'Rua Lauro Cavalcante', 'Avenida André Araújo', 'Rua Adriano Jorge'],
    bairros: ['Centro', 'Adrianópolis', 'Nossa Senhora das Graças', 'Aleixo', 'Vieiralves', 'Chapada', 'São Francisco', 'Ponta Negra', 'Japiim', 'Cachoeirinha', 'Parque 10', 'Flores']
  },
];

const setoresOptions = [
  'Administrativo', 'Financeiro', 'Recursos Humanos', 'Jurídico', 'TI',
  'Enfermagem', 'Medicina', 'Farmácia', 'Laboratório', 'Radiologia',
  'Fisioterapia', 'Nutrição', 'Psicologia', 'Serviço Social', 'Odontologia',
  'Manutenção', 'Limpeza', 'Segurança Patrimonial', 'Transporte', 'Almoxarifado',
  'Compras', 'Marketing', 'Comunicação', 'Planejamento', 'Controladoria',
];

const dominioEmails = ['sispnaist.com', 'saude.gov.br', 'prefeitura.sp.gov.br', 'gov.br', 'saude.mg.gov.br'];

const doencasOcupacionais = [
  { codigoDoenca: 'B30.9', nomeDoenca: 'Alergia a pó ocupacional' },
  { codigoDoenca: 'M25.5', nomeDoenca: 'Dor articular relacionada ao trabalho' },
  { codigoDoenca: 'J30.9', nomeDoenca: 'Rinite alérgica ocupacional' },
  { codigoDoenca: 'L23.9', nomeDoenca: 'Dermatite de contato profissional' },
  { codigoDoenca: 'G56.1', nomeDoenca: 'Síndrome do Túnel do Carpo' },
  { codigoDoenca: 'M54.5', nomeDoenca: 'Lombalgia ocupacional' },
  { codigoDoenca: 'H83.3', nomeDoenca: 'Perda auditiva induzida por ruído' },
  { codigoDoenca: 'F43.2', nomeDoenca: 'Transtorno de adaptação ao trabalho' },
  { codigoDoenca: 'J45.0', nomeDoenca: 'Asma ocupacional' },
  { codigoDoenca: 'M70.2', nomeDoenca: 'Bursite do ombro relacionada ao trabalho' },
  { codigoDoenca: 'I10', nomeDoenca: 'Hipertensão arterial relacionada ao trabalho' },
];

const vacinasDisponiveis = [
  { vacina: 'Hepatite B', doseUnica: false, intervaloDias: 30 },
  { vacina: 'Hepatite A', doseUnica: false, intervaloDias: 180 },
  { vacina: 'Tétano', doseUnica: false, intervaloDias: 365 },
  { vacina: 'Difteria', doseUnica: false, intervaloDias: 365 },
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

function generateCNPJ(index: number): string {
  const base = 10000000000000 + index;
  const s = String(base);
  return `${s.substring(0, 2)}.${s.substring(2, 5)}.${s.substring(5, 8)}/${s.substring(8, 12)}-${s.substring(12, 14)}`;
}

export async function seedTrabalhadores(targetCount: number = 1500) {
  console.log(`🌱 Iniciando seed de ${targetCount} trabalhadores e seus submódulos...`);

  console.log('🏢 Removendo empresas e unidades antigas...');
  await Empresa.deleteMany({});
  await Unidade.deleteMany({});

  const empresasDados: { razaoSocial: string; nomeFantasia: string; area: string }[] = [
    { razaoSocial: 'Hospital Geral São Lucas Ltda', nomeFantasia: 'Hospital São Lucas', area: 'hospital' },
    { razaoSocial: 'Clínica Médica Santa Clara S/S Ltda', nomeFantasia: 'Clínica Santa Clara', area: 'clinica' },
    { razaoSocial: 'Laboratório de Análises Clínicas Vital S/A', nomeFantasia: 'Lab Vital', area: 'laboratorio' },
    { razaoSocial: 'Serviços de Saúde Ocupacional Proteger Ltda', nomeFantasia: 'Proteger SST', area: 'ocupacional' },
    { razaoSocial: 'Centro de Diagnóstico por Imagem Radiante Ltda', nomeFantasia: 'Diagnóstico Radiante', area: 'diagnostico' },
    { razaoSocial: 'Unidade de Pronto Atendimento Vida Plena S/A', nomeFantasia: 'UPA Vida Plena', area: 'upa' },
    { razaoSocial: 'Clínica de Reabilitação Física Movimento Ltda', nomeFantasia: 'Reabilitar Movimento', area: 'reabilitacao' },
    { razaoSocial: 'Hospital Materno Infantil Nova Geração Ltda', nomeFantasia: 'Hospital Nova Geração', area: 'hospital' },
    { razaoSocial: 'Medicina do Trabalho Empresarial S/S Ltda', nomeFantasia: 'MedTrabalho', area: 'ocupacional' },
    { razaoSocial: 'Centro de Especialidades Médicas Integradas S/A', nomeFantasia: 'CEMI Especialidades', area: 'clinica' },
    { razaoSocial: 'Laboratório de Patologia e Análises Biomédicas Ltda', nomeFantasia: 'BioPath Lab', area: 'laboratorio' },
    { razaoSocial: 'Clínica Odontológica Sorriso Perfeito Ltda', nomeFantasia: 'Sorriso Perfeito', area: 'odontologia' },
    { razaoSocial: 'Hospital Ortopédico e Traumatológico Fraturas Zero S/A', nomeFantasia: 'Hospital Fraturas Zero', area: 'hospital' },
    { razaoSocial: 'Gestão de Saúde Corporativa SaúdeTotal Ltda', nomeFantasia: 'SaúdeTotal Corporativa', area: 'ocupacional' },
    { razaoSocial: 'Centro de Vacinação e Imunização ImunoVida Ltda', nomeFantasia: 'ImunoVida', area: 'vacinacao' },
  ];

  const emails = ['contato', 'administracao', 'financeiro', 'rh', 'atendimento', 'recepcao', 'faturamento', 'secretaria'];
  const telefones = [
    '(11) 3000-1001', '(11) 3123-4567', '(21) 2525-8000', '(21) 3555-4400',
    '(31) 3222-1100', '(41) 3333-5500', '(51) 3344-6600', '(71) 3456-7800',
    '(85) 3266-9900', '(81) 3422-8800', '(61) 3322-7700', '(92) 3633-6600',
    '(11) 4004-2001', '(21) 2222-3300', '(31) 3111-4400',
  ];

  const nomesUnidades = [
    'Unidade Central', 'Filial Zona Sul', 'Filial Zona Norte', 'Posto Avançado',
    'Unidade Leste', 'Unidade Oeste', 'Centro Médico', 'Núcleo de Atendimento',
    'Polo Regional', 'Núcleo Avançado', 'Filial Centro', 'Unidade Matriz',
    'Filial Nova', 'Posto de Atendimento',
  ];

  const nomesGestores = [
    'Dr. Carlos Mendes', 'Dra. Renata Oliveira', 'Dr. Paulo Henrique Santos', 'Dra. Marina Costa',
    'Dr. Ricardo Barbosa', 'Dra. Isabela Rocha', 'Dr. Fernando Almeida', 'Dra. Luciana Martins',
    'Dr. Gustavo Nunes', 'Dra. Camila Vieira', 'Dr. André Cavalcanti', 'Dra. Patricia Souza',
    'Dr. Marcos Vinícius', 'Dra. Tatiane Ferreira', 'Dr. Eduardo Lima', 'Dra. Daniela Braga',
    'Dr. Rodrigo Campos', 'Dra. Amanda Teixeira', 'Dr. Felipe Moreira', 'Dra. Juliana Cardoso',
    'Dr. Marcelo Ribeiro', 'Dra. Bianca Furtado', 'Dr. Thiago Araújo', 'Dra. Vanessa Dias',
    'Dr. Leonardo Pires', 'Dra. Sabrina Batista', 'Dr. Hugo Carvalho', 'Dra. Livia Monteiro',
    'Dr. Rafael Nogueira', 'Dr. Alex Sandro Freitas', 'Dra. Elaine Matos', 'Dr. César Chaves',
    'Dra. Elisa Reis', 'Dr. Jorge Luiz', 'Dra. Valéria Assunção', 'Dr. Cristiano Pinto',
    'Dra. Flávia Magalhães', 'Dr. Otávio Augusto', 'Dra. Júlia Moraes', 'Dr. Rogério Campos',
    'Dra. Heloísa Amaral', 'Dr. Pedro Alves', 'Dra. Cristina Lopes', 'Dr. Jonas Pereira',
    'Dra. Daiane Figueiredo', 'Dr. Nilton Castro', 'Dra. Miriam Oliveira', 'Dr. Adriano Souza',
  ];

  // Criar 15 empresas
  console.log('🏢 Criando 15 empresas...');
  const empresas: any[] = [];

  for (let i = 0; i < empresasDados.length; i++) {
    const empData = empresasDados[i];
    const r = mulberry32(i * 991 + 5555);
    const cidade = pick(cidades, r);
    const logradouro = pick(cidade.logradouros, r);
    const bairro = pick(cidade.bairros, r);
    const emailPrefixo = pick(emails, r);

    const emp = await Empresa.create({
      razaoSocial: empData.razaoSocial,
      nomeFantasia: empData.nomeFantasia,
      cnpj: generateCNPJ(i + 1),
      email: `${emailPrefixo}@${empData.nomeFantasia.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}.com.br`,
      telefone: telefones[i],
      endereco: {
        logradouro,
        numero: String(100 + Math.floor(r() * 900)),
        complemento: r() > 0.6 ? `Conjunto ${Math.floor(r() * 30) + 1}` : '',
        bairro,
        cidade: cidade.cidade,
        estado: cidade.estado,
        cep: `${String(cidade.cepRange[0]).substring(0, 5)}-${String(100 + Math.floor(r() * 800)).padStart(3, '0')}`,
      },
      ativa: true,
    });
    empresas.push(emp);
    console.log(`   ${i + 1}/15 ${empData.nomeFantasia}`);
  }

  // Criar 40 unidades distribuídas entre as 15 empresas
  console.log('🏥 Distribuindo 40 unidades entre as 15 empresas...');
  const unidades: any[] = [];
  const distribuicao = [5, 4, 2, 3, 2, 4, 2, 5, 3, 3, 2, 1, 4, 3, 2];

  for (let e = 0; e < empresas.length; e++) {
    const numUnidades = distribuicao[e];
    const empresa = empresas[e];

    for (let u = 0; u < numUnidades; u++) {
      const r = mulberry32(e * 1000 + u * 53 + 7777);
      const cidade = pick(cidades, r);
      const logradouro = pick(cidade.logradouros, r);
      const bairro = pick(cidade.bairros, r);

      const nomeUnidade = `${empresasDados[e].nomeFantasia} - ${pick(nomesUnidades, r)}${u > 0 ? ` ${u + 1}` : ''}`;

      const esferaOptions: Array<{ value: string; weight: number }> = [
        { value: 'municipal', weight: 0.35 },
        { value: 'estadual', weight: 0.20 },
        { value: 'federal', weight: 0.15 },
        { value: 'privado', weight: 0.20 },
        { value: 'terceiro_setor', weight: 0.10 },
      ];
      const esferaRand = r();
      let cumSum = 0;
      let esfera = 'privado';
      for (const opt of esferaOptions) {
        cumSum += opt.weight;
        if (esferaRand < cumSum) { esfera = opt.value; break; }
      }

      const unidade = await Unidade.create({
        nome: nomeUnidade,
        empresaId: empresa._id,
        esferaAdministrativa: esfera,
        possuiPgr: r() > 0.35,
        endereco: {
          logradouro,
          numero: String(100 + Math.floor(r() * 900)),
          complemento: r() > 0.5 ? `Sala ${Math.floor(r() * 50) + 1}` : '',
          bairro,
          cidade: cidade.cidade,
          estado: cidade.estado,
        cep: `${String(cidade.cepRange[0]).substring(0, 5)}-${String(100 + Math.floor(r() * 800)).padStart(3, '0')}`,
        },
        gestor: pick(nomesGestores, r),
        ativa: true,
      });
      unidades.push(unidade);
    }
  }
  console.log(`🏢 ${empresas.length} empresas, ${unidades.length} unidades criadas.`);

  // Questionário
  let questionario = await Questionario.findOne();
  if (!questionario) {
    console.log('📝 Nenhum questionário encontrado. Criando...');
    questionario = await Questionario.create({
      nome: 'Questionário Geral de Saúde do Trabalhador',
      descricao: 'Mapeamento de perfil epidemiológico e de processo de trabalho do SISPNAIST',
      tipo: 'saude',
      ativo: true,
    });
  }

  // Catálogos
  console.log('🗂️ Carregando opções dos catálogos...');
  const catalogos = await Catalogo.find({ ativo: true });

  const getOptions = (entidade: string, fallback: string[]): string[] => {
    const list = catalogos.filter(c => c.entidade === entidade).map(c => c.nome);
    return list.length > 0 ? list : fallback;
  };

  const sexos = getOptions('sexo', ['Masculino', 'Feminino']);
  const generos = getOptions('genero', ['Mulher cisgênero', 'Homem cisgênero', 'Não-binário', 'Outro']);
  const racas = getOptions('racaCor', ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena']);
  const escolaridades = getOptions('escolaridade', ['Fundamental Completo', 'Médio Completo', 'Superior Completo', 'Pós-graduação']);
  const estadosCivis = getOptions('estadoCivil', ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável']);
  const tiposSanguineos = getOptions('tipoSanguineo', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
  const deficienciaTipos = getOptions('tipoDeficiencia', ['Física', 'Visual', 'Auditiva', 'Intelectual', 'Múltipla', 'Psicossocial']);
  const deficienciaTempos = getOptions('tempoDeficiencia', ['Congênita', 'Adquirida', 'Temporária', 'Permanente']);
  const deficienciaGraus = getOptions('grauDeficiencia', ['Leve', 'Moderada', 'Severa', 'Profunda']);
  const vinculoTipos = getOptions('tipoVinculo', ['Efetivo', 'CLT', 'Estágio', 'Temporário', 'Terceirizado', 'Comissionado']);
  const turnos = getOptions('turnoTrabalho', ['Diurno', 'Noturno', 'Misto', 'Plantão 12h', 'Plantão 24h']);
  const jornadas = getOptions('jornadaTrabalho', ['20 horas semanais', '30 horas semanais', '40 horas semanais', '44 horas semanais']);
  const situacoes = getOptions('situacaoTrabalho', ['Ativo', 'Afastado', 'Desligado', 'Aposentado']);
  const funcoes = getOptions('funcao', ['Médico(a)', 'Enfermeiro(a)', 'Técnico(a) de Enfermagem', 'Administrativo', 'Serviços Gerais']);
  const afastamentoTipos = getOptions('tipoAfastamento', ['Doença', 'Acidente de trabalho', 'Licença maternidade', 'Licença para tratamento']);
  const afastamentoMotivos = getOptions('motivoAfastamento', ['Doença comum', 'Doença profissional', 'COVID-19', 'Cirurgia', 'Acidente']);
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

  // Limpar dados antigos
  console.log('🧹 Limpando dados antigos...');
  await Trabalhador.deleteMany({});
  await TrabalhadorAfastamento.deleteMany({});
  await TrabalhadorDependente.deleteMany({});
  await TrabalhadorInformacao.deleteMany({});
  await TrabalhadorProcessoTrabalho.deleteMany({});
  await TrabalhadorReadaptacao.deleteMany({});
  await TrabalhadorVinculo.deleteMany({});
  await TrabalhadorRiscoOcupacional.deleteMany({});
  await TrabalhadorHistoricoPPP.deleteMany({});
  await Acidente.deleteMany({});
  await Doenca.deleteMany({});
  await Vacinacao.deleteMany({});
  await MaterialBiologico.deleteMany({});
  console.log('🧹 Limpeza concluída.');

  console.log(`📝 Preparando ${targetCount} registros...`);

  const workersToInsert: any[] = [];
  const afastamentosToInsert: any[] = [];
  const dependentesToInsert: any[] = [];
  const informacoesToInsert: any[] = [];
  const ocorrenciasToInsert: any[] = [];
  const processosToInsert: any[] = [];
  const readaptacoesToInsert: any[] = [];
  const vinculosToInsert: any[] = [];
  const vacinacoesToInsert: any[] = [];
  const doencasToInsert: any[] = [];
  const acidentesToInsert: any[] = [];
  const materiaisBiologicosToInsert: any[] = [];
  const riscosOcupacionaisToInsert: any[] = [];
  const historicoPPPToInsert: any[] = [];

  for (let i = 1; i <= targetCount; i++) {
    const rand = mulberry32(i * 2654435761 + 12345);
    const workerId = new mongoose.Types.ObjectId();

    // ---- NOME ----
    const firstName = pick(firstNames, rand);
    const middleName = pick(middleNames, rand);
    const lastName = pick(lastNames, rand);
    const nome = `${firstName} ${middleName} ${lastName}`;

    const maeFirstName = pick(motherFirstNames, rand);
    const maeMiddleName = pick(middleNames, rand);
    const nomeMae = `${maeFirstName} ${maeMiddleName} ${lastName}`;

    const cpf = generateCPF(i);
    const cartaoSus = String(700000000000000 + i);
    const matricula = `MAT-${String(i).padStart(6, '0')}`;
    const dominio = pick(dominioEmails, rand);
    const email = normalizeEmail(`${firstName}.${lastName}.${i}@${dominio}`);

    // ---- DATAS REALISTAS ----
    const idadeAnos = 18 + Math.floor(rand() * 47); // 18 a 64 anos
    const birthYear = 2026 - idadeAnos;
    const birthMonth = 1 + Math.floor(rand() * 12);
    const birthDay = 1 + Math.floor(rand() * 28);
    const dataNascimento = new Date(birthYear, birthMonth - 1, birthDay);

    // Data de entrada: entre 1 e 25 anos atrás (nunca antes dos 14 anos)
    const anosServico = 1 + Math.floor(rand() * Math.min(idadeAnos - 14, 25));
    const entradaYear = birthYear + 14 + Math.floor(rand() * Math.max(1, idadeAnos - 14 - 1));
    const entradaMonth = 1 + Math.floor(rand() * 12);
    const entradaDay = 1 + Math.floor(rand() * 28);
    const dataEntrada = new Date(Math.min(entradaYear, 2025), entradaMonth - 1, entradaDay);

    // ---- ENDEREÇO ----
    const cidadeObj = pick(cidades, rand);
    const logradouro = pick(cidadeObj.logradouros, rand);
    const bairro = pick(cidadeObj.bairros, rand);
    const numero = 1 + Math.floor(rand() * 9999);
    const cepNum = cidadeObj.cepRange[0] + Math.floor(rand() * (cidadeObj.cepRange[1] - cidadeObj.cepRange[0]));
    const cep = String(cepNum).padStart(8, '0').replace(/^(\d{5})(\d{3})$/, '$1-$2');

    // ---- SEXO / GÊNERO ----
    const isFeminino = rand() > 0.5;
    const sexoStr = isFeminino ? 'Feminino' : 'Masculino';
    const generoStr = isFeminino
      ? (rand() > 0.95 ? 'Não-binário' : 'Mulher cisgênero')
      : (rand() > 0.95 ? 'Não-binário' : 'Homem cisgênero');

    const racaStr = (() => {
      const r = rand();
      if (r < 0.43) return 'Branca';
      if (r < 0.72) return 'Parda';
      if (r < 0.88) return 'Preta';
      if (r < 0.96) return 'Amarela';
      return 'Indígena';
    })();

    const escolaridadeStr = (() => {
      const r = rand();
      if (r < 0.08) return 'Fundamental Completo';
      if (r < 0.48) return 'Médio Completo';
      if (r < 0.78) return 'Superior Completo';
      return 'Pós-graduação';
    })();

    const estadoCivilStr = (() => {
      const r = rand();
      if (r < 0.35) return 'Solteiro(a)';
      if (r < 0.65) return 'Casado(a)';
      if (r < 0.80) return 'União Estável';
      if (r < 0.93) return 'Divorciado(a)';
      return 'Viúvo(a)';
    })();

    const tipoSanguineoStr = (() => {
      const r = rand();
      if (r < 0.36) return 'O+';
      if (r < 0.53) return 'A+';
      if (r < 0.63) return 'B+';
      if (r < 0.69) return 'AB+';
      if (r < 0.77) return 'O-';
      if (r < 0.85) return 'A-';
      if (r < 0.93) return 'B-';
      return 'AB-';
    })();

    // ---- DEFICIÊNCIA (~7% dos casos) ----
    const hasDeficiency = rand() < 0.07;
    const deficiencia = {
      tipo: hasDeficiency ? pick(deficienciaTipos, rand) : '',
      tempo: hasDeficiency ? pick(deficienciaTempos, rand) : '',
      grau: hasDeficiency ? pick(deficienciaGraus, rand) : ''
    };

    // ---- VÍNCULO ----
    const vinculoTipoStr = (() => {
      const r = rand();
      if (r < 0.40) return 'Efetivo';
      if (r < 0.70) return 'CLT';
      if (r < 0.82) return 'Terceirizado';
      if (r < 0.90) return 'Comissionado';
      if (r < 0.96) return 'Temporário';
      return 'Estágio';
    })();

    const turnoStr = pick(turnos, rand);
    const jornadaStr = (() => {
      const r = rand();
      if (r < 0.50) return '40 horas semanais';
      if (r < 0.80) return '44 horas semanais';
      if (r < 0.93) return '30 horas semanais';
      return '20 horas semanais';
    })();

    const situacaoStr = (() => {
      const r = rand();
      if (r < 0.78) return 'Ativo';
      if (r < 0.88) return 'Afastado';
      if (r < 0.95) return 'Desligado';
      return 'Aposentado';
    })();

    const funcaoStr = (() => {
      const r = rand();
      if (r < 0.20) return 'Médico(a)';
      if (r < 0.45) return 'Enfermeiro(a)';
      if (r < 0.70) return 'Técnico(a) de Enfermagem';
      if (r < 0.88) return 'Administrativo';
      return 'Serviços Gerais';
    })();

    const setorStr = pick(setoresOptions, rand);

    // ---- DISTRIBUIÇÃO EMPRESA/UNIDADE ----
    const empIndex = (i - 1) % empresas.length;
    const currentEmpresa = empresas[empIndex];
    const unidadesDaEmpresa = unidades.filter(u => u.empresaId.toString() === currentEmpresa._id.toString());
    const currentUnidade = pick(unidadesDaEmpresa, mulberry32(i * 777 + 9999));

    // ---- DOCUMENTO TRABALHADOR ----
    workersToInsert.push({
      _id: workerId,
      cpf,
      nome,
      nomeSocial: rand() > 0.9 ? `Nome Social ${firstName}` : '',
      nomeMae,
      matricula,
      cartaoSus,
      celular: `(11) 9${String(90000000 + i * 7).substring(0, 4)}-${String(90000000 + i * 7).substring(4, 8)}`,
      telefoneContato: rand() > 0.6 ? `(11) ${3000 + Math.floor(rand() * 5000)}-${String(1000 + Math.floor(rand() * 8000)).substring(0, 4)}` : '',
      email,
      dataNascimento,
      empresa: currentEmpresa._id,
      unidade: currentUnidade._id,
      sexo: sexoStr,
      genero: generoStr,
      raca: racaStr,
      etnia: racaStr === 'Indígena' ? 'Tupi-Guarani' : (rand() > 0.9 ? pick(['Quilombola', 'Cigano', 'Não especificada'], rand) : ''),
      nacionalidade: {
        cidade: cidadeObj.cidade,
        estado: cidadeObj.estado,
        pais: 'Brasil'
      },
      insalubridadePericulosidade: rand() > 0.7 ? 'Insalubridade grau médio' : '',
      neurodivergencias: rand() > 0.92 ? [pick(['TDAH', 'Dislexia', 'TEA', 'Discalculia'], rand)] : [],
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
        logradouro,
        numero: String(numero),
        complemento: rand() > 0.5 ? `Apto ${Math.floor(rand() * 100) + 1}` : '',
        bairro,
        cidade: cidadeObj.cidade,
        estado: cidadeObj.estado,
        cep
      },
      trabalho: {
        dataPosse: vinculoTipoStr === 'Efetivo' ? dataEntrada : null,
        empresaTerceirizada: vinculoTipoStr === 'Terceirizado' ? 'Terceiriza SST S/A' : '',
        residente: rand() > 0.9,
        anosResidencia: rand() > 0.9 ? `${1 + Math.floor(rand() * 20)} anos` : '',
        dataEntrada,
        setor: setorStr,
        cargo: funcaoStr,
        funcao: funcaoStr,
        ocupacao: `CBO-${2000 + Math.floor(rand() * 999)}`
      },
      historico: {
        dataAposentadoria: situacaoStr === 'Aposentado' ? new Date(2024, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)) : null,
        dataObito: null,
        dataRemocao: null,
        novoServico: '',
        dataRetorno: null,
        dataRelotacao: null,
        dataDesligamento: situacaoStr === 'Desligado' ? new Date(2023, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)) : null,
        dataAfastamento: situacaoStr === 'Afastado' ? new Date(2024, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)) : null,
        tipoAfastamento: situacaoStr === 'Afastado' ? pick(afastamentoTipos, rand) : ''
      }
    });

    // ---- Submódulo 1: AFASTAMENTO (~40% dos casos) ----
    if (rand() > 0.6) {
      const afastInicio = new Date(entradaYear + Math.floor(rand() * 5) + 1, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28));
      const afastRetorno = new Date(afastInicio.getTime() + (5 + Math.floor(rand() * 60)) * 86400000);
      const afastDias = Math.round((afastRetorno.getTime() - afastInicio.getTime()) / 86400000);
      afastamentosToInsert.push({
        trabalhadorId: workerId,
        tipoAfastamento: pick(afastamentoTipos, rand),
        motivoAfastamento: pick(afastamentoMotivos, rand),
        cid: `M${50 + Math.floor(rand() * 50)}.${Math.floor(rand() * 9)}`,
        dataInicio: afastInicio,
        dataFim: afastRetorno,
        dataRetorno: new Date(afastRetorno.getTime() + 86400000),
        dataPericia: new Date(afastInicio.getTime() + 3 * 86400000),
        desfecho: rand() > 0.3 ? 'Alta médica e retorno integral ao serviço' : 'Alta com restrições parciais',
        tempoAfastamento: `${afastDias} dias`,
        laudoMedico: rand() > 0.5 ? 'Tratamento clínico com repouso recomendado. Paciente apresenta boa evolução.' : 'Acompanhamento ambulatorial necessário. Retorno gradual ao trabalho.',
        observacoes: rand() > 0.5 ? 'Afastamento regularizado sem pendências.' : 'Paciente em acompanhamento periódico.',
        ativo: true
      });
    }

    // ---- Submódulo 2: DEPENDENTES (~60% dos casos) ----
    const numDependentes = estadoCivilStr === 'Casado(a)' || estadoCivilStr === 'União Estável'
      ? (rand() > 0.5 ? 2 : 1)
      : (rand() > 0.7 ? 1 : 0);

    for (let d = 0; d < numDependentes; d++) {
      const depFirstName = pick(firstNames, mulberry32(i * 100 + d * 7 + 999));
      const depParentesco = d === 0
        ? (isFeminino ? 'Cônjuge' : 'Cônjuge')
        : 'Filho(a)';
      const depDataNasc = depParentesco === 'Cônjuge'
        ? new Date(birthYear - 2 + Math.floor(rand() * 5), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28))
        : new Date(2010 + Math.floor(rand() * 15), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28));

      const depHasDeficiencia = rand() < 0.07;
      dependentesToInsert.push({
        trabalhadorId: workerId,
        nome: `${depFirstName} ${middleName} ${lastName}`,
        cpf: generateCPF(4000 + i * 10 + d),
        dataNascimento: depDataNasc,
        parentesco: depParentesco,
        dependentIR: d === 0 && rand() > 0.5,
        temDeficiencia: depHasDeficiencia,
        tipoDeficiencia: depHasDeficiencia ? pick(deficienciaTipos, rand) : '',
        descricaoDeficiencia: depHasDeficiencia ? `Deficiência ${pick(deficienciaTipos, rand)} diagnosticada.` : '',
        ativo: true
      });
    }

    if (dependentesToInsert.length === 0 || dependentesToInsert[dependentesToInsert.length - 1]?.trabalhadorId?.toString() !== workerId.toString()) {
      // Garantir que tenha ao menos um registro neste lote, vazio não é inserido
    }

    // ---- Submódulo 3: INFORMAÇÕES DE SAÚDE ----
    const doencaBaseOpts = getOptions('doencaBase', ['Diabetes', 'Hipertensão', 'Asma', 'Nenhuma']);
    const estadoVacinalOpts = getOptions('estadoVacinal', ['Em dia', 'Atrasado', 'Não vacinado']);
    const tipoDrogaOpts = getOptions('tipoDroga', ['Álcool', 'Tabaco', 'Nenhuma']);

    const teveCovid = rand() > 0.6;
    const hasLimitacao = rand() < 0.12;
    const isGestante = isFeminino && rand() > 0.85;
    const hasDoencaPreexistente = rand() < 0.15;
    const hasHistoricoFamiliar = rand() < 0.2;
    informacoesToInsert.push({
      trabalhadorId: workerId.toString(),
      doencaBase: rand() > 0.25 ? 'Nenhuma' : pick(doencaBaseOpts.filter(d => d !== 'Nenhuma'), rand),
      estadoVacinal: pick(estadoVacinalOpts, rand),
      tipoDroga: rand() > 0.7 ? pick(tipoDrogaOpts.filter(d => d !== 'Nenhuma'), rand) : 'Nenhuma',
      tipoSanguineo: tipoSanguineoStr,
      medicamentos: rand() > 0.2 ? 'Nenhum' : 'Uso contínuo de anti-hipertensivo',
      doadorSangue: rand() > 0.7,
      doadorOrgaos: rand() > 0.8,
      doencaPreexistente: hasDoencaPreexistente,
      descricaoDoencaPreexistente: hasDoencaPreexistente ? 'Hipertensão arterial diagnosticada há mais de 5 anos.' : '',
      historicoFamiliar: hasHistoricoFamiliar,
      descricaoHistoricoFamiliar: hasHistoricoFamiliar ? 'Histórico de diabetes e hipertensão na família.' : '',
      teveCovid,
      ultimoContagio: teveCovid ? `${2021 + Math.floor(rand() * 4)}-0${1 + Math.floor(rand() * 9)}` : '',
      teveSequela: teveCovid && rand() > 0.7,
      descricaoSequela: teveCovid && rand() > 0.7 ? 'Fadiga persistente e perda parcial de olfato.' : '',
      foiInternado: teveCovid && rand() > 0.8,
      diasInternacao: teveCovid && rand() > 0.8 ? 5 + Math.floor(rand() * 15) : 0,
      foiIntubado: teveCovid && rand() > 0.9,
      allergy: rand() > 0.85,
      descricaoAlergia: rand() > 0.85 ? 'Alergia a Dipirona' : '',
      acompanhamentoMedico: rand() > 0.5,
      acompanhamentoMedicoMotivo: rand() > 0.5 ? 'Acompanhamento cardiológico semestral' : '',
      acompanhamentoReabilitacao: false,
      usoAlcool: rand() > 0.7,
      dosesAlcool: rand() > 0.7 ? Math.floor(rand() * 4) + 1 : 0,
      usoCigarro: rand() > 0.85,
      macosCigarro: rand() > 0.85 ? Math.floor(rand() * 3) + 1 : 0,
      usoOutraDroga: false,
      outraDrogaDescricao: '',
      frequenciaUso: rand() > 0.7 ? 'Ocasional' : '',
      gestante: isGestante,
      dataUltimaMenstruacao: isGestante ? `2026-0${1 + Math.floor(rand() * 5)}-${10 + Math.floor(rand() * 18)}` : '',
      semanasGestacao: isGestante ? 8 + Math.floor(rand() * 30) : 0,
      dataPartoPrevista: isGestante ? `2026-${6 + Math.floor(rand() * 6)}-${1 + Math.floor(rand() * 28)}` : '',
      preNatal: isGestante && rand() > 0.1,
      lactante: isFeminino && rand() > 0.85 && !isGestante,
      complicacoesGestacao: isGestante && rand() > 0.85 ? 'Diabetes gestacional controlada.' : '',
      limitacao: hasLimitacao,
      tipoLimitacao: hasLimitacao ? pick(deficienciaTipos, rand) : '',
      descricaoLimitacao: hasLimitacao ? 'Limitação parcial para atividades que exigem esforço físico intenso.' : '',
      causaLimitacao: hasLimitacao ? pick(['Acidente de trabalho', 'Doença ocupacional', 'Congênita'], rand) : '',
      parteCorpoAtingida: hasLimitacao ? pick(['Membros superiores', 'Coluna lombar', 'Membros inferiores'], rand) : '',
      necessitaAdaptacao: hasLimitacao && rand() > 0.5,
      descricaoAdaptacao: hasLimitacao && rand() > 0.5 ? 'Necessita de cadeira ergonômica e pousa-teclado ajustável.' : '',
      readaptacaoProfissional: rand() < 0.08,
      descricaoReadaptacao: rand() < 0.08 ? 'Readaptado para função administrativa por limitação física.' : '',
      exames: [],
      observacoes: rand() > 0.7 ? 'Trabalhador sem queixas no momento.' : 'Acompanhamento de rotina.',
      ativo: true
    });

    // ---- Submódulo 4: OCORRÊNCIA DE VIOLÊNCIA (~15% dos casos) ----
    if (rand() > 0.85) {
      const isAssedioCase = rand() > 0.5;
      ocorrenciasToInsert.push({
        trabalhadorId: workerId,
        dataOcorrencia: new Date(entradaYear + Math.floor(rand() * 5), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
        localOcorrencia: `${setorStr} - Sala ${Math.floor(rand() * 50) + 1}`,
        tipoViolencia: pick(violenciaTipos, rand),
        tipoViolenciaSexual: pick(violenciaSexuais, rand),
        isAssedio: isAssedioCase,
        motivoViolencia: pick(violenciaMotivos, rand),
        meioAgressao: pick(violenciaMeios, rand),
        tipoAutorViolencia: pick(violenciaAutores, rand),
        frequenciaAssedio: isAssedioCase ? pick(['Diário', 'Semanal', 'Quinzenal', 'Mensal'], rand) : '',
        testemunhas: isAssedioCase && rand() > 0.4 ? pick(['Colegas de setor', 'Chefia imediata', 'Pacientes presentes'], rand) : '',
        descricaoOcorrencia: rand() > 0.5
          ? 'Registro de conflito verbal ocorrido durante o expediente do trabalhador no atendimento de rotina.'
          : 'Trabalhador relatou episódio de assédio moral praticado por superior hierárquico durante reunião de equipe.',
        reincidencia: rand() > 0.9,
        atendimentoRealizado: 'Acolhimento da coordenação imediata do setor e encaminhamento ao serviço de psicologia.',
        condutaViolencia: 'Registro administrativo e orientação interna. Encaminhamento ao RH.',
        pessoasEnvolvidas: 'Colaboradores envolvidos e chefia imediata.',
        emissaoCatNas: rand() > 0.7,
        boletimOcorrencia: rand() > 0.7 ? `BO-${10000 + Math.floor(rand() * 90000)}/2025` : '',
        medidasTomadas: 'Remanejamento preventivo e acompanhamento psicológico.',
        acompanhamentos: 'Orientação geral e acompanhamento periódico.',
        ativo: true
      });
    }

    // ---- Submódulo 5: PROCESSO DE TRABALHO ----
    processosToInsert.push({
      trabalhadorId: workerId,
      setor: setorStr,
      cargo: funcaoStr,
      funcao: funcaoStr,
      jornadaTrabalho: jornadaStr,
      turnoTrabalho: turnoStr,
      jornadaSemanal: jornadaStr.split(' ')[0],
      questionarioId: questionario._id,
      dataInicio: dataEntrada,
      dataFim: null,
      observacoes: 'Desenvolve atividades relativas à sua função no setor designado.',
      ativo: true
    });

    // ---- Submódulo 6: READAPTAÇÃO FUNCIONAL (~10% dos casos) ----
    if (rand() > 0.9) {
      const readaptDate = new Date(dataEntrada.getTime() + (180 + Math.floor(rand() * 1000)) * 86400000);
      const mudouSetor = rand() > 0.5;
      const mudouFuncao = rand() > 0.6;
      readaptacoesToInsert.push({
        trabalhadorId: workerId,
        dataReadaptacao: readaptDate,
        motivo: pick(readaptacaoMotivos, rand),
        cid: `M${40 + Math.floor(rand() * 30)}.${Math.floor(rand() * 9)}`,
        mudancaSetor: mudouSetor,
        setorOrigem: setorStr,
        setorReadaptacao: mudouSetor ? 'Administrativo Central' : setorStr,
        mudancaFuncao: mudouFuncao,
        funcaoAnterior: funcaoStr,
        funcaoNova: mudouFuncao ? 'Auxiliar de Suporte Administrativo' : funcaoStr,
        tempoReadaptacao: pick(readaptacaoTempos, rand),
        restricao: 'Evitar esforços repetitivos severos e posturas inadequadas.',
        novasAtribuicoes: 'Auxílio na digitação de planilhas e atendimento telefônico geral.',
        acompanhamento: pick(readaptacaoAcompanhamentos, rand),
        grauSatisfacao: pick(satisfacoes, rand),
        laudoMedico: 'Recomendação por junta médica interna para alívio ergométrico temporário.',
        dataRetorno: new Date(readaptDate.getTime() + (30 + Math.floor(rand() * 180)) * 86400000),
        observacoes: 'Acompanhamento do caso em andamento sem incidentes.',
        ativo: true
      });
    }

    // ---- VACINAÇÕES (5 por trabalhador) ----
    const vacinasEscolhidas: string[] = [];
    for (let v = 0; v < 5; v++) {
      let vacinaInfo = pick(vacinasDisponiveis, mulberry32(i * 100 + v * 13 + 777));
      let tentativas = 0;
      while (vacinasEscolhidas.includes(vacinaInfo.vacina) && tentativas < 10) {
        vacinaInfo = pick(vacinasDisponiveis, mulberry32(i * 100 + v * 13 + 777 + tentativas));
        tentativas++;
      }
      vacinasEscolhidas.push(vacinaInfo.vacina);

      const dataVac = new Date(2022 + Math.floor(rand() * 4), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28));
      const dataProxDose = vacinaInfo.doseUnica
        ? undefined
        : new Date(dataVac.getTime() + vacinaInfo.intervaloDias * 24 * 60 * 60 * 1000);

      vacinacoesToInsert.push({
        trabalhadorId: workerId,
        vacina: vacinaInfo.vacina,
        dataVacinacao: dataVac,
        proximoDose: dataProxDose,
        unidadeSaude: pick(unidadesSaude, mulberry32(i * 100 + v * 37 + 555)),
        profissional: pick(profissionaisSaude, mulberry32(i * 100 + v * 53 + 333)),
        certificado: `CERT-${String(20250000 + i).padStart(8, '0')}-${String(v + 1)}`,
      });
    }

    // ---- DOENÇAS (0 a 3 aleatórias) ----
    const numDoencas = rand() < 0.1 ? 0 : (rand() < 0.4 ? 1 : (rand() < 0.7 ? 2 : 3));
    const doencasUsadas: string[] = [];
    for (let d = 0; d < numDoencas; d++) {
      let doencaInfo = pick(doencasOcupacionais, mulberry32(i * 200 + d * 17 + 3333));
      let tentativas = 0;
      while (doencasUsadas.includes(doencaInfo.nomeDoenca) && tentativas < 10) {
        doencaInfo = pick(doencasOcupacionais, mulberry32(i * 200 + d * 17 + 3333 + tentativas));
        tentativas++;
      }
      doencasUsadas.push(doencaInfo.nomeDoenca);

      const relacaoOptions = ['comum', 'ocupacional', 'acidente'] as const;
      const relacaoRand = rand();
      const relacaoTrabalho = relacaoRand < 0.50 ? 'comum' : relacaoRand < 0.80 ? 'ocupacional' : 'acidente';

      const now = Date.now();
      const doencaPeriodoRand = rand();
      const dataInicioDoenca = doencaPeriodoRand < 0.50
        ? new Date(now - Math.floor(rand() * 365) * 86400000)
        : doencaPeriodoRand < 0.80
          ? new Date(now - (365 + Math.floor(rand() * 365)) * 86400000)
          : new Date(now - (730 + Math.floor(rand() * 365)) * 86400000);

      const isAtiva = rand() > 0.35;

      doencasToInsert.push({
        dataInicio: dataInicioDoenca,
        dataFim: isAtiva ? undefined : new Date(dataInicioDoenca.getTime() + (30 + Math.floor(rand() * 180)) * 86400000),
        trabalhadorId: workerId,
        codigoDoenca: doencaInfo.codigoDoenca,
        nomeDoenca: doencaInfo.nomeDoenca,
        relacaoTrabalho,
        relatoClinico: `Paciente apresenta ${doencaInfo.nomeDoenca.toLowerCase()}. ${rand() > 0.5 ? 'Em acompanhamento regular com evolução satisfatória.' : 'Necessita de reavaliação periódica.'}`,
        profissionalSaude: pick(profissionaisSaude, rand),
        ativo: isAtiva,
      });
    }

    // ---- ACIDENTES (0 a 5 aleatórios) ----
    const numAcidentes = Math.floor(rand() * 6);
    for (let a = 0; a < numAcidentes; a++) {
      const acRand = mulberry32(i * 10000 + a * 997 + 3333);
      const tiposTrauma = getOptions('tipoTrauma', ['Contusão', 'Fratura', 'Entorse', 'Laceração', 'Escoriação', 'Queimadura']);
      const partesCorpo = getOptions('parteCorpo', ['Mãos/Dedos', 'Ombro', 'Coluna', 'Punho', 'Joelho', 'Braço', 'Pé', 'Cabeça']);
      const causadores = getOptions('causadorTrauma', ['Queda de mesmo nível', 'Esforço repetitivo', 'Corte com objeto perfurocortante', 'Impacto contra objeto', 'Movimento brusco']);

      const tipoTraumaValue = pick(tiposTrauma, acRand);
      const parteCorpoValue = pick(partesCorpo, acRand);
      const causadorValue = pick(causadores, acRand);
      const statusValue = pick(statusAcidente, acRand);
      const ehMaterialBiologico = acRand() < 0.18;

      const now = Date.now();
      const acPeriodoRand = acRand();
      const dataAcidente = acPeriodoRand < 0.50
        ? new Date(now - Math.floor(acRand() * 365) * 86400000)
        : acPeriodoRand < 0.80
          ? new Date(now - (365 + Math.floor(acRand() * 365)) * 86400000)
          : new Date(now - (730 + Math.floor(acRand() * 365)) * 86400000);

      const outrosAtingidos = acRand() > 0.92;
      const acidente = await Acidente.create({
        dataAcidente,
        horario: `${Math.floor(acRand() * 24).toString().padStart(2, '0')}:${Math.floor(acRand() * 60).toString().padStart(2, '0')}`,
        horarioAposInicioJornada: `${Math.floor(acRand() * 8).toString().padStart(2, '0')}:${Math.floor(acRand() * 60).toString().padStart(2, '0')}`,
        trabalhadorId: workerId,
        tipoAcidente: ehMaterialBiologico ? 'Acidente com Material Biológico' : pick(['Típico', 'Trajeto', 'Violência'], acRand),
        tipoTrauma: tipoTraumaValue,
        agenteCausador: causadorValue,
        parteCorpo: parteCorpoValue,
        descricao: `Acidente de trabalho: ${causadorValue} resultando em ${tipoTraumaValue} na região ${parteCorpoValue}.`,
        descricaoTrauma: `${tipoTraumaValue} na região ${parteCorpoValue} com necessidade de avaliação médica.`,
        local: `Setor ${setorStr}`,
        lesoes: [tipoTraumaValue],
        feriado: acRand() > 0.95,
        comunicado: acRand() > 0.15,
        dataComunicacao: acRand() > 0.15 ? new Date(dataAcidente.getTime() + Math.floor(acRand() * 5) * 86400000) : undefined,
        dataNotificacao: new Date(dataAcidente.getTime() + Math.floor(acRand() * 3) * 86400000),
        atendimentoMedico: acRand() > 0.08,
        dataAtendimento: acRand() > 0.08 ? new Date(dataAcidente.getTime() + Math.floor(acRand() * 2) * 86400000) : undefined,
        horaAtendimento: `${Math.floor(acRand() * 24).toString().padStart(2, '0')}:${Math.floor(acRand() * 60).toString().padStart(2, '0')}`,
        unidadeAtendimento: pick(unidadesSaude, acRand),
        internamento: acRand() > 0.75,
        duracaoInternamento: acRand() > 0.75 ? Math.floor(acRand() * 15) + 1 : undefined,
        catNas: acRand() > 0.25,
        registroPolicial: acRand() > 0.9,
        encaminhamentoJuntaMedica: acRand() > 0.85,
        afastamento: acRand() > 0.7,
        outrosTrabalhadoresAtingidos: outrosAtingidos,
        quantidadeTrabalhadoresAtingidos: outrosAtingidos ? 1 + Math.floor(acRand() * 4) : 0,
        status: statusValue,
      });

      if (ehMaterialBiologico) {
        materiaisBiologicosToInsert.push({
          acidenteId: acidente._id,
          tipoExposicao: pick(['Percutânea', 'Mucosa', 'Pele não íntegra'], acRand),
          materialOrganico: pick(['Sangue', 'Secreção', 'Líquido cefalorraquidiano'], acRand),
          circunstanciaAcidente: pick(['Durante procedimento', 'Manuseio de resíduos', 'Acidente com agulha'], acRand),
          agente: 'Biológico',
          equipamentoProtecao: acRand() > 0.4 ? 'Utilizado corretamente' : 'Não utilizado',
          sorologiaPaciente: acRand() > 0.2 ? 'Não reagente' : 'Reagente para Hepatite B',
          sorologiaAcidentado: acRand() > 0.3 ? 'Não reagente' : 'Reagente para Hepatite B',
          conduta: pick(['Profilaxia pós-exposição indicada', 'Apenas acompanhamento sorológico', 'Encaminhamento ao infectologista'], acRand),
          evolucaoCaso: acRand() > 0.5 ? 'Paciente em acompanhamento, sem sinais de soroconversão.' : 'Caso encerrado após acompanhamento sorológico de 6 meses.',
          usoEPI: acRand() > 0.4,
          sorologiaFonte: acRand() > 0.3,
          acompanhamentoPrEP: acRand() > 0.6,
          descAcompanhamentoPrEP: acRand() > 0.6 ? 'Acompanhamento trimestral no serviço especializado.' : '',
          descEncaminhamento: acRand() > 0.5 ? 'Encaminhado ao CTA para aconselhamento.' : '',
          dataReavaliacao: new Date(dataAcidente.getTime() + 30 * 86400000),
          efeitoColateralPermanente: acRand() > 0.95,
          descEfeitoColateralPermanente: acRand() > 0.95 ? 'Relato de náuseas com o uso da profilaxia.' : '',
        });
      }
    }

    // ---- Submódulo 7: VÍNCULOS EMPREGATÍCIOS (0 a 5) ----
    const numVinculos = rand() < 0.1 ? 0 : 1 + Math.floor(rand() * 5);
    const empresasUsadas: string[] = [];
    for (let v = 0; v < numVinculos; v++) {
      const vRand = mulberry32(i * 500 + v * 31 + 1111);
      const empIndexVinculo = (i + v) % empresas.length;
      const empresaVinculo = empresas[empIndexVinculo];
      const unidadesDaEmpresaVinculo = unidades.filter(u => u.empresaId.toString() === empresaVinculo._id.toString());
      const unidadeVinculo = pick(unidadesDaEmpresaVinculo, vRand);

      const empresaKey = empresaVinculo._id.toString();
      if (empresasUsadas.includes(empresaKey)) continue;
      empresasUsadas.push(empresaKey);

      const vinculoAtivo = vRand() > 0.2;
      const vinculoSituacao = vinculoAtivo ? 'Ativo' : 'Encerrado';
      const vinculoTipo = pick(vinculoTipos, vRand);
      const vinculoFuncao = pick(funcoes, vRand);
      const vinculoSetor = pick(setoresOptions, vRand);
      const vinculoCarga = vRand() < 0.5 ? 40 : (vRand() < 0.8 ? 44 : (vRand() < 0.93 ? 30 : 20));
      const vinculoSalario = (() => {
        if (vinculoFuncao === 'Médico(a)') return 10000 + Math.floor(vRand() * 10000);
        if (vinculoFuncao === 'Enfermeiro(a)') return 4500 + Math.floor(vRand() * 3500);
        if (vinculoFuncao === 'Técnico(a) de Enfermagem') return 2200 + Math.floor(vRand() * 1800);
        if (vinculoFuncao === 'Administrativo') return 2000 + Math.floor(vRand() * 2000);
        return 1500 + Math.floor(vRand() * 1200);
      })();

      const temAvaliacao = vRand() > 0.5;
      vinculosToInsert.push({
        trabalhadorId: workerId,
        empresa: empresaVinculo._id,
        unidade: unidadeVinculo._id,
        tipoVinculo: vinculoTipo,
        matricula: `VINC-${String(i).padStart(6, '0')}-${String(v + 1)}`,
        funcao: vinculoFuncao,
        jornadaTrabalho: `${vinculoCarga} horas semanais`,
        turnoTrabalho: pick(turnos, vRand),
        dataInicio: new Date(dataEntrada.getTime() - Math.floor(vRand() * 365) * 86400000),
        dataPosse: new Date(dataEntrada.getTime() - Math.floor(vRand() * 365) * 86400000),
        dataFim: vinculoAtivo ? null : new Date(2024, Math.floor(vRand() * 12), 1 + Math.floor(vRand() * 28)),
        situacao: vinculoSituacao,
        empresaTerceirizada: vinculoTipo === 'Terceirizado' ? 'Terceiriza SST S/A' : '',
        residente: vRand() > 0.9,
        anosResidencia: vRand() > 0.9 ? `${1 + Math.floor(vRand() * 20)} anos` : '',
        setor: vinculoSetor,
        cargo: vinculoFuncao,
        ocupacao: `CBO-${3000 + Math.floor(vRand() * 999)}`,
        cargaHoraria: vinculoCarga,
        salario: vinculoSalario,
        insalubridadePericulosidade: vRand() > 0.7 ? 'Insalubridade grau médio' : '',
        observacoes: `Vínculo registrado via seed. ${vinculoAtivo ? 'Ativo' : 'Encerrado'}.`,
        ativo: vinculoAtivo,
        avaliacaoAmbienteTrabalho: temAvaliacao ? {
          riscosOcupacionais: {
            agentesFisicos: { presente: vRand() > 0.5, intensidade: vRand() > 0.5 ? 'medio' : 'baixo', observacao: 'Ruído ambiental dentro dos limites.' },
            agentesQuimicos: { presente: vRand() > 0.7, intensidade: 'baixo', observacao: 'Produtos de limpeza padronizados.' },
            agentesBiologicos: { presente: vRand() > 0.4, intensidade: vRand() > 0.5 ? 'medio' : 'alto', observacao: 'Exposição a material biológico.' },
            riscosErgonomicos: { presente: vRand() > 0.5, intensidade: 'medio', observacao: 'Postura inadequada prolongada.' },
            riscosAcidentes: { presente: vRand() > 0.6, intensidade: 'baixo', observacao: 'Riscos de queda controlados.' },
          },
          condicoesTrabalho: {
            infraestrutura: { presente: true, situacao: vRand() > 0.3 ? 'adequado' : 'parcial' },
            equipamentos: { presente: true, situacao: vRand() > 0.4 ? 'adequado' : 'parcial' },
            organizacaoTrabalho: { presente: true, situacao: vRand() > 0.5 ? 'adequado' : 'parcial' },
          },
          relacoesTrabalho: {
            violencia: { presente: vRand() > 0.85, frequencia: 'raramente' },
            assedio: { presente: vRand() > 0.9, frequencia: 'nunca' },
            climaOrganizacional: { presente: true, situacao: vRand() > 0.4 ? 'adequado' : 'parcial' },
            satisfacaoTrabalho: { presente: true, situacao: vRand() > 0.4 ? 'adequado' : 'parcial' },
          },
          acoesPrevencao: {
            pcmo: { presente: vRand() > 0.3, situacao: vRand() > 0.5 ? 'adequado' : 'parcial' },
            ppraPgr: { presente: vRand() > 0.4, situacao: vRand() > 0.5 ? 'adequado' : 'parcial' },
            programasVacinacao: { presente: vRand() > 0.3, situacao: vRand() > 0.6 ? 'adequado' : 'parcial' },
            treinamentos: { presente: vRand() > 0.4, situacao: vRand() > 0.5 ? 'adequado' : 'parcial' },
            inspecoes: { presente: vRand() > 0.5, situacao: vRand() > 0.6 ? 'adequado' : 'parcial' },
          },
        } : undefined,
      });
    }

    // ---- Submódulo 8: RISCOS OCUPACIONAIS (0 a 3 por trabalhador, ~70% dos casos) ----
    if (rand() > 0.3) {
      const numRiscos = 1 + Math.floor(rand() * 3);
      const categorias = ['Físico', 'Químico', 'Biológico', 'Ergonômico', 'Acidente'];
      for (let r = 0; r < numRiscos; r++) {
        const rRand = mulberry32(i * 300 + r * 37 + 5555);
        const categoria = pick(categorias, rRand);
        const riscosFisicos = ['Ruído', 'Vibração', 'Calor', 'Frio', 'Radiação ionizante', 'Radiação não ionizante', 'Umidade'];
        const riscosQuimicos = ['Poeira mineral', 'Fumos metálicos', 'Névoas ácidas', 'Gases tóxicos', 'Vapores orgânicos'];
        const riscosBiologicos = ['Vírus', 'Bactérias', 'Fungos', 'Parasitas', 'Material biológico'];
        const riscosErgonomicos = ['Postura inadequada', 'Movimentos repetitivos', 'Esforço físico intenso', 'Jornada prolongada'];
        const riscosAcidente = ['Máquinas sem proteção', 'Piso escorregadio', 'Altura', 'Eletricidade', 'Ferramentas cortantes'];
        const mapRisco: Record<string, string[]> = {
          'Físico': riscosFisicos,
          'Químico': riscosQuimicos,
          'Biológico': riscosBiologicos,
          'Ergonômico': riscosErgonomicos,
          'Acidente': riscosAcidente,
        };
        const tipoRisco = pick(mapRisco[categoria], rRand);
        riscosOcupacionaisToInsert.push({
          trabalhadorId: workerId,
          empresaId: currentEmpresa._id,
          unidadeId: currentUnidade._id,
          categoria,
          tipoRisco,
          presente: rRand() > 0.15,
          observacao: `Risco ${tipoRisco} identificado no setor ${setorStr}.`,
          intensidade: rRand() > 0.5 ? 'medio' : (rRand() > 0.5 ? 'alto' : 'baixo'),
          fonteGeradora: pick(['Processo produtivo', 'Equipamentos', 'Ambiente', 'Organização do trabalho'], rRand),
          frequenciaExposicao: pick(['Eventual', 'Intermitente', 'Permanente'], rRand),
          duracaoExposicao: pick(['< 2h/dia', '2-6h/dia', '> 6h/dia'], rRand),
          epcUtilizado: rRand() > 0.3,
          epcDescricao: rRand() > 0.3 ? pick(['Exaustor local', 'Cabine de segurança', 'Enclausuramento', 'Ventilação geral'], rRand) : '',
          epiUtilizado: rRand() > 0.2,
          epiDescricao: rRand() > 0.2 ? pick(['Luvas', 'Máscara N95', 'Protetor auricular', 'Óculos de proteção', 'Avental'], rRand) : '',
          caEpis: rRand() > 0.2 ? [String(10000 + Math.floor(rRand() * 90000))] : [],
          medidasControle: rRand() > 0.5 ? 'Medidas de controle implementadas conforme PPRA.' : '',
          dataAvaliacao: new Date(2023 + Math.floor(rRand() * 3), Math.floor(rRand() * 12), 1 + Math.floor(rRand() * 28)),
          avaliador: pick(['Eng. Segurança do Trabalho', 'Médico do Trabalho', 'Técnico em Segurança'], rRand),
          ativo: true,
        });
      }
    }

    // ---- Submódulo 9: HISTÓRICO PPP (~30% dos casos, 1 registro por trabalhador) ----
    if (rand() > 0.7) {
      const pppRand = mulberry32(i * 400 + 7777);
      const dataPPPInicio = new Date(entradaYear + Math.floor(pppRand() * 5), Math.floor(pppRand() * 12), 1 + Math.floor(pppRand() * 28));
      const dataPPPFim = pppRand() > 0.6 ? new Date(dataPPPInicio.getTime() + (180 + Math.floor(pppRand() * 1000)) * 86400000) : undefined;
      historicoPPPToInsert.push({
        trabalhadorId: workerId,
        dataInicio: dataPPPInicio,
        dataFim: dataPPPFim,
        empresa: currentEmpresa.nomeFantasia,
        cargo: funcaoStr,
        funcao: funcaoStr,
        setor: setorStr,
        descricaoAtividades: `Desenvolvimento de atividades na área ${setorStr}, atuando como ${funcaoStr}.`,
        agentesQuimicos: pppRand() > 0.6 ? pick(['Poeira', 'Fumos', 'Gases', 'Vapores'], pppRand) : 'Não houve exposição a agentes químicos.',
        agentesFisicos: pppRand() > 0.5 ? pick(['Ruído acima de 85dB', 'Calor excessivo', 'Vibração localizada', 'Radiação'], pppRand) : 'Não houve exposição a agentes físicos.',
        agentesBiologicos: pppRand() > 0.4 ? pick(['Vírus', 'Bactérias', 'Fungos', 'Material biológico'], pppRand) : 'Não houve exposição a agentes biológicos.',
        agentesErgonomicos: pppRand() > 0.5 ? pick(['Postura inadequada', 'Movimentos repetitivos', 'Levantamento de peso'], pppRand) : 'Não houve exposição a riscos ergonômicos.',
        tecnicaMedicao: pppRand() > 0.5 ? pick(['Dosimetria', 'Decibelímetro', 'Bomba de amostragem', 'Termômetro de globo'], pppRand) : '',
        resultadoMedicao: pppRand() > 0.5 ? `${70 + Math.floor(pppRand() * 40)} dB` : '',
        limiteTolerancia: pppRand() > 0.5 ? '85 dB para 8h de exposição (NR-15)' : '',
        epcEficaz: pppRand() > 0.6,
        epiEficaz: pppRand() > 0.7,
        ltcatNumero: `LTCAT-${202300 + Math.floor(pppRand() * 3)}-${String(i).padStart(4, '0')}`,
        dataLtcat: new Date(2023 + Math.floor(pppRand() * 3), Math.floor(pppRand() * 12), 1 + Math.floor(pppRand() * 28)),
        responsavelNome: pick(['Eng. Carlos Silva', 'Dra. Mariana Santos', 'Téc. João Pereira'], pppRand),
        responsavelRegistro: `CREA-${100000 + Math.floor(pppRand() * 900000)}`,
        dataExameMedico: new Date(dataPPPInicio.getTime() + 90 * 86400000),
        resultadoExame: pppRand() > 0.85 ? 'Apto com restrições' : 'Apto',
        anexos: [],
        observacoes: 'PPP elaborado conforme legislação vigente.',
        ativo: true,
      });
    }
  }

  console.log('⚡ Inserindo dados no MongoDB...');

  console.log('  ▸ Trabalhadores...');
  await Trabalhador.insertMany(workersToInsert);

  console.log('  ▸ Afastamentos...');
  if (afastamentosToInsert.length > 0) await TrabalhadorAfastamento.insertMany(afastamentosToInsert);

  console.log('  ▸ Dependentes...');
  if (dependentesToInsert.length > 0) await TrabalhadorDependente.insertMany(dependentesToInsert);

  console.log('  ▸ Informações de Saúde...');
  await TrabalhadorInformacao.insertMany(informacoesToInsert);

  console.log('  ▸ Ocorrências de Violência...');
  if (ocorrenciasToInsert.length > 0) await TrabalhadorOcorrenciaViolencia.insertMany(ocorrenciasToInsert);

  console.log('  ▸ Processos de Trabalho...');
  await TrabalhadorProcessoTrabalho.insertMany(processosToInsert);

  console.log('  ▸ Readaptações...');
  if (readaptacoesToInsert.length > 0) await TrabalhadorReadaptacao.insertMany(readaptacoesToInsert);

  console.log('  ▸ Vínculos...');
  if (vinculosToInsert.length > 0) await TrabalhadorVinculo.insertMany(vinculosToInsert);

  console.log('  ▸ Vacinações...');
  if (vacinacoesToInsert.length > 0) await Vacinacao.insertMany(vacinacoesToInsert);

  console.log('  ▸ Doenças...');
  if (doencasToInsert.length > 0) await Doenca.insertMany(doencasToInsert);

  console.log('  ▸ Acidentes...');
  console.log('     (criados individualmente com _id)');

  console.log('  ▸ Material Biológico...');
  if (materiaisBiologicosToInsert.length > 0) await MaterialBiologico.insertMany(materiaisBiologicosToInsert);

  console.log('  ▸ Riscos Ocupacionais...');
  if (riscosOcupacionaisToInsert.length > 0) await TrabalhadorRiscoOcupacional.insertMany(riscosOcupacionaisToInsert);

  console.log('  ▸ Histórico PPP...');
  if (historicoPPPToInsert.length > 0) await TrabalhadorHistoricoPPP.insertMany(historicoPPPToInsert);

  // ---- HABILITAÇÃO PNAIST ----
  console.log('🏙️  Criando registros de Habilitação PNAIST...');
  await HabilitacaoPnaist.deleteMany({});
  const cidadesUnicas = new Map<string, { municipio: string; uf: string }>();
  for (const u of unidades) {
    const key = `${u.endereco.cidade}|${u.endereco.estado}`;
    if (!cidadesUnicas.has(key) && u.endereco.cidade && u.endereco.estado) {
      cidadesUnicas.set(key, { municipio: u.endereco.cidade, uf: u.endereco.estado });
    }
  }
  // Add some extra cities/states for more coverage
  const extras = [
    { municipio: 'Florianópolis', uf: 'SC' },
    { municipio: 'Goiânia', uf: 'GO' },
    { municipio: 'Belém', uf: 'PA' },
    { municipio: 'São Luís', uf: 'MA' },
    { municipio: 'Natal', uf: 'RN' },
    { municipio: 'João Pessoa', uf: 'PB' },
    { municipio: 'Aracaju', uf: 'SE' },
    { municipio: 'Cuiabá', uf: 'MT' },
    { municipio: 'Campo Grande', uf: 'MS' },
    { municipio: 'Teresina', uf: 'PI' },
    { municipio: 'Macapá', uf: 'AP' },
    { municipio: 'Boa Vista', uf: 'RR' },
    { municipio: 'Porto Velho', uf: 'RO' },
    { municipio: 'Rio Branco', uf: 'AC' },
    { municipio: 'Vitória', uf: 'ES' },
    { municipio: 'Palmas', uf: 'TO' },
  ];
  for (const ext of extras) {
    const key = `${ext.municipio}|${ext.uf}`;
    if (!cidadesUnicas.has(key)) cidadesUnicas.set(key, ext);
  }
  const habilitacaoDocs: any[] = [];
  let habIdx = 0;
  for (const [, cid] of cidadesUnicas) {
    const hRand = mulberry32(habIdx * 991 + 4444);
    habilitacaoDocs.push({
      municipio: cid.municipio,
      uf: cid.uf,
      dataHabilitacao: new Date(2022 + Math.floor(hRand() * 4), Math.floor(hRand() * 12), 1 + Math.floor(hRand() * 28)),
      ativo: hRand() > 0.25,
    });
    habIdx++;
  }
  await HabilitacaoPnaist.insertMany(habilitacaoDocs);
  console.log(`   ✅ ${habilitacaoDocs.length} registros de habilitação criados.`);

  console.log(`✅ ${targetCount} trabalhadores e submódulos cadastrados com sucesso!`);
}

connectDB().then(() => {
  seedTrabalhadores(1500).then(() => {
    console.log('🚀 Seed de trabalhadores concluído.');
    mongoose.connection.close();
    process.exit(0);
  });
}).catch((err) => {
  console.error('❌ Erro na conexão com o banco:', err);
  process.exit(1);
});

