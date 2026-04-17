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
        dataPosse?: Date;
        empresaTerceirizada?: string;
        dataEntrada?: Date;
        setor?: string;
        cargo?: string;
        funcao?: string;
        ocupacao?: string;
    };
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
export interface IAcidente {
    _id?: string;
    dataAcidente: Date;
    horario?: string;
    trabalhadorId: string;
    tipoAcidente: string;
    descricao: string;
    local?: string;
    lesoes?: string[];
    feriado?: boolean;
    comunicado?: boolean;
    dataComunicacao?: Date;
    status?: 'Aberto' | 'Em Análise' | 'Fechado';
    dataCriacao?: Date;
    dataAtualizacao?: Date;
}
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
export interface IAcidMaterialBiologico {
    _id?: string;
    dataExposicao: Date;
    trabalhadorId: string;
    tipoMaterial: string;
    descricao: string;
    medidas?: string[];
    acompanhamento?: ICompanhame;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
}
export interface ICompanhame {
    dataRetorno?: Date;
    resultado?: string;
    observacoes?: string;
}
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
    porTipo: {
        nome: string;
        valor: number;
    }[];
    porStatus: {
        nome: string;
        valor: number;
    }[];
    ultimosMeses: {
        mes: string;
        quantidade: number;
    }[];
}
export interface IAnalyticsDashboardAdmin {
    kpis: IKPIData;
    graficos: {
        acidentesPorTipo: {
            nome: string;
            valor: number;
        }[];
        acidentesPorStatus: {
            nome: string;
            valor: number;
        }[];
        acidentesUltimosMeses: {
            mes: string;
            quantidade: number;
        }[];
        trabalhadoresPorEmpresa: {
            nome: string;
            total: number;
        }[];
    };
    tabelas: {
        proximasVacinacoes: any[];
        ultimosAcidentes: any[];
    };
}
//# sourceMappingURL=index.d.ts.map