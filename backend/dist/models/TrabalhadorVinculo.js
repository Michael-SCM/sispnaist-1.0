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
const TrabalhadorVinculoSchema = new mongoose_1.Schema({
    trabalhadorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Trabalhador', required: true, index: true },
    tipoVinculo: { type: String, required: true, trim: true },
    matricula: { type: String, required: true, trim: true },
    funcao: { type: String, trim: true },
    jornadaTrabalho: { type: String, required: true, trim: true },
    turnoTrabalho: { type: String, trim: true },
    dataInicio: { type: Date, required: true },
    dataFim: { type: Date },
    situacao: { type: String, trim: true, default: 'Ativo' },
    empresaTerceirizada: { type: String, trim: true },
    setor: { type: String, trim: true },
    cargo: { type: String, trim: true },
    ocupacao: { type: String, trim: true },
    cargaHoraria: { type: Number, min: 1, max: 168 },
    salario: { type: Number, min: 0 },
    observacoes: { type: String, trim: true },
    ativo: { type: Boolean, default: true }
}, {
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' },
    collection: 'trabalhador_vinculos'
});
TrabalhadorVinculoSchema.index({ trabalhadorId: 1, dataInicio: -1 });
TrabalhadorVinculoSchema.index({ trabalhadorId: 1, ativo: 1 });
exports.default = mongoose_1.default.model('TrabalhadorVinculo', TrabalhadorVinculoSchema);
