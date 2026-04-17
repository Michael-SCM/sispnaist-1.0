import { asyncHandler } from '../middleware/asyncHandler.js';
import trabalhadorService from '../services/TrabalhadorService.js';
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
    const trabalhador = await trabalhadorService.criar(req.body);
    res.status(201).json({
        status: 'success',
        data: { trabalhador },
    });
});
/**
 * @desc    Atualizar trabalhador
 * @route   PUT /api/trabalhadores/:id
 * @access  Private/Admin/Saude
 */
export const updateTrabalhador = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const trabalhador = await trabalhadorService.atualizar(id, req.body);
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
    const { id } = req.params;
    await trabalhadorService.deletar(id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
//# sourceMappingURL=trabalhadorController.js.map