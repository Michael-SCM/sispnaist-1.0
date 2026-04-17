import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para uploads de arquivos.
 * Equivalente a: tb_arquivo_upload no PHP original.
 */

export interface IArquivoUpload extends Document {
  entidade: string;           // 'acidente', 'trabalhador', 'doenca', etc.
  entidadeId: string;         // ID da entidade associada
  nomeOriginal: string;       // nome original do arquivo
  nomeArmazenado: string;     // nome gerado para armazenamento
  caminho: string;            // path do arquivo
  mimeType: string;           // 'image/jpeg', 'application/pdf', etc.
  tamanho: number;            // tamanho em bytes
  descricao?: string;
  enviadoPor: string;         // ObjectId do User
  dataCriacao: Date;
}

const ArquivoUploadSchema = new Schema<IArquivoUpload>(
  {
    entidade: { type: String, required: true, index: true },
    entidadeId: { type: Schema.Types.ObjectId, required: true, index: true },
    nomeOriginal: { type: String, required: true },
    nomeArmazenado: { type: String, required: true },
    caminho: { type: String, required: true },
    mimeType: { type: String, required: true },
    tamanho: { type: Number, required: true },
    descricao: { type: String, trim: true },
    enviadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao' },
    collection: 'arquivos_upload'
  }
);

ArquivoUploadSchema.index({ entidade: 1, entidadeId: 1 });

export default mongoose.model<IArquivoUpload>('ArquivoUpload', ArquivoUploadSchema);
