import mongoose, { Schema } from 'mongoose';
const TrabalhadorAfastamentoSchema = new Schema({
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    tipoAfastamento: { type: String, required: true },
    motivoAfastamento: { type: String, required: true },
    cid: { type: String, trim: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    dataRetorno: { type: Date, required: true },
    dataPericia: { type: Date, required: true },
    desfecho: { type: String, trim: true, required: true },
    tempoAfastamento: { type: String, trim: true, required: true },
    laudoMedico: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_afastamentos'
});
TrabalhadorAfastamentoSchema.index({ trabalhadorId: 1, dataInicio: -1 });
TrabalhadorAfastamentoSchema.index({ trabalhadorId: 1, ativo: 1 });
export default mongoose.model('TrabalhadorAfastamento', TrabalhadorAfastamentoSchema);
