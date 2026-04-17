import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema({
    cpf: {
        type: String,
        required: [true, 'CPF é obrigatório'],
        unique: true,
        trim: true,
        match: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    },
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email é obrigatório'],
        unique: true,
        lowercase: true,
        match: /^[\w\.-]+@[\w\.-]+\.\w+$/,
    },
    senha: {
        type: String,
        required: [true, 'Senha é obrigatória'],
        select: false,
        minlength: 6,
    },
    matricula: {
        type: String,
        unique: true,
        sparse: true,
    },
    dataNascimento: Date,
    sexo: {
        type: String,
        enum: ['M', 'F'],
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
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'Empresa',
    },
    unidade: {
        type: Schema.Types.ObjectId,
        ref: 'Unidade',
    },
    departamento: String,
    cargo: String,
    dataAdmissao: Date,
    perfil: {
        type: String,
        enum: ['admin', 'gestor', 'trabalhador', 'saude'],
        default: 'trabalhador',
    },
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
}, { collection: 'usuarios', timestamps: true });
// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('senha'))
        return next();
    try {
        const bcrypt = await import('bcryptjs').then(m => m.default);
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
UserSchema.methods.comparePassword = async function (password) {
    const bcrypt = await import('bcryptjs').then(m => m.default);
    return bcrypt.compare(password, this.senha);
};
export default mongoose.model('User', UserSchema);
//# sourceMappingURL=User.js.map