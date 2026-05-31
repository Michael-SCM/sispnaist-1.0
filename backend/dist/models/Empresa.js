import mongoose, { Schema } from 'mongoose';
const EmpresaSchema = new Schema({
    razaoSocial: {
        type: String,
        required: [true, 'Razão social é obrigatória'],
    },
    nomeFantasia: String,
    cnpj: {
        type: String,
        required: [true, 'CNPJ é obrigatório'],
        unique: true,
        trim: true,
        match: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    },
    email: {
        type: String,
        lowercase: true,
        required: [true, 'E-mail é obrigatório'],
    },
    telefone: String,
    endereco: {
        logradouro: {
            type: String,
            required: [true, 'Logradouro é obrigatório'],
        },
        numero: {
            type: String,
            required: [true, 'Número é obrigatório'],
        },
        complemento: String,
        bairro: {
            type: String,
            required: [true, 'Bairro é obrigatório'],
        },
        cidade: {
            type: String,
            required: [true, 'Cidade é obrigatória'],
        },
        estado: {
            type: String,
            required: [true, 'Estado é obrigatório'],
        },
        cep: String,
    },
    ativa: {
        type: Boolean,
        default: true,
    },
}, {
    collection: 'empresas',
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' }
});
export default mongoose.model('Empresa', EmpresaSchema);
