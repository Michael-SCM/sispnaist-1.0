import mongoose, { Document, Schema } from 'mongoose';

export interface ITrabalhadorInternacao extends Document {
  trabalhadorId: mongoose.Types.ObjectId;
  numeroAih: string;
  cnesHospital?: string;
  nomeHospital?: string;
  dataInternacao: Date;
  dataAlta?: Date;
  cidPrincipal?: string;
  descricaoCid?: string;
  caraterAtendimento?: string;
  valorTotalAih?: number;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorInternacaoSchema = new Schema<ITrabalhadorInternacao>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    numeroAih: { type: String, trim: true, required: true },
    cnesHospital: { type: String, trim: true },
    nomeHospital: { type: String, trim: true },
    dataInternacao: { type: Date, required: true },
    dataAlta: { type: Date },
    cidPrincipal: { type: String, trim: true },
    descricaoCid: { type: String, trim: true },
    caraterAtendimento: { type: String, trim: true },
    valorTotalAih: { type: Number },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_internacoes',
  }
);

TrabalhadorInternacaoSchema.index({ trabalhadorId: 1, dataInternacao: -1 });
TrabalhadorInternacaoSchema.index({ trabalhadorId: 1, ativo: 1 });
TrabalhadorInternacaoSchema.index({ numeroAih: 1 });

export default mongoose.model<ITrabalhadorInternacao>('TrabalhadorInternacao', TrabalhadorInternacaoSchema);
