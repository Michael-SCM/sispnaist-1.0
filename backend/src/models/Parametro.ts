import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para parâmetros/configurações gerais do sistema.
 * Equivalente a: tb_parametro no PHP original.
 */

export interface IParametro extends Document {
  chave: string;              // 'prazo_acidente', 'dias_alerta_vacina', 'horario_inicio', etc.
  valor: string;              // valor do parâmetro
  descricao?: string;
  categoria?: string;         // 'acidente', 'vacinacao', 'geral', etc.
  tipo: string;               // 'texto', 'numero', 'data', 'hora', 'boolean', 'json'
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const ParametroSchema = new Schema<IParametro>(
  {
    chave: { type: String, required: true, unique: true, trim: true },
    valor: { type: String, required: true },
    descricao: { type: String, trim: true },
    categoria: { type: String, trim: true },
    tipo: { type: String, required: true, default: 'texto' }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'parametros'
  }
);

ParametroSchema.index({ chave: 1, ativo: 1 });

export default mongoose.model<IParametro>('Parametro', ParametroSchema);
