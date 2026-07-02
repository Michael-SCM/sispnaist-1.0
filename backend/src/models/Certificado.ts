import mongoose, { Document, Schema } from 'mongoose';

export interface ICertificado extends Document {
  usuarioId: mongoose.Types.ObjectId;
  videoAulaId: mongoose.Types.ObjectId;
  nomeUsuario: string;
  cpfUsuario: string;
  tituloTreinamento: string;
  descricaoTreinamento?: string;
  categoriaTreinamento?: string;
  cargaHoraria?: string;
  pontuacaoQuiz: number;
  codigoCertificado: string;
  dataConclusao: Date;
  dataEmissao: Date;
  emitidoPor?: string;
  ativo: boolean;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const CertificadoSchema = new Schema<ICertificado>(
  {
    usuarioId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoAulaId: { type: Schema.Types.ObjectId, ref: 'VideoAula', required: true },
    nomeUsuario: { type: String, required: true, trim: true },
    cpfUsuario: { type: String, required: true, trim: true },
    tituloTreinamento: { type: String, required: true, trim: true },
    descricaoTreinamento: { type: String, trim: true },
    categoriaTreinamento: { type: String, trim: true },
    cargaHoraria: { type: String },
    pontuacaoQuiz: { type: Number, required: true, min: 0, max: 100 },
    codigoCertificado: { type: String, required: true, unique: true, trim: true },
    dataConclusao: { type: Date, required: true },
    dataEmissao: { type: Date, default: Date.now },
    emitidoPor: { type: String },
    ativo: { type: Boolean, default: true }
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'certificados'
  }
);

CertificadoSchema.index({ usuarioId: 1 });
CertificadoSchema.index({ videoAulaId: 1 });
CertificadoSchema.index({ codigoCertificado: 1 }, { unique: true });
CertificadoSchema.index({ usuarioId: 1, videoAulaId: 1 }, { unique: true });

export default mongoose.model<ICertificado>('Certificado', CertificadoSchema);
