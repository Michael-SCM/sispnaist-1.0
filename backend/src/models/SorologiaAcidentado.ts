import mongoose, { Schema, Document } from 'mongoose';

export interface ISorologiaAcidentado {
  _id?: mongoose.Types.ObjectId;
  acidenteMaterialBiologicoId: mongoose.Types.ObjectId; // Vincula ao acidente biológico
  trabalhadorId: mongoose.Types.ObjectId; // Ref Trabalhador
  hivBasal: string;
  hbsAgBasal: string;
  antiHbcBasal: string;
  antiHcvBasal: string;
  vdrlBasal: string;
  hivProfilaxia: string;
  hbsAgProfilaxia: string;
  antiHbcProfilaxia: string;
  antiHcvProfilaxia: string;
  vdrlProfilaxia: string;
  dataColetaBasal: Date;
  dataResultadoBasal: Date;
  dataColetaProfilaxia?: Date;
  dataResultadoProfilaxia?: Date;
  observacoes?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISorologiaAcidentadoDocument extends ISorologiaAcidentado, Document {}

const SorologiaAcidentadoSchema = new Schema<ISorologiaAcidentadoDocument>({
  acidenteMaterialBiologicoId: {
    type: Schema.Types.ObjectId,
    ref: 'AcidenteMaterialBiologico',
    required: true,
    index: true,
  },
  trabalhadorId: {
    type: Schema.Types.ObjectId,
    ref: 'Trabalhador',
    required: true,
  },
  hivBasal: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
    required: true,
  },
  hbsAgBasal: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
    required: true,
  },
  antiHbcBasal: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
    required: true,
  },
  antiHcvBasal: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
    required: true,
  },
  vdrlBasal: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
    required: true,
  },
  hivProfilaxia: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
  },
  hbsAgProfilaxia: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
  },
  antiHbcProfilaxia: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
  },
  antiHcvProfilaxia: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
  },
  vdrlProfilaxia: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente', 'Não Realizado'],
  },
  dataColetaBasal: {
    type: Date,
    required: true,
  },
  dataResultadoBasal: Date,
  dataColetaProfilaxia: Date,
  dataResultadoProfilaxia: Date,
  observacoes: String,
  ativo: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, collection: 'sorologia_acidentados' });

// SorologiaAcidentadoSchema.index({ acidenteMaterialBiologicoId: 1 });
SorologiaAcidentadoSchema.index({ trabalhadorId: 1 });

export default mongoose.model<ISorologiaAcidentadoDocument>('SorologiaAcidentado', SorologiaAcidentadoSchema);

