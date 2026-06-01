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

function generateCNPJ(index: number): string {
  const base = 10000000000000 + index;
  const s = String(base);
  return `${s.substring(0, 2)}.${s.substring(2, 5)}.${s.substring(5, 8)}/${s.substring(8, 12)}-${s.substring(12, 14)}`;
}

export async function seedTrabalhadores(targetCount: number = 2000) {
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

      const unidade = await Unidade.create({
        nome: nomeUnidade,
        empresaId: empresa._id,
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

      dependentesToInsert.push({
        trabalhadorId: workerId,
        nome: `${depFirstName} ${middleName} ${lastName}`,
        cpf: generateCPF(4000 + i * 10 + d),
        dataNascimento: depDataNasc,
        parentesco: depParentesco,
        dependentIR: d === 0 && rand() > 0.5,
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

    informacoesToInsert.push({
      trabalhadorId: workerId.toString(),
      doencaBase: rand() > 0.25 ? 'Nenhuma' : pick(doencaBaseOpts.filter(d => d !== 'Nenhuma'), rand),
      estadoVacinal: pick(estadoVacinalOpts, rand),
      tipoDroga: rand() > 0.7 ? pick(tipoDrogaOpts.filter(d => d !== 'Nenhuma'), rand) : 'Nenhuma',
      tipoSanguineo: tipoSanguineoStr,
      medicamentos: rand() > 0.2 ? 'Nenhum' : 'Uso contínuo de anti-hipertensivo',
      allergy: rand() > 0.85,
      descricaoAlergia: rand() > 0.85 ? 'Alergia a Dipirona' : '',
      acompanhamentoMedico: rand() > 0.5,
      acompanhamentoReabilitacao: false,
      usoAlcool: rand() > 0.7,
      dosesAlcool: rand() > 0.7 ? Math.floor(rand() * 4) + 1 : 0,
      usoCigarro: rand() > 0.85,
      macosCigarro: rand() > 0.85 ? Math.floor(rand() * 3) + 1 : 0,
      usoOutraDroga: false,
      frequenciaUso: rand() > 0.7 ? 'Ocasional' : '',
      ativo: true
    });

    // ---- Submódulo 4: OCORRÊNCIA DE VIOLÊNCIA (~15% dos casos) ----
    if (rand() > 0.85) {
      ocorrenciasToInsert.push({
        trabalhadorId: workerId,
        dataOcorrencia: new Date(entradaYear + Math.floor(rand() * 5), Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)),
        localOcorrencia: `${setorStr} - Sala ${Math.floor(rand() * 50) + 1}`,
        tipoViolencia: pick(violenciaTipos, rand),
        tipoViolenciaSexual: pick(violenciaSexuais, rand),
        motivoViolencia: pick(violenciaMotivos, rand),
        meioAgressao: pick(violenciaMeios, rand),
        tipoAutorViolencia: pick(violenciaAutores, rand),
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

    // ---- Submódulo 7: VÍNCULO EMPREGATÍCIO ----
    const cargaHoraria = jornadaStr.startsWith('44') ? 44 : (jornadaStr.startsWith('40') ? 40 : (jornadaStr.startsWith('30') ? 30 : 20));
    const salario = (() => {
      if (funcaoStr === 'Médico(a)') return 12000 + Math.floor(rand() * 8000);
      if (funcaoStr === 'Enfermeiro(a)') return 5000 + Math.floor(rand() * 3000);
      if (funcaoStr === 'Técnico(a) de Enfermagem') return 2500 + Math.floor(rand() * 1500);
      if (funcaoStr === 'Administrativo') return 2200 + Math.floor(rand() * 1800);
      return 1800 + Math.floor(rand() * 1000);
    })();

    vinculosToInsert.push({
      trabalhadorId: workerId,
      tipoVinculo: vinculoTipoStr,
      matricula,
      funcao: funcaoStr,
      jornadaTrabalho: jornadaStr,
      turnoTrabalho: turnoStr,
      dataInicio: dataEntrada,
      dataFim: situacaoStr === 'Desligado' || situacaoStr === 'Aposentado' ? new Date(2024, Math.floor(rand() * 12), 1 + Math.floor(rand() * 28)) : null,
      situacao: situacaoStr,
      empresaTerceirizada: vinculoTipoStr === 'Terceirizado' ? 'Terceiriza SST S/A' : '',
      setor: setorStr,
      cargo: funcaoStr,
      ocupacao: `CBO-${2000 + Math.floor(rand() * 999)}`,
      cargaHoraria,
      salario,
      observacoes: 'Contrato cadastrado no sistema.',
      ativo: true
    });
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
  await TrabalhadorVinculo.insertMany(vinculosToInsert);

  console.log(`✅ ${targetCount} trabalhadores e submódulos cadastrados com sucesso!`);
}

connectDB().then(() => {
  seedTrabalhadores(2000).then(() => {
    console.log('🚀 Seed de trabalhadores concluído.');
    mongoose.connection.close();
    process.exit(0);
  });
}).catch((err) => {
  console.error('❌ Erro na conexão com o banco:', err);
  process.exit(1);
});

