import Joi from 'joi';

export const registerSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'CPF deve estar no formato: XXX.XXX.XXX-XX',
    }),
  nome: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 3 caracteres',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
    }),
  senha: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'A senha deve conter letra maiúscula, minúscula, número e caractere especial',
    }),
  telefone: Joi.string().optional(),
  dataNascimento: Joi.date().required().messages({
    'date.base': 'Data de nascimento inválida',
    'any.required': 'Data de nascimento é obrigatória',
  }),
});

// Validação genérica para catálogos/tabelas auxiliares
export const catalogoSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).required().messages({
    'string.min': 'Nome deve ter pelo menos 1 caractere',
    'any.required': 'Nome é obrigatório'
  }),
  sigla: Joi.string().trim().max(10).optional(),
  descricao: Joi.string().trim().max(500).optional(),
  ativo: Joi.boolean().optional(),
  ordem: Joi.number().integer().min(0).optional()
});

export const catalogoUpdateSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(200).optional(),
  sigla: Joi.string().trim().max(10).optional(),
  descricao: Joi.string().trim().max(500).optional(),
  ativo: Joi.boolean().optional(),
  ordem: Joi.number().integer().min(0).optional()
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),
  senha: Joi.string()
    .required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório',
  }),
  dataNascimento: Joi.date().required().messages({
    'date.base': 'Data de nascimento inválida',
    'any.required': 'Data de nascimento é obrigatória',
  }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token é obrigatório',
  }),
  novaSenha: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'A nova senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'A nova senha deve conter letra maiúscula, minúscula, número e caractere especial',
      'any.required': 'A nova senha é obrigatória',
    }),
  confirmarSenha: Joi.string().valid(Joi.ref('novaSenha')).required().messages({
    'any.only': 'As senhas não conferem',
    'any.required': 'Confirmação de senha é obrigatória',
  }),
});

export const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'O token de verificação é obrigatório.',
  }),
});

// =========== SCHEMAS PARA EMPRESAS ===========

export const empresaSchema = Joi.object({
  razaoSocial: Joi.string().trim().min(2).max(200).required().messages({
    'any.required': 'Razão social é obrigatória',
  }),
  nomeFantasia: Joi.string().trim().max(200).optional().allow('', null),
  cnpj: Joi.string()
    .pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'CNPJ deve estar no formato: XX.XXX.XXX/XXXX-XX',
      'any.required': 'CNPJ é obrigatório',
    }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email inválido',
    'any.required': 'Email é obrigatório',
  }),
  telefone: Joi.string().trim().max(20).optional().allow('', null),
  endereco: Joi.object({
    logradouro: Joi.string().trim().max(200).required(),
    numero: Joi.string().trim().max(20).required(),
    complemento: Joi.string().trim().max(100).optional().allow('', null),
    bairro: Joi.string().trim().max(100).required(),
    cidade: Joi.string().trim().max(100).required(),
    estado: Joi.string().trim().max(50).required(),
    cep: Joi.string().trim().max(10).optional().allow('', null),
  }).optional(),
  ativa: Joi.boolean().optional(),
});

export const empresaUpdateSchema = Joi.object({
  razaoSocial: Joi.string().trim().min(2).max(200).optional(),
  nomeFantasia: Joi.string().trim().max(200).optional().allow('', null),
  cnpj: Joi.string()
    .pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)
    .optional()
    .messages({ 'string.pattern.base': 'CNPJ deve estar no formato: XX.XXX.XXX/XXXX-XX' }),
  email: Joi.string().email().optional(),
  telefone: Joi.string().trim().max(20).optional().allow('', null),
  endereco: Joi.object({
    logradouro: Joi.string().trim().max(200).optional(),
    numero: Joi.string().trim().max(20).optional(),
    complemento: Joi.string().trim().max(100).optional().allow('', null),
    bairro: Joi.string().trim().max(100).optional(),
    cidade: Joi.string().trim().max(100).optional(),
    estado: Joi.string().trim().max(50).optional(),
    cep: Joi.string().trim().max(10).optional().allow('', null),
  }).optional(),
  ativa: Joi.boolean().optional(),
}).min(1);

// =========== SCHEMAS PARA UNIDADES ===========

export const unidadeSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(200).required().messages({
    'any.required': 'Nome da unidade é obrigatório',
  }),
  empresaId: Joi.string().required().messages({
    'any.required': 'Empresa é obrigatória',
  }),
  endereco: Joi.object({
    logradouro: Joi.string().trim().max(200).required(),
    numero: Joi.string().trim().max(20).required(),
    complemento: Joi.string().trim().max(100).optional().allow('', null),
    bairro: Joi.string().trim().max(100).required(),
    cidade: Joi.string().trim().max(100).required(),
    estado: Joi.string().trim().max(50).required(),
    cep: Joi.string().trim().max(10).optional().allow('', null),
  }).optional(),
  gestor: Joi.string().trim().max(100).optional().allow('', null),
  ativa: Joi.boolean().optional(),
});

export const unidadeUpdateSchema = Joi.object({
  nome: Joi.string().trim().min(2).max(200).optional(),
  empresaId: Joi.string().optional(),
  endereco: Joi.object({
    logradouro: Joi.string().trim().max(200).optional(),
    numero: Joi.string().trim().max(20).optional(),
    complemento: Joi.string().trim().max(100).optional().allow('', null),
    bairro: Joi.string().trim().max(100).optional(),
    cidade: Joi.string().trim().max(100).optional(),
    estado: Joi.string().trim().max(50).optional(),
    cep: Joi.string().trim().max(10).optional().allow('', null),
  }).optional(),
  gestor: Joi.string().trim().max(100).optional().allow('', null),
  ativa: Joi.boolean().optional(),
}).min(1);

// =========== SCHEMAS PARA USUÁRIOS (ADMIN) ===========

export const updateUserSchema = Joi.object({
  nome: Joi.string().trim().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  telefone: Joi.string().trim().optional().allow('', null),
  perfil: Joi.string().valid('admin', 'gestor', 'trabalhador', 'saude').optional(),
  ativo: Joi.boolean().optional(),
  empresa: Joi.string().optional().allow('', null),
  unidade: Joi.string().optional().allow('', null),
}).min(1);

// =========== SCHEMAS PARA ATOS MUNICIPAIS ===========

export const atoMunicipalSchema = Joi.object({
  nr_ato: Joi.string().trim().max(50).required(),
  ano_ato: Joi.number().integer().min(1900).max(2100).required(),
  link_ato_legal: Joi.string().uri().optional().allow('', null),
  nm_cidade: Joi.string().trim().max(100).required(),
  nm_estado: Joi.string().trim().max(50).required(),
  nm_tipo: Joi.string().trim().max(100).optional().allow('', null),
  nm_subtipo: Joi.string().trim().max(100).optional().allow('', null),
  nm_categoria: Joi.string().trim().max(100).optional().allow('', null),
  nm_classe_categoria: Joi.string().trim().max(100).optional().allow('', null),
  texto_legal: Joi.string().trim().optional().allow('', null),
  texto_ementa: Joi.string().trim().optional().allow('', null),
  papeisModoGovernanca: Joi.array().items(Joi.string()).optional(),
  ativo: Joi.boolean().optional(),
});

export const atoMunicipalUpdateSchema = Joi.object({
  nr_ato: Joi.string().trim().max(50).optional(),
  ano_ato: Joi.number().integer().min(1900).max(2100).optional(),
  link_ato_legal: Joi.string().uri().optional().allow('', null),
  nm_cidade: Joi.string().trim().max(100).optional(),
  nm_estado: Joi.string().trim().max(50).optional(),
  nm_tipo: Joi.string().trim().max(100).optional().allow('', null),
  nm_subtipo: Joi.string().trim().max(100).optional().allow('', null),
  nm_categoria: Joi.string().trim().max(100).optional().allow('', null),
  nm_classe_categoria: Joi.string().trim().max(100).optional().allow('', null),
  texto_legal: Joi.string().trim().optional().allow('', null),
  texto_ementa: Joi.string().trim().optional().allow('', null),
  papeisModoGovernanca: Joi.array().items(Joi.string()).optional(),
  ativo: Joi.boolean().optional(),
}).min(1);

// =========== SCHEMAS PARA PADRÕES DE E-MAIL ===========

export const padraoEmailSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(100).required(),
  assunto: Joi.string().trim().min(1).max(200).required(),
  corpo: Joi.string().trim().min(1).required(),
  variaveis: Joi.array().items(Joi.string().trim()).optional(),
  ativo: Joi.boolean().optional(),
});

export const padraoEmailUpdateSchema = Joi.object({
  nome: Joi.string().trim().min(1).max(100).optional(),
  assunto: Joi.string().trim().min(1).max(200).optional(),
  corpo: Joi.string().trim().min(1).optional(),
  variaveis: Joi.array().items(Joi.string().trim()).optional(),
  ativo: Joi.boolean().optional(),
}).min(1);

// =========== SCHEMAS PARA PREFERÊNCIAS ===========

export const preferenciaSchema = Joi.object({
  tema: Joi.string().valid('claro', 'escuro', 'sistema').optional(),
  idioma: Joi.string().valid('pt-BR').optional(),
  notificacoes: Joi.object({
    email: Joi.boolean().optional(),
    sistema: Joi.boolean().optional(),
  }).optional(),
  dashboard: Joi.object({
    kpis: Joi.array().items(Joi.string()).optional(),
    graficos: Joi.array().items(Joi.string()).optional(),
  }).optional(),
}).min(1);

// =========== SCHEMAS PARA MATERIAL BIOLÓGICO ===========

export const materialBiologicoSchema = Joi.object({
  acidenteId: Joi.string().required().messages({ 'any.required': 'Acidente é obrigatório' }),
  tipoExposicao: Joi.string().trim().max(200).required(),
  materialOrganico: Joi.string().trim().max(200).required(),
  circunstanciaAcidente: Joi.string().trim().max(1000).required(),
  agente: Joi.string().trim().max(200).required(),
  equipamentoProtecao: Joi.string().trim().max(200).optional().allow('', null),
  sorologiaPaciente: Joi.string().trim().max(200).required(),
  sorologiaAcidentado: Joi.string().trim().max(200).required(),
  conduta: Joi.string().trim().max(2000).required(),
  evolucaoCaso: Joi.string().trim().max(2000).required(),
  usoEPI: Joi.boolean().optional(),
  sorologiaFonte: Joi.boolean().optional(),
  acompanhamentoPrEP: Joi.boolean().optional(),
  descAcompanhamentoPrEP: Joi.string().trim().max(500).optional().allow('', null),
  descEncaminhamento: Joi.string().trim().max(500).optional().allow('', null),
  dataReavaliacao: Joi.date().optional().allow(null),
  efeitoColateralPermanente: Joi.boolean().optional(),
  descEfeitoColateralPermanente: Joi.string().trim().max(500).optional().allow('', null),
});

export const materialBiologicoUpdateSchema = Joi.object({
  tipoExposicao: Joi.string().trim().max(200).optional(),
  materialOrganico: Joi.string().trim().max(200).optional(),
  circunstanciaAcidente: Joi.string().trim().max(1000).optional(),
  agente: Joi.string().trim().max(200).optional(),
  equipamentoProtecao: Joi.string().trim().max(200).optional().allow('', null),
  sorologiaPaciente: Joi.string().trim().max(200).optional(),
  sorologiaAcidentado: Joi.string().trim().max(200).optional(),
  conduta: Joi.string().trim().max(2000).optional(),
  evolucaoCaso: Joi.string().trim().max(2000).optional(),
  usoEPI: Joi.boolean().optional(),
  sorologiaFonte: Joi.boolean().optional(),
  acompanhamentoPrEP: Joi.boolean().optional(),
  descAcompanhamentoPrEP: Joi.string().trim().max(500).optional().allow('', null),
  descEncaminhamento: Joi.string().trim().max(500).optional().allow('', null),
  dataReavaliacao: Joi.date().optional().allow(null),
  efeitoColateralPermanente: Joi.boolean().optional(),
  descEfeitoColateralPermanente: Joi.string().trim().max(500).optional().allow('', null),
}).min(1);

// =========== SCHEMA PARA REFRESH TOKEN ===========

// =========== SCHEMA PARA ALTERAÇÃO DE SENHA ===========

export const changePasswordSchema = Joi.object({
  senhaAtual: Joi.string().required().messages({
    'any.required': 'Senha atual é obrigatória',
  }),
  novaSenha: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .required()
    .messages({
      'string.min': 'A nova senha deve ter pelo menos 8 caracteres',
      'string.pattern.base': 'A nova senha deve conter letra maiúscula, minúscula, número e caractere especial',
      'any.required': 'Nova senha é obrigatória',
    }),
  confirmarSenha: Joi.string().valid(Joi.ref('novaSenha')).required().messages({
    'any.only': 'As senhas não conferem',
    'any.required': 'Confirmação de senha é obrigatória',
  }),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token é obrigatório',
  }),
});

export const updateProfileSchema = Joi.object({
  nome: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional(),
  email: Joi.string()
    .email()
    .optional(),
  telefone: Joi.string().optional(),
  dataNascimento: Joi.date().optional(),
  endereco: Joi.object({
    logradouro: Joi.string().optional(),
    numero: Joi.string().optional(),
    complemento: Joi.string().optional(),
    bairro: Joi.string().optional(),
    cidade: Joi.string().optional(),
    estado: Joi.string().optional(),
    cep: Joi.string().optional(),
  }).optional(),
}).min(1);

// =========== SCHEMAS PARA ACIDENTES ===========

export const criarAcidenteSchema = Joi.object({
  dataAcidente: Joi.date()
    .required()
    .messages({
      'date.base': 'Data do acidente deve ser uma data válida',
      'any.required': 'Data do acidente é obrigatória',
    }),
  horario: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Horário deve estar no formato HH:MM',
    }),
  horarioAposInicioJornada: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Horário deve estar no formato HH:MM',
    }),
  trabalhadorId: Joi.string()
    .required()
    .messages({
      'any.required': 'Trabalhador é obrigatório',
    }),
  tipoAcidente: Joi.string()
    .valid('Típico', 'Trajeto', 'Doença Ocupacional', 'Acidente com Material Biológico', 'Violência')
    .required()
    .messages({
      'any.required': 'Tipo de acidente é obrigatório',
      'any.only': 'Tipo de acidente inválido',
    }),
  tipoTrauma: Joi.string().trim().max(100).required().messages({
    'any.required': 'Tipo de trauma é obrigatório',
  }),
  agenteCausador: Joi.string().trim().max(100).required().messages({
    'any.required': 'Agente causador é obrigatório',
  }),
  parteCorpo: Joi.string().trim().max(100).required().messages({
    'any.required': 'Parte do corpo é obrigatória',
  }),
  descricao: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.min': 'Descrição deve ter pelo menos 10 caracteres',
      'string.max': 'Descrição não pode ter mais de 1000 caracteres',
      'any.required': 'Descrição é obrigatória',
    }),
  descricaoTrauma: Joi.string().trim().max(500).optional(),
  local: Joi.string()
    .trim()
    .max(200)
    .optional(),
  lesoes: Joi.array()
    .items(Joi.string().trim())
    .optional(),
  feriado: Joi.boolean().optional(),
  comunicado: Joi.boolean().optional(),
  dataComunicacao: Joi.date().optional().allow('', null),
  dataNotificacao: Joi.date().optional().allow('', null),
  atendimentoMedico: Joi.boolean().optional(),
  dataAtendimento: Joi.date().optional().allow('', null),
  horaAtendimento: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional()
    .messages({
      'string.pattern.base': 'Hora deve estar no formato HH:MM',
    }),
  unidadeAtendimento: Joi.string().trim().max(200).optional(),
  internamento: Joi.boolean().optional(),
  duracaoInternamento: Joi.number().integer().min(0).optional(),
  catNas: Joi.boolean().optional(),
  registroPolicial: Joi.boolean().optional(),
  encaminhamentoJuntaMedica: Joi.boolean().optional(),
  afastamento: Joi.boolean().optional(),
  outrosTrabalhadoresAtingidos: Joi.boolean().optional(),
  quantidadeTrabalhadoresAtingidos: Joi.number().integer().min(0).optional(),
  status: Joi.string()
    .valid('Aberto', 'Em Análise', 'Fechado')
    .optional(),
});

export const atualizarAcidenteSchema = Joi.object({
  dataAcidente: Joi.date().optional(),
  horario: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  horarioAposInicioJornada: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  trabalhadorId: Joi.string().optional(),
  tipoAcidente: Joi.string()
    .valid('Típico', 'Trajeto', 'Doença Ocupacional', 'Acidente com Material Biológico', 'Violência')
    .optional(),
  tipoTrauma: Joi.string().trim().max(100).optional(),
  agenteCausador: Joi.string().trim().max(100).optional(),
  parteCorpo: Joi.string().trim().max(100).optional(),
  descricao: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .optional(),
  descricaoTrauma: Joi.string().trim().max(500).optional(),
  local: Joi.string()
    .trim()
    .max(200)
    .optional(),
  lesoes: Joi.array()
    .items(Joi.string().trim())
    .optional(),
  feriado: Joi.boolean().optional(),
  comunicado: Joi.boolean().optional(),
  dataComunicacao: Joi.date().optional().allow('', null),
  dataNotificacao: Joi.date().optional().allow('', null),
  atendimentoMedico: Joi.boolean().optional(),
  dataAtendimento: Joi.date().optional().allow('', null),
  horaAtendimento: Joi.string()
    .pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  unidadeAtendimento: Joi.string().trim().max(200).optional(),
  internamento: Joi.boolean().optional(),
  duracaoInternamento: Joi.number().integer().min(0).optional(),
  catNas: Joi.boolean().optional(),
  registroPolicial: Joi.boolean().optional(),
  encaminhamentoJuntaMedica: Joi.boolean().optional(),
  afastamento: Joi.boolean().optional(),
  outrosTrabalhadoresAtingidos: Joi.boolean().optional(),
  quantidadeTrabalhadoresAtingidos: Joi.number().integer().min(0).optional(),
  status: Joi.string()
    .valid('Aberto', 'Em Análise', 'Fechado')
    .optional(),
}).min(1);

// =========== SCHEMAS PARA DOENÇAS ===========

export const criarDoencaSchema = Joi.object({
  dataInicio: Joi.date()
    .required()
    .messages({
      'date.base': 'Data de início deve ser uma data válida',
      'any.required': 'Data de início é obrigatória',
    }),
  dataFim: Joi.date()
    .optional()
    .allow(null),
  trabalhadorId: Joi.string()
    .required()
    .messages({
      'any.required': 'Trabalhador é obrigatório',
    }),
  codigoDoenca: Joi.string()
    .trim()
    .max(50)
    .required()
    .messages({
      'any.required': 'Código da doença é obrigatório',
    }),
  nomeDoenca: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Nome da doença deve ter pelo menos 3 caracteres',
      'any.required': 'Nome da doença é obrigatório',
    }),
  relatoClinico: Joi.string()
    .trim()
    .max(2000)
    .optional(),
  profissionalSaude: Joi.string()
    .trim()
    .max(100)
    .optional(),
  ativo: Joi.boolean()
    .optional(),
});

export const atualizarDoencaSchema = Joi.object({
  dataInicio: Joi.date()
    .optional(),
  dataFim: Joi.date()
    .optional()
    .allow(null),
  codigoDoenca: Joi.string()
    .trim()
    .max(50)
    .optional(),
  nomeDoenca: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .optional(),
  relatoClinico: Joi.string()
    .trim()
    .max(2000)
    .optional(),
  profissionalSaude: Joi.string()
    .trim()
    .max(100)
    .optional(),
  ativo: Joi.boolean()
    .optional(),
}).min(1);

// =========== SCHEMAS PARA VACINAÇÕES ===========

export const criarVacinacaoSchema = Joi.object({
  trabalhadorId: Joi.string()
    .required()
    .messages({
      'any.required': 'Trabalhador é obrigatório',
    }),
  vacina: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Nome da vacina deve ter pelo menos 3 caracteres',
      'any.required': 'Vacina é obrigatória',
    }),
  dataVacinacao: Joi.date()
    .required()
    .messages({
      'date.base': 'Data da vacinação deve ser uma data válida',
      'any.required': 'Data da vacinação é obrigatória',
    }),
  proximoDose: Joi.date()
    .optional()
    .allow(null),
  unidadeSaude: Joi.string()
    .trim()
    .max(200)
    .optional(),
  profissional: Joi.string()
    .trim()
    .max(100)
    .optional(),
  certificado: Joi.string()
    .trim()
    .max(500)
    .optional(),
});

export const atualizarVacinacaoSchema = Joi.object({
  trabalhadorId: Joi.string()
    .optional(),
  vacina: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .optional(),
  dataVacinacao: Joi.date()
    .optional(),
  proximoDose: Joi.date()
    .optional()
    .allow(null),
  unidadeSaude: Joi.string()
    .trim()
    .max(200)
    .optional(),
  profissional: Joi.string()
    .trim()
    .max(100)
    .optional(),
  certificado: Joi.string()
    .trim()
    .max(500)
    .optional(),
}).min(1);

// =========== SCHEMAS PARA TRABALHADORES ===========

export const criarTrabalhadorSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'CPF deve estar no formato: XXX.XXX.XXX-XX',
      'any.required': 'CPF é obrigatório',
    }),
  nome: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required(),
  nomeSocial: Joi.string().trim().allow('', null),
  nomeMae: Joi.string().trim().allow('', null),
  matricula: Joi.string().trim().allow('', null),
  cartaoSus: Joi.string().trim().allow('', null),
  celular: Joi.string().trim().allow('', null),
  telefoneContato: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  dataNascimento: Joi.date().required().messages({
    'any.required': 'Data de nascimento é obrigatória',
  }),
  nacionalidade: Joi.object({
    cidade: Joi.string().trim().allow('', null),
    estado: Joi.string().trim().allow('', null),
    pais: Joi.string().trim().allow('', null),
  }).optional(),
  sexo: Joi.string().trim().allow('', null),
  genero: Joi.string().trim().allow('', null),
  raca: Joi.string().trim().allow('', null),
  escolaridade: Joi.string().trim().allow('', null),
  estadoCivil: Joi.string().trim().allow('', null),
  tipoSanguineo: Joi.string().trim().allow('', null),
  insalubridadePericulosidade: Joi.string().trim().allow('', null),
  neurodivergencias: Joi.array().items(Joi.string().trim()).optional(),
  deficiencia: Joi.object({
    tipo: Joi.string().trim().allow('', null),
    tempo: Joi.string().trim().allow('', null),
    grau: Joi.string().trim().allow('', null),
  }).optional(),
  empresa: Joi.string().trim().required().messages({
    'any.required': 'Empresa é obrigatória',
  }),
  unidade: Joi.string().trim().required().messages({
    'any.required': 'Unidade é obrigatória',
  }),
  vinculo: Joi.object({
    tipo: Joi.string().trim().allow('', null),
    outro: Joi.string().trim().allow('', null),
    turno: Joi.string().trim().allow('', null),
    jornada: Joi.string().trim().allow('', null),
    jornadaOutro: Joi.string().trim().allow('', null),
    situacao: Joi.string().trim().allow('', null),
  }).optional(),
  endereco: Joi.object({
    logradouro: Joi.string().trim().allow('', null),
    numero: Joi.string().trim().allow('', null),
    complemento: Joi.string().trim().allow('', null),
    bairro: Joi.string().trim().allow('', null),
    cidade: Joi.string().trim().allow('', null),
    estado: Joi.string().trim().allow('', null),
    cep: Joi.string().trim().allow('', null),
  }).optional(),
  trabalho: Joi.object({
    dataPosse: Joi.date().allow(null),
    empresaTerceirizada: Joi.string().trim().allow('', null),
    dataEntrada: Joi.date().allow(null),
    setor: Joi.string().trim().allow('', null),
    cargo: Joi.string().trim().allow('', null),
    funcao: Joi.string().trim().allow('', null),
    ocupacao: Joi.string().trim().allow('', null),
  }).optional(),
  historico: Joi.object({
    dataAposentadoria: Joi.date().allow(null),
    dataObito: Joi.date().allow(null),
    dataRemocao: Joi.date().allow(null),
    novoServico: Joi.string().trim().allow('', null),
    dataRetorno: Joi.date().allow(null),
    dataRelotacao: Joi.date().allow(null),
    dataDesligamento: Joi.date().allow(null),
    dataAfastamento: Joi.date().allow(null),
    tipoAfastamento: Joi.string().trim().allow('', null),
  }).optional(),
});

export const atualizarTrabalhadorSchema = Joi.object({
  cpf: Joi.string()
    .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .optional(),
  nome: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional(),
  nomeSocial: Joi.string().trim().allow('', null),
  nomeMae: Joi.string().trim().allow('', null),
  matricula: Joi.string().trim().allow('', null),
  cartaoSus: Joi.string().trim().allow('', null),
  celular: Joi.string().trim().allow('', null),
  telefoneContato: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  dataNascimento: Joi.date().required().messages({
    'any.required': 'Data de nascimento é obrigatória',
  }),
  nacionalidade: Joi.object({
    cidade: Joi.string().trim().allow('', null),
    estado: Joi.string().trim().allow('', null),
    pais: Joi.string().trim().allow('', null),
  }).optional(),
  sexo: Joi.string().trim().allow('', null),
  genero: Joi.string().trim().allow('', null),
  raca: Joi.string().trim().allow('', null),
  escolaridade: Joi.string().trim().allow('', null),
  estadoCivil: Joi.string().trim().allow('', null),
  tipoSanguineo: Joi.string().trim().allow('', null),
  insalubridadePericulosidade: Joi.string().trim().allow('', null),
  neurodivergencias: Joi.array().items(Joi.string().trim()).optional(),
  deficiencia: Joi.object({
    tipo: Joi.string().trim().allow('', null),
    tempo: Joi.string().trim().allow('', null),
    grau: Joi.string().trim().allow('', null),
  }).optional(),
  empresa: Joi.string().trim().required().messages({
    'any.required': 'Empresa é obrigatória',
  }),
  unidade: Joi.string().trim().required().messages({
    'any.required': 'Unidade é obrigatória',
  }),
  vinculo: Joi.object({
    tipo: Joi.string().trim().allow('', null),
    outro: Joi.string().trim().allow('', null),
    turno: Joi.string().trim().allow('', null),
    jornada: Joi.string().trim().allow('', null),
    jornadaOutro: Joi.string().trim().allow('', null),
    situacao: Joi.string().trim().allow('', null),
  }).optional(),
  endereco: Joi.object({
    logradouro: Joi.string().trim().allow('', null),
    numero: Joi.string().trim().allow('', null),
    complemento: Joi.string().trim().allow('', null),
    bairro: Joi.string().trim().allow('', null),
    cidade: Joi.string().trim().allow('', null),
    estado: Joi.string().trim().allow('', null),
    cep: Joi.string().trim().allow('', null),
  }).optional(),
  trabalho: Joi.object({
    dataPosse: Joi.date().allow(null),
    empresaTerceirizada: Joi.string().trim().allow('', null),
    dataEntrada: Joi.date().allow(null),
    setor: Joi.string().trim().allow('', null),
    cargo: Joi.string().trim().allow('', null),
    funcao: Joi.string().trim().allow('', null),
    ocupacao: Joi.string().trim().allow('', null),
  }).optional(),
  historico: Joi.object({
    dataAposentadoria: Joi.date().allow(null),
    dataObito: Joi.date().allow(null),
    dataRemocao: Joi.date().allow(null),
    novoServico: Joi.string().trim().allow('', null),
    dataRetorno: Joi.date().allow(null),
    dataRelotacao: Joi.date().allow(null),
    dataDesligamento: Joi.date().allow(null),
    dataAfastamento: Joi.date().allow(null),
    tipoAfastamento: Joi.string().trim().allow('', null),
  }).optional(),
}).min(1);
