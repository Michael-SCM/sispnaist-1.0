import { asyncHandler } from '../middleware/asyncHandler.js';
import unidadeService from '../services/UnidadeService.js';
/**
 * @desc    Listar unidades com paginação e filtros
 * @route   GET /api/unidades
 * @access  Private/Admin
 */
export const getUnidades = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nome: req.query.nome,
        empresaId: req.query.empresaId,
    };
    const result = await unidadeService.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter uma única unidade
 * @route   GET /api/unidades/:id
 * @access  Private/Admin
 */
export const getUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const unidade = await unidadeService.obter(id);
    res.status(200).json({
        status: 'success',
        data: { unidade },
    });
});
/**
 * @desc    Criar nova unidade
 * @route   POST /api/unidades
 * @access  Private/Admin
 */
export const createUnidade = asyncHandler(async (req, res) => {
    const unidade = await unidadeService.criar(req.body);
    res.status(201).json({
        status: 'success',
        data: { unidade },
    });
});
/**
 * @desc    Atualizar unidade
 * @route   PUT /api/unidades/:id
 * @access  Private/Admin
 */
export const updateUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const unidade = await unidadeService.atualizar(id, req.body);
    res.status(200).json({
        status: 'success',
        data: { unidade },
    });
});
/**
 * @desc    Deletar unidade
 * @route   DELETE /api/unidades/:id
 * @access  Private/Admin
 */
export const deleteUnidade = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await unidadeService.deletar(id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
/**
 * @desc    Listar unidades por empresa
 * @route   GET /api/unidades/empresa/:empresaId
 * @access  Private
 */
export const getUnidadesPorEmpresa = asyncHandler(async (req, res) => {
    const { empresaId } = req.params;
    const unidades = await unidadeService.listarPorEmpresa(empresaId);
    res.status(200).json({
        status: 'success',
        data: { unidades },
    });
});
//# sourceMappingURL=unidadeController.js.map