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
const UnidadeSchema = new mongoose_1.Schema({
    nome: {
        type: String,
        required: [true, 'Nome da unidade é obrigatório'],
    },
    empresaId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: [true, 'Empresa é obrigatória'],
    },
    endereco: {
        logradouro: {
            type: String,
            required: [true, 'Logradouro é obrigatório'],
        },
        numero: {
            type: String,
            required: [true, 'Número é obrigatório'],
        },
        complemento: String,
        bairro: {
            type: String,
            required: [true, 'Bairro é obrigatório'],
        },
        cidade: {
            type: String,
            required: [true, 'Cidade é obrigatória'],
        },
        estado: {
            type: String,
            required: [true, 'Estado é obrigatório'],
        },
        cep: String,
    },
    gestor: String,
    ativa: {
        type: Boolean,
        default: true,
    },
}, {
    collection: 'unidades',
    timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' }
});
UnidadeSchema.index({ empresaId: 1 });
exports.default = mongoose_1.default.model('Unidade', UnidadeSchema);
