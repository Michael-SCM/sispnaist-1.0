import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para video-aulas de treinamento/capacitação.
 * Equivalente a: tb_video_aula no PHP original.
 */

export interface IVideoAula extends Document {
  titulo: string;
  descricao?: string;
  url: string;                // URL do vídeo (YouTube, Vimeo, etc.)
  thumbnail?: string;         // URL da imagem de capa
  duracao?: string;           // 'HH:MM:SS'
  categoria?: string;         // 'sst', 'integracao', 'seguranca', 'saude', etc.
  tags?: string[];
  ordem?: number;
  ativo: boolean;
  visualizacoes?: number;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const VideoAulaSchema = new Schema<IVideoAula>(
  {
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
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'video_aulas'
  }
);

VideoAulaSchema.index({ categoria: 1, ordem: 1 });

export default mongoose.model<IVideoAula>('VideoAula', VideoAulaSchema);
