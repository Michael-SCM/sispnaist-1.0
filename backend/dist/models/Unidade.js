import mongoose, { Schema } from 'mongoose';
const UnidadeSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'Nome da unidade é obrigatório'],
    },
    empresaId: {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'Empresa é obrigatória'],
    },
    endereco: {
        logradouro: String,
        numero: String,
        complemento: String,
        bairro: String,
        cidade: String,
        estado: String,
        cep: String,
    },
    gestor: String,
    ativa: {
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
}, { collection: 'unidades', timestamps: true });
UnidadeSchema.index({ empresaId: 1 });
export default mongoose.model('Unidade', UnidadeSchema);
//# sourceMappingURL=Unidade.js.map