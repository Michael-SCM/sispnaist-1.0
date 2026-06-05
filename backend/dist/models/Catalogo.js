"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CatalogoSchema = new mongoose_1.Schema({
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
exports.default = mongoose_1.default.model('Catalogo', CatalogoSchema);
