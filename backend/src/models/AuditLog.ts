import mongoose, { Schema, Document } from 'mongoose';
import { calcularHashRegistro, GENESIS } from '../utils/auditHash.js';

export type AcaoAudit =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'READ'
  | 'EXPORT';

export type ResultadoAudit = 'sucesso' | 'falha' | 'negado';

export interface IAuditLog {
  _id?: string;
  usuarioId?: string;
  acao: AcaoAudit;
  entidade: string;
  entidadeId: string;
  /** Resultado da operação — sucesso | falha | negado. */
  resultado?: ResultadoAudit;
  /** Somente NOMES de campo alterados; nunca valores. */
  camposAlterados?: string[];
  /** Metadados redigidos (sem PII/credenciais/dados clínicos). */
  detalhes?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  sensivel?: boolean;
  /** Hash do registro anterior (encadeamento). */
  hashAnterior?: string;
  /** Hash sha256 deste registro incluindo hashAnterior. */
  hash?: string;
  dataCriacao?: Date;
}

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    usuarioId: {
      type: Schema.Types.ObjectId as any,
      ref: 'User',
      index: true,
    },
    acao: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'READ', 'EXPORT'],
      required: true,
    },
    entidade: {
      type: String,
      required: true,
      index: true,
    },
    entidadeId: {
      type: String,
      required: true,
      index: true,
    },
    resultado: {
      type: String,
      enum: ['sucesso', 'falha', 'negado'],
      default: 'sucesso',
    },
    camposAlterados: {
      type: [String],
      default: undefined,
    },
    detalhes: {
      type: Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    sensivel: {
      type: Boolean,
      default: false,
      index: true,
    },
    hashAnterior: {
      type: String,
    },
    hash: {
      type: String,
    },
  },
  {
    collection: 'audit_logs',
    timestamps: { createdAt: 'dataCriacao', updatedAt: false },
    minimize: false,
  }
);

// ---------------------------------------------------------------------------
// Imutabilidade: a aplicação não pode alterar nem apagar logs por acidente.
// A exclusão por retenção é feita deliberadamente pelo driver nativo
// (`mongoose.connection.db.collection('audit_logs').deleteMany`), fora dos hooks.
// ---------------------------------------------------------------------------
const operacoesMutacao = [
  'updateMany',
  'updateOne',
  'findOneAndUpdate',
  'findOneAndReplace',
  'replaceOne',
] as const;
for (const op of operacoesMutacao) {
  AuditLogSchema.pre(op as any, function () {
    throw new Error('Audit logs são imutáveis — operação de escrita bloqueada.');
  });
}

const operacoesDelete = ['deleteMany', 'deleteOne', 'findOneAndDelete'] as const;
for (const op of operacoesDelete) {
  AuditLogSchema.pre(op as any, function () {
    throw new Error('Audit logs são imutáveis — operação de exclusão bloqueada.');
  });
}

// ---------------------------------------------------------------------------
// Encadeamento: calcula ANTES da inserção para que nenhum registro seja
// gravado sem hash. Exige que o registro anterior seja lido — por isso as
// escritas são serializadas em `auditChain.criarComCadeia`.
// ---------------------------------------------------------------------------
AuditLogSchema.pre('save', async function (next) {
  try {
    if (!this.isNew) {
      return next();
    }

    if (!this.dataCriacao) {
      this.set('dataCriacao' as any, new Date(), { silent: true } as any);
    }

    const Modelo = mongoose.model<IAuditLogDocument>('AuditLog');
    const anterior = await Modelo.findOne(
      { _id: { $ne: this._id } },
      { hash: 1 }
    )
      .sort({ dataCriacao: -1, _id: -1 })
      .lean();

    const hashAnterior = (anterior as any)?.hash ?? GENESIS;

    // Round-trip JSON: o hash é calculado sobre o que VAI para o banco —
    // um `undefined` em memória que o Mongoose descarta mudaria o hash lido
    // depois e geraria quebra falsa na verificação.
    const plano = JSON.parse(JSON.stringify(this.toObject({ depopulate: true })));
    const hash = calcularHashRegistro(plano, hashAnterior);

    this.set('hashAnterior', hashAnterior);
    this.set('hash', hash);

    return next();
  } catch (err) {
    return next(err as Error);
  }
});

// ---------------------------------------------------------------------------
// Índices (nota: o campo de tempo é `dataCriacao`, não `createdAt`)
// ---------------------------------------------------------------------------
AuditLogSchema.index({ entidade: 1, dataCriacao: -1 });
AuditLogSchema.index({ usuarioId: 1, dataCriacao: -1 });
AuditLogSchema.index({ acao: 1 });
AuditLogSchema.index({ sensivel: 1, dataCriacao: -1 });
AuditLogSchema.index({ acao: 1, sensivel: 1, dataCriacao: -1 });
AuditLogSchema.index({ dataCriacao: 1 });

export default mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
