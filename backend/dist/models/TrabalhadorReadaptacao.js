import mongoose, { Schema } from 'mongoose';
const TrabalhadorReadaptacaoSchema = new Schema({
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    dataReadaptacao: { type: Date, required: true },
    motivo: { type: String, required: true },
    cid: { type: String, trim: true },
    mudancaSetor: { type: Boolean, default: false },
    setorOrigem: { type: String, required: true },
    setorReadaptacao: { type: String, required: true },
    mudancaFuncao: { type: Boolean, default: false },
    funcaoAnterior: { type: String, required: true },
    funcaoNova: { type: String, required: true },
    tempoReadaptacao: { type: String, required: true },
    restricao: { type: String, required: true },
    novasAtribuicoes: { type: String, required: true },
    acompanhamento: { type: String, required: true },
    grauSatisfacao: { type: String, required: true },
    laudoMedico: { type: String, trim: true },
    dataRetorno: { type: Date },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_readaptacoes'
});
TrabalhadorReadaptacaoSchema.index({ trabalhadorId: 1, dataReadaptacao: -1 });
export default mongoose.model('TrabalhadorReadaptacao', TrabalhadorReadaptacaoSchema);
