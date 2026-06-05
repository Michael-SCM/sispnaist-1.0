import mongoose, { Schema, Document } from 'mongoose';
import { IVacinacao } from '../types/index.js';

export interface IVacinacaoDocument extends Omit<IVacinacao, '_id' | 'trabalhadorId'>, Document {
  trabalhadorId: mongoose.Types.ObjectId;
}

const VacinacaoSchema = new Schema<IVacinacaoDocument>(
  {
    trabalhadorId: {
      type: Schema.Types.ObjectId as any,
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
VacinacaoSchema.index({ proximoDose: 1 });
VacinacaoSchema.index({ vacina: 1 });

export default mongoose.model<IVacinacaoDocument>('Vacinacao', VacinacaoSchema);
