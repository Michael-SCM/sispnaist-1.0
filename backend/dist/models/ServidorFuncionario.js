import mongoose, { Schema } from 'mongoose';
const ServidorFuncionarioSchema = new Schema({
    trabalhadorId: { type: Schema.Types.ObjectId, ref: 'Trabalhador', required: true, unique: true },
    matriculaFuncional: { type: String, required: true, unique: true },
    dataPosse: { type: Date, required: true },
    dataExercicio: { type: Date, required: true },
    regimeJuridico: { type: String, trim: true },
    cargoEfetivo: { type: String, trim: true },
    cargoComissionado: { type: String, trim: true },
    lotacao: { type: String, trim: true },
    situacaoFuncional: { type: String, trim: true },
    atoNomeacao: { type: String, trim: true },
    dataNomeacao: { type: Date },
    dataAposentadoria: { type: Date },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'servidores_funcionarios'
});
export default mongoose.model('ServidorFuncionario', ServidorFuncionarioSchema);
