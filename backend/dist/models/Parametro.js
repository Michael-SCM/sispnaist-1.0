import mongoose, { Schema } from 'mongoose';
const ParametroSchema = new Schema({
    chave: { type: String, required: true, unique: true, trim: true },
    valor: { type: String, required: true },
    descricao: { type: String, trim: true },
    categoria: { type: String, trim: true },
    tipo: { type: String, required: true, default: 'texto' }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'parametros'
});
ParametroSchema.index({ chave: 1, ativo: 1 });
export default mongoose.model('Parametro', ParametroSchema);
