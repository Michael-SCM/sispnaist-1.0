import mongoose, { Document, Schema } from 'mongoose';

export type TipoAlerta = 'PICO_ACIDENTES' | 'VACINA_VENCENDO' | 'NAO_CONFORMIDADE' | 'MONITORAMENTO_CRITICO';
export type NivelAlerta = 'baixo' | 'medio' | 'alto';
export type StatusAlerta = 'ativa' | 'reagindo' | 'lida' | 'arquivada';

export interface IAlerta extends Document {
  _id: mongoose.Types.ObjectId;
  tipo: TipoAlerta;
  nivel: NivelAlerta;
  titulo: string;
  descricao: string;
  referencia?: {
    entidade: string;
    entidadeId: string;
  };
  empresaId?: mongoose.Types.ObjectId;
  unidadeId?: mongoose.Types.ObjectId;
  uf?: string;
  municipio?: string;
  usuariosNotificados: mongoose.Types.ObjectId[];
  ultimoEmailEnviadoEm?: Date;
  status: StatusAlerta;
  dataAlerta: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

const AlertaSchema = new Schema<IAlerta>(
  {
    tipo: {
      type: String,
      enum: ['PICO_ACIDENTES', 'VACINA_VENCENDO', 'NAO_CONFORMIDADE', 'MONITORAMENTO_CRITICO'],
      required: true,
      index: true,
    },
    nivel: {
      type: String,
      enum: ['baixo', 'medio', 'alto'],
      default: 'medio',
    },
    titulo: { type: String, required: true, trim: true },
    descricao: { type: String, required: true },
    referencia: {
      entidade: { type: String, trim: true },
      entidadeId: { type: String, trim: true },
    },
    empresaId: { type: Schema.Types.ObjectId as any, ref: 'Empresa' },
    unidadeId: { type: Schema.Types.ObjectId as any, ref: 'Unidade' },
    uf: { type: String, trim: true },
    municipio: { type: String, trim: true },
    usuariosNotificados: [{ type: Schema.Types.ObjectId as any, ref: 'User' }],
    ultimoEmailEnviadoEm: { type: Date },
    status: {
      type: String,
      enum: ['ativa', 'reagindo', 'lida', 'arquivada'],
      default: 'ativa',
      index: true,
    },
    dataAlerta: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'alertas',
  }
);

AlertaSchema.index({ status: 1, dataAlerta: -1 });
AlertaSchema.index({ tipo: 1, status: 1 });
AlertaSchema.index({ empresaId: 1, status: 1, dataAlerta: -1 });

export default mongoose.model<IAlerta>('Alerta', AlertaSchema);
