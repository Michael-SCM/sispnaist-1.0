import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterialBiologico {
  _id?: string;
  acidenteId: mongoose.Types.ObjectId;
  tipoExposicao: string;
  materialOrganico: string;
  circunstanciaAcidente: string;
  agente: string;
  equipamentoProtecao: string;
  sorologiaPaciente: string;
  sorologiaAcidentado: string;
  conduta: string;
  evolucaoCaso: string;
  usoEPI: boolean;
  sorologiaFonte: boolean;
  acompanhamentoPrEP: boolean;
  descAcompanhamentoPrEP?: string;
  descEncaminhamento?: string;
  dataReavaliacao?: Date;
  efeitoColateralPermanente: boolean;
  descEfeitoColateralPermanente?: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface IMaterialBiologicoDocument extends IMaterialBiologico, Document {}

const MaterialBiologicoSchema = new Schema<IMaterialBiologicoDocument>(
  {
    acidenteId: {
      type: Schema.Types.ObjectId,
      ref: 'Acidente',
      required: [true, 'Vínculo com acidente é obrigatório'],
      index: true,
      unique: true, // Cada acidente tem apenas uma ficha técnica biológica
    },
    tipoExposicao: { type: String, required: true },
    materialOrganico: { type: String, required: true },
    circunstanciaAcidente: { type: String, required: true },
    agente: { type: String, required: true },
    equipamentoProtecao: { type: String, required: true },
    sorologiaPaciente: { type: String, required: true },
    sorologiaAcidentado: { type: String, required: true },
    conduta: { type: String, required: true },
    evolucaoCaso: { type: String, required: true },
    usoEPI: { type: Boolean, default: false },
    sorologiaFonte: { type: Boolean, default: false },
    acompanhamentoPrEP: { type: Boolean, default: false },
    descAcompanhamentoPrEP: String,
    descEncaminhamento: String,
    dataReavaliacao: Date,
    efeitoColateralPermanente: { type: Boolean, default: false },
    descEfeitoColateralPermanente: String,
  },
  {
    collection: 'material_biologico',
    timestamps: true,
  }
);

export default mongoose.model<IMaterialBiologicoDocument>('MaterialBiologico', MaterialBiologicoSchema);
