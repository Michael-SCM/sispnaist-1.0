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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const Acidente_js_1 = __importDefault(require("../models/Acidente.js"));
const Doenca_js_1 = __importDefault(require("../models/Doenca.js"));
const Vacinacao_js_1 = __importDefault(require("../models/Vacinacao.js"));
const Trabalhador_js_1 = __importDefault(require("../models/Trabalhador.js"));
const User_js_1 = __importDefault(require("../models/User.js"));
const mongoose_1 = __importDefault(require("mongoose"));
class AnalyticsService {
    /**
     * Obtém KPIs gerais do sistema
     */
    async obterKPIs() {
        const trintaDias = new Date();
        trintaDias.setDate(trintaDias.getDate() + 30);
        const TrabalhadorAfastamento = (await Promise.resolve().then(() => __importStar(require('../models/TrabalhadorAfastamento.js')))).default;
        const [totalAcidentes, acidentesAbertos, acidentesEmAnalise, acidentesFechados, totalTrabalhadores, totalDoencas, doencasAtivas, totalVacinacoes, proximasVacinacoes, trabalhadoresComVacina, absenteismoAgg] = await Promise.all([
            Acidente_js_1.default.countDocuments(),
            Acidente_js_1.default.countDocuments({ status: 'Aberto' }),
            Acidente_js_1.default.countDocuments({ status: 'Em Análise' }),
            Acidente_js_1.default.countDocuments({ status: 'Fechado' }),
            Trabalhador_js_1.default.countDocuments({ 'vinculo.situacao': 'Ativo' }),
            Doenca_js_1.default.countDocuments(),
            Doenca_js_1.default.countDocuments({ ativo: true }),
            Vacinacao_js_1.default.countDocuments(),
            Vacinacao_js_1.default.countDocuments({ proximoDose: { $lte: trintaDias } }),
            Vacinacao_js_1.default.distinct('trabalhadorId'),
            TrabalhadorAfastamento.aggregate([
                {
                    $match: {
                        dataInicio: { $exists: true, $ne: null },
                        dataRetorno: { $exists: true, $ne: null }
                    }
                },
                {
                    $project: {
                        diasAfastamento: {
                            $ceil: {
                                $divide: [
                                    { $subtract: ['$dataRetorno', '$dataInicio'] },
                                    1000 * 60 * 60 * 24
                                ]
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$diasAfastamento' }
                    }
                }
            ])
        ]);
        // Taxa de resolução (acidentes fechados / total * 100)
        const taxaResolucao = totalAcidentes > 0
            ? Math.round((acidentesFechados / totalAcidentes) * 100)
            : 0;
        // Cobertura vacinal aproximada
        const coberturaVacinal = totalTrabalhadores > 0
            ? Math.round((trabalhadoresComVacina.length / totalTrabalhadores) * 100)
            : 0;
        // Total absenteísmo (dias de afastamento) calculado a partir dos afastamentos reais
        const totalAbsenteismo = absenteismoAgg[0]?.total || 0;
        return {
            totalAcidentes,
            acidentesAbertos,
            acidentesEmAnalise,
            acidentesFechados,
            taxaResolucao,
            totalTrabalhadores,
            totalDoencas,
            doencasAtivas,
            totalVacinacoes,
            proximasVacinacoes,
            coberturaVacinal,
            totalAbsenteismo
        };
    }
    /**
     * Obtém dados para gráficos de acidentes
     */
    async obterDadosAcidentes() {
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
        // Executa as agregações em paralelo
        const [porTipoAgg, porStatusAgg, ultimosMesesAgg] = await Promise.all([
            Acidente_js_1.default.aggregate([
                {
                    $group: {
                        _id: '$tipoAcidente',
                        valor: { $sum: 1 },
                    },
                },
                { $sort: { valor: -1 } },
            ]),
            Acidente_js_1.default.aggregate([
                {
                    $group: {
                        _id: '$status',
                        valor: { $sum: 1 },
                    },
                },
                { $sort: { valor: -1 } },
            ]),
            Acidente_js_1.default.aggregate([
                {
                    $match: {
                        dataAcidente: { $gte: seisMesesAtras },
                    },
                },
                {
                    $group: {
                        _id: {
                            ano: { $year: '$dataAcidente' },
                            mes: { $month: '$dataAcidente' },
                        },
                        quantidade: { $sum: 1 },
                    },
                },
                {
                    $sort: { '_id.ano': 1, '_id.mes': 1 },
                },
            ])
        ]);
        const porTipo = porTipoAgg.map((item) => ({
            nome: item._id || 'Não informado',
            valor: item.valor,
        }));
        const porStatus = porStatusAgg.map((item) => ({
            nome: item._id || 'Não informado',
            valor: item.valor,
        }));
        // Gerar array completo dos últimos 6 meses (incluindo meses com 0 acidentes)
        const ultimosMeses = [];
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 5; i >= 0; i--) {
            const data = new Date();
            data.setMonth(data.getMonth() - i);
            const mesIndex = data.getMonth();
            const ano = data.getFullYear();
            const mesLabel = `${mesesNomes[mesIndex]}/${ano.toString().slice(2)}`;
            const encontrado = ultimosMesesAgg.find((item) => item._id.mes === (mesIndex + 1) && item._id.ano === ano);
            ultimosMeses.push({
                mes: mesLabel,
                quantidade: encontrado ? encontrado.quantidade : 0,
            });
        }
        return {
            porTipo,
            porStatus,
            ultimosMeses,
        };
    }
    /**
     * Obtém próximas vacinações (vencidas ou próximas de vencer)
     */
    async obterProximasVacinacoes(dias = 30) {
        const hoje = new Date();
        const limite = new Date();
        limite.setDate(limite.getDate() + dias);
        const vacinacoesBrutas = await Vacinacao_js_1.default.find({
            proximoDose: { $lte: limite },
        })
            .populate('trabalhadorId', 'nome cpf email empresa unidade')
            .sort({ proximoDose: 1 })
            .limit(20)
            .lean();
        const vacinacoes = await Promise.all(vacinacoesBrutas.map(async (vacinacao) => {
            if (!vacinacao.trabalhadorId || typeof vacinacao.trabalhadorId === 'string' || !vacinacao.trabalhadorId.nome) {
                const doc = await Vacinacao_js_1.default.findById(vacinacao._id).select('trabalhadorId').lean();
                if (doc && doc.trabalhadorId) {
                    const identifier = doc.trabalhadorId.toString();
                    let t = null;
                    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                        const [trabalhadorObj, userObj] = await Promise.all([
                            Trabalhador_js_1.default.findById(identifier).select('nome cpf').lean(),
                            User_js_1.default.findById(identifier).select('nome cpf').lean()
                        ]);
                        t = trabalhadorObj || userObj;
                    }
                    else {
                        const [trabalhadorObj, userObj] = await Promise.all([
                            Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean(),
                            User_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean()
                        ]);
                        t = trabalhadorObj || userObj;
                    }
                    if (t)
                        vacinacao.trabalhadorId = t;
                }
            }
            return vacinacao;
        }));
        return vacinacoes.map((vac) => {
            const dataVencimento = new Date(vac.proximoDose);
            const diffDias = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
            let status = 'Em dia';
            if (diffDias < 0) {
                status = 'Vencida';
            }
            else if (diffDias <= 7) {
                status = 'Vence em breve';
            }
            return {
                ...vac,
                status,
                diasRestantes: diffDias,
            };
        });
    }
    /**
     * Obtém últimos acidentes registrados
     */
    async obterUltimosAcidentes(limit = 5) {
        const acidentesBrutos = await Acidente_js_1.default.find()
            .populate('trabalhadorId', 'nome cpf empresa unidade')
            .sort({ dataAcidente: -1 })
            .limit(limit)
            .lean();
        const acidentes = await Promise.all(acidentesBrutos.map(async (acidente) => {
            if (!acidente.trabalhadorId || typeof acidente.trabalhadorId === 'string' || !acidente.trabalhadorId.nome) {
                const doc = await Acidente_js_1.default.findById(acidente._id).select('trabalhadorId').lean();
                if (doc && doc.trabalhadorId) {
                    const identifier = doc.trabalhadorId.toString();
                    let t = null;
                    if (mongoose_1.default.Types.ObjectId.isValid(identifier)) {
                        const [trabalhadorObj, userObj] = await Promise.all([
                            Trabalhador_js_1.default.findById(identifier).select('nome cpf').lean(),
                            User_js_1.default.findById(identifier).select('nome cpf').lean()
                        ]);
                        t = trabalhadorObj || userObj;
                    }
                    else {
                        const [trabalhadorObj, userObj] = await Promise.all([
                            Trabalhador_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean(),
                            User_js_1.default.findOne({ cpf: identifier }).select('nome cpf').lean()
                        ]);
                        t = trabalhadorObj || userObj;
                    }
                    if (t)
                        acidente.trabalhadorId = t;
                }
            }
            return acidente;
        }));
        return acidentes;
    }
    /**
     * Obtém dados completos para dashboard admin
     */
    async obterDadosDashboardAdmin() {
        const [kpis, dadosAcidentes, proximasVacinacoes, ultimosAcidentes, trabalhadoresPorEmpresa] = await Promise.all([
            this.obterKPIs(),
            this.obterDadosAcidentes(),
            this.obterProximasVacinacoes(30),
            this.obterUltimosAcidentes(5),
            Trabalhador_js_1.default.aggregate([
                { $match: { empresa: { $exists: true, $ne: null } } },
                {
                    $lookup: {
                        from: 'empresas',
                        localField: 'empresa',
                        foreignField: '_id',
                        as: 'empresaData',
                    },
                },
                { $unwind: { path: '$empresaData', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: '$empresaData.razaoSocial',
                        total: { $sum: 1 },
                    },
                },
                { $sort: { total: -1 } },
            ])
        ]);
        const empresasFormatadas = trabalhadoresPorEmpresa.map((item) => ({
            nome: item._id || 'Sem empresa',
            total: item.total,
        }));
        return {
            kpis,
            graficos: {
                acidentesPorTipo: dadosAcidentes.porTipo,
                acidentesPorStatus: dadosAcidentes.porStatus,
                acidentesUltimosMeses: dadosAcidentes.ultimosMeses,
                trabalhadoresPorEmpresa: empresasFormatadas,
            },
            tabelas: {
                proximasVacinacoes,
                ultimosAcidentes,
            },
        };
    }
    /**
     * Obtém dados resumidos para dashboard do trabalhador
     */
    async obterDadosDashboardTrabalhador(trabalhadorId) {
        const acidentes = await Acidente_js_1.default.countDocuments({ trabalhadorId });
        const doencas = await Doenca_js_1.default.countDocuments({ trabalhadorId, ativo: true });
        const vacinacoes = await Vacinacao_js_1.default.find({ trabalhadorId })
            .sort({ proximoDose: 1 })
            .lean();
        const proximaVacinacao = vacinacoes.find((vac) => {
            if (!vac.proximoDose)
                return false;
            const data = new Date(vac.proximoDose);
            return data >= new Date();
        });
        const vacinacaoVencida = vacinacoes.find((vac) => {
            if (!vac.proximoDose)
                return false;
            const data = new Date(vac.proximoDose);
            return data < new Date();
        });
        return {
            resumo: {
                acidentes,
                doencasAtivas: doencas,
                totalVacinacoes: vacinacoes.length,
            },
            proximaVacinacao: proximaVacinacao || null,
            vacinacaoVencida: vacinacaoVencida || null,
            ultimosAcidentes: await Acidente_js_1.default.find({ trabalhadorId })
                .sort({ dataAcidente: -1 })
                .limit(3)
                .lean(),
        };
    }
    /**
     * Obtém dados detalhados de monitoramento clínico
     */
    async obterMonitoramentoClinico() {
        const totalTrabalhadores = await Trabalhador_js_1.default.countDocuments({ 'vinculo.situacao': 'Ativo' });
        const trabalhadoresComVacina = await Vacinacao_js_1.default.distinct('trabalhadorId');
        // Alertas Críticos
        // Regra atual: trabalhadores com >= 2 acidentes
        // Ajuste: buscar nome na coleção 'trabalhadores' (não em 'users')
        const trabalhadoresEmRisco = await Acidente_js_1.default.aggregate([
            {
                $group: { _id: '$trabalhadorId', count: { $sum: 1 } },
            },
            { $match: { count: { $gte: 2 } } },
            {
                $lookup: {
                    from: 'trabalhadores',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'trabalhador',
                },
            },
            { $unwind: '$trabalhador' },
            { $project: { nome: '$trabalhador.nome', total: '$count' } },
        ]);
        const alertasCriticos = trabalhadoresEmRisco.map((t) => ({
            trabalhador: t.nome,
            motivo: `${t.total} acidentes registrados`,
            nivel: (t.total > 3 ? 'alto' : 'medio'),
        }));
        // Absenteísmo por mês
        // Ajuste: o campo diasAfastamento não existe no modelo 'Acidente'.
        // Então calculamos por afastamentos do trabalhador (TrabalhadorAfastamento), somando dias entre dataInicio e dataFim (ou dataRetorno).
        const TrabalhadorAfastamento = (await Promise.resolve().then(() => __importStar(require('../models/TrabalhadorAfastamento.js')))).default;
        const afastamentos = await TrabalhadorAfastamento.find({}).lean();
        const porMesMap = {};
        let totalDias = 0;
        for (const a of afastamentos) {
            const inicioISO = new Date(a.dataInicio).toISOString();
            const fimISO = a.dataFim
                ? new Date(a.dataFim).toISOString()
                : a.dataRetorno
                    ? new Date(a.dataRetorno).toISOString()
                    : null;
            if (!fimISO)
                continue;
            const [inicioDate] = inicioISO.split('T');
            const [fimDate] = fimISO.split('T');
            const [iy, im, id] = inicioDate.split('-').map(Number);
            const [fy, fm, fd] = fimDate.split('-').map(Number);
            const diffDias = (new Date(fy, fm - 1, fd).getTime() - new Date(iy, im - 1, id).getTime()) / (1000 * 60 * 60 * 24);
            const diasArredondado = Math.round(diffDias);
            if (diasArredondado <= 0)
                continue;
            totalDias += diasArredondado;
            const mes = im;
            const ano = iy;
            const key = `${ano}-${mes}`;
            porMesMap[key] = (porMesMap[key] || 0) + diasArredondado;
        }
        // Gerar últimos 12 meses com labels
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const porMes = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mes = d.getMonth() + 1; // 1-12
            const ano = d.getFullYear();
            const key = `${ano}-${mes}`;
            const label = `${mesesNomes[mes - 1]}/${ano.toString().slice(2)}`;
            porMes.push({ mes: label, dias: porMesMap[key] || 0 });
        }
        // Cobertura vacinal por empresa
        // Definição: percentual de trabalhadores ativos (vinculo.situacao === 'Ativo') que possuem pelo menos 1 registro em Vacinacao,
        // agrupado por empresa do Trabalhador.
        const totalAtivosPorEmpresa = await Trabalhador_js_1.default.aggregate([
            {
                $match: {
                    'vinculo.situacao': 'Ativo',
                    empresa: { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: '$empresa',
                    totalAtivos: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'empresas',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'empresaData',
                },
            },
            { $unwind: { path: '$empresaData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    empresaId: '$_id',
                    totalAtivos: 1,
                    nomeEmpresa: '$empresaData.razaoSocial',
                },
            },
        ]);
        const ativosComVacinaPorEmpresa = await Vacinacao_js_1.default.aggregate([
            {
                $lookup: {
                    from: 'trabalhadores',
                    localField: 'trabalhadorId',
                    foreignField: '_id',
                    as: 'trabalhadorData',
                },
            },
            { $unwind: '$trabalhadorData' },
            {
                $match: {
                    'trabalhadorData.vinculo.situacao': 'Ativo',
                    'trabalhadorData.empresa': { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: {
                        empresa: '$trabalhadorData.empresa',
                        trabalhador: '$trabalhadorId',
                    },
                },
            },
            {
                $group: {
                    _id: '$_id.empresa',
                    totalComVacina: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'empresas',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'empresaData',
                },
            },
            { $unwind: { path: '$empresaData', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    empresaId: '$_id',
                    totalComVacina: 1,
                    nomeEmpresa: '$empresaData.razaoSocial',
                },
            },
        ]);
        const mapVacina = new Map(ativosComVacinaPorEmpresa.map((item) => [
            item.empresaId?.toString?.() ?? String(item.empresaId),
            item.totalComVacina,
        ]));
        const porEmpresa = totalAtivosPorEmpresa
            .map((item) => {
            const empresaKey = item.empresaId?.toString?.() ?? String(item.empresaId);
            const totalAtivos = item.totalAtivos ?? 0;
            const totalComVacina = mapVacina.get(empresaKey) ?? 0;
            const cobertura = totalAtivos > 0 ? Math.round((totalComVacina / totalAtivos) * 100) : 0;
            return {
                nome: item.nomeEmpresa || 'Sem empresa',
                cobertura,
            };
        })
            .sort((a, b) => (b.cobertura ?? 0) - (a.cobertura ?? 0));
        // Mes atual (este mes e mes anterior)
        const now = new Date();
        const mesAtual = now.getMonth() + 1;
        const anoAtual = now.getFullYear();
        const mesAnterior = mesAtual === 1 ? 12 : mesAtual - 1;
        const anoAnterior = mesAtual === 1 ? anoAtual - 1 : anoAtual;
        const chaveMesAtual = `${anoAtual}-${mesAtual}`;
        const chaveMesAnterior = `${anoAnterior}-${mesAnterior}`;
        const diasMesAtual = porMesMap[chaveMesAtual] || 0;
        const diasMesAnterior = porMesMap[chaveMesAnterior] || 0;
        // Variacao percentual
        let variacao = 0;
        if (diasMesAnterior > 0) {
            variacao = Math.round(((diasMesAtual - diasMesAnterior) / diasMesAnterior) * 100);
        }
        else if (diasMesAtual > 0) {
            variacao = 100; // primeira vez com dados
        }
        return {
            coberturaVacinal: {
                total: totalTrabalhadores > 0
                    ? Math.round((trabalhadoresComVacina.length / totalTrabalhadores) * 100)
                    : 0,
                porEmpresa,
            },
            absenteismo: {
                totalDias: diasMesAtual,
                variacao,
                porMes,
            },
            alertasCriticos,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
exports.default = new AnalyticsService();
