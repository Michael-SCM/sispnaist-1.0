/**
 * Referência de trabalhador retornada pela API.
 * A API devolve o ObjectId como string ou o documento populado, dependendo do endpoint.
 */
export interface ITrabalhadorRef {
  _id?: string;
  nome?: string;
  cpf?: string;
  email?: string;
  empresa?: string;
  unidade?: string;
}

/** Referência populável: id puro ou objeto populado pela API */
export type RefTrabalhador = string | ITrabalhadorRef;

/** Extrai o id de uma referência id | objeto populado */
export const refId = (ref: string | { _id?: string } | undefined | null): string | undefined =>
  typeof ref === 'string' ? ref : ref?._id;

/** Extrai o nome de uma referência id | objeto populado */
export const refNome = (ref: string | { nome?: string } | undefined | null): string | undefined =>
  typeof ref === 'object' && ref !== null ? ref.nome : undefined;

/** Extrai o CPF de uma referência id | objeto populado */
export const refCpf = (ref: string | { cpf?: string } | undefined | null): string | undefined =>
  typeof ref === 'object' && ref !== null ? ref.cpf : undefined;

export interface ITrabalhadorAfastamento {
  _id?: string;
  trabalhadorId: string;
  tipoAfastamento: string;
  motivoAfastamento: string;
  cid?: string;
  dataInicio: string;
  dataFim?: string;
  dataRetorno?: string;
  dataPericia?: string;
  desfecho?: string;
  tempoAfastamento?: string;
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

export interface ITrabalhadorExameSaude {
  _id?: string;
  trabalhadorId: string;
  numeroAso?: string;
  dataAso: string;
  dataValidadeAso?: string;
  tipoAso: 'admissional' | 'periodico' | 'retorno' | 'mudanca' | 'demissional';
  medicoNome: string;
  medicoCRM: string;
  medicoUFCrm?: string;
  resultado: 'apto' | 'inapto' | 'apto_com_restricoes';
  observacaoMedica?: string;
  examesRealizados?: string[];
  riscosOcupacionais?: string[];
  medicoPCMSONome?: string;
  medicoPCMSOCrm?: string;
  arquivoAso?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorInternacao {
  _id?: string;
  trabalhadorId: string;
  numeroAih: string;
  cnesHospital?: string;
  nomeHospital?: string;
  dataInternacao: string;
  dataAlta?: string;
  cidPrincipal?: string;
  descricaoCid?: string;
  caraterAtendimento?: string;
  valorTotalAih?: number;
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
  dataReadaptacao: string;
  motivo: string;
  cid?: string;
  mudancaSetor?: boolean;
  setorOrigem: string;
  setorReadaptacao: string;
  mudancaFuncao?: boolean;
  funcaoAnterior: string;
  funcaoNova: string;
  tempoReadaptacao: string;
  restricao: string;
  novasAtribuicoes: string;
  acompanhamento: string;
  grauSatisfacao: string;
  laudoMedico?: string;
  dataRetorno?: string;
  observacoes?: string;
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
  epcEficaz?: string;
  epiUtilizado?: boolean;
  epiDescricao?: string;
  caEpis?: string[];
  epiEficaz?: boolean;
  medidasControle?: string;
  dataAvaliacao?: string;
  avaliador?: string;
  tecnicaMedicao?: string;
  resultadoMedicao?: string;
  limiteTolerancia?: string;
  fatorRisco?: string;
  dataInicioExposicao?: string;
  dataFimExposicao?: string;
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
  doisFatoresHabilitado?: boolean;
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
  user?: IUser;
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
  needs2FA?: boolean;
  preAuthToken?: string;
  doisFatoresHabilitado?: boolean;
  confiarDispositivo?: boolean;
}

export interface IAcidente {
  _id?: string;
  dataAcidente: string;
  horario?: string;
  horarioAposInicioJornada?: string;
  trabalhadorId: RefTrabalhador;
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
  // e-Social S-2210 (CAT)
  catNumero?: string;
  catDataEmissao?: string;
  catTipo?: 'inicial' | 'reabertura' | 'comunicacao';
  emitenteCat?: 'empregador' | 'trabalhador' | 'sindico' | 'medico';
  cidLesao?: string;
  dataObito?: string;

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
  trabalhadorId: RefTrabalhador;
  codigoDoenca: string;
  nomeDoenca: string;
  relacaoTrabalho?: string;
  relatoClinico?: string;
  profissionalSaude?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IVacinacao {
  _id?: string;
  trabalhadorId: RefTrabalhador;
  vacina: string;
  dataVacinacao: string;
  proximoDose?: string;
  unidadeSaude?: string;
  profissional?: string;
  lote?: string;
  certificado?: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IAcidentePopulated extends Omit<IAcidente, 'trabalhadorId'> {
  // Populated fields
  trabalhadorId?: ITrabalhadorRef;
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
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface IUnidade {
  _id?: string;
  nome: string;
  empresaId: string | IEmpresa;
  tipo?: string;
  endereco?: IEndereco;
  gestor?: string;
  esferaAdministrativa?: string;
  possuiPgr?: boolean;
  ativo?: boolean;
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
  tipoSanguineo?: string;
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

export interface IQuestionario {
  _id?: string;
  nome: string;
  descricao?: string;
  tipo: string;
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
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

/** Questionário com os itens já resolvidos (endpoint de detalhe) */
export interface IQuestionarioComItens extends IQuestionario {
  itens: IQuestionarioItem[];
}

export interface IPadraoEmail {
  _id?: string;
  nome: string;
  assunto: string;
  conteudo: string;
  categoria?: string;
  variaveis?: string[];
  ativo?: boolean;
}

export interface IParametro {
  _id?: string;
  chave: string;
  valor: string;
  descricao?: string;
  categoria?: string;
  tipo: string;
  ativo?: boolean;
}

export interface IServidorFuncionario {
  _id?: string;
  trabalhadorId: string;
  matriculaFuncional: string;
  dataPosse: string;
  dataExercicio: string;
  regimeJuridico?: string;
  cargoEfetivo?: string;
  cargoComissionado?: string;
  lotacao?: string;
  situacaoFuncional?: string;
  atoNomeacao?: string;
  dataNomeacao?: string;
  dataAposentadoria?: string;
  observacoes?: string;
  ativo?: boolean;
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
  melhorPontuacao?: number;
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
