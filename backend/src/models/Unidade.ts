import mongoose, { Schema, Document } from 'mongoose';
import { IUnidade } from '../types/index.js';

export interface IUnidadeDocument extends Omit<IUnidade, '_id' | 'empresaId'>, Document {
  empresaId: mongoose.Types.ObjectId;
}

const UnidadeSchema = new Schema<IUnidadeDocument>(
  {
    nome: {
      type: String,
      required: [true, 'Nome da unidade é obrigatório'],
    },
    empresaId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Empresa',
      required: [true, 'Empresa é obrigatória'],
    },
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
    gestor: String,
    possuiPgr: {
      type: Boolean,
      default: false,
    },
    ativa: {
      type: Boolean,
      default: true,
    },
  },
  { 
    collection: 'unidades', 
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } 
  }
);

UnidadeSchema.index({ empresaId: 1 });
UnidadeSchema.index({ nome: 1 });

export default mongoose.model<IUnidadeDocument>('Unidade', UnidadeSchema);
