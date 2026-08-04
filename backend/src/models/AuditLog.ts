import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export type AcaoAudit = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'READ' | 'EXPORT';

export interface IAuditLog {
  _id?: string;
  usuarioId?: string;
  acao: AcaoAudit;
  entidade: string;
  entidadeId: string;
  detalhes?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  sensivel?: boolean;
  hashAnterior?: string;
  dataCriacao?: Date;
}

export interface IAuditLogDocument extends Omit<IAuditLog, '_id'>, Document {}

function calcularHash(doc: any): string {
  const payload = JSON.stringify({
    usuarioId: doc.usuarioId?.toString?.() || doc.usuarioId,
    acao: doc.acao,
    entidade: doc.entidade,
    entidadeId: doc.entidadeId,
    createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
  });
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

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
  },
  {
    collection: 'audit_logs',
    timestamps: true,
  }
);

// Imutabilidade: bloquear updateMany, updateOne, findOneAndUpdate, findOneAndReplace
const operacoesMutacao = ['updateMany', 'updateOne', 'findOneAndUpdate', 'findOneAndReplace', 'replaceOne'];
for (const op of operacoesMutacao) {
  AuditLogSchema.pre(op, function () {
    throw new Error('Audit logs são imutáveis — operação de escrita bloqueada.');
  });
}

// Imutabilidade: bloquear deleteMany, deleteOne, findOneAndDelete
const operacoesDelete = ['deleteMany', 'deleteOne', 'findOneAndDelete'];
for (const op of operacoesDelete) {
  AuditLogSchema.pre(op, function () {
    throw new Error('Audit logs são imutáveis — operação de exclusão bloqueada.');
  });
}

// Gerar hash de cadeia após save
AuditLogSchema.post('save', function (doc) {
  try {
    const hash = calcularHash(doc);
    doc.set('hashAnterior', hash, { silent: true });
    doc.collection.updateOne({ _id: doc._id }, { $set: { hashAnterior: hash } }).catch(() => {});
  } catch {
    // Ignorar erros de hash — não deve interromper a operação principal
  }
});

// Index composto para queries eficientes
AuditLogSchema.index({ entidade: 1, createdAt: -1 });
AuditLogSchema.index({ usuarioId: 1, createdAt: -1 });
AuditLogSchema.index({ acao: 1 });
AuditLogSchema.index({ sensivel: 1, createdAt: -1 });
AuditLogSchema.index({ acao: 1, sensivel: 1, createdAt: -1 });

export default mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
