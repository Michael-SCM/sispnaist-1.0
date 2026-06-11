import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para vínculos empregatícios detalhados do trabalhador.
 * Equivalente a: tb_trabalhador_vinculos no PHP original.
 */

export interface ITrabalhadorVinculo extends Document {
  trabalhadorId: mongoose.Types.ObjectId;
  empresa?: mongoose.Types.ObjectId;
  unidade?: mongoose.Types.ObjectId;
  tipoVinculo: string;
  funcao?: string;
  matricula: string;
  jornadaTrabalho: string;
  turnoTrabalho?: string;
  dataInicio: Date;
  dataPosse?: Date;
  dataFim?: Date;
  situacao?: string;
  empresaTerceirizada?: string;
  setor?: string;
  cargo?: string;
  ocupacao?: string;
  cargaHoraria?: number;
  salario?: number;
  insalubridadePericulosidade?: string;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface ITrabalhadorVinculoDocument extends ITrabalhadorVinculo {}

const TrabalhadorVinculoSchema = new Schema<ITrabalhadorVinculoDocument>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId as any, ref: 'Trabalhador', required: true, index: true },
    empresa: { type: Schema.Types.ObjectId as any, ref: 'Empresa' },
    unidade: { type: Schema.Types.ObjectId as any, ref: 'Unidade' },
    tipoVinculo: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, trim: true },
    funcao: { type: String, trim: true },
    jornadaTrabalho: { type: String, required: true, trim: true },
    turnoTrabalho: { type: String, trim: true },
    dataInicio: { type: Date, required: true },
    dataPosse: { type: Date },
    dataFim: { type: Date },
    situacao: { type: String, trim: true, default: 'Ativo' },
    empresaTerceirizada: { type: String, trim: true },
    setor: { type: String, trim: true },
    cargo: { type: String, trim: true },
    ocupacao: { type: String, trim: true },
    cargaHoraria: { type: Number, min: 1, max: 168 },
    salario: { type: Number, min: 0 },
    insalubridadePericulosidade: { type: String, trim: true },
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



