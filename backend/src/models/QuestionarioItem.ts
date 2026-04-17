import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para itens/perguntas de um questionário.
 * Equivalente a: tb_questionario_item no PHP original.
 */

export interface IQuestionarioItem extends Document {
  questionarioId: string;
  pergunta: string;
  tipoResposta: string;       // 'texto', 'unica', 'multipla', 'escala', 'data'
  obrigatorio: boolean;
  ordem: number;
  alternativas?: {
    valor: string;
    texto: string;
    pontuacao?: number;
  }[];
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const QuestionarioItemSchema = new Schema<IQuestionarioItem>(
  {
    questionarioId: { type: Schema.Types.ObjectId, ref: 'Questionario', required: true, index: true },
    pergunta: { type: String, required: true, trim: true },
    tipoResposta: { type: String, required: true, enum: ['texto', 'unica', 'multipla', 'escala', 'data'] },
    obrigatorio: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 },
    alternativas: [
      {
        valor: { type: String, required: true },
        texto: { type: String, required: true },
        pontuacao: { type: Number }
      }
    ],
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'questionario_itens'
  }
);

QuestionarioItemSchema.index({ questionarioId: 1, ordem: 1 });

export default mongoose.model<IQuestionarioItem>('QuestionarioItem', QuestionarioItemSchema);
