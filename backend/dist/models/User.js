"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Empresa',
    },
    unidade: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    isVerified: {
        type: Boolean,
    },
    verificationToken: {
        type: String,
        select: false,
    },
    verificationTokenExpires: {
        type: Date,
        select: false,
        index: { expires: 0 }, // Índice TTL: o MongoDB exclui a conta automaticamente se passar de 24h sem verificação
    },
    refreshToken: {
        type: String,
        select: false,
    },
    refreshTokenExpires: {
        type: Date,
        select: false,
    },
}, {
    collection: 'usuarios',
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' }
});
// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('senha'))
        return next();
    try {
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs'))).then(m => m.default);
        const salt = await bcrypt.genSalt(10);
        const userDoc = this;
        userDoc.senha = await bcrypt.hash(userDoc.senha, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Method to compare password
UserSchema.methods.comparePassword = async function (password) {
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs'))).then(m => m.default);
    return bcrypt.compare(password, this.senha);
};
exports.default = mongoose_1.default.model('User', UserSchema);
