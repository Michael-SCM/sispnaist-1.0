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
    nomeMae: String,
    matricula: String,
    cartaoSus: String,
    celular: String,
    telefoneContato: String,
    email: {
      type: String,
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
    sexo: String,
    genero: String,
    raca: String,
    escolaridade: String,
    estadoCivil: String,
    tipoSanguineo: String,

    // Deficiência
    deficiencia: {
      tipo: String,
      tempo: String,
      grau: String,
    },

    // Vínculos e Situação
    vinculo: {
      tipo: String,
      outro: String,
      turno: String,
      jornada: String,
      jornadaOutro: String,
      situacao: String,
    },

    // Endereço
    endereco: {
      logradouro: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String,
    },

    // Dados do Trabalho
    trabalho: {
      dataPosse: Date,
      empresaTerceirizada: String,
      dataEntrada: Date,
      setor: String,
      cargo: String,
      funcao: String,
      ocupacao: String,
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
