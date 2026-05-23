import mongoose, { Schema } from 'mongoose';
const TrabalhadorDependenteSchema = new Schema({
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    nome: { type: String, required: true, trim: true },
    cpf: { type: String, trim: true },
    dataNascimento: { type: Date, required: true },
    parentesco: { type: String, required: true },
    dependentIR: { type: Boolean, default: false },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_dependentes'
});
TrabalhadorDependenteSchema.index({ trabalhadorId: 1, ativo: 1 });
export default mongoose.model('TrabalhadorDependente', TrabalhadorDependenteSchema);
