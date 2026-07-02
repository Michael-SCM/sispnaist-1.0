import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestao {
  pergunta: string;
  opcoes: string[];
  opcaoCorreta: number;
  ordem: number;
}

export interface IQuiz extends Document {
  titulo: string;
  descricao?: string;
  videoAulaId?: mongoose.Types.ObjectId;
  questoes: IQuestao[];
  pontuacaoMinima: number;
  tempoLimite?: number;
  tentativasPermitidas: number;
  ativo: boolean;
  ordem?: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const QuestaoSchema = new Schema<IQuestao>(
  {
    pergunta: { type: String, required: true, trim: true },
    opcoes: [{ type: String, required: true, trim: true }],
    opcaoCorreta: { type: Number, required: true, min: 0 },
    ordem: { type: Number, default: 0 }
  },
  { _id: false }
);

const QuizSchema = new Schema<IQuiz>(
  {
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    videoAulaId: { type: Schema.Types.ObjectId, ref: 'VideoAula' },
    questoes: { type: [QuestaoSchema], required: true, validate: [(v: IQuestao[]) => v.length > 0, 'Pelo menos uma questão é obrigatória'] },
    pontuacaoMinima: { type: Number, default: 70, min: 0, max: 100 },
    tempoLimite: { type: Number, min: 0 },
    tentativasPermitidas: { type: Number, default: 3, min: 0 },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'quizzes'
  }
);

QuizSchema.index({ videoAulaId: 1 });
QuizSchema.index({ ativo: 1, ordem: 1 });

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
