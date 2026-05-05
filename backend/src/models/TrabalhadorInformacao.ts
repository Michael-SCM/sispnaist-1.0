import mongoose, { Document, Schema } from 'mongoose';

export interface ITrabalhadorInformacao extends Document {
  trabalhadorId: string;
  doencaBase: string;
  estadoVacinal: string;
  tipoDroga: string;
  tipoSanguineo: string;
  medicamentos: string;
  allergy: boolean;
  descricaoAlergia: string;
  acompanhamentoMedico: boolean;
  acompanhamentoReabilitacao: boolean;
  usoAlcool: boolean;
  dosesAlcool: number;
  usoCigarro: boolean;
  macosCigarro: number;
  usoOutraDroga: boolean;
  frequenciaUso: string;
  ativo: boolean;
}

const TrabalhadorInformacaoSchema = new Schema<ITrabalhadorInformacao>(
  {
    trabalhadorId: {
      type: String,
      required: true,
      index: true,
    },
    doencaBase: {
      type: String,
      default: '',
    },
    estadoVacinal: {
      type: String,
      default: '',
    },
    tipoDroga: {
      type: String,
      default: '',
    },
    tipoSanguineo: {
      type: String,
      default: '',
    },
    medicamentos: {
      type: String,
      default: '',
    },
    allergy: {
      type: Boolean,
      default: false,
    },
    descricaoAlergia: {
      type: String,
      default: '',
    },
    acompanhamentoMedico: {
      type: Boolean,
      default: false,
    },
    acompanhamentoReabilitacao: {
      type: Boolean,
      default: false,
    },
    usoAlcool: {
      type: Boolean,
      default: false,
    },
    dosesAlcool: {
      type: Number,
      default: 0,
    },
    usoCigarro: {
      type: Boolean,
      default: false,
    },
    macosCigarro: {
      type: Number,
      default: 0,
    },
    usoOutraDroga: {
      type: Boolean,
      default: false,
    },
    frequenciaUso: {
      type: String,
      default: '',
    },
    ativo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'trabalhador_informacoes',
  }
);

TrabalhadorInformacaoSchema.index({ trabalhadorId: 1, ativo: 1 });

export default mongoose.model<ITrabalhadorInformacao>('TrabalhadorInformacao', TrabalhadorInformacaoSchema);
