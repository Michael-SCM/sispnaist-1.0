import mongoose, { Schema, Document } from 'mongoose';
import { IEmpresa } from '../types/index.js';

export interface IEmpresaDocument extends Omit<IEmpresa, '_id'>, Document {}

const EmpresaSchema = new Schema<IEmpresaDocument>(
  {
    razaoSocial: {
      type: String,
      required: [true, 'Razão social é obrigatória'],
    },
    nomeFantasia: String,
    cnpj: {
      type: String,
      required: [true, 'CNPJ é obrigatório'],
      unique: true,
      trim: true,
      match: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, 'E-mail é obrigatório'],
    },
    telefone: String,
    endereco: {
      logradouro: {
        type: String,
        required: [true, 'Logradouro é obrigatório'],
      },
      numero: {
        type: String,
        required: [true, 'Número é obrigatório'],
      },
      complemento: String,
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
      cep: String,
    },
    ativa: {
      type: Boolean,
      default: true,
    },
  },
  { 
    collection: 'empresas', 
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } 
  }
);

EmpresaSchema.index({ razaoSocial: 1 });

export default mongoose.model<IEmpresaDocument>('Empresa', EmpresaSchema);
