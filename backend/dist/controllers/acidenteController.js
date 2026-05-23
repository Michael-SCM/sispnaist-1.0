import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteService from '../services/AcidenteService.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';
export const criar = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para criar acidentes', 403);
    }
    const acidente = await acidenteService.criar(req.body);
    await logAction(req, 'CREATE', 'Acidente', acidente._id.toString(), {
        tipoAcidente: acidente.tipoAcidente,
        dataAcidente: acidente.dataAcidente
    });
    res.status(201).json({
        status: 'success',
        data: { acidente },
    });
});
export const obter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const acidente = await acidenteService.obter(id);
    if (!acidente) {
        throw new AppError('Acidente não encontrado', 404);
    }
    // Se o usuário logado for trabalhador, só pode visualizar se o acidente for dele
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
        const recordTrabalhadorId = (acidente.trabalhadorId && acidente.trabalhadorId._id)
            ? acidente.trabalhadorId._id.toString()
            : acidente.trabalhadorId.toString();
        if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
            throw new AppError('Sem permissão para acessar os dados deste acidente', 403);
        }
    }
    res.status(200).json({
        status: 'success',
        data: { acidente },
    });
});
export const listar = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        tipoAcidente: req.query.tipoAcidente,
        status: req.query.status,
        trabalhadorId: req.query.trabalhadorId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
        descricao: req.query.descricao,
        cpfTrabalhador: req.query.cpfTrabalhador,
    };
    // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
        filtros.trabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
    }
    // Normaliza CPF do filtro (remover máscara) para evitar validações/rejeições
    if (typeof filtros.cpfTrabalhador === 'string' && filtros.cpfTrabalhador.trim()) {
        filtros.cpfTrabalhador = filtros.cpfTrabalhador.replace(/\D/g, '');
    }
    const { acidentes, total, pages } = await acidenteService.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        data: {
            acidentes,
            paginacao: {
                page,
                limit,
                total,
                pages,
            },
        },
    });
});
export const atualizar = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para atualizar acidentes', 403);
    }
    const { id } = req.params;
    const acidente = await acidenteService.atualizar(id, req.body);
    await logAction(req, 'UPDATE', 'Acidente', id, {
        status: acidente.status
    });
    res.status(200).json({
        status: 'success',
        data: { acidente },
    });
});
export const deletar = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para deletar acidentes', 403);
    }
    const { id } = req.params;
    await acidenteService.deletar(id);
    await logAction(req, 'DELETE', 'Acidente', id);
    res.status(204).send();
});
export const obterPorTrabalhador = asyncHandler(async (req, res) => {
    const { trabalhadorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Se o usuário logado for trabalhador, ele só pode acessar seus próprios dados
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
        if (!trabalhador || trabalhador._id.toString() !== trabalhadorId) {
            throw new AppError('Sem permissão para acessar estes dados', 403);
        }
    }
    const { acidentes, total, pages } = await acidenteService.obterPorTrabalhador(trabalhadorId, page, limit);
    res.status(200).json({
        status: 'success',
        data: {
            acidentes,
            paginacao: {
                page,
                limit,
                total,
                pages,
            },
        },
    });
});
export const obterEstatisticas = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
    }
    const stats = await acidenteService.obterEstatisticas();
    res.status(200).json({
        status: 'success',
        data: { stats },
    });
});
