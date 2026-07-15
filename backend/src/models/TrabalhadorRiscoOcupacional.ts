import mongoose, { Document, Schema } from 'mongoose';

export interface ITrabalhadorRiscoOcupacional extends Document {
  trabalhadorId: mongoose.Types.ObjectId;
  vinculoId?: mongoose.Types.ObjectId;
  empresaId: mongoose.Types.ObjectId;
  unidadeId: mongoose.Types.ObjectId;
  categoria: string;
  tipoRisco: string;
  presente: boolean;
  observacao?: string;
  intensidade?: string;
  fonteGeradora?: string;
  frequenciaExposicao?: string;
  duracaoExposicao?: string;
  epcUtilizado?: boolean;
  epcDescricao?: string;
  epcEficaz?: string;
  epiUtilizado?: boolean;
  epiDescricao?: string;
  caEpis?: string[];
  epiEficaz?: boolean;
  medidasControle?: string;
  dataAvaliacao?: Date;
  avaliador?: string;
  tecnicaMedicao?: string;
  resultadoMedicao?: string;
  limiteTolerancia?: string;
  fatorRisco?: string;
  dataInicioExposicao?: Date;
  dataFimExposicao?: Date;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorRiscoOcupacionalSchema = new Schema<ITrabalhadorRiscoOcupacional>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    vinculoId: { type: Schema.Types.ObjectId, ref: 'TrabalhadorVinculo' },
    empresaId: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
    unidadeId: { type: Schema.Types.ObjectId, ref: 'Unidade', required: true },
    categoria: { type: String, required: true },
    tipoRisco: { type: String, required: true },
    presente: { type: Boolean, default: true },
    observacao: { type: String, trim: true },
    intensidade: { type: String, enum: ['baixo', 'medio', 'alto'] },
    fonteGeradora: { type: String, trim: true },
    frequenciaExposicao: { type: String, trim: true },
    duracaoExposicao: { type: String, trim: true },
    epcUtilizado: { type: Boolean, default: false },
    epcDescricao: { type: String, trim: true },
    epcEficaz: { type: String, trim: true },
    epiUtilizado: { type: Boolean, default: false },
    epiDescricao: { type: String, trim: true },
    caEpis: [{ type: String, trim: true }],
    epiEficaz: { type: Boolean, default: false },
    medidasControle: { type: String, trim: true },
    dataAvaliacao: { type: Date },
    avaliador: { type: String, trim: true },
    tecnicaMedicao: { type: String, trim: true },
    resultadoMedicao: { type: String, trim: true },
    limiteTolerancia: { type: String, trim: true },
    fatorRisco: { type: String, trim: true },
    dataInicioExposicao: { type: Date },
    dataFimExposicao: { type: Date },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_riscos_ocupacionais'
  }
);

TrabalhadorRiscoOcupacionalSchema.index({ trabalhadorId: 1, categoria: 1 });
TrabalhadorRiscoOcupacionalSchema.index({ vinculoId: 1 });

export default mongoose.model<ITrabalhadorRiscoOcupacional>('TrabalhadorRiscoOcupacional', TrabalhadorRiscoOcupacionalSchema);
