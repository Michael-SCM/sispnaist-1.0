import mongoose, { Schema } from 'mongoose';
const VacinacaoSchema = new Schema({
    trabalhadorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trabalhador é obrigatório'],
    },
    vacina: {
        type: String,
        required: [true, 'Vacina é obrigatória'],
    },
    dataVacinacao: {
        type: Date,
        required: [true, 'Data da vacinação é obrigatória'],
    },
    proximoDose: Date,
    unidadeSaude: String,
    profissional: String,
    certificado: String,
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'vacinacoes', timestamps: true });
VacinacaoSchema.index({ trabalhadorId: 1, dataVacinacao: -1 });
export default mongoose.model('Vacinacao', VacinacaoSchema);
//# sourceMappingURL=Vacinacao.js.map