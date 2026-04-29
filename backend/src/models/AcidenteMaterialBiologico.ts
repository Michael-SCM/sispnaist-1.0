import mongoose, { Schema, Document } from 'mongoose';

export interface IAcidenteMaterialBiologico {
  _id?: mongoose.Types.ObjectId;
  acidenteId: mongoose.Types.ObjectId; // id_fk_acidente ref Acidente
  tipoExposicaoId: mongoose.Types.ObjectId; // id_fk_tipo_exposicao
  materialOrganicoId: mongoose.Types.ObjectId; // id_fk_material_organico
  circunstanciaAcidenteId: mongoose.Types.ObjectId; // id_fk_circunstancia_acidente
  agenteId: mongoose.Types.ObjectId; // id_fk_agente
  equipamentoProtecaoId?: mongoose.Types.ObjectId; // id_fk_equipamento_protecao
  sorologiaPacienteId?: mongoose.Types.ObjectId; // id_fk_sorologia_paciente
  sorologiaAcidentadoId?: mongoose.Types.ObjectId; // id_fk_sorologia_acidentado
  condutaId?: mongoose.Types.ObjectId; // id_fk_conduta
  evolucaoId?: mongoose.Types.ObjectId; // id_fk_evolucao
  usoEpi: boolean; // in_uso_epi
  sorologiaFonte: boolean; // in_sorologia_fonte
  acompanhamentoPrep: boolean; // in_acompanhamento_prep
  dsAcompanhamentoPrep?: string; // ds_acompanhamento_prep
  dsEncaminhamento?: string; // ds_encaminhamento
  dtReavaliacao?: Date; // dt_reavaliacao
  efeitoColateralPermanece: boolean; // in_efeito_colateral_permanece
  dsEfeitoColateralPermanece?: string; // ds_efeito_colateral_permanece
  ativo: boolean; // soft delete
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAcidenteMaterialBiologicoDocument extends IAcidenteMaterialBiologico, Document {}

const AcidenteMaterialBiologicoSchema = new Schema<IAcidenteMaterialBiologicoDocument>({
  acidenteId: {
    type: Schema.Types.ObjectId,
    ref: 'Acidente',
    required: true,
    index: true,
  },
  tipoExposicaoId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
    required: true,
  },
  materialOrganicoId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
    required: true,
  },
  circunstanciaAcidenteId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
    required: true,
  },
  agenteId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
    required: true,
  },
  equipamentoProtecaoId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
  },
  sorologiaPacienteId: {
    type: Schema.Types.ObjectId,
    ref: 'SorologiaPaciente',
  },
  sorologiaAcidentadoId: {
    type: Schema.Types.ObjectId,
    ref: 'SorologiaAcidentado',
  },
  condutaId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
  },
  evolucaoId: {
    type: Schema.Types.ObjectId,
    ref: 'Catalogo',
  },
  usoEpi: {
    type: Boolean,
    required: true,
    default: false,
  },
  sorologiaFonte: {
    type: Boolean,
    required: true,
    default: false,
  },
  acompanhamentoPrep: {
    type: Boolean,
    required: true,
    default: false,
  },
  dsAcompanhamentoPrep: String,
  dsEncaminhamento: String,
  dtReavaliacao: Date,
  efeitoColateralPermanece: {
    type: Boolean,
    default: false,
  },
  dsEfeitoColateralPermanece: String,
  ativo: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, collection: 'acidentes_material_biologico' });

// AcidenteMaterialBiologicoSchema.index({ acidenteId: 1 }); // Removido duplicate
AcidenteMaterialBiologicoSchema.index({ ativo: 1 });

export default mongoose.model<IAcidenteMaterialBiologicoDocument>('AcidenteMaterialBiologico', AcidenteMaterialBiologicoSchema);

