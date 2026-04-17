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
    },
    telefone: String,
    endereco: {
        logradouro: String,
        numero: String,
        complemento: String,
        bairro: String,
        cidade: String,
        estado: String,
        cep: String,
    },
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
}, { collection: 'empresas', timestamps: true });
export default mongoose.model('Empresa', EmpresaSchema);
//# sourceMappingURL=Empresa.js.map