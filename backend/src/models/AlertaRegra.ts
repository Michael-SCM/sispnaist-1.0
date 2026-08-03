import mongoose, { Document, Schema } from 'mongoose';
import { TipoAlerta, NivelAlerta } from './Alerta.js';

export type ParametroCondicao =
  | 'quantidadeAcidentes'
  | 'diasAntesVencimento'
  | 'variacaoPercentual'
  | 'periodoAcidentes';

/**
 * Regra configurável de geração de alertas.
 * Cada regra define um tipo de alerta, um limiar/condição e o escopo (empresa/unidade/UF).
 */
export interface ICondicaoAlerta {
  parametro: ParametroCondicao;
  operador: '>=' | '>' | '<' | '<=' | '==';
  valor: number;
}

export interface IAlertaRegra extends Document {
  _id: mongoose.Types.ObjectId;
  nome: string;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  condicao: ICondicaoAlerta;
  janelaDias: number;          // janela atual (ex.: picos nos últimos N dias)
  periodoAnteriorDias: number; // período de comparação (ex.: N dias anteriores)
  empresaId?: mongoose.Types.ObjectId;
  unidadeId?: mongoose.Types.ObjectId;
  ufs?: string[];
  municipios?: string[];
  notificarEmail: boolean;
  descricao?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const AlertaRegraSchema = new Schema<IAlertaRegra>(
  {
    nome: { type: String, required: true, trim: true },
    tipo: {
      type: String,
      enum: ['PICO_ACIDENTES', 'VACINA_VENCENDO', 'NAO_CONFORMIDADE', 'MONITORAMENTO_CRITICO'],
      required: true,
    },
    nivel: {
      type: String,
      enum: ['baixo', 'medio', 'alto'],
      default: 'medio',
    },
    condicao: {
      parametro: {
        type: String,
        enum: ['quantidadeAcidentes', 'diasAntesVencimento', 'variacaoPercentual', 'periodoAcidentes'],
        required: true,
      },
      operador: {
        type: String,
        enum: ['>=', '>', '<', '<=', '=='],
        default: '>=',
      },
      valor: { type: Number, required: true },
    },
    janelaDias: { type: Number, default: 7 },
    periodoAnteriorDias: { type: Number, default: 7 },
    empresaId: { type: Schema.Types.ObjectId as any, ref: 'Empresa' },
    unidadeId: { type: Schema.Types.ObjectId as any, ref: 'Unidade' },
    ufs: [{ type: String, trim: true }],
    municipios: [{ type: String, trim: true }],
    notificarEmail: { type: Boolean, default: true },
    descricao: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'alertas_regras',
  }
);

AlertaRegraSchema.index({ tipo: 1, ativo: 1 });
AlertaRegraSchema.index({ empresaId: 1, ativo: 1 });

export default mongoose.model<IAlertaRegra>('AlertaRegra', AlertaRegraSchema);