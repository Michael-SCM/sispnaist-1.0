import mongoose, { Document, Schema } from 'mongoose';

export interface IHabilitacaoPnaist extends Document {
  municipio: string;
  uf: string;
  dataHabilitacao: Date;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const HabilitacaoPnaistSchema = new Schema<IHabilitacaoPnaist>(
  {
    municipio: { type: String, required: true, trim: true },
    uf: { type: String, required: true, trim: true, uppercase: true },
    dataHabilitacao: { type: Date, default: Date.now },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'habilitacao_pnaist',
  }
);

HabilitacaoPnaistSchema.index({ municipio: 1, uf: 1 }, { unique: true });
HabilitacaoPnaistSchema.index({ uf: 1 });

export default mongoose.model<IHabilitacaoPnaist>('HabilitacaoPnaist', HabilitacaoPnaistSchema);
