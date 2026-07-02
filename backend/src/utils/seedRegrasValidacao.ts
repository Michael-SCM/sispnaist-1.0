import RegraValidacao from '../models/RegraValidacao';

const REGIOES = {
  norte: ['AC','AP','AM','PA','RO','RR','TO'],
  nordeste: ['AL','BA','CE','MA','PB','PE','PI','RN','SE'],
  centroOeste: ['DF','GO','MT','MS'],
  sudeste: ['ES','MG','RJ','SP'],
  sul: ['PR','RS','SC']
};

const regrasSeed = [
  {
    nome: 'CAT obrigatória para acidente típico em SP',
    descricao: 'No estado de São Paulo, acidentes do tipo "típico" exigem o número da CAT',
    entidade: 'acidente',
    campo: 'numeroCAT',
    tipoLocalidade: 'uf',
    ufs: ['SP'],
    municipios: [],
    tipoValidacao: 'obrigatorio',
    valorValidacao: 'true',
    mensagemErro: 'CAT é obrigatória para acidentes típicos no estado de São Paulo',
    prioridade: 10,
    ativo: true
  },
  {
    nome: 'CPF obrigatório para trabalhador',
    descricao: 'CPF é obrigatório para cadastro de trabalhador em todo território nacional',
    entidade: 'trabalhador',
    campo: 'cpf',
    tipoLocalidade: 'nacional',
    ufs: [],
    municipios: [],
    tipoValidacao: 'obrigatorio',
    valorValidacao: 'true',
    mensagemErro: 'CPF do trabalhador é obrigatório',
    prioridade: 5,
    ativo: true
  },
  {
    nome: 'Etnia obrigatória na região Norte',
    descricao: 'Para trabalhadores na região Norte, o campo etnia é obrigatório devido à diversidade de povos',
    entidade: 'trabalhador',
    campo: 'etnia',
    tipoLocalidade: 'uf',
    ufs: REGIOES.norte,
    municipios: [],
    tipoValidacao: 'obrigatorio',
    valorValidacao: 'true',
    mensagemErro: 'Etnia é obrigatória para trabalhadores na região Norte',
    prioridade: 8,
    ativo: true
  },
  {
    nome: 'CNPJ deve ter 14 dígitos',
    descricao: 'CNPJ da empresa deve conter exatamente 14 dígitos numéricos',
    entidade: 'empresa',
    campo: 'cnpj',
    tipoLocalidade: 'nacional',
    ufs: [],
    municipios: [],
    tipoValidacao: 'regex',
    valorValidacao: '^\\d{2}\\.?\\d{3}\\.?\\d{3}\\/?\\d{4}\\-?\\d{2}$',
    mensagemErro: 'CNPJ inválido. Deve conter 14 dígitos',
    prioridade: 5,
    ativo: true
  },
  {
    nome: 'Valores mínimos para carga horária (RJ)',
    descricao: 'No Rio de Janeiro, carga horária mínima é de 20 horas semanais',
    entidade: 'trabalhador',
    campo: 'vinculo.jornada',
    tipoLocalidade: 'uf',
    ufs: ['RJ'],
    municipios: [],
    tipoValidacao: 'min',
    valorValidacao: '20',
    mensagemErro: 'Carga horária mínima no RJ é de 20 horas semanais',
    prioridade: 5,
    ativo: true
  },
  {
    nome: 'Telefone celular obrigatório para trabalhador no DF',
    descricao: 'No Distrito Federal, celular do trabalhador é obrigatório',
    entidade: 'trabalhador',
    campo: 'celular',
    tipoLocalidade: 'uf',
    ufs: ['DF'],
    municipios: [],
    tipoValidacao: 'obrigatorio',
    valorValidacao: 'true',
    mensagemErro: 'Celular do trabalhador é obrigatório no Distrito Federal',
    prioridade: 8,
    ativo: true
  },
  {
    nome: 'valores válidos para campo sexo',
    descricao: 'Sexo deve ser Masculino, Feminino ou Não Informado',
    entidade: 'trabalhador',
    campo: 'sexo',
    tipoLocalidade: 'nacional',
    ufs: [],
    municipios: [],
    tipoValidacao: 'enum',
    valorValidacao: 'Masculino,Feminino,Não Informado',
    mensagemErro: 'Sexo deve ser Masculino, Feminino ou Não Informado',
    prioridade: 1,
    ativo: true
  },
  {
    nome: 'Validação comprimento mínimo do CEP',
    descricao: 'CEP deve ter no mínimo 8 caracteres',
    entidade: 'empresa',
    campo: 'endereco.cep',
    tipoLocalidade: 'nacional',
    ufs: [],
    municipios: [],
    tipoValidacao: 'lengthMin',
    valorValidacao: '8',
    mensagemErro: 'CEP deve ter no mínimo 8 caracteres',
    prioridade: 3,
    ativo: true
  },
  {
    nome: 'Data de nascimento mínima (menor aprendiz - SP)',
    descricao: 'Em SP, trabalhador menor aprendiz deve ter no mínimo 14 anos',
    entidade: 'trabalhador',
    campo: 'dataNascimento',
    tipoLocalidade: 'uf',
    ufs: ['SP'],
    municipios: [],
    tipoValidacao: 'max',
    valorValidacao: '2012-01-01',
    mensagemErro: 'Trabalhador menor aprendiz deve ter no mínimo 14 anos em SP',
    prioridade: 5,
    ativo: true
  },
  {
    nome: 'Registro obrigatório do número do CAT para acidentes graves (MG)',
    descricao: 'Em Minas Gerais, acidentes graves exigem número da CAT',
    entidade: 'acidente',
    campo: 'numeroCAT',
    tipoLocalidade: 'uf',
    ufs: ['MG'],
    municipios: [],
    tipoValidacao: 'obrigatorio',
    valorValidacao: 'true',
    mensagemErro: 'CAT é obrigatória para acidentes graves em Minas Gerais',
    prioridade: 8,
    ativo: true
  }
];

export async function seedRegrasValidacao(): Promise<void> {
  try {
    const count = await RegraValidacao.countDocuments();
    if (count > 0) {
      console.log(`[seedRegrasValidacao] ${count} regras já existem. Pulando seed.`);
      return;
    }

    await RegraValidacao.insertMany(regrasSeed);
    console.log(`[seedRegrasValidacao] ${regrasSeed.length} regras de validação inseridas com sucesso.`);
  } catch (error) {
    console.error('[seedRegrasValidacao] Erro ao semear regras:', error);
  }
}

export default seedRegrasValidacao;
