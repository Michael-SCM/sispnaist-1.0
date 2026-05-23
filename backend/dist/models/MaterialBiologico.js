import mongoose, { Schema } from 'mongoose';
const MaterialBiologicoSchema = new Schema({
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
    equipamentoProtecao: { type: String, required: false, default: 'Nenhum' },
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
}, {
    collection: 'material_biologico',
    timestamps: true,
});
export default mongoose.model('MaterialBiologico', MaterialBiologicoSchema);
