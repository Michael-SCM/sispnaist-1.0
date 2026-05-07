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
  mudancaSetor: boolean;
  setorOrigem: string;
  setorReadaptacao: string;
  mudancaFuncao: boolean;
  funcaoAnterior: string;
  funcaoNova: string;
  tempoReadaptacao: string;    // temporário, definitivo, etc.
  restricao: string;
  novasAtribuicoes: string;
  acompanhamento: string;
  grauSatisfacao: string;
  laudoMedico?: string;
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
    mudancaSetor: { type: Boolean, default: false },
    setorOrigem: { type: String, required: true },
    setorReadaptacao: { type: String, required: true },
    mudancaFuncao: { type: Boolean, default: false },
    funcaoAnterior: { type: String, required: true },
    funcaoNova: { type: String, required: true },
    tempoReadaptacao: { type: String, required: true },
    restricao: { type: String, required: true },
    novasAtribuicoes: { type: String, required: true },
    acompanhamento: { type: String, required: true },
    grauSatisfacao: { type: String, required: true },
    laudoMedico: { type: String, trim: true },
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
