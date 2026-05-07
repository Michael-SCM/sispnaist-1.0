import mongoose, { Schema, Document } from 'mongoose';
import { ITrabalhador } from '../types/index.js';

export interface ITrabalhadorDocument extends ITrabalhador, Document {}

const TrabalhadorSchema = new Schema<ITrabalhadorDocument>(
  {
    cpf: {
      type: String,
      required: [true, 'CPF é obrigatório'],
      unique: true,
      trim: true,
      match: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'],
    },
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    nomeMae: {
      type: String,
      required: [true, 'Nome da mãe é obrigatório'],
      trim: true,
    },
    matricula: {
      type: String,
      required: [true, 'Matrícula é obrigatória'],
      trim: true,
    },
    cartaoSus: {
      type: String,
      required: [true, 'Cartão do SUS é obrigatório'],
      trim: true,
    },
    celular: {
      type: String,
      required: [true, 'Celular é obrigatório'],
      trim: true,
    },
    telefoneContato: {
      type: String,
      required: [true, 'Telefone de contato é obrigatório'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      trim: true,
      lowercase: true,
      match: [/^[\w\.-]+@[\w\.-]+\.\w+$/, 'Email inválido'],
    },
    dataNascimento: Date,

    // Vínculo com Empresa/Unidade
    empresa: {
      type: Schema.Types.ObjectId,
      ref: 'Empresa',
    },
    unidade: {
      type: Schema.Types.ObjectId,
      ref: 'Unidade',
    },

    // Dados Pessoais/Diversos
    sexo: {
      type: String,
      required: [true, 'Sexo é obrigatório'],
    },
    genero: {
      type: String,
      required: [true, 'Gênero é obrigatório'],
    },
    raca: {
      type: String,
      required: [true, 'Raça é obrigatória'],
    },
    escolaridade: {
      type: String,
      required: [true, 'Escolaridade é obrigatória'],
    },
    estadoCivil: {
      type: String,
      required: [true, 'Estado civil é obrigatório'],
    },
    tipoSanguineo: String,

    // Deficiência
    deficiencia: {
      tipo: String,
      tempo: String,
      grau: String,
    },

    // Vínculos e Situação
    vinculo: {
      tipo: {
        type: String,
        required: [true, 'Tipo de vínculo é obrigatório'],
      },
      outro: String,
      turno: {
        type: String,
        required: [true, 'Turno de trabalho é obrigatório'],
      },
      jornada: {
        type: String,
        required: [true, 'Jornada de trabalho é obrigatória'],
      },
      jornadaOutro: String,
      situacao: {
        type: String,
        required: [true, 'Situação do trabalho é obrigatória'],
      },
    },

    // Endereço
    endereco: {
      logradouro: {
        type: String,
        required: [true, 'Logradouro é obrigatório'],
      },
      numero: {
        type: String,
        required: [true, 'Número é obrigatório'],
      },
      complemento: {
        type: String,
        required: [true, 'Complemento é obrigatório'],
      },
      bairro: {
        type: String,
        required: [true, 'Bairro é obrigatório'],
      },
      cidade: {
        type: String,
        required: [true, 'Cidade é obrigatória'],
      },
      estado: {
        type: String,
        required: [true, 'Estado é obrigatório'],
      },
      cep: {
        type: String,
        required: [true, 'CEP é obrigatório'],
      },
    },

    // Dados do Trabalho
    trabalho: {
      dataPosse: Date,
      empresaTerceirizada: String,
      dataEntrada: {
        type: Date,
        required: [true, 'Data de entrada em serviço é obrigatória'],
      },
      setor: {
        type: String,
        required: [true, 'Setor de trabalho é obrigatório'],
      },
      cargo: {
        type: String,
        required: [true, 'Cargo é obrigatório'],
      },
      funcao: {
        type: String,
        required: [true, 'Função é obrigatória'],
      },
      ocupacao: {
        type: String,
        required: [true, 'Ocupação é obrigatória'],
      },
    },

    // Histórico e Eventos
    historico: {
      dataAposentadoria: Date,
      dataObito: Date,
      dataRemocao: Date,
      novoServico: String,
      dataRetorno: Date,
      dataRelotacao: Date,
      dataDesligamento: Date,
      dataAfastamento: Date,
      tipoAfastamento: String,
    },

    dataCriacao: {
      type: Date,
      default: Date.now,
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'trabalhadores', timestamps: true }
);

export default mongoose.model<ITrabalhadorDocument>('Trabalhador', TrabalhadorSchema);
