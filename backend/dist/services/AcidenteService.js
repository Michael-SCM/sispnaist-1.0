import Acidente from '../models/Acidente.js';
import User from '../models/User.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import mongoose from 'mongoose';
export class AcidenteService {
    /**
     * Resolve trabalhadorId de CPF para ObjectId
     * Se o valor já for um ObjectId válido, retorna como está
     * Se for um CPF, busca o usuário ou trabalhador e retorna seu ObjectId
     */
    async resolverTrabalhadorId(identifier) {
        // Se já for um ObjectId válido, retorna como está
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            return identifier;
        }
        // Tentar buscar na coleção de usuários primeiro
        const usuario = await User.findOne({ cpf: identifier });
        if (usuario) {
            return usuario._id.toString();
        }
        // Se não encontrar em User, tentar em Trabalhador
        const trabalhador = await Trabalhador.findOne({ cpf: identifier });
        if (trabalhador) {
            return trabalhador._id.toString();
        }
        throw new AppError(`Trabalhador com CPF ${identifier} não encontrado`, 404);
    }
    async criar(acidenteData) {
        // Resolver trabalhadorId se for CPF
        if (acidenteData.trabalhadorId && !mongoose.Types.ObjectId.isValid(acidenteData.trabalhadorId)) {
            acidenteData.trabalhadorId = await this.resolverTrabalhadorId(acidenteData.trabalhadorId);
        }
        const acidente = new Acidente(acidenteData);
        await acidente.save();
        return acidente.toObject();
    }
    async obter(id) {
        console.log(`[AcidenteService] Buscando acidente ID: ${id}`);
        const acidente = await Acidente.findById(id)
            .populate('trabalhadorId', 'nome cpf email empresa unidade')
            .lean();
        if (!acidente) {
            throw new AppError('Acidente não encontrado', 404);
        }
        console.log(`[AcidenteService] Acidente retornado:`, JSON.stringify(acidente));
        return acidente;
    }
    async listar(page = 1, limit = 10, filtros) {
        const skip = (page - 1) * limit;
        const query = {};
        // Aplicar filtros se fornecidos
        if (filtros?.tipoAcidente) {
            query.tipoAcidente = filtros.tipoAcidente;
        }
        if (filtros?.status) {
            query.status = filtros.status;
        }
        if (filtros?.trabalhadorId) {
            query.trabalhadorId = filtros.trabalhadorId;
        }
        if (filtros?.dataInicio || filtros?.dataFim) {
            query.dataAcidente = {};
            if (filtros?.dataInicio) {
                query.dataAcidente.$gte = new Date(filtros.dataInicio);
            }
            if (filtros?.dataFim) {
                query.dataAcidente.$lte = new Date(filtros.dataFim);
            }
        }
        const total = await Acidente.countDocuments(query);
        const acidentes = await Acidente.find(query)
            .populate('trabalhadorId', 'nome cpf email empresa unidade')
            .sort({ dataAcidente: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            acidentes: acidentes,
            total,
            pages,
        };
    }
    async atualizar(id, acidenteData) {
        console.log(`[AcidenteService] Atualizando acidente ID: ${id}, Payload:`, JSON.stringify(acidenteData));
        // Não permitir alterar data de criação
        if ('dataCriacao' in acidenteData) {
            delete acidenteData.dataCriacao;
        }
        // Resolver trabalhadorId se for CPF
        if (acidenteData.trabalhadorId && !mongoose.Types.ObjectId.isValid(acidenteData.trabalhadorId)) {
            acidenteData.trabalhadorId = await this.resolverTrabalhadorId(acidenteData.trabalhadorId);
        }
        // Garantir que lesões é um array, mas SOMENTE se ele foi enviado no payload
        if (acidenteData.lesoes !== undefined && !Array.isArray(acidenteData.lesoes)) {
            acidenteData.lesoes = [];
        }
        // Usar $set explicitamente para garantir que arrays (como lesoes) sejam substituídos corretamente
        const acidente = await Acidente.findByIdAndUpdate(id, { $set: acidenteData }, {
            new: true,
            runValidators: true,
        }).populate('trabalhadorId', 'nome cpf email empresa unidade').lean();
        if (!acidente) {
            throw new AppError('Acidente não encontrado', 404);
        }
        console.log(`[AcidenteService] Acidente APÓS atualização:`, JSON.stringify(acidente));
        return acidente;
    }
    async deletar(id) {
        const result = await Acidente.findByIdAndDelete(id);
        if (!result) {
            throw new AppError('Acidente não encontrado', 404);
        }
    }
    async obterPorTrabalhador(trabalhadorId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const query = { trabalhadorId };
        const total = await Acidente.countDocuments(query);
        const acidentes = await Acidente.find(query)
            .sort({ dataAcidente: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const pages = Math.ceil(total / limit);
        return {
            acidentes: acidentes,
            total,
            pages,
        };
    }
    async obterEstatisticas() {
        const total = await Acidente.countDocuments();
        const porTipo = await Acidente.aggregate([
            {
                $group: {
                    _id: '$tipoAcidente',
                    quantidade: { $sum: 1 },
                },
            },
        ]);
        const porStatus = await Acidente.aggregate([
            {
                $group: {
                    _id: '$status',
                    quantidade: { $sum: 1 },
                },
            },
        ]);
        // Últimos 6 meses
        const seisMesesAtras = new Date();
        seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
        const ultimosMeses = await Acidente.aggregate([
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
        ]);
        return {
            total,
            porTipo: porTipo.reduce((acc, item) => {
                acc[item._id || 'Não informado'] = item.quantidade;
                return acc;
            }, {}),
            porStatus: porStatus.reduce((acc, item) => {
                acc[item._id || 'Não informado'] = item.quantidade;
                return acc;
            }, {}),
            ultimosMeses: ultimosMeses.map((item) => ({
                mes: `${item._id.mes}/${item._id.ano}`,
                quantidade: item.quantidade,
            })),
        };
    }
}
export default new AcidenteService();
//# sourceMappingURL=AcidenteService.js.map