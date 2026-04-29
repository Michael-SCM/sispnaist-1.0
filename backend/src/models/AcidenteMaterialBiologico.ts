import mongoose, { Schema, Document } from 'mongoose';
import { IAcidenteMaterialBiologico } from '../types/index.js';

export interface IAcidenteMaterialBiologicoDocument extends IAcidenteMaterialBiologico, Document {}

const AcidenteMaterialBiologicoSchema = new Schema<IAcidenteMaterialBiologicoDocument>(
  {
    acidenteId: {
      type: Schema.Types.ObjectId,
      ref: 'Acidente',
      required: [true, 'Acidente é obrigatório'],
      index: true,
    },
    tipoExposicao: {
      type: String,
      trim: true,
    },
    materialOrganico: {
      type: String,
      trim: true,
    },
    circunstanciaAcidente: {
      type: String,
      trim: true,
    },
    agente: {
      type: String,
      trim: true,
    },
    equipamentoProtecao: {
      type: String,
      trim: true,
    },
    sorologiaPaciente: {
      type: Schema.Types.ObjectId,
      ref: 'SorologiaPaciente',
      default: null,
    },
    sorologiaAcidentado: {
      type: Schema.Types.ObjectId,
      ref: 'SorologiaAcidentado',
      default: null,
    },
    conduta: {
      type: String,
      trim: true,
    },
    evolucao: {
      type: String,
      trim: true,
    },
    usoEpi: {
      type: Boolean,
      default: false,
    },
    sorologiaFonte: {
      type: Boolean,
      default: false,
    },
    acompanhamentoPrep: {
      type: Boolean,
      default: false,
    },
    descricaoAcompanhamentoPrep: {
      type: String,
      trim: true,
    },
    encaminhamento: {
      type: String,
      trim: true,
    },
    dataReavaliacao: {
      type: Date,
    },
    efeitoColateralPermanece: {
      type: Boolean,
      default: false,
    },
    descricaoEfeitoColateral: {
      type: String,
      trim: true,
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  { collection: 'acidentes_material_biologico', timestamps: true }
);

// Índice composto para busca por acidente
AcidenteMaterialBiologicoSchema.index({ acidenteId: 1 });
// Índice para listagem ativa
AcidenteMaterialBiologicoSchema.index({ ativo: 1, createdAt: -1 });

export default mongoose.model<IAcidenteMaterialBiologicoDocument>(
  'AcidenteMaterialBiologico',
  AcidenteMaterialBiologicoSchema
);
