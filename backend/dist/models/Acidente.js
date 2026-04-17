import mongoose, { Schema } from 'mongoose';
const AcidenteSchema = new Schema({
    dataAcidente: {
        type: Date,
        required: [true, 'Data do acidente é obrigatória'],
    },
    horario: String,
    trabalhadorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Trabalhador é obrigatório'],
    },
    tipoAcidente: {
        type: String,
        required: [true, 'Tipo de acidente é obrigatório'],
        enum: [
            'Típico',
            'Trajeto',
            'Doença Ocupacional',
            'Acidente com Material Biológico',
            'Violência',
        ],
    },
    descricao: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
    },
    local: String,
    lesoes: [String],
    feriado: {
        type: Boolean,
        default: false,
    },
    comunicado: {
        type: Boolean,
        default: false,
    },
    dataComunicacao: Date,
    status: {
        type: String,
        enum: ['Aberto', 'Em Análise', 'Fechado'],
        default: 'Aberto',
    },
    dataCriacao: {
        type: Date,
        default: Date.now,
    },
    dataAtualizacao: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'acidentes', timestamps: true });
AcidenteSchema.index({ trabalhadorId: 1, dataAcidente: -1 });
export default mongoose.model('Acidente', AcidenteSchema);
//# sourceMappingURL=Acidente.js.map