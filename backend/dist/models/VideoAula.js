import mongoose, { Schema } from 'mongoose';
const VideoAulaSchema = new Schema({
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    url: { type: String, required: true },
    thumbnail: { type: String },
    duracao: { type: String },
    categoria: { type: String, trim: true },
    tags: [{ type: String }],
    ordem: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
    visualizacoes: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'video_aulas'
});
VideoAulaSchema.index({ categoria: 1, ordem: 1 });
export default mongoose.model('VideoAula', VideoAulaSchema);
