import mongoose, { Schema } from 'mongoose';
const AtoMunicipalInovacaoSchema = new Schema({
    nr_ato: { type: String, required: true, trim: true },
    ano_ato: { type: Number, required: true },
    link_ato_legal: { type: String, trim: true },
    nm_cidade: { type: String, required: true, trim: true },
    nm_estado: { type: String, required: true, trim: true },
    nm_tipo: { type: String, trim: true },
    nm_subtipo: { type: String, trim: true },
    nm_categoria: { type: String, trim: true },
    nm_classe_categoria: { type: String, trim: true },
    texto_legal: { type: String, trim: true },
    texto_ementa: { type: String, trim: true },
    papeisModoGovernanca: [{ type: Schema.Types.ObjectId, ref: 'Catalogo' }],
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'atos_municipais_inovacao'
});
// Índices para busca rápida
AtoMunicipalInovacaoSchema.index({ nr_ato: 1, ano_ato: 1 }, { unique: true });
AtoMunicipalInovacaoSchema.index({ nm_cidade: 1, nm_estado: 1 });
export default mongoose.model('AtoMunicipalInovacao', AtoMunicipalInovacaoSchema);
