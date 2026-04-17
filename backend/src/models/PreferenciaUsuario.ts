import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para preferências de cada usuário.
 * Equivalente a: tb_preferencia_usuario no PHP original.
 */

export interface IPreferenciaUsuario extends Document {
  usuarioId: string;          // ObjectId do User
  tema?: string;              // 'claro', 'escuro'
  idioma?: string;            // 'pt-BR', 'en'
  notificacoesEmail?: boolean;
  notificacoesPush?: boolean;
  dashboardPadrao?: string;   // 'admin', 'trabalhador'
  itensPorPagina?: number;
  ordenacaoPadrao?: string;
  dataUltimoAcesso?: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const PreferenciaUsuarioSchema = new Schema<IPreferenciaUsuario>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tema: { type: String, default: 'claro' },
    idioma: { type: String, default: 'pt-BR' },
    notificacoesEmail: { type: Boolean, default: true },
    notificacoesPush: { type: Boolean, default: false },
    dashboardPadrao: { type: String },
    itensPorPagina: { type: Number, default: 10 },
    ordenacaoPadrao: { type: String },
    dataUltimoAcesso: { type: Date }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'preferencias_usuario'
  }
);

export default mongoose.model<IPreferenciaUsuario>('PreferenciaUsuario', PreferenciaUsuarioSchema);
