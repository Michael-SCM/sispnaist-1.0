import mongoose, { Schema } from 'mongoose';
const QuestionarioItemSchema = new Schema({
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
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'questionario_itens'
});
QuestionarioItemSchema.index({ questionarioId: 1, ordem: 1 });
export default mongoose.model('QuestionarioItem', QuestionarioItemSchema);
