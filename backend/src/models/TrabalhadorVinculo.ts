export interface IAvaliacaoItem {
  presente: boolean;
  observacao?: string;
  intensidade?: 'baixo' | 'medio' | 'alto';
  fonteGeradora?: string;
  situacao?: 'adequado' | 'parcial' | 'inadequado';
  frequencia?: 'nunca' | 'raramente' | 'as_vezes' | 'frequentemente';
  ultimoEvento?: Date;
  dataUltimaAcao?: Date;
  proximaAcao?: Date;
  responsavel?: string;
}

export interface IAvaliacaoRiscosOcupacionais {
  agentesFisicos: IAvaliacaoItem;
  agentesQuimicos: IAvaliacaoItem;
  agentesBiologicos: IAvaliacaoItem;
  riscosErgonomicos: IAvaliacaoItem;
  riscosAcidentes: IAvaliacaoItem;
}

export interface IAvaliacaoCondicoesTrabalho {
  infraestrutura: IAvaliacaoItem;
  equipamentos: IAvaliacaoItem;
  organizacaoTrabalho: IAvaliacaoItem;
}

export interface IAvaliacaoRelacoesTrabalho {
  violencia: IAvaliacaoItem;
  assedio: IAvaliacaoItem;
  climaOrganizacional: IAvaliacaoItem;
  satisfacaoTrabalho: IAvaliacaoItem;
}

export interface IAvaliacaoAcoesPrevencao {
  pcmo: IAvaliacaoItem;
  ppraPgr: IAvaliacaoItem;
  programasVacinacao: IAvaliacaoItem;
  treinamentos: IAvaliacaoItem;
  inspecoes: IAvaliacaoItem;
}

export interface IAvaliacaoAmbienteTrabalho {
  riscosOcupacionais: IAvaliacaoRiscosOcupacionais;
  condicoesTrabalho: IAvaliacaoCondicoesTrabalho;
  relacoesTrabalho: IAvaliacaoRelacoesTrabalho;
  acoesPrevencao: IAvaliacaoAcoesPrevencao;
}

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Model para vínculos empregatícios detalhados do trabalhador.
 * Equivalente a: tb_trabalhador_vinculos no PHP original.
 */

export interface ITrabalhadorVinculo extends Document {
  trabalhadorId: mongoose.Types.ObjectId;
  empresa?: mongoose.Types.ObjectId;
  unidade?: mongoose.Types.ObjectId;
  tipoVinculo: string;
  funcao?: string;
  matricula: string;
  jornadaTrabalho: string;
  turnoTrabalho?: string;
  dataInicio: Date;
  dataPosse?: Date;
  dataFim?: Date;
  situacao?: string;
  empresaTerceirizada?: string;
  residente?: boolean;
  anosResidencia?: string;
  setor?: string;
  cargo?: string;
  ocupacao?: string;
  cargaHoraria?: number;
  salario?: number;
  insalubridadePericulosidade?: string;
  observacoes?: string;
  ativo: boolean;
  avaliacaoAmbienteTrabalho?: IAvaliacaoAmbienteTrabalho;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface ITrabalhadorVinculoDocument extends ITrabalhadorVinculo {}

const SubdimensaoItemSchema = new Schema({
  presente: { type: Boolean, default: false },
  observacao: { type: String, trim: true },
  intensidade: { type: String, enum: ['baixo', 'medio', 'alto'] },
  fonteGeradora: { type: String, trim: true },
  situacao: { type: String, enum: ['adequado', 'parcial', 'inadequado'] },
  frequencia: { type: String, enum: ['nunca', 'raramente', 'as_vezes', 'frequentemente'] },
  ultimoEvento: { type: Date },
  dataUltimaAcao: { type: Date },
  proximaAcao: { type: Date },
  responsavel: { type: String, trim: true },
}, { _id: false });

const TrabalhadorVinculoSchema = new Schema<ITrabalhadorVinculoDocument>(
  {
    trabalhadorId: { type: Schema.Types.ObjectId as any, ref: 'Trabalhador', required: true, index: true },
    empresa: { type: Schema.Types.ObjectId as any, ref: 'Empresa' },
    unidade: { type: Schema.Types.ObjectId as any, ref: 'Unidade' },
    tipoVinculo: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, trim: true },
    funcao: { type: String, trim: true },
    jornadaTrabalho: { type: String, required: true, trim: true },
    turnoTrabalho: { type: String, trim: true },
    dataInicio: { type: Date, required: true },
    dataPosse: { type: Date },
    dataFim: { type: Date },
    situacao: { type: String, trim: true, default: 'Ativo' },
    empresaTerceirizada: { type: String, trim: true },
    residente: { type: Boolean, default: false },
    anosResidencia: { type: String, trim: true },
    setor: { type: String, trim: true },
    cargo: { type: String, trim: true },
    ocupacao: { type: String, trim: true },
    cargaHoraria: { type: Number, min: 1, max: 168 },
    salario: { type: Number, min: 0 },
    insalubridadePericulosidade: { type: String, trim: true },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
    avaliacaoAmbienteTrabalho: {
      type: {
        riscosOcupacionais: {
          agentesFisicos: { type: SubdimensaoItemSchema, default: () => ({}) },
          agentesQuimicos: { type: SubdimensaoItemSchema, default: () => ({}) },
          agentesBiologicos: { type: SubdimensaoItemSchema, default: () => ({}) },
          riscosErgonomicos: { type: SubdimensaoItemSchema, default: () => ({}) },
          riscosAcidentes: { type: SubdimensaoItemSchema, default: () => ({}) },
        },
        condicoesTrabalho: {
          infraestrutura: { type: SubdimensaoItemSchema, default: () => ({}) },
          equipamentos: { type: SubdimensaoItemSchema, default: () => ({}) },
          organizacaoTrabalho: { type: SubdimensaoItemSchema, default: () => ({}) },
        },
        relacoesTrabalho: {
          violencia: { type: SubdimensaoItemSchema, default: () => ({}) },
          assedio: { type: SubdimensaoItemSchema, default: () => ({}) },
          climaOrganizacional: { type: SubdimensaoItemSchema, default: () => ({}) },
          satisfacaoTrabalho: { type: SubdimensaoItemSchema, default: () => ({}) },
        },
        acoesPrevencao: {
          pcmo: { type: SubdimensaoItemSchema, default: () => ({}) },
          ppraPgr: { type: SubdimensaoItemSchema, default: () => ({}) },
          programasVacinacao: { type: SubdimensaoItemSchema, default: () => ({}) },
          treinamentos: { type: SubdimensaoItemSchema, default: () => ({}) },
          inspecoes: { type: SubdimensaoItemSchema, default: () => ({}) },
        },
      },
      default: () => ({}),
    },
  },
  {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_vinculos'
  }
);

TrabalhadorVinculoSchema.index({ trabalhadorId: 1, dataInicio: -1 });
TrabalhadorVinculoSchema.index({ trabalhadorId: 1, ativo: 1 });

export default mongoose.model<ITrabalhadorVinculo>('TrabalhadorVinculo', TrabalhadorVinculoSchema);



