import mongoose, { Schema } from 'mongoose';
const PadraoEmailSchema = new Schema({
    nome: { type: String, required: true, trim: true },
    assunto: { type: String, required: true, trim: true },
    conteudo: { type: String, required: true },
    categoria: { type: String, trim: true },
    variaveis: [{ type: String }],
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'padroes_email'
});
export default mongoose.model('PadraoEmail', PadraoEmailSchema);
