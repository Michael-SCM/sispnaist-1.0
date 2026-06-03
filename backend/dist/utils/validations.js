"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.atualizarTrabalhadorSchema = exports.criarTrabalhadorSchema = exports.atualizarVacinacaoSchema = exports.criarVacinacaoSchema = exports.atualizarDoencaSchema = exports.criarDoencaSchema = exports.atualizarAcidenteSchema = exports.criarAcidenteSchema = exports.updateProfileSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.catalogoUpdateSchema = exports.catalogoSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    cpf: joi_1.default.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .required()
        .messages({
        'string.pattern.base': 'CPF deve estar no formato: XXX.XXX.XXX-XX',
    }),
    nome: joi_1.default.string()
        .trim()
        .min(3)
        .max(100)
        .required()
        .messages({
        'string.min': 'Nome deve ter pelo menos 3 caracteres',
    }),
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Email inválido',
    }),
    senha: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
        .required()
        .messages({
        'string.min': 'Senha deve ter pelo menos 8 caracteres',
        'string.pattern.base': 'A senha deve conter letra maiúscula, minúscula, número e caractere especial',
    }),
    telefone: joi_1.default.string().optional(),
    dataNascimento: joi_1.default.date().required().messages({
        'date.base': 'Data de nascimento inválida',
        'any.required': 'Data de nascimento é obrigatória',
    }),
});
// Validação genérica para catálogos/tabelas auxiliares
exports.catalogoSchema = joi_1.default.object({
    nome: joi_1.default.string().trim().min(1).max(200).required().messages({
        'string.min': 'Nome deve ter pelo menos 1 caractere',
        'any.required': 'Nome é obrigatório'
    }),
    sigla: joi_1.default.string().trim().max(10).optional(),
    descricao: joi_1.default.string().trim().max(500).optional(),
    ativo: joi_1.default.boolean().optional(),
    ordem: joi_1.default.number().integer().min(0).optional()
});
exports.catalogoUpdateSchema = joi_1.default.object({
    nome: joi_1.default.string().trim().min(1).max(200).optional(),
    sigla: joi_1.default.string().trim().max(10).optional(),
    descricao: joi_1.default.string().trim().max(500).optional(),
    ativo: joi_1.default.boolean().optional(),
    ordem: joi_1.default.number().integer().min(0).optional()
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string()
        .email()
        .required(),
    senha: joi_1.default.string()
        .required(),
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Email inválido',
        'any.required': 'Email é obrigatório',
    }),
    dataNascimento: joi_1.default.date().required().messages({
        'date.base': 'Data de nascimento inválida',
        'any.required': 'Data de nascimento é obrigatória',
    }),
});
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'any.required': 'Token é obrigatório',
    }),
    novaSenha: joi_1.default.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
        .required()
        .messages({
        'string.min': 'A nova senha deve ter pelo menos 8 caracteres',
        'string.pattern.base': 'A nova senha deve conter letra maiúscula, minúscula, número e caractere especial',
        'any.required': 'A nova senha é obrigatória',
    }),
    confirmarSenha: joi_1.default.string().valid(joi_1.default.ref('novaSenha')).required().messages({
        'any.only': 'As senhas não conferem',
        'any.required': 'Confirmação de senha é obrigatória',
    }),
});
exports.verifyEmailSchema = joi_1.default.object({
    token: joi_1.default.string().required().messages({
        'any.required': 'O token de verificação é obrigatório.',
    }),
});
exports.updateProfileSchema = joi_1.default.object({
    nome: joi_1.default.string()
        .trim()
        .min(3)
        .max(100)
        .optional(),
    email: joi_1.default.string()
        .email()
        .optional(),
    telefone: joi_1.default.string().optional(),
    dataNascimento: joi_1.default.date().optional(),
    endereco: joi_1.default.object({
        logradouro: joi_1.default.string().optional(),
        numero: joi_1.default.string().optional(),
        complemento: joi_1.default.string().optional(),
        bairro: joi_1.default.string().optional(),
        cidade: joi_1.default.string().optional(),
        estado: joi_1.default.string().optional(),
        cep: joi_1.default.string().optional(),
    }).optional(),
}).min(1);
// =========== SCHEMAS PARA ACIDENTES ===========
exports.criarAcidenteSchema = joi_1.default.object({
    dataAcidente: joi_1.default.date()
        .required()
        .messages({
        'date.base': 'Data do acidente deve ser uma data válida',
        'any.required': 'Data do acidente é obrigatória',
    }),
    horario: joi_1.default.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        'string.pattern.base': 'Horário deve estar no formato HH:MM',
    }),
    horarioAposInicioJornada: joi_1.default.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        'string.pattern.base': 'Horário deve estar no formato HH:MM',
    }),
    trabalhadorId: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Trabalhador é obrigatório',
    }),
    tipoAcidente: joi_1.default.string()
        .valid('Típico', 'Trajeto', 'Doença Ocupacional', 'Acidente com Material Biológico', 'Violência')
        .required()
        .messages({
        'any.required': 'Tipo de acidente é obrigatório',
        'any.only': 'Tipo de acidente inválido',
    }),
    tipoTrauma: joi_1.default.string().trim().max(100).required().messages({
        'any.required': 'Tipo de trauma é obrigatório',
    }),
    agenteCausador: joi_1.default.string().trim().max(100).required().messages({
        'any.required': 'Agente causador é obrigatório',
    }),
    parteCorpo: joi_1.default.string().trim().max(100).required().messages({
        'any.required': 'Parte do corpo é obrigatória',
    }),
    descricao: joi_1.default.string()
        .trim()
        .min(10)
        .max(1000)
        .required()
        .messages({
        'string.min': 'Descrição deve ter pelo menos 10 caracteres',
        'string.max': 'Descrição não pode ter mais de 1000 caracteres',
        'any.required': 'Descrição é obrigatória',
    }),
    descricaoTrauma: joi_1.default.string().trim().max(500).optional(),
    local: joi_1.default.string()
        .trim()
        .max(200)
        .optional(),
    lesoes: joi_1.default.array()
        .items(joi_1.default.string().trim())
        .optional(),
    feriado: joi_1.default.boolean().optional(),
    comunicado: joi_1.default.boolean().optional(),
    dataComunicacao: joi_1.default.date().optional().allow('', null),
    dataNotificacao: joi_1.default.date().optional().allow('', null),
    atendimentoMedico: joi_1.default.boolean().optional(),
    dataAtendimento: joi_1.default.date().optional().allow('', null),
    horaAtendimento: joi_1.default.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional()
        .messages({
        'string.pattern.base': 'Hora deve estar no formato HH:MM',
    }),
    unidadeAtendimento: joi_1.default.string().trim().max(200).optional(),
    internamento: joi_1.default.boolean().optional(),
    duracaoInternamento: joi_1.default.number().integer().min(0).optional(),
    catNas: joi_1.default.boolean().optional(),
    registroPolicial: joi_1.default.boolean().optional(),
    encaminhamentoJuntaMedica: joi_1.default.boolean().optional(),
    afastamento: joi_1.default.boolean().optional(),
    outrosTrabalhadoresAtingidos: joi_1.default.boolean().optional(),
    quantidadeTrabalhadoresAtingidos: joi_1.default.number().integer().min(0).optional(),
    status: joi_1.default.string()
        .valid('Aberto', 'Em Análise', 'Fechado')
        .optional(),
});
exports.atualizarAcidenteSchema = joi_1.default.object({
    dataAcidente: joi_1.default.date().optional(),
    horario: joi_1.default.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    horarioAposInicioJornada: joi_1.default.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    trabalhadorId: joi_1.default.string().optional(),
    tipoAcidente: joi_1.default.string()
        .valid('Típico', 'Trajeto', 'Doença Ocupacional', 'Acidente com Material Biológico', 'Violência')
        .optional(),
    tipoTrauma: joi_1.default.string().trim().max(100).optional(),
    agenteCausador: joi_1.default.string().trim().max(100).optional(),
    parteCorpo: joi_1.default.string().trim().max(100).optional(),
    descricao: joi_1.default.string()
        .trim()
        .min(10)
        .max(1000)
        .optional(),
    descricaoTrauma: joi_1.default.string().trim().max(500).optional(),
    local: joi_1.default.string()
        .trim()
        .max(200)
        .optional(),
    lesoes: joi_1.default.array()
        .items(joi_1.default.string().trim())
        .optional(),
    feriado: joi_1.default.boolean().optional(),
    comunicado: joi_1.default.boolean().optional(),
    dataComunicacao: joi_1.default.date().optional().allow('', null),
    dataNotificacao: joi_1.default.date().optional().allow('', null),
    atendimentoMedico: joi_1.default.boolean().optional(),
    dataAtendimento: joi_1.default.date().optional().allow('', null),
    horaAtendimento: joi_1.default.string()
        .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
        .optional(),
    unidadeAtendimento: joi_1.default.string().trim().max(200).optional(),
    internamento: joi_1.default.boolean().optional(),
    duracaoInternamento: joi_1.default.number().integer().min(0).optional(),
    catNas: joi_1.default.boolean().optional(),
    registroPolicial: joi_1.default.boolean().optional(),
    encaminhamentoJuntaMedica: joi_1.default.boolean().optional(),
    afastamento: joi_1.default.boolean().optional(),
    outrosTrabalhadoresAtingidos: joi_1.default.boolean().optional(),
    quantidadeTrabalhadoresAtingidos: joi_1.default.number().integer().min(0).optional(),
    status: joi_1.default.string()
        .valid('Aberto', 'Em Análise', 'Fechado')
        .optional(),
}).min(1);
// =========== SCHEMAS PARA DOENÇAS ===========
exports.criarDoencaSchema = joi_1.default.object({
    dataInicio: joi_1.default.date()
        .required()
        .messages({
        'date.base': 'Data de início deve ser uma data válida',
        'any.required': 'Data de início é obrigatória',
    }),
    dataFim: joi_1.default.date()
        .optional()
        .allow(null),
    trabalhadorId: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Trabalhador é obrigatório',
    }),
    codigoDoenca: joi_1.default.string()
        .trim()
        .max(50)
        .required()
        .messages({
        'any.required': 'Código da doença é obrigatório',
    }),
    nomeDoenca: joi_1.default.string()
        .trim()
        .min(3)
        .max(200)
        .required()
        .messages({
        'string.min': 'Nome da doença deve ter pelo menos 3 caracteres',
        'any.required': 'Nome da doença é obrigatório',
    }),
    relatoClinico: joi_1.default.string()
        .trim()
        .max(2000)
        .optional(),
    profissionalSaude: joi_1.default.string()
        .trim()
        .max(100)
        .optional(),
    ativo: joi_1.default.boolean()
        .optional(),
});
exports.atualizarDoencaSchema = joi_1.default.object({
    dataInicio: joi_1.default.date()
        .optional(),
    dataFim: joi_1.default.date()
        .optional()
        .allow(null),
    codigoDoenca: joi_1.default.string()
        .trim()
        .max(50)
        .optional(),
    nomeDoenca: joi_1.default.string()
        .trim()
        .min(3)
        .max(200)
        .optional(),
    relatoClinico: joi_1.default.string()
        .trim()
        .max(2000)
        .optional(),
    profissionalSaude: joi_1.default.string()
        .trim()
        .max(100)
        .optional(),
    ativo: joi_1.default.boolean()
        .optional(),
}).min(1);
// =========== SCHEMAS PARA VACINAÇÕES ===========
exports.criarVacinacaoSchema = joi_1.default.object({
    trabalhadorId: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Trabalhador é obrigatório',
    }),
    vacina: joi_1.default.string()
        .trim()
        .min(3)
        .max(200)
        .required()
        .messages({
        'string.min': 'Nome da vacina deve ter pelo menos 3 caracteres',
        'any.required': 'Vacina é obrigatória',
    }),
    dataVacinacao: joi_1.default.date()
        .required()
        .messages({
        'date.base': 'Data da vacinação deve ser uma data válida',
        'any.required': 'Data da vacinação é obrigatória',
    }),
    proximoDose: joi_1.default.date()
        .optional()
        .allow(null),
    unidadeSaude: joi_1.default.string()
        .trim()
        .max(200)
        .optional(),
    profissional: joi_1.default.string()
        .trim()
        .max(100)
        .optional(),
    certificado: joi_1.default.string()
        .trim()
        .max(500)
        .optional(),
});
exports.atualizarVacinacaoSchema = joi_1.default.object({
    trabalhadorId: joi_1.default.string()
        .optional(),
    vacina: joi_1.default.string()
        .trim()
        .min(3)
        .max(200)
        .optional(),
    dataVacinacao: joi_1.default.date()
        .optional(),
    proximoDose: joi_1.default.date()
        .optional()
        .allow(null),
    unidadeSaude: joi_1.default.string()
        .trim()
        .max(200)
        .optional(),
    profissional: joi_1.default.string()
        .trim()
        .max(100)
        .optional(),
    certificado: joi_1.default.string()
        .trim()
        .max(500)
        .optional(),
}).min(1);
// =========== SCHEMAS PARA TRABALHADORES ===========
exports.criarTrabalhadorSchema = joi_1.default.object({
    cpf: joi_1.default.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .required()
        .messages({
        'string.pattern.base': 'CPF deve estar no formato: XXX.XXX.XXX-XX',
        'any.required': 'CPF é obrigatório',
    }),
    nome: joi_1.default.string()
        .trim()
        .min(3)
        .max(100)
        .required(),
    nomeMae: joi_1.default.string().trim().allow('', null),
    matricula: joi_1.default.string().trim().allow('', null),
    cartaoSus: joi_1.default.string().trim().allow('', null),
    celular: joi_1.default.string().trim().allow('', null),
    telefoneContato: joi_1.default.string().trim().allow('', null),
    email: joi_1.default.string().email().allow('', null),
    dataNascimento: joi_1.default.date().required().messages({
        'any.required': 'Data de nascimento é obrigatória',
    }),
    sexo: joi_1.default.string().trim().allow('', null),
    genero: joi_1.default.string().trim().allow('', null),
    raca: joi_1.default.string().trim().allow('', null),
    escolaridade: joi_1.default.string().trim().allow('', null),
    estadoCivil: joi_1.default.string().trim().allow('', null),
    tipoSanguineo: joi_1.default.string().trim().allow('', null),
    deficiencia: joi_1.default.object({
        tipo: joi_1.default.string().trim().allow('', null),
        tempo: joi_1.default.string().trim().allow('', null),
        grau: joi_1.default.string().trim().allow('', null),
    }).optional(),
    empresa: joi_1.default.string().trim().required().messages({
        'any.required': 'Empresa é obrigatória',
    }),
    unidade: joi_1.default.string().trim().required().messages({
        'any.required': 'Unidade é obrigatória',
    }),
    vinculo: joi_1.default.object({
        tipo: joi_1.default.string().trim().allow('', null),
        outro: joi_1.default.string().trim().allow('', null),
        turno: joi_1.default.string().trim().allow('', null),
        jornada: joi_1.default.string().trim().allow('', null),
        jornadaOutro: joi_1.default.string().trim().allow('', null),
        situacao: joi_1.default.string().trim().allow('', null),
    }).optional(),
    endereco: joi_1.default.object({
        logradouro: joi_1.default.string().trim().allow('', null),
        numero: joi_1.default.string().trim().allow('', null),
        complemento: joi_1.default.string().trim().allow('', null),
        bairro: joi_1.default.string().trim().allow('', null),
        cidade: joi_1.default.string().trim().allow('', null),
        estado: joi_1.default.string().trim().allow('', null),
        cep: joi_1.default.string().trim().allow('', null),
    }).optional(),
    trabalho: joi_1.default.object({
        dataPosse: joi_1.default.date().allow(null),
        empresaTerceirizada: joi_1.default.string().trim().allow('', null),
        dataEntrada: joi_1.default.date().allow(null),
        setor: joi_1.default.string().trim().allow('', null),
        cargo: joi_1.default.string().trim().allow('', null),
        funcao: joi_1.default.string().trim().allow('', null),
        ocupacao: joi_1.default.string().trim().allow('', null),
    }).optional(),
    historico: joi_1.default.object({
        dataAposentadoria: joi_1.default.date().allow(null),
        dataObito: joi_1.default.date().allow(null),
        dataRemocao: joi_1.default.date().allow(null),
        novoServico: joi_1.default.string().trim().allow('', null),
        dataRetorno: joi_1.default.date().allow(null),
        dataRelotacao: joi_1.default.date().allow(null),
        dataDesligamento: joi_1.default.date().allow(null),
        dataAfastamento: joi_1.default.date().allow(null),
        tipoAfastamento: joi_1.default.string().trim().allow('', null),
    }).optional(),
});
exports.atualizarTrabalhadorSchema = joi_1.default.object({
    cpf: joi_1.default.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .optional(),
    nome: joi_1.default.string()
        .trim()
        .min(3)
        .max(100)
        .optional(),
    nomeMae: joi_1.default.string().trim().allow('', null),
    matricula: joi_1.default.string().trim().allow('', null),
    cartaoSus: joi_1.default.string().trim().allow('', null),
    celular: joi_1.default.string().trim().allow('', null),
    telefoneContato: joi_1.default.string().trim().allow('', null),
    email: joi_1.default.string().email().allow('', null),
    dataNascimento: joi_1.default.date().required().messages({
        'any.required': 'Data de nascimento é obrigatória',
    }),
    sexo: joi_1.default.string().trim().allow('', null),
    genero: joi_1.default.string().trim().allow('', null),
    raca: joi_1.default.string().trim().allow('', null),
    escolaridade: joi_1.default.string().trim().allow('', null),
    estadoCivil: joi_1.default.string().trim().allow('', null),
    tipoSanguineo: joi_1.default.string().trim().allow('', null),
    deficiencia: joi_1.default.object({
        tipo: joi_1.default.string().trim().allow('', null),
        tempo: joi_1.default.string().trim().allow('', null),
        grau: joi_1.default.string().trim().allow('', null),
    }).optional(),
    empresa: joi_1.default.string().trim().required().messages({
        'any.required': 'Empresa é obrigatória',
    }),
    unidade: joi_1.default.string().trim().required().messages({
        'any.required': 'Unidade é obrigatória',
    }),
    vinculo: joi_1.default.object({
        tipo: joi_1.default.string().trim().allow('', null),
        outro: joi_1.default.string().trim().allow('', null),
        turno: joi_1.default.string().trim().allow('', null),
        jornada: joi_1.default.string().trim().allow('', null),
        jornadaOutro: joi_1.default.string().trim().allow('', null),
        situacao: joi_1.default.string().trim().allow('', null),
    }).optional(),
    endereco: joi_1.default.object({
        logradouro: joi_1.default.string().trim().allow('', null),
        numero: joi_1.default.string().trim().allow('', null),
        complemento: joi_1.default.string().trim().allow('', null),
        bairro: joi_1.default.string().trim().allow('', null),
        cidade: joi_1.default.string().trim().allow('', null),
        estado: joi_1.default.string().trim().allow('', null),
        cep: joi_1.default.string().trim().allow('', null),
    }).optional(),
    trabalho: joi_1.default.object({
        dataPosse: joi_1.default.date().allow(null),
        empresaTerceirizada: joi_1.default.string().trim().allow('', null),
        dataEntrada: joi_1.default.date().allow(null),
        setor: joi_1.default.string().trim().allow('', null),
        cargo: joi_1.default.string().trim().allow('', null),
        funcao: joi_1.default.string().trim().allow('', null),
        ocupacao: joi_1.default.string().trim().allow('', null),
    }).optional(),
    historico: joi_1.default.object({
        dataAposentadoria: joi_1.default.date().allow(null),
        dataObito: joi_1.default.date().allow(null),
        dataRemocao: joi_1.default.date().allow(null),
        novoServico: joi_1.default.string().trim().allow('', null),
        dataRetorno: joi_1.default.date().allow(null),
        dataRelotacao: joi_1.default.date().allow(null),
        dataDesligamento: joi_1.default.date().allow(null),
        dataAfastamento: joi_1.default.date().allow(null),
        tipoAfastamento: joi_1.default.string().trim().allow('', null),
    }).optional(),
}).min(1);
