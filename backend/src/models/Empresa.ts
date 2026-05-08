import mongoose, { Schema, Document } from 'mongoose';
import { IEmpresa } from '../types/index.js';

export interface IEmpresaDocument extends IEmpresa, Document {}

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
    },
    telefone: String,
    endereco: {
      logradouro: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
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

export default mongoose.model<IEmpresaDocument>('Empresa', EmpresaSchema);
