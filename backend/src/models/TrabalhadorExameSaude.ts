import mongoose, { Document, Schema } from 'mongoose';

export interface ITrabalhadorExameSaude extends Document {
  trabalhadorId: mongoose.Types.ObjectId;
  numeroAso?: string;
  dataAso: Date;
  dataValidadeAso?: Date;
  tipoAso: string;
  medicoNome: string;
  medicoCRM: string;
  medicoUFCrm?: string;
  resultado: string;
  observacaoMedica?: string;
  examesRealizados?: string[];
  riscosOcupacionais?: string[];
  medicoPcmsmoNome?: string;
  medicoPcmsmoCrm?: string;
  arquivoAso?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorExameSaudeSchema = new Schema<ITrabalhadorExameSaude>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    numeroAso: { type: String, trim: true },
    dataAso: { type: Date, required: true },
    dataValidadeAso: { type: Date },
    tipoAso: {
      type: String,
      required: true,
      enum: ['admissional', 'periodico', 'retorno', 'mudanca', 'demissional'],
    },
    medicoNome: { type: String, trim: true, required: true },
    medicoCRM: { type: String, trim: true, required: true },
    medicoUFCrm: { type: String, trim: true },
    resultado: {
      type: String,
      required: true,
      enum: ['apto', 'inapto', 'apto_com_restricoes'],
    },
    observacaoMedica: { type: String, trim: true },
    examesRealizados: [{ type: String, trim: true }],
    riscosOcupacionais: [{ type: String, trim: true }],
    medicoPcmsmoNome: { type: String, trim: true },
    medicoPcmsmoCrm: { type: String, trim: true },
    arquivoAso: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_exames_saude',
  }
);

TrabalhadorExameSaudeSchema.index({ trabalhadorId: 1, dataAso: -1 });
TrabalhadorExameSaudeSchema.index({ trabalhadorId: 1, ativo: 1 });

export default mongoose.model<ITrabalhadorExameSaude>('TrabalhadorExameSaude', TrabalhadorExameSaudeSchema);
