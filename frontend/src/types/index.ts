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
  parentesco: string;
  dependentIR?: boolean;
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
  acidenteMaterialBiologicoId?: string;
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
  // ... resto igual
  empresa?: string;
  unidade?: string;
  sexo?: string;
  raca?: string;
  escolaridade?: string;
  estadoCivil?: string;
  deficiencia?: {
    tipo?: string;
    tempo?: string;
    grau?: string;
  };
  vinculo?: {
    tipo?: string;
    outro?: string;
    turno?: string;
    jornada?: string;
    jornadaOutro?: string;
    situacao?: string;
  };
  endereco?: IEndereco;
  trabalho?: {
    dataPosse?: string;
    empresaTerceirizada?: string;
    dataEntrada?: string;
    setor?: string;
    cargo?: string;
    funcao?: string;
    ocupacao?: string;
  };
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

// NOVOS TIPOS - Acidente Material Biológico
export interface IAcidenteMaterialBiologico {
  _id?: string;
  acidenteId: string;
  tipoExposicaoId: string;
  materialOrganicoId: string;
  circunstanciaAcidenteId: string;
  agenteId: string;
  equipamentoProtecaoId?: string;
  sorologiaPacienteId?: string;
  sorologiaAcidentadoId?: string;
  condutaId?: string;
  evolucaoId?: string;
  usoEpi: boolean;
  sorologiaFonte: boolean;
  acompanhamentoPrep: boolean;
  dsAcompanhamentoPrep?: string;
  dsEncaminhamento?: string;
  dtReavaliacao?: string;
  efeitoColateralPermanece: boolean;
  dsEfeitoColateralPermanece?: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Populated
  acidente?: Pick<IAcidente, '_id' | 'dataAcidente' | 'tipoAcidente'>;
  tipoExposicao?: Pick<ICatalogoItem, '_id' | 'nome'>;
  materialOrganico?: Pick<ICatalogoItem, '_id' | 'nome'>;
  circunstanciaAcidente?: Pick<ICatalogoItem, '_id' | 'nome'>;
  agente?: Pick<ICatalogoItem, '_id' | 'nome'>;
  equipamentoProtecao?: Pick<ICatalogoItem, '_id' | 'nome'>;
  conduta?: Pick<ICatalogoItem, '_id' | 'nome'>;
  evolucao?: Pick<ICatalogoItem, '_id' | 'nome'>;
  sorologiaPaciente?: ISorologiaPaciente;
  sorologiaAcidentado?: ISorologiaAcidentado;
}

export interface ISorologiaPaciente {
  _id?: string;
  acidenteMaterialBiologicoId: string;
  pacienteFonteNome?: string;
  pacienteFonteCpf?: string;
  hiv: string;
  hbsAg: string;
  antiHbc: string;
  antiHcv: string;
  vdrl: string;
  dataColeta: string;
  dataResultado?: string;
  observacoes?: string;
  ativo: boolean;
}

export interface ISorologiaAcidentado {
  _id?: string;
  acidenteMaterialBiologicoId: string;
  trabalhadorId: string;
  hivBasal: string;
  hbsAgBasal: string;
  antiHbcBasal: string;
  antiHcvBasal: string;
  vdrlBasal: string;
  hivProfilaxia?: string;
  hbsAgProfilaxia?: string;
  antiHbcProfilaxia?: string;
  antiHcvProfilaxia?: string;
  vdrlProfilaxia?: string;
  dataColetaBasal: string;
  dataResultadoBasal?: string;
  dataColetaProfilaxia?: string;
  dataResultadoProfilaxia?: string;
  observacoes?: string;
  ativo: boolean;
}

