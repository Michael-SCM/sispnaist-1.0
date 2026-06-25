import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para ocorrências de violência envolvendo trabalhadores.
 * Equivalente a: tb_trabalhador_ocorrencia_violencia no PHP original.
 */

export interface ITrabalhadorOcorrenciaViolencia extends Document {
  trabalhadorId: mongoose.Types.ObjectId;
  dataOcorrencia: Date;
  localOcorrencia?: string;
  tipoViolencia: string;          // vinculado a tb_tipo_violencia
  tipoViolenciaSexual: string;    // vinculado a tb_tipo_violencia_sexual (se aplicável)
  isAssedio: boolean;             // true = assédio moral/sexual
  motivoViolencia: string;        // vinculado a tb_motivo_violencia
  meioAgressao: string;           // vinculado a tb_meio_agressao
  tipoAutorViolencia: string;     // vinculado a tb_tipo_autor_violencia
  frequenciaAssedio?: string;     // frequência do assédio
  testemunhas?: string;           // testemunhas do assédio
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

export interface ITrabalhadorOcorrenciaViolenciaDocument extends ITrabalhadorOcorrenciaViolencia {}

const TrabalhadorOcorrenciaViolenciaSchema = new Schema<ITrabalhadorOcorrenciaViolenciaDocument>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId as any, ref: 'Trabalhador', required: true, index: true },
    dataOcorrencia: { type: Date, required: true },
    localOcorrencia: { type: String, trim: true },
    tipoViolencia: { type: String, required: true },
    tipoViolenciaSexual: { type: String, default: '' },
    isAssedio: { type: Boolean, default: false },
    motivoViolencia: { type: String, default: '' },
    meioAgressao: { type: String, default: '' },
    tipoAutorViolencia: { type: String, default: '' },
    frequenciaAssedio: { type: String, trim: true },
    testemunhas: { type: String, trim: true },
    descricaoOcorrencia: { type: String, required: true },
    reincidencia: { type: Boolean, default: false },
    atendimentoRealizado: { type: String, required: true },
    condutaViolencia: { type: String, default: '' },
    pessoasEnvolvidas: { type: String, default: '' },
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


