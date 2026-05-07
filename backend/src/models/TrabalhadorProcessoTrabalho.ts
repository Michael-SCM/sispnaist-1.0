import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para processo de trabalho do trabalhador.
 * Equivalente a: tb_trabalhador_processo_trabalho no PHP original.
 */

export interface ITrabalhadorProcessoTrabalho extends Document {
  trabalhadorId: string;
  setor: string;
  cargo: string;
  funcao: string;
  jornadaTrabalho?: string;
  turnoTrabalho?: string;
  jornadaSemanal?: string;
  questionarioId?: string;
  dataInicio: Date;
  dataFim?: Date;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorProcessoTrabalhoSchema = new Schema<ITrabalhadorProcessoTrabalho>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    setor: { type: String, required: true },
    cargo: { type: String, required: true },
    funcao: { type: String, required: true },
    jornadaTrabalho: { type: String, trim: true },
    turnoTrabalho: { type: String, trim: true },
    jornadaSemanal: { type: String, trim: true },
    questionarioId: { type: Schema.Types.ObjectId, ref: 'Questionario' },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_processos_trabalho'
  }
);

TrabalhadorProcessoTrabalhoSchema.index({ trabalhadorId: 1, dataInicio: -1 });

export default mongoose.model<ITrabalhadorProcessoTrabalho>('TrabalhadorProcessoTrabalho', TrabalhadorProcessoTrabalhoSchema);
