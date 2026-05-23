import mongoose, { Schema } from 'mongoose';
const QuestionarioSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    tipo: { type: String, required: true },
    ativo: { type: Boolean, default: true },
    dataInicio: { type: Date },
    dataFim: { type: Date },
    criadoPor: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'questionarios'
});
export default mongoose.model('Questionario', QuestionarioSchema);
