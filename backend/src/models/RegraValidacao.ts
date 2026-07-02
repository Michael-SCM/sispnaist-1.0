import mongoose, { Document, Schema } from 'mongoose';

export interface IRegraValidacao extends Document {
  nome: string;
  descricao?: string;
  entidade: 'trabalhador' | 'acidente' | 'doenca' | 'vacinacao' | 'empresa' | 'unidade';
  campo: string;
  tipoLocalidade: 'nacional' | 'uf' | 'municipio';
  ufs: string[];
  municipios: string[];
  tipoValidacao: 'obrigatorio' | 'regex' | 'min' | 'max' | 'enum' | 'lengthMin' | 'lengthMax' | 'personalizado';
  valorValidacao: string;
  mensagemErro: string;
  prioridade: number;
  ativo: boolean;
  dataInicioVigencia: Date;
  dataFimVigencia?: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const RegraValidacaoSchema = new Schema<IRegraValidacao>(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    entidade: {
      type: String,
      required: true,
      enum: ['trabalhador', 'acidente', 'doenca', 'vacinacao', 'empresa', 'unidade']
    },
    campo: { type: String, required: true, trim: true },
    tipoLocalidade: {
      type: String,
      required: true,
      enum: ['nacional', 'uf', 'municipio'],
      default: 'nacional'
    },
    ufs: [{ type: String, trim: true, uppercase: true, minlength: 2, maxlength: 2 }],
    municipios: [{ type: String, trim: true }],
    tipoValidacao: {
      type: String,
      required: true,
      enum: ['obrigatorio', 'regex', 'min', 'max', 'enum', 'lengthMin', 'lengthMax', 'personalizado']
    },
    valorValidacao: { type: String, required: true },
    mensagemErro: { type: String, required: true },
    prioridade: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
    dataInicioVigencia: { type: Date, default: Date.now },
    dataFimVigencia: { type: Date }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'regras_validacao'
  }
);

RegraValidacaoSchema.index({ entidade: 1, campo: 1 });
RegraValidacaoSchema.index({ ufs: 1 });
RegraValidacaoSchema.index({ ativo: 1, dataInicioVigencia: 1, dataFimVigencia: 1 });

export default mongoose.model<IRegraValidacao>('RegraValidacao', RegraValidacaoSchema);
