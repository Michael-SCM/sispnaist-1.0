import mongoose, { Schema } from 'mongoose';
const TrabalhadorOcorrenciaViolenciaSchema = new Schema({
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    dataOcorrencia: { type: Date, required: true },
    localOcorrencia: { type: String, trim: true },
    tipoViolencia: { type: String, required: true },
    tipoViolenciaSexual: { type: String, required: true },
    motivoViolencia: { type: String, required: true },
    meioAgressao: { type: String, required: true },
    tipoAutorViolencia: { type: String, required: true },
    descricaoOcorrencia: { type: String, required: true },
    reincidencia: { type: Boolean, default: false },
    atendimentoRealizado: { type: String, required: true },
    condutaViolencia: { type: String, required: true },
    pessoasEnvolvidas: { type: String, required: true },
    emissaoCatNas: { type: Boolean, default: false },
    boletimOcorrencia: { type: String, trim: true },
    medidasTomadas: { type: String, trim: true },
    acompanhamentos: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_ocorrencias_violencia'
});
TrabalhadorOcorrenciaViolenciaSchema.index({ trabalhadorId: 1, dataOcorrencia: -1 });
export default mongoose.model('TrabalhadorOcorrenciaViolencia', TrabalhadorOcorrenciaViolenciaSchema);
