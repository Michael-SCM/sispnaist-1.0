import mongoose, { Schema } from 'mongoose';
const TrabalhadorProcessoTrabalhoSchema = new Schema({
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    setor: { type: String, required: true },
    cargo: { type: String, required: true },
    funcao: { type: String, required: true },
    jornadaTrabalho: { type: String, trim: true },
    turnoTrabalho: { type: String, trim: true },
    jornadaSemanal: { type: String, trim: true },
    questionarioId: { type: Schema.Types.ObjectId, ref: 'Questionario', required: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_processos_trabalho'
});
TrabalhadorProcessoTrabalhoSchema.index({ trabalhadorId: 1, dataInicio: -1 });
export default mongoose.model('TrabalhadorProcessoTrabalho', TrabalhadorProcessoTrabalhoSchema);
