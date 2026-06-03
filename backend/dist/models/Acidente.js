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
const AcidenteSchema = new mongoose_1.Schema({
    dataAcidente: {
        type: Date,
        required: [true, 'Data do acidente é obrigatória'],
    },
    horario: String,
    horarioAposInicioJornada: String,
    trabalhadorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Trabalhador',
        required: [true, 'Trabalhador é obrigatório'],
    },
    tipoAcidente: {
        type: String,
        required: [true, 'Tipo de acidente é obrigatório'],
    },
    tipoTrauma: {
        type: String,
        required: [true, 'Tipo de trauma é obrigatório'],
    },
    agenteCausador: {
        type: String,
        required: [true, 'Agente causador é obrigatório'],
    },
    parteCorpo: {
        type: String,
        required: [true, 'Parte do corpo é obrigatória'],
    },
    descricao: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
    },
    descricaoTrauma: String,
    local: {
        type: String,
        required: [true, 'Local do acidente é obrigatório'],
    },
    lesoes: {
        type: [String],
        required: [true, 'Lesões são obrigatórias'],
        validate: {
            validator: (v) => v.length > 0,
            message: 'Adicione pelo menos uma lesão',
        },
    },
    feriado: {
        type: Boolean,
        default: false,
    },
    comunicado: {
        type: Boolean,
        default: false,
    },
    dataComunicacao: Date,
    dataNotificacao: Date,
    // Campos de atendimento médico
    atendimentoMedico: Boolean,
    dataAtendimento: Date,
    horaAtendimento: String,
    unidadeAtendimento: String,
    // Campos de internamento
    internamento: Boolean,
    duracaoInternamento: Number,
    // CAT/NAS
    catNas: Boolean,
    // Registro Policial
    registroPolicial: Boolean,
    // Encaminhamento junta médica
    encaminhamentoJuntaMedica: Boolean,
    // Afastamento
    afastamento: Boolean,
    // Outros trabalhadores atingidos
    outrosTrabalhadoresAtingidos: Boolean,
    quantidadeTrabalhadoresAtingidos: Number,
    status: {
        type: String,
        enum: ['Aberto', 'Em Análise', 'Fechado'],
        default: 'Aberto',
    },
}, { collection: 'acidentes', timestamps: true });
AcidenteSchema.index({ trabalhadorId: 1, dataAcidente: -1 });
AcidenteSchema.index({ status: 1 });
AcidenteSchema.index({ dataAcidente: 1 });
exports.default = mongoose_1.default.model('Acidente', AcidenteSchema);
