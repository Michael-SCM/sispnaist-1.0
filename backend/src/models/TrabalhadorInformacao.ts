import mongoose, { Document, Schema } from 'mongoose';

export interface IAnexo {
  id: string;
  nome: string;
}

export interface IExame {
  realizados: string;
  resultados: string;
  periodicidade: string;
  anexos: IAnexo[];
}

export interface ITrabalhadorInformacao extends Document {
  trabalhadorId: string;
  doencaBase: string;
  estadoVacinal: string;
  tipoDroga: string;
  tipoSanguineo: string;
  medicamentos: string;
  doencaPreexistente: boolean;
  descricaoDoencaPreexistente: string;
  historicoFamiliar: boolean;
  descricaoHistoricoFamiliar: string;
  allergy: boolean;
  descricaoAlergia: string;
  acompanhamentoMedico: boolean;
  acompanhamentoMedicoMotivo: string;
  acompanhamentoReabilitacao: boolean;
  usoAlcool: boolean;
  dosesAlcool: number;
  usoCigarro: boolean;
  macosCigarro: number;
  usoOutraDroga: boolean;
  outraDrogaDescricao: string;
  frequenciaUso: string;
  exames: IExame[];
  observacoes: string;
  ativo: boolean;
}

const AnexoSchema = new Schema<IAnexo>(
  {
    id: { type: String, required: true },
    nome: { type: String, required: true },
  },
  { _id: false }
);

const ExameSchema = new Schema<IExame>(
  {
    realizados: { type: String, default: '' },
    resultados: { type: String, default: '' },
    periodicidade: { type: String, default: '' },
    anexos: { type: [AnexoSchema], default: [] },
  },
  { _id: false }
);

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
    doencaPreexistente: {
      type: Boolean,
      default: false,
    },
    descricaoDoencaPreexistente: {
      type: String,
      default: '',
    },
    historicoFamiliar: {
      type: Boolean,
      default: false,
    },
    descricaoHistoricoFamiliar: {
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
    acompanhamentoMedicoMotivo: {
      type: String,
      default: '',
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
    outraDrogaDescricao: {
      type: String,
      default: '',
    },
    frequenciaUso: {
      type: String,
      default: '',
    },
    exames: {
      type: [ExameSchema],
      default: [],
    },
    observacoes: {
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
