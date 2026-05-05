// User/Employee types
export interface IUser {
  _id?: string;
  cpf: string;
  nome: string;
  email: string;
  senha?: string;
  matricula?: string;
  dataNascimento?: Date;
  sexo?: 'M' | 'F';
  telefone?: string;
  endereco?: IEndereco;
  empresa?: string;
  unidade?: string;
  departamento?: string;
  cargo?: string;
  dataAdmissao?: Date;
  perfil?: string;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface ITrabalhador {
  _id?: string;
  cpf: string;
  nome: string;
  nomeMae?: string;
  matricula?: string;
  cartaoSus?: string;
  celular?: string;
  telefoneContato?: string;
  email?: string;
  dataNascimento?: Date;

  // Vínculo com Empresa/Unidade
  empresa?: string; // ObjectId da Empresa
  unidade?: string; // ObjectId da Unidade

  // Dados Pessoais/Diversos
  sexo?: string; // M, F, etc.
  genero?: string;
  raca?: string;
  escolaridade?: string;
  estadoCivil?: string;
  tipoSanguineo?: string;
  
  // Deficiência
  deficiencia?: {
    tipo?: string;
    tempo?: string;
    grau?: string;
  };

  // Vínculos e Situação
  vinculo?: {
    tipo?: string;
    outro?: string;
    turno?: string;
    jornada?: string;
    jornadaOutro?: string;
    situacao?: string;
  };

  // Endereço
  endereco?: IEndereco;

  // Dados do Trabalho
  trabalho?: {
    dataPosse?: Date;
    empresaTerceirizada?: string;
    dataEntrada?: Date;
    setor?: string;
    cargo?: string;
    funcao?: string;
    ocupacao?: string;
  };

  // Histórico e Eventos
  historico?: {
    dataAposentadoria?: Date;
    dataObito?: Date;
    dataRemocao?: Date;
    novoServico?: string;
    dataRetorno?: Date;
    dataRelotacao?: Date;
    dataDesligamento?: Date;
    dataAfastamento?: Date;
    tipoAfastamento?: string;
  };

  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface IEndereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

// Accident types
export interface IAcidente {
  _id?: string;
  dataAcidente: Date;
  horario?: string;
  horarioAposInicioJornada?: string;
  trabalhadorId: string;
  tipoAcidente: string;
  tipoTrauma?: string;
  agenteCausador?: string;
  parteCorpo?: string;
  descricao: string;
  descricaoTrauma?: string;
  local?: string;
  lesoes?: string[];
  feriado?: boolean;
  comunicado?: boolean;
  dataComunicacao?: Date;
  dataNotificacao?: Date;
  estado?: string;

  // Campos de atendimento médico
  atendimentoMedico?: boolean;
  dataAtendimento?: Date;
  horaAtendimento?: string;
  unidadeAtendimento?: string;

  // Campos de internamento
  internamento?: boolean;
  duracaoInternamento?: number;

  // CAT/NAS
  catNas?: boolean;

  // Registro Policial
  registroPolicial?: boolean;

  // Encaminhamento junta médica
  encaminhamentoJuntaMedica?: boolean;

  // Afastamento
  afastamento?: boolean;

  // Outros trabalhadores atingidos
  outrosTrabalhadoresAtingidos?: boolean;
  quantidadeTrabalhadoresAtingidos?: number;

  status?: 'Aberto' | 'Em Análise' | 'Fechado';
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// Disease/Illness types
export interface IDoenca {
  _id?: string;
  dataInicio: Date;
  dataFim?: Date;
  trabalhadorId: string;
  codigoDoenca: string;
  nomeDoenca: string;
  relatoClinico?: string;
  profissionalSaude?: string;
  ativo?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// Occupational Accident types (Biological Material)
export interface IMaterialBiologico {
  _id?: string;
  acidenteId: string;
  tipoExposicao: string;
  materialOrganico: string;
  circunstanciaAcidente: string;
  agente: string;
  equipamentoProtecao: string;
  sorologiaPaciente: string;
  sorologiaAcidentado: string;
  conduta: string;
  evolucaoCaso: string;
  usoEPI: boolean;
  sorologiaFonte: boolean;
  acompanhamentoPrEP: boolean;
  descAcompanhamentoPrEP?: string;
  descEncaminhamento?: string;
  dataReavaliacao?: Date;
  efeitoColateralPermanente: boolean;
  descEfeitoColateralPermanente?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}


// Vaccination records
export interface IVacinacao {
  _id?: string;
  trabalhadorId: string;
  vacina: string;
  dataVacinacao: Date;
  proximoDose?: Date;
  unidadeSaude?: string;
  profissional?: string;
  certificado?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// Company/Organization
export interface IEmpresa {
  _id?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: IEndereco;
  ativa?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// Unit/Department
export interface IUnidade {
  _id?: string;
  nome: string;
  empresaId: string;
  endereco?: IEndereco;
  gestor?: string;
  ativa?: boolean;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Analytics types
export interface IKPIData {
  totalAcidentes: number;
  acidentesAbertos: number;
  acidentesEmAnalise: number;
  acidentesFechados: number;
  taxaResolucao: number;
  totalTrabalhadores: number;
  totalDoencas: number;
  doencasAtivas: number;
  totalVacinacoes: number;
  proximasVacinacoes: number;
}

export interface IAnalyticsDadosAcidentes {
  porTipo: { nome: string; valor: number }[];
  porStatus: { nome: string; valor: number }[];
  ultimosMeses: { mes: string; quantidade: number }[];
}

export interface IAnalyticsDashboardAdmin {
  kpis: IKPIData;
  graficos: {
    acidentesPorTipo: { nome: string; valor: number }[];
    acidentesPorStatus: { nome: string; valor: number }[];
    acidentesUltimosMeses: { mes: string; quantidade: number }[];
    trabalhadoresPorEmpresa: { nome: string; total: number }[];
  };
  tabelas: {
    proximasVacinacoes: any[];
    ultimosAcidentes: any[];
  };
}

// Catalogos / Tabelas Auxiliares
export interface ICatalogoItem {
  _id?: string;
  entidade: string;
  nome: string;
  sigla?: string;
  descricao?: string;
  ativo: boolean;
  ordem?: number;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

// Submodulos do Trabalhador
export interface ITrabalhadorDependente {
  _id?: string;
  trabalhadorId: string;
  nome: string;
  cpf?: string;
  dataNascimento?: Date;
  parentesco: string;
  dependentIR?: boolean;
  ativo?: boolean;
}

export interface ITrabalhadorAfastamento {
  _id?: string;
  trabalhadorId: string;
  tipoAfastamento: string;
  motivoAfastamento: string;
  cid?: string;
  dataInicio: Date;
  dataFim?: Date;
  dataRetorno?: Date;
  laudoMedico?: string;
  observacoes?: string;
  ativo?: boolean;
}

export interface ITrabalhadorOcorrenciaViolencia {
  _id?: string;
  trabalhadorId: string;
  dataOcorrencia: Date;
  localOcorrencia?: string;
  tipoViolencia: string;
  tipoViolenciaSexual?: string;
  motivoViolencia: string;
  meioAgressao: string;
  tipoAutorViolencia: string;
  descricaoOcorrencia: string;
  boletimOcorrencia?: string;
  medidasTomadas?: string;
  ativo?: boolean;
}

export interface ITrabalhadorReadaptacao {
  _id?: string;
  trabalhadorId: string;
  dataReadaptacao: Date;
  motivo: string;
  cid?: string;
  atividadeAnterior?: string;
  atividadeAtual?: string;
  laudoMedico?: string;
  tempoReadaptacao?: string;
  dataRetorno?: Date;
  ativo?: boolean;
}

export interface ITrabalhadorProcessoTrabalho {
  _id?: string;
  trabalhadorId: string;
  setor: string;
  cargo: string;
  funcao: string;
  jornadaTrabalho?: string;
  turnoTrabalho?: string;
  dataInicio: Date;
  dataFim?: Date;
  ativo?: boolean;
}

// Questionarios
export interface IQuestionario {
  _id?: string;
  nome: string;
  descricao?: string;
  tipo: string;
  ativo?: boolean;
  dataInicio?: Date;
  dataFim?: Date;
  criadoPor?: string;
  itens?: IQuestionarioItem[];
}

export interface IQuestionarioItem {
  _id?: string;
  questionarioId: string;
  pergunta: string;
  tipoResposta: 'texto' | 'unica' | 'multipla' | 'escala' | 'data';
  obrigatorio?: boolean;
  ordem?: number;
  alternativas?: { valor: string; texto: string; pontuacao?: number }[];
  ativo?: boolean;
}

// Upload
export interface IArquivoUpload {
  _id?: string;
  entidade: string;
  entidadeId: string;
  nomeOriginal: string;
  nomeArmazenado: string;
  caminho: string;
  mimeType: string;
  tamanho: number;
  descricao?: string;
  enviadoPor: string;
}

// Email
export interface IPadraoEmail {
  _id?: string;
  nome: string;
  assunto: string;
  conteudo: string;
  categoria?: string;
  variaveis?: string[];
  ativo?: boolean;
}

// Parametros
export interface IParametro {
  _id?: string;
  chave: string;
  valor: string;
  descricao?: string;
  categoria?: string;
  tipo: string;
  ativo?: boolean;
}

// Preferencias
export interface IPreferenciaUsuario {
  _id?: string;
  usuarioId: string;
  tema?: string;
  idioma?: string;
  notificacoesEmail?: boolean;
  notificacoesPush?: boolean;
  dashboardPadrao?: string;
  itensPorPagina?: number;
}

// Servidor/Funcionario
export interface IServidorFuncionario {
  _id?: string;
  trabalhadorId: string;
  matriculaFuncional: string;
  dataPosse: Date;
  dataExercicio: Date;
  regimeJuridico?: string;
  cargoEfetivo?: string;
  lotacao?: string;
  situacaoFuncional?: string;
  ativo?: boolean;
}

// Video Aulas
export interface IVideoAula {
  _id?: string;
  titulo: string;
  descricao?: string;
  url: string;
  thumbnail?: string;
  duracao?: string;
  categoria?: string;
  tags?: string[];
  ordem?: number;
  ativo?: boolean;
  visualizacoes?: number;
}
