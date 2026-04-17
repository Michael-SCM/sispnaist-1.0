import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para questionários.
 * Equivalente a: tb_questionario no PHP original.
 */

export interface IQuestionario extends Document {
  nome: string;
  descricao?: string;
  tipo: string;               // 'avaliacao', 'satisfacao', 'saude', 'outro'
  ativo: boolean;
  dataInicio?: Date;
  dataFim?: Date;
  criadoPor?: string;         // ObjectId do User
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const QuestionarioSchema = new Schema<IQuestionario>(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    tipo: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    dataInicio: { type: Date },
    dataFim: { type: Date },
    criadoPor: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'questionarios'
  }
);

export default mongoose.model<IQuestionario>('Questionario', QuestionarioSchema);
