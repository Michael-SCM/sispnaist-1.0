import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para vínculos empregatícios detalhados do trabalhador.
 * Equivalente a: tb_trabalhador_vinculos no PHP original.
 */

export interface ITrabalhadorVinculo extends Document {
  trabalhadorId: string;
  tipoVinculo: string;        // vinculado a tb_tipo_vinculo
  funcao?: string;            // vinculado a tb_funcao
  jornadaTrabalho?: string;   // vinculado a tb_jornada_trabalho
  turnoTrabalho?: string;     // vinculado a tb_turno_trabalho
  dataInicio: Date;
  dataFim?: Date;
  situacao?: string;          // Ativo, Afastado, Desligado, etc.
  empresaTerceirizada?: string;
  setor?: string;
  cargo?: string;
  ocupacao?: string;          // CBO
  cargaHoraria?: number;      // carga horária semanal
  salario?: number;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TrabalhadorVinculoSchema = new Schema<ITrabalhadorVinculo>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    tipoVinculo: { type: String, required: true, trim: true },
    funcao: { type: String, trim: true },
    jornadaTrabalho: { type: String, trim: true },
    turnoTrabalho: { type: String, trim: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    situacao: { type: String, trim: true, default: 'Ativo' },
    empresaTerceirizada: { type: String, trim: true },
    setor: { type: String, trim: true },
    cargo: { type: String, trim: true },
    ocupacao: { type: String, trim: true },
    cargaHoraria: { type: Number, min: 1, max: 168 },
    salario: { type: Number, min: 0 },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_vinculos'
  }
);

TrabalhadorVinculoSchema.index({ trabalhadorId: 1, dataInicio: -1 });
TrabalhadorVinculoSchema.index({ trabalhadorId: 1, ativo: 1 });

export default mongoose.model<ITrabalhadorVinculo>('TrabalhadorVinculo', TrabalhadorVinculoSchema);

