import mongoose, { Schema } from 'mongoose';
const TrabalhadorInformacaoSchema = new Schema({
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
}, {
    timestamps: true,
    collection: 'trabalhador_informacoes',
});
TrabalhadorInformacaoSchema.index({ trabalhadorId: 1, ativo: 1 });
export default mongoose.model('TrabalhadorInformacao', TrabalhadorInformacaoSchema);
