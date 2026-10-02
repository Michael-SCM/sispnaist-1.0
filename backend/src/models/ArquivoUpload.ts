import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para uploads de arquivos.
 * Equivalente a: tb_arquivo_upload no PHP original.
 */

export interface IArquivoUpload extends Document {
  entidade: string;           // 'acidente', 'trabalhador', 'doenca', etc.
  entidadeId: string;         // ID da entidade associada
  empresa?: string;           // ObjectId da empresa dona do arquivo (escopo multiempresa)
  nomeOriginal: string;       // nome original do arquivo
  nomeArmazenado: string;     // nome gerado para armazenamento seguro
  caminhoArquivo?: string;    // caminho ou key no storage privado (disco ou S3)
  storageBackend?: string;    // 'disk' | 's3' — backend usado no upload
  checksumSha256?: string;    // hash sha256 para integridade
  mimeType: string;           // 'image/jpeg', 'application/pdf', etc.
  tamanho: number;            // tamanho em bytes
  data?: Buffer;              // conteúdo do arquivo (legado/opcional)
  descricao?: string;
  enviadoPor: string;         // ObjectId do User
  dataCriacao: Date;
}

const ArquivoUploadSchema = new Schema<IArquivoUpload>(
  {
    entidade: { type: String, required: true, index: true },
    entidadeId: { type: Schema.Types.ObjectId as any, required: true, index: true },
    // Campo empresa indexado para filtro fail-closed por escopo de empresa (multiempresa)
    empresa: { type: Schema.Types.ObjectId as any, ref: 'Empresa', index: true },
    nomeOriginal: { type: String, required: true },
    nomeArmazenado: { type: String, required: true },
    // caminhoArquivo é a key S3 ou caminho em disco conforme storageBackend
    caminhoArquivo: { type: String },
    storageBackend: { type: String, enum: ['disk', 's3'], default: 'disk' },
    checksumSha256: { type: String },
    mimeType: { type: String, required: true },
    tamanho: { type: Number, required: true },
    data: { type: Buffer, required: false },
    descricao: { type: String, trim: true },
    enviadoPor: { type: Schema.Types.ObjectId as any, ref: 'User', required: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao' },
    collection: 'arquivos_upload'
  }
);

ArquivoUploadSchema.index({ entidade: 1, entidadeId: 1 });
ArquivoUploadSchema.index({ empresa: 1, dataCriacao: -1 });

export default mongoose.model<IArquivoUpload>('ArquivoUpload', ArquivoUploadSchema);
