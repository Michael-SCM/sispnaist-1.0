import mongoose, { Document, Schema } from 'mongoose';

export interface ITrabalhadorHistoricoPPP extends Document {
  trabalhadorId: mongoose.Types.ObjectId;

  // Período
  dataInicio: Date;
  dataFim?: Date;

  // Vínculo na época
  empresa: string;
  cargo: string;
  funcao: string;
  setor: string;

  // Atividades
  descricaoAtividades: string;

  // Exposição a Agentes Nocivos
  agentesQuimicos: string;
  agentesFisicos: string;
  agentesBiologicos: string;
  agentesErgonomicos: string;

  // Monitoramento Ambiental
  tecnicaMedicao: string;
  resultadoMedicao: string;
  limiteTolerancia: string;

  // EPC/EPI
  epcEficaz: boolean;
  epiEficaz: boolean;

  // LTCAT
  ltcatNumero: string;
  dataLtcat: Date;

  // Responsável Técnico
  responsavelNome: string;
  responsavelRegistro: string;

  // Exames Médicos Ocupacionais
  dataExameMedico: Date;
  resultadoExame: string;

  observacoes: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface ITrabalhadorHistoricoPPPDocument extends ITrabalhadorHistoricoPPP {}

const TrabalhadorHistoricoPPPSchema = new Schema<ITrabalhadorHistoricoPPPDocument>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId as any, ref: 'Trabalhador', required: true, index: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    empresa: { type: String, trim: true, required: true },
    cargo: { type: String, trim: true, required: true },
    funcao: { type: String, trim: true },
    setor: { type: String, trim: true, required: true },
    descricaoAtividades: { type: String, trim: true },
    agentesQuimicos: { type: String, trim: true },
    agentesFisicos: { type: String, trim: true },
    agentesBiologicos: { type: String, trim: true },
    agentesErgonomicos: { type: String, trim: true },
    tecnicaMedicao: { type: String, trim: true },
    resultadoMedicao: { type: String, trim: true },
    limiteTolerancia: { type: String, trim: true },
    epcEficaz: { type: Boolean, default: false },
    epiEficaz: { type: Boolean, default: false },
    ltcatNumero: { type: String, trim: true },
    dataLtcat: { type: Date },
    responsavelNome: { type: String, trim: true },
    responsavelRegistro: { type: String, trim: true },
    dataExameMedico: { type: Date },
    resultadoExame: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_historico_ppp',
  }
);

TrabalhadorHistoricoPPPSchema.index({ trabalhadorId: 1, dataInicio: -1 });
TrabalhadorHistoricoPPPSchema.index({ trabalhadorId: 1, ativo: 1 });

export default mongoose.model<ITrabalhadorHistoricoPPP>('TrabalhadorHistoricoPPP', TrabalhadorHistoricoPPPSchema);
