import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/index.js';

export interface IPasswordHistoryEntry {
  hash: string;
  dataAlteracao: Date;
}

export interface IUserDocument extends Omit<IUser, '_id' | 'empresa' | 'unidade' | 'senha'>, Document {
  empresa?: mongoose.Types.ObjectId;
  unidade?: mongoose.Types.ObjectId;
  senha?: string;
  refreshToken?: string;
  refreshTokenExpires?: Date;
  tokenVersion?: number;
  passwordHistory?: IPasswordHistoryEntry[];
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>(
  {
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
      minlength: 8,
      maxlength: 20,
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
      type: Schema.Types.ObjectId as any,
      ref: 'Empresa',
    },
    unidade: {
      type: Schema.Types.ObjectId as any,
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
    },
    refreshToken: {
      type: String,
      select: false,
    },
    refreshTokenExpires: {
      type: Date,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 1,
    },
    passwordHistory: {
      type: [{
        hash: { type: String, required: true },
        dataAlteracao: { type: Date, default: Date.now },
      }],
      select: false,
      default: [],
    },
    // LGPD
    consentimentoLGPD: {
      type: Boolean,
      default: false,
    },
    dataAceiteLGPD: {
      type: Date,
    },
    versaoTermo: {
      type: String,
      default: '1.0',
    },
    dataSolicitacaoExclusao: {
      type: Date,
    },
    anonimizado: {
      type: Boolean,
      default: false,
    },
    dataAnonimizacao: {
      type: Date,
    },
  },
  { 
    collection: 'usuarios', 
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } 
  }
);

UserSchema.index({ nome: 1 });
UserSchema.index({ perfil: 1 });
UserSchema.index(
  { dataCriacao: 1 },
  {
    expireAfterSeconds: 30 * 24 * 60 * 60,
    partialFilterExpression: { isVerified: false },
  }
);

// TTL index: dados anonimizados são automaticamente deletados após 5 anos
UserSchema.index(
  { dataAnonimizacao: 1 },
  {
    expireAfterSeconds: 5 * 365 * 24 * 60 * 60,
    partialFilterExpression: { anonimizado: true },
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();

  try {
    const bcrypt = await import('bcryptjs').then(m => m.default);
    const salt = await bcrypt.genSalt(10);
    const userDoc = this as any;
    userDoc.senha = await bcrypt.hash(userDoc.senha, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  const bcrypt = await import('bcryptjs').then(m => m.default);
  return bcrypt.compare(password, this.senha);
};

export default mongoose.model<IUserDocument>('User', UserSchema);
