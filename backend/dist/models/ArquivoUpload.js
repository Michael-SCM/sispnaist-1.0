import mongoose, { Schema } from 'mongoose';
const ArquivoUploadSchema = new Schema({
    entidade: { type: String, required: true, index: true },
    entidadeId: { type: Schema.Types.ObjectId, required: true, index: true },
    nomeOriginal: { type: String, required: true },
    nomeArmazenado: { type: String, required: true },
    caminho: { type: String, required: true },
    mimeType: { type: String, required: true },
    tamanho: { type: Number, required: true },
    descricao: { type: String, trim: true },
    enviadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: { createdAt: 'dataCriacao' },
    collection: 'arquivos_upload'
});
ArquivoUploadSchema.index({ entidade: 1, entidadeId: 1 });
export default mongoose.model('ArquivoUpload', ArquivoUploadSchema);
