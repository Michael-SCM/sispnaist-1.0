import mongoose, { Schema } from 'mongoose';
const AuditLogSchema = new Schema({
    usuarioId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
}, {
    collection: 'audit_logs',
    timestamps: true,
});
// Index composto para queries eficientes
AuditLogSchema.index({ entidade: 1, dataCriacao: -1 });
AuditLogSchema.index({ usuarioId: 1, dataCriacao: -1 });
export default mongoose.model('AuditLog', AuditLogSchema);
