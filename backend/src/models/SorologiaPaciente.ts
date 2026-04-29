import mongoose, { Schema, Document } from 'mongoose';

export interface ISorologiaPaciente {
  _id?: mongoose.Types.ObjectId;
  acidenteMaterialBiologicoId: mongoose.Types.ObjectId; // Vincula ao acidente biológico
  pacienteFonteNome?: string;
  pacienteFonteCpf?: string;
  hiv: string; // Negativo/Positivo/Reagente/Indeterminado
  hbsAg: string;
  antiHbc: string;
  antiHcv: string;
  vdrl: string;
  dataColeta: Date;
  dataResultado: Date;
  observacoes?: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISorologiaPacienteDocument extends ISorologiaPaciente, Document {}

const SorologiaPacienteSchema = new Schema<ISorologiaPacienteDocument>({
  acidenteMaterialBiologicoId: {
    type: Schema.Types.ObjectId,
    ref: 'AcidenteMaterialBiologico',
    required: true,
    index: true,
  },
  pacienteFonteNome: String,
  pacienteFonteCpf: String,
  hiv: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente'],
    required: true,
  },
  hbsAg: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente'],
    required: true,
  },
  antiHbc: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente'],
    required: true,
  },
  antiHcv: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente'],
    required: true,
  },
  vdrl: {
    type: String,
    enum: ['Negativo', 'Positivo', 'Reagente', 'Indeterminado', 'Pendente'],
    required: true,
  },
  dataColeta: {
    type: Date,
    required: true,
  },
  dataResultado: Date,
  observacoes: String,
  ativo: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, collection: 'sorologia_pacientes' });

// SorologiaPacienteSchema.index({ acidenteMaterialBiologicoId: 1 }); // Removido duplicate

export default mongoose.model<ISorologiaPacienteDocument>('SorologiaPaciente', SorologiaPacienteSchema);

