import mongoose, { Document, Schema } from 'mongoose';

export interface ITentativaQuiz {
  tentativa: number;
  pontuacao: number;
  respostas: number[];
  questoesSelecionadas?: number[];
  dataRealizacao: Date;
}

export interface ISessaoAtiva {
  questoesSelecionadas: number[];
  dataInicio: Date;
}

export interface IProgressoTreinamento extends Document {
  usuarioId: mongoose.Types.ObjectId;
  videoAulaId: mongoose.Types.ObjectId;
  assistido: boolean;
  dataUltimaVisualizacao?: Date;
  quizRealizado: boolean;
  quizAprovado: boolean;
  tentativasQuiz: ITentativaQuiz[];
  melhormaPontuacao?: number;
  certificadoEmitido: boolean;
  dataConclusao?: Date;
  favorito: boolean;
  sessaoAtiva?: ISessaoAtiva;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const TentativaQuizSchema = new Schema<ITentativaQuiz>(
  {
    tentativa: { type: Number, required: true },
    pontuacao: { type: Number, required: true, min: 0, max: 100 },
    respostas: [{ type: Number }],
    questoesSelecionadas: [{ type: Number }],
    dataRealizacao: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ProgressoTreinamentoSchema = new Schema<IProgressoTreinamento>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoAulaId: { type: Schema.Types.ObjectId, ref: 'VideoAula', required: true },
    assistido: { type: Boolean, default: false },
    dataUltimaVisualizacao: { type: Date },
    quizRealizado: { type: Boolean, default: false },
    quizAprovado: { type: Boolean, default: false },
    tentativasQuiz: [TentativaQuizSchema],
    melhormaPontuacao: { type: Number, min: 0, max: 100 },
    certificadoEmitido: { type: Boolean, default: false },
    dataConclusao: { type: Date },
    favorito: { type: Boolean, default: false },
    sessaoAtiva: {
      type: {
        questoesSelecionadas: [{ type: Number }],
        dataInicio: { type: Date, default: Date.now }
      },
      required: false
    }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'treinamento_progressos'
  }
);

ProgressoTreinamentoSchema.index({ usuarioId: 1, videoAulaId: 1 }, { unique: true });
ProgressoTreinamentoSchema.index({ usuarioId: 1, assistido: 1 });

export default mongoose.model<IProgressoTreinamento>('ProgressoTreinamento', ProgressoTreinamentoSchema);
