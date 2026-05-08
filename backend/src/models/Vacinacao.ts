import mongoose, { Schema, Document } from 'mongoose';
import { IVacinacao } from '../types/index.js';

export interface IVacinacaoDocument extends IVacinacao, Document {}

const VacinacaoSchema = new Schema<IVacinacaoDocument>(
  {
    trabalhadorId: {
      type: Schema.Types.ObjectId,
      ref: 'Trabalhador',
      required: [true, 'Trabalhador é obrigatório'],
    },
    vacina: {
      type: String,
      required: [true, 'Vacina é obrigatória'],
    },
    dataVacinacao: {
      type: Date,
      required: [true, 'Data da vacinação é obrigatória'],
    },
    proximoDose: Date,
    unidadeSaude: String,
    profissional: String,
    certificado: String,
  },
  { 
    collection: 'vacinacoes', 
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } 
  }
);

VacinacaoSchema.index({ trabalhadorId: 1, dataVacinacao: -1 });

export default mongoose.model<IVacinacaoDocument>('Vacinacao', VacinacaoSchema);
