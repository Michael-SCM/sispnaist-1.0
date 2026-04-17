import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog {
  _id?: string;
  usuarioId?: string;
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  entidade: string;
  entidadeId: string;
  detalhes?: Record<string, any>;
  ip?: string;
  userAgent?: string;
  dataCriacao?: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    usuarioId: {
      type: String,
      index: true,
    },
    acao: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
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
  },
  {
    collection: 'audit_logs',
    timestamps: true,
  }
);

// Index composto para queries eficientes
AuditLogSchema.index({ entidade: 1, dataCriacao: -1 });
AuditLogSchema.index({ usuarioId: 1, dataCriacao: -1 });

export default mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
