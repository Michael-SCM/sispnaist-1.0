import mongoose, { Schema, Document } from 'mongoose';
import { IAcidente } from '../types/index.js';

export interface IAcidenteDocument extends Omit<IAcidente, '_id'>, Document {}

const AcidenteSchema = new Schema<IAcidenteDocument>(
  {
    dataAcidente: {
      type: Date,
      required: [true, 'Data do acidente é obrigatória'],
    },
    horario: String,
    horarioAposInicioJornada: String,
    trabalhadorId: {
      type: Schema.Types.ObjectId as any,
      ref: 'Trabalhador',
      required: [true, 'Trabalhador é obrigatório'],
    },
    tipoAcidente: {
      type: String,
      required: [true, 'Tipo de acidente é obrigatório'],
    },
    tipoTrauma: {
      type: String,
      required: [true, 'Tipo de trauma é obrigatório'],
    },
    agenteCausador: {
      type: String,
      required: [true, 'Agente causador é obrigatório'],
    },
    parteCorpo: {
      type: String,
      required: [true, 'Parte do corpo é obrigatória'],
    },
    descricao: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
    },
    descricaoTrauma: String,
    local: {
      type: String,
      required: [true, 'Local do acidente é obrigatório'],
    },
    lesoes: {
      type: [String],
      required: [true, 'Lesões são obrigatórias'],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'Adicione pelo menos uma lesão',
      },
    },
    feriado: {
      type: Boolean,
      default: false,
    },
    comunicado: {
      type: Boolean,
      default: false,
    },
    dataComunicacao: Date,
    dataNotificacao: Date,
    // Campos de atendimento médico
    atendimentoMedico: Boolean,
    dataAtendimento: Date,
    horaAtendimento: String,
    unidadeAtendimento: String,

    // Campos de internamento
    internamento: Boolean,
    duracaoInternamento: Number,

    // CAT/NAS
    catNas: Boolean,

    // Registro Policial
    registroPolicial: Boolean,

    // Encaminhamento junta médica
    encaminhamentoJuntaMedica: Boolean,

    // Afastamento
    afastamento: Boolean,

    // Outros trabalhadores atingidos
    outrosTrabalhadoresAtingidos: Boolean,
    quantidadeTrabalhadoresAtingidos: Number,

    status: {
      type: String,
      enum: ['Aberto', 'Em Análise', 'Fechado'],
      default: 'Aberto',
    },
  },
  { collection: 'acidentes', timestamps: true }
);

AcidenteSchema.index({ trabalhadorId: 1, dataAcidente: -1 });
AcidenteSchema.index({ status: 1 });
AcidenteSchema.index({ dataAcidente: 1 });

export default mongoose.model<IAcidenteDocument>('Acidente', AcidenteSchema);
