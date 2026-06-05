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
const MaterialBiologicoSchema = new mongoose_1.Schema({
    acidenteId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.default = mongoose_1.default.model('MaterialBiologico', MaterialBiologicoSchema);
