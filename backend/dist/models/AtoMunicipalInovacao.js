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
const AtoMunicipalInovacaoSchema = new mongoose_1.Schema({
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
    papeisModoGovernanca: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Catalogo' }],
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'atos_municipais_inovacao'
});
// Índices para busca rápida
AtoMunicipalInovacaoSchema.index({ nr_ato: 1, ano_ato: 1 }, { unique: true });
AtoMunicipalInovacaoSchema.index({ nm_cidade: 1, nm_estado: 1 });
exports.default = mongoose_1.default.model('AtoMunicipalInovacao', AtoMunicipalInovacaoSchema);
