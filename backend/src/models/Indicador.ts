import mongoose, { Document, Schema } from 'mongoose';

export type TipoFormula = 'simple' | 'percentage' | 'ratio' | 'difference';

export interface IFormulaIndicador {
  type: TipoFormula;
  metric?: string;
  numerator?: string;
  denominator?: string;
  metric1?: string;
  metric2?: string;
}

export interface IIndicador extends Document {
  nome: string;
  descricao?: string;
  categoria: string;
  tipo: 'quantitativo' | 'percentual';
  formula: IFormulaIndicador;
  meta?: number;
  unidade?: string;
  periodicidade: 'mensal' | 'trimestral' | 'semestral' | 'anual';
  uf?: string;
  icone: string;
  cor: string;
  ordem: number;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const IndicadorSchema = new Schema<IIndicador>(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    categoria: {
      type: String,
      required: true,
      enum: ['acidente', 'doenca', 'vacinacao', 'absenteismo', 'geral']
    },
    tipo: {
      type: String,
      required: true,
      enum: ['quantitativo', 'percentual']
    },
    formula: {
      type: Schema.Types.Mixed,
      required: true
    },
    meta: { type: Number },
    unidade: { type: String, trim: true },
    periodicidade: {
      type: String,
      required: true,
      enum: ['mensal', 'trimestral', 'semestral', 'anual'],
      default: 'mensal'
    },
    uf: {
      type: String,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2
    },
    icone: { type: String, default: '📊' },
    cor: {
      type: String,
      enum: ['blue', 'green', 'red', 'yellow', 'purple', 'orange'],
      default: 'blue'
    },
    ordem: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'indicadores'
  }
);

IndicadorSchema.index({ ativo: 1, ordem: 1 });
IndicadorSchema.index({ categoria: 1, ativo: 1 });
IndicadorSchema.index({ uf: 1, ativo: 1 });

export default mongoose.model<IIndicador>('Indicador', IndicadorSchema);
