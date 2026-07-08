export interface ITrabalhadorAfastamento {
  _id?: string;
  trabalhadorId: string;
  tipoAfastamento: string;
  motivoAfastamento: string;
  cid?: string;
  dataInicio: string;
  dataFim?: string;
  dataRetorno?: string;
  laudoMedico?: string;
  observacoes?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorDependente {
  _id?: string;
  trabalhadorId: string;
  nome: string;
  dataNascimento?: string;
  cpf?: string;
  parentesco: string;      // 'conjuge', 'filho', 'enteado', 'irmao', 'mae', 'pai', 'outro'
  dependentIR?: boolean;   // dependente para imposto de renda
  temDeficiencia?: boolean;
  tipoDeficiencia?: string; // 'fisica', 'cognitiva', 'sensorial', 'multipla', 'outro'
  descricaoDeficiencia?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IAvaliacaoItem {
  presente: boolean;
  observacao?: string;
  intensidade?: 'baixo' | 'medio' | 'alto';
  fonteGeradora?: string;
  situacao?: 'adequado' | 'parcial' | 'inadequado';
  frequencia?: 'nunca' | 'raramente' | 'as_vezes' | 'frequentemente';
  ultimoEvento?: string;
  dataUltimaAcao?: string;
  proximaAcao?: string;
  responsavel?: string;
}

export interface IAvaliacaoRiscosOcupacionais {
  agentesFisicos: IAvaliacaoItem;
  agentesQuimicos: IAvaliacaoItem;
  agentesBiologicos: IAvaliacaoItem;
  riscosErgonomicos: IAvaliacaoItem;
  riscosAcidentes: IAvaliacaoItem;
}

export interface IAvaliacaoCondicoesTrabalho {
  infraestrutura: IAvaliacaoItem;
  equipamentos: IAvaliacaoItem;
  organizacaoTrabalho: IAvaliacaoItem;
}

export interface IAvaliacaoRelacoesTrabalho {
  violencia: IAvaliacaoItem;
  assedio: IAvaliacaoItem;
  climaOrganizacional: IAvaliacaoItem;
  satisfacaoTrabalho: IAvaliacaoItem;
}

export interface IAvaliacaoAcoesPrevencao {
  pcmo: IAvaliacaoItem;
  ppraPgr: IAvaliacaoItem;
  programasVacinacao: IAvaliacaoItem;
  treinamentos: IAvaliacaoItem;
  inspecoes: IAvaliacaoItem;
}

export interface IAvaliacaoAmbienteTrabalho {
  riscosOcupacionais: IAvaliacaoRiscosOcupacionais;
  condicoesTrabalho: IAvaliacaoCondicoesTrabalho;
  relacoesTrabalho: IAvaliacaoRelacoesTrabalho;
  acoesPrevencao: IAvaliacaoAcoesPrevencao;
}

export interface ITrabalhadorVinculo {
  _id?: string;
  trabalhadorId: string;
  empresa?: string;
  unidade?: string;
  tipoVinculo: string;
  matricula?: string;
  funcao?: string;
  jornadaTrabalho?: string;
  turnoTrabalho?: string;
  dataInicio: string;
  dataPosse?: string;
  dataFim?: string;
  situacao?: string;
  empresaTerceirizada?: string;
  residente?: boolean;
  anosResidencia?: string;
  setor?: string;
  cargo?: string;
  ocupacao?: string;
  cargaHoraria?: number;
  salario?: number;
  insalubridadePericulosidade?: string;
  observacoes?: string;
  ativo?: boolean;
  avaliacaoAmbienteTrabalho?: IAvaliacaoAmbienteTrabalho;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorOcorrenciaViolencia {
  _id?: string;
  trabalhadorId: string;
  dataOcorrencia: string;
  localOcorrencia?: string;
  tipoViolencia?: string;
  tipoViolenciaSexual?: string;
  isAssedio?: boolean;
  motivoViolencia?: string;
  meioAgressao?: string;
  tipoAutorViolencia?: string;
  frequenciaAssedio?: string;
  testemunhas?: string;
  descricaoOcorrencia?: string;
  descricao?: string;
  reincidencia?: boolean;
  atendimentoRealizado?: string;
  condutaViolencia?: string;
  pessoasEnvolvidas?: string;
  emissaoCatNas?: boolean;
  boletimOcorrencia?: string;
  medidasTomadas?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorReadaptacao {
  _id?: string;
  trabalhadorId: string;
  dataInicio: string;
  dataFim?: string;
  motivo?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorProcessoTrabalho {
  _id?: string;
  trabalhadorId: string;
  numeroProcesso?: string;
  dataInicio?: string;
  dataFim?: string;
  descricao?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorRiscoOcupacional {
  _id?: string;
  trabalhadorId: string;
  vinculoId?: string;
  empresaId: string;
  unidadeId: string;
  categoria: string;
  tipoRisco: string;
  presente: boolean;
  observacao?: string;
  intensidade?: string;
  fonteGeradora?: string;
  frequenciaExposicao?: string;
  duracaoExposicao?: string;
  epcUtilizado?: boolean;
  epcDescricao?: string;
  epiUtilizado?: boolean;
  epiDescricao?: string;
  caEpis?: string[];
  medidasControle?: string;
  dataAvaliacao?: string;
  avaliador?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorHistoricoPPP {
  _id?: string;
  trabalhadorId: string;
  dataInicio: string;
  dataFim?: string;
  empresa: string;
  cargo: string;
  funcao?: string;
  setor: string;
  descricaoAtividades?: string;
  agentesQuimicos?: string;
  agentesFisicos?: string;
  agentesBiologicos?: string;
  agentesErgonomicos?: string;
  tecnicaMedicao?: string;
  resultadoMedicao?: string;
  limiteTolerancia?: string;
  epcEficaz?: boolean;
  epiEficaz?: boolean;
  ltcatNumero?: string;
  dataLtcat?: string;
  responsavelNome?: string;
  responsavelRegistro?: string;
  dataExameMedico?: string;
  resultadoExame?: string;
  anexos?: { id: string; nome: string }[];
  observacoes?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IUser {
  _id?: string;
  cpf: string;
  nome: string;
  email: string;
  matricula?: string;
  dataNascimento?: string;
  sexo?: 'M' | 'F';
  telefone?: string;
  endereco?: IEndereco;
  empresa?: string;
  unidade?: string;
  departamento?: string;
  cargo?: string;
  dataAdmissao?: string;
  perfil?: string;
  ativo?: boolean;
  isVerified?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
  consentimentoLGPD?: boolean;
  dataAceiteLGPD?: string;
  versaoTermo?: string;
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

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
  csrfToken?: string;
}

export interface IAcidente {
  _id?: string;
  dataAcidente: string;
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
  dataComunicacao?: string;
  dataNotificacao?: string;
  atendimentoMedico?: boolean;
  dataAtendimento?: string;
  horaAtendimento?: string;
  unidadeAtendimento?: string;
  internamento?: boolean;
  duracaoInternamento?: number;
  catNas?: boolean;
  registroPolicial?: boolean;
  encaminhamentoJuntaMedica?: boolean;
  afastamento?: boolean;
  outrosTrabalhadoresAtingidos?: boolean;
  quantidadeTrabalhadoresAtingidos?: number;
  status?: 'Aberto' | 'Em Análise' | 'Fechado';
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IDoenca {
  _id?: string;
  dataInicio: string;
  dataFim?: string;
  trabalhadorId: string;
  codigoDoenca: string;
  nomeDoenca: string;
  relatoClinico?: string;
  profissionalSaude?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IVacinacao {
  _id?: string;
  trabalhadorId: string;
  vacina: string;
  dataVacinacao: string;
  proximoDose?: string;
  unidadeSaude?: string;
  profissional?: string;
  certificado?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IAcidentePopulated {
  _id?: string;
  dataAcidente: string;
  horario?: string;
  horarioAposInicioJornada?: string;
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
  dataComunicacao?: string;
  dataNotificacao?: string;
  atendimentoMedico?: boolean;
  dataAtendimento?: string;
  horaAtendimento?: string;
  unidadeAtendimento?: string;
  internamento?: boolean;
  duracaoInternamento?: number;
  catNas?: boolean;
  registroPolicial?: boolean;
  encaminhamentoJuntaMedica?: boolean;
  afastamento?: boolean;
  outrosTrabalhadoresAtingidos?: boolean;
  quantidadeTrabalhadoresAtingidos?: number;
  status?: 'Aberto' | 'Em Análise' | 'Fechado';
  dataCriacao?: string;
  dataAtualizacao?: string;
  // Populated fields
  trabalhadorId?: {
    _id?: string;
    nome?: string;
    cpf?: string;
    email?: string;
    empresa?: string;
    unidade?: string;
  };
}

export interface IMaterialBiologico {
  _id?: string;
  acidenteId: string | IAcidentePopulated;
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
  dataReavaliacao?: string;
  efeitoColateralPermanente: boolean;
  descEfeitoColateralPermanente?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IEmpresa {
  _id?: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: IEndereco;
  ativa?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IUnidade {
  _id?: string;
  nome: string;
  empresaId: string;
  endereco?: IEndereco;
  gestor?: string;
  possuiPgr?: boolean;
  ativa?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ICatalogoItem {
  _id?: string;
  entidade: string;
  nome: string;
  sigla?: string;
  descricao?: string;
  ativo: boolean;
  ordem?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhador {
  _id?: string;
  cpf: string;
  nome: string;
  nomeSocial?: string;
  nomeMae?: string;
  matricula?: string;
  cartaoSus?: string;
  celular?: string;
  telefoneContato?: string;
  email?: string;
  dataNascimento?: string;

  // Vínculo com Empresa/Unidade
  empresa?: string; // ObjectId da Empresa
  unidade?: string; // ObjectId da Unidade

  // Nacionalidade
  nacionalidade?: {
    cidade?: string;
    estado?: string;
    pais?: string;
  };

  // Dados Pessoais/Diversos
  sexo?: string;
  genero?: string;
  insalubridadePericulosidade?: string;
  neurodivergencias?: string[];
  raca?: string;
  etnia?: string;
  escolaridade?: string;
  estadoCivil?: string;
  
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
    dataPosse?: string;
    empresaTerceirizada?: string;
    residente?: boolean;
    anosResidencia?: string;
    dataEntrada?: string;
    setor?: string;
    cargo?: string;
    funcao?: string;
    ocupacao?: string;
  };

  // Histórico e Eventos
  historico?: {
    dataAposentadoria?: string;
    dataObito?: string;
    dataRemocao?: string;
    novoServico?: string;
    dataRetorno?: string;
    dataRelotacao?: string;
    dataDesligamento?: string;
    dataAfastamento?: string;
    tipoAfastamento?: string;
  };

  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IPreferenciaUsuario {
  _id?: string;
  usuarioId: string;
  tema?: string;
  idioma?: string;
  notificacoesEmail?: boolean;
  notificacoesPush?: boolean;
  dashboardPadrao?: string;
  itensPorPagina?: number;
  ocultarAlertaOrientacao?: boolean;
}

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
  url?: string;
}

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
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IQuestao {
  pergunta: string;
  opcoes: string[];
  opcaoCorreta: number;
  ordem: number;
}

export interface IQuiz {
  _id?: string;
  titulo: string;
  descricao?: string;
  videoAulaId?: string;
  questoes: IQuestao[];
  pontuacaoMinima: number;
  tempoLimite?: number;
  tentativasPermitidas: number;
  ativo?: boolean;
  ordem?: number;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITentativaQuiz {
  tentativa: number;
  pontuacao: number;
  respostas: number[];
  questoesSelecionadas?: number[];
  dataRealizacao: string;
}

export interface IProgressoTreinamento {
  _id?: string;
  usuarioId: string;
  videoAulaId: string;
  assistido: boolean;
  dataUltimaVisualizacao?: string;
  quizRealizado: boolean;
  quizAprovado: boolean;
  tentativasQuiz: ITentativaQuiz[];
  melhormaPontuacao?: number;
  certificadoEmitido: boolean;
  dataConclusao?: string;
  favorito: boolean;
  sessaoAtiva?: {
    questoesSelecionadas: number[];
    dataInicio: string;
  };
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ICertificado {
  _id?: string;
  usuarioId: string;
  videoAulaId: string;
  nomeUsuario: string;
  cpfUsuario: string;
  tituloTreinamento: string;
  descricaoTreinamento?: string;
  categoriaTreinamento?: string;
  cargaHoraria?: string;
  pontuacaoQuiz: number;
  codigoCertificado: string;
  dataConclusao: string;
  dataEmissao: string;
  emitidoPor?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IDetalheQuestao {
  pergunta: string;
  opcoes: string[];
  respostaUsuario: number;
  respostaCorreta: number;
  correta: boolean;
}

export interface IResultadoQuiz {
  pontuacao: number;
  aprovado: boolean;
  totalQuestoes: number;
  acertos: number;
  tentativa: number;
  tentativasRestantes: number;
  pontuacaoMinima: number;
  detalhes: IDetalheQuestao[];
}

export interface IQuestaoSessao {
  pergunta: string;
  opcoes: string[];
  index: number;
}

export interface IInicioQuizResponse {
  questoes: IQuestaoSessao[];
  totalQuestoes: number;
}
