import { asyncHandler } from '../middleware/asyncHandler.js';
import trabalhadorService from '../services/TrabalhadorService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction } from '../utils/auditLogger.js';
/**
 * @desc    Listar trabalhadores com paginação e filtros
 * @route   GET /api/trabalhadores
 * @access  Private
 */
export const getTrabalhadores = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nome: req.query.nome,
        cpf: req.query.cpf,
        matricula: req.query.matricula,
        setor: req.query.setor,
    };
    // Se o usuário logado for trabalhador, força o filtro por seu próprio CPF
    if (req.user?.perfil === 'trabalhador') {
        filtros.cpf = req.user.cpf;
    }
    const result = await trabalhadorService.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter um único trabalhador
 * @route   GET /api/trabalhadores/:id
 * @access  Private
 */
export const getTrabalhador = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const trabalhador = await trabalhadorService.obter(id);
    if (!trabalhador) {
        throw new AppError('Trabalhador não encontrado', 404);
    }
    // Se o usuário logado for trabalhador, ele só pode acessar seu próprio perfil (CPF correspondente)
    if (req.user?.perfil === 'trabalhador' && trabalhador.cpf !== req.user.cpf) {
        throw new AppError('Sem permissão para acessar os dados deste trabalhador', 403);
    }
    res.status(200).json({
        status: 'success',
        data: { trabalhador },
    });
});
/**
 * @desc    Obter um único trabalhador com todos os submódulos
 * @route   GET /api/trabalhadores/:id/completo
 * @access  Private
 */
export const getTrabalhadorCompleto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const trabalhador = await trabalhadorService.obterComSubmodulos(id);
    if (!trabalhador) {
        throw new AppError('Trabalhador não encontrado', 404);
    }
    // Se o usuário logado for trabalhador, ele só pode acessar seu próprio perfil (CPF correspondente)
    if (req.user?.perfil === 'trabalhador' && trabalhador.cpf !== req.user.cpf) {
        throw new AppError('Sem permissão para acessar os dados deste trabalhador', 403);
    }
    res.status(200).json({
        status: 'success',
        data: { trabalhador },
    });
});
/**
 * @desc    Criar novo trabalhador
 * @route   POST /api/trabalhadores
 * @access  Private/Admin/Saude
 */
export const createTrabalhador = asyncHandler(async (req, res) => {
    // Trabalhadores não podem cadastrar nenhum perfil
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para cadastrar trabalhadores', 403);
    }
    try {
        const trabalhador = await trabalhadorService.criar(req.body);
        await logAction(req, 'CREATE', 'Trabalhador', trabalhador._id.toString(), {
            nome: trabalhador.nome,
            cpf: trabalhador.cpf
        });
        res.status(201).json({
            status: 'success',
            data: { trabalhador },
        });
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            error.receivedBody = req.body;
        }
        throw error;
    }
});
/**
 * @desc    Atualizar trabalhador
 * @route   PUT /api/trabalhadores/:id
 * @access  Private/Admin/Saude
 */
export const updateTrabalhador = asyncHandler(async (req, res) => {
    // Trabalhadores não podem atualizar nenhum perfil (apenas leitura de seus próprios dados)
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para atualizar dados de trabalhadores', 403);
    }
    const { id } = req.params;
    const trabalhador = await trabalhadorService.atualizar(id, req.body);
    await logAction(req, 'UPDATE', 'Trabalhador', id, {
        nome: trabalhador.nome
    });
    res.status(200).json({
        status: 'success',
        data: { trabalhador },
    });
});
/**
 * @desc    Deletar trabalhador
 * @route   DELETE /api/trabalhadores/:id
 * @access  Private/Admin
 */
export const deleteTrabalhador = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para deletar trabalhadores', 403);
    }
    const { id } = req.params;
    await trabalhadorService.deletar(id);
    await logAction(req, 'DELETE', 'Trabalhador', id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
