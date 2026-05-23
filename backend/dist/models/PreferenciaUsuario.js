import mongoose, { Schema } from 'mongoose';
const PreferenciaUsuarioSchema = new Schema({
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tema: { type: String, default: 'claro' },
    idioma: { type: String, default: 'pt-BR' },
    notificacoesEmail: { type: Boolean, default: true },
    notificacoesPush: { type: Boolean, default: false },
    dashboardPadrao: { type: String },
    itensPorPagina: { type: Number, default: 10 },
    ordenacaoPadrao: { type: String },
    dataUltimoAcesso: { type: Date }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'preferencias_usuario'
});
export default mongoose.model('PreferenciaUsuario', PreferenciaUsuarioSchema);
