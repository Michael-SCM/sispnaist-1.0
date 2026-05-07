import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para ocorrências de violência envolvendo trabalhadores.
 * Equivalente a: tb_trabalhador_ocorrencia_violencia no PHP original.
 */

export interface ITrabalhadorOcorrenciaViolencia extends Document {
  trabalhadorId: string;
  dataOcorrencia: Date;
  localOcorrencia?: string;
  tipoViolencia: string;          // vinculado a tb_tipo_violencia
  tipoViolenciaSexual: string;    // vinculado a tb_tipo_violencia_sexual (se aplicável)
  motivoViolencia: string;        // vinculado a tb_motivo_violencia
  meioAgressao: string;           // vinculado a tb_meio_agressao
  tipoAutorViolencia: string;     // vinculado a tb_tipo_autor_violencia
  descricaoOcorrencia: string;
  reincidencia: boolean;
  atendimentoRealizado: string;
  condutaViolencia: string;
  pessoasEnvolvidas?: string;
  emissaoCatNas: boolean;
  boletimOcorrencia?: string;     // número do BO
  medidasTomadas?: string;
  acompanhamentos?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorOcorrenciaViolenciaSchema = new Schema<ITrabalhadorOcorrenciaViolencia>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    dataOcorrencia: { type: Date, required: true },
    localOcorrencia: { type: String, trim: true },
    tipoViolencia: { type: String, required: true },
    tipoViolenciaSexual: { type: String, required: true },
    motivoViolencia: { type: String, required: true },
    meioAgressao: { type: String, required: true },
    tipoAutorViolencia: { type: String, required: true },
    descricaoOcorrencia: { type: String, required: true },
    reincidencia: { type: Boolean, default: false },
    atendimentoRealizado: { type: String, required: true },
    condutaViolencia: { type: String, required: true },
    pessoasEnvolvidas: { type: String, required: true },
    emissaoCatNas: { type: Boolean, default: false },
    boletimOcorrencia: { type: String, trim: true },
    medidasTomadas: { type: String, trim: true },
    acompanhamentos: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_ocorrencias_violencia'
  }
);

TrabalhadorOcorrenciaViolenciaSchema.index({ trabalhadorId: 1, dataOcorrencia: -1 });

export default mongoose.model<ITrabalhadorOcorrenciaViolencia>('TrabalhadorOcorrenciaViolencia', TrabalhadorOcorrenciaViolenciaSchema);
