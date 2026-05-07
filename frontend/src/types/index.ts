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
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorVinculo {
  _id?: string;
  trabalhadorId: string;
  tipoVinculo: string;
  funcao?: string;
  jornadaTrabalho?: string;
  turnoTrabalho?: string;
  dataInicio: string;
  dataFim?: string;
  situacao?: string;
  empresaTerceirizada?: string;
  setor?: string;
  cargo?: string;
  ocupacao?: string;
  cargaHoraria?: number;
  salario?: number;
  observacoes?: string;
  ativo?: boolean;
  dataCriacao?: string;
  dataAtualizacao?: string;
}

export interface ITrabalhadorOcorrenciaViolencia {
  _id?: string;
  trabalhadorId: string;
  dataOcorrencia: string;
  tipoViolencia?: string;
  descricao?: string;
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
  dataCriacao?: string;
  dataAtualizacao?: string;
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
  token: string;
}

export interface IAcidente {
  _id?: string;
  dataAcidente: string;
  horario?: string;
  trabalhadorId: string;
  tipoAcidente: string;
  descricao: string;
  local?: string;
  lesoes?: string[];
  feriado?: boolean;
  comunicado?: boolean;
  dataComunicacao?: string;
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

  // Dados Pessoais/Diversos
  sexo?: string;
  genero?: string;
  raca?: string;
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
