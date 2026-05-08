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
    .min(6)
    .required()
    .messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
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
  novaSenha: Joi.string().min(6).required().messages({
    'string.min': 'A nova senha deve ter pelo menos 6 caracteres',
    'any.required': 'A nova senha é obrigatória',
  }),
  confirmarSenha: Joi.string().valid(Joi.ref('novaSenha')).required().messages({
    'any.only': 'As senhas não conferem',
    'any.required': 'Confirmação de senha é obrigatória',
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
  tipoTrauma: Joi.string().trim().max(100).optional(),
  agenteCausador: Joi.string().trim().max(100).optional(),
  parteCorpo: Joi.string().trim().max(100).optional(),
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
  estado: Joi.string().trim().max(2).optional(),
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
  estado: Joi.string().trim().max(2).optional(),
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
  nomeMae: Joi.string().trim().allow('', null),
  matricula: Joi.string().trim().allow('', null),
  cartaoSus: Joi.string().trim().allow('', null),
  celular: Joi.string().trim().allow('', null),
  telefoneContato: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  dataNascimento: Joi.date().optional(),
  sexo: Joi.string().trim().allow('', null),
  genero: Joi.string().trim().allow('', null),
  raca: Joi.string().trim().allow('', null),
  escolaridade: Joi.string().trim().allow('', null),
  estadoCivil: Joi.string().trim().allow('', null),
  tipoSanguineo: Joi.string().trim().allow('', null),
  deficiencia: Joi.object({
    tipo: Joi.string().trim().allow('', null),
    tempo: Joi.string().trim().allow('', null),
    grau: Joi.string().trim().allow('', null),
  }).optional(),
  empresa: Joi.string().trim().allow('', null),
  unidade: Joi.string().trim().allow('', null),
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
  nomeMae: Joi.string().trim().allow('', null),
  matricula: Joi.string().trim().allow('', null),
  cartaoSus: Joi.string().trim().allow('', null),
  celular: Joi.string().trim().allow('', null),
  telefoneContato: Joi.string().trim().allow('', null),
  email: Joi.string().email().allow('', null),
  dataNascimento: Joi.date().optional(),
  sexo: Joi.string().trim().allow('', null),
  genero: Joi.string().trim().allow('', null),
  raca: Joi.string().trim().allow('', null),
  escolaridade: Joi.string().trim().allow('', null),
  estadoCivil: Joi.string().trim().allow('', null),
  tipoSanguineo: Joi.string().trim().allow('', null),
  deficiencia: Joi.object({
    tipo: Joi.string().trim().allow('', null),
    tempo: Joi.string().trim().allow('', null),
    grau: Joi.string().trim().allow('', null),
  }).optional(),
  empresa: Joi.string().trim().allow('', null),
  unidade: Joi.string().trim().allow('', null),
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
