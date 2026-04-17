import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para readaptação funcional do trabalhador.
 * Equivalente a: tb_trabalhador_readaptacao no PHP original.
 */

export interface ITrabalhadorReadaptacao extends Document {
  trabalhadorId: string;
  dataReadaptacao: Date;
  motivo: string;
  cid?: string;
  atividadeAnterior?: string;
  atividadeAtual?: string;
  laudoMedico?: string;
  tempoReadaptacao?: string;    // temporário, definitivo, etc.
  dataRetorno?: Date;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorReadaptacaoSchema = new Schema<ITrabalhadorReadaptacao>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    dataReadaptacao: { type: Date, required: true },
    motivo: { type: String, required: true },
    cid: { type: String, trim: true },
    atividadeAnterior: { type: String, trim: true },
    atividadeAtual: { type: String, trim: true },
    laudoMedico: { type: String, trim: true },
    tempoReadaptacao: { type: String, trim: true },
    dataRetorno: { type: Date },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_readaptacoes'
  }
);

TrabalhadorReadaptacaoSchema.index({ trabalhadorId: 1, dataReadaptacao: -1 });

export default mongoose.model<ITrabalhadorReadaptacao>('TrabalhadorReadaptacao', TrabalhadorReadaptacaoSchema);
