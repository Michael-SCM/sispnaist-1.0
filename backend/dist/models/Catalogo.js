import mongoose, { Schema } from 'mongoose';
const CatalogoSchema = new Schema({
    entidade: {
        type: String,
        required: true,
        index: true,
        enum: [
            'sexo', 'genero', 'racaCor', 'escolaridade', 'estadoCivil',
            'tipoSanguineo', 'estadoVacinal', 'tipoDeficiencia', 'grauDeficiencia',
            'tempoDeficiencia', 'tipoAcidente', 'tipoTrauma', 'causadorTrauma',
            'parteCorpo', 'circunstanciaAcidente', 'tipoExposicao', 'agente',
            'conduta', 'desfecho', 'evolucaoAcidentado', 'evolucaoCaso',
            'materialOrganico', 'sorologiaAcidentado', 'sorologiaPaciente',
            'doencaBase', 'tipoViolencia', 'tipoViolenciaSexual', 'motivoViolencia',
            'meioAgressao', 'tipoAutorViolencia', 'jornadaTrabalho', 'turnoTrabalho',
            'situacaoTrabalho', 'tipoAfastamento', 'motivoAfastamento',
            'motivoReadaptacao', 'tempoReadaptacao',
            'regimeAcompanhamento', 'equipamentoProtecao', 'tipoVinculo',
            'outroVinculo', 'funcao', 'grauSatisfacao', 'bairro', 'tipoDroga',
            'padraoEmail', 'parametro', 'parentesco', 'sorologia',
            'acompanhamentoReadaptacao'
        ]
    },
    nome: { type: String, required: true, trim: true },
    sigla: { type: String, trim: true },
    descricao: { type: String, trim: true },
    ativo: { type: Boolean, default: true },
    ordem: { type: Number, default: 0 }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'catalogos'
});
// Índice composto para busca rápida por entidade + ativo
CatalogoSchema.index({ entidade: 1, ativo: 1 });
// Índice para ordenação
CatalogoSchema.index({ entidade: 1, ordem: 1 });
export default mongoose.model('Catalogo', CatalogoSchema);
