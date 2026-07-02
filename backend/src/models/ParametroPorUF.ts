import mongoose, { Document, Schema } from 'mongoose';

export interface IParametroPorUF extends Document {
  chave: string;
  valor: string;
  descricao?: string;
  uf: string;
  categoria?: string;
  tipo: string;
  ativo: boolean;
  dataInicioVigencia: Date;
  dataFimVigencia?: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const ParametroPorUFSchema = new Schema<IParametroPorUF>(
  {
    chave: { type: String, required: true, trim: true },
    valor: { type: String, required: true },
    descricao: { type: String, trim: true },
    uf: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2
    },
    categoria: { type: String, trim: true },
    tipo: { type: String, required: true, default: 'texto' },
    ativo: { type: Boolean, default: true },
    dataInicioVigencia: { type: Date, default: Date.now },
    dataFimVigencia: { type: Date }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'parametros_uf'
  }
);

ParametroPorUFSchema.index({ chave: 1, uf: 1 }, { unique: true });
ParametroPorUFSchema.index({ uf: 1, ativo: 1 });
ParametroPorUFSchema.index({ categoria: 1, uf: 1 });

export default mongoose.model<IParametroPorUF>('ParametroPorUF', ParametroPorUFSchema);
