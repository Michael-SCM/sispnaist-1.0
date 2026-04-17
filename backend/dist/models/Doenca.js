import mongoose, { Schema } from 'mongoose';
const DoencaSchema = new Schema({
    dataInicio: {
        type: Date,
        required: [true, 'Data de início é obrigatória'],
    },
    dataFim: Date,
    trabalhadorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trabalhador é obrigatório'],
    },
    codigoDoenca: {
        type: String,
        required: [true, 'Código da doença é obrigatório'],
    },
    nomeDoenca: {
        type: String,
        required: [true, 'Nome da doença é obrigatório'],
    },
    relatoClinico: String,
    profissionalSaude: String,
    ativo: {
        type: Boolean,
        default: true,
    },
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'doencas', timestamps: true });
DoencaSchema.index({ trabalhadorId: 1, dataInicio: -1 });
export default mongoose.model('Doenca', DoencaSchema);
//# sourceMappingURL=Doenca.js.map