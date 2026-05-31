import { asyncHandler } from '../middleware/asyncHandler.js';
import empresaService from '../services/EmpresaService.js';
import { logAction, compararDados } from '../utils/auditLogger.js';
/**
 * @desc    Listar empresas com paginação e filtros
 * @route   GET /api/empresas
 * @access  Private/Admin
 */
export const getEmpresas = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        razaoSocial: req.query.razaoSocial,
        cnpj: req.query.cnpj,
    };
    const result = await empresaService.listar(page, limit, filtros);
    res.status(200).json({
        status: 'success',
        ...result,
    });
});
/**
 * @desc    Obter uma única empresa
 * @route   GET /api/empresas/:id
 * @access  Private/Admin
 */
export const getEmpresa = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresa = await empresaService.obter(id);
    res.status(200).json({
        status: 'success',
        data: { empresa },
    });
});
/**
 * @desc    Criar nova empresa
 * @route   POST /api/empresas
 * @access  Private/Admin
 */
export const createEmpresa = asyncHandler(async (req, res) => {
    const empresa = await empresaService.criar(req.body);
    await logAction(req, 'CREATE', 'Empresa', empresa._id.toString(), empresa);
    res.status(201).json({
        status: 'success',
        data: { empresa },
    });
});
/**
 * @desc    Atualizar empresa
 * @route   PUT /api/empresas/:id
 * @access  Private/Admin
 */
export const updateEmpresa = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaAntiga = await empresaService.obter(id);
    const empresa = await empresaService.atualizar(id, req.body);
    const mudancas = compararDados(empresaAntiga, empresa);
    await logAction(req, 'UPDATE', 'Empresa', id, mudancas);
    res.status(200).json({
        status: 'success',
        data: { empresa },
    });
});
/**
 * @desc    Deletar empresa
 * @route   DELETE /api/empresas/:id
 * @access  Private/Admin
 */
export const deleteEmpresa = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const empresaAntiga = await empresaService.obter(id);
    await empresaService.deletar(id);
    await logAction(req, 'DELETE', 'Empresa', id, empresaAntiga);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
/**
 * @desc    Buscar empresa vinculada a uma unidade
 * @route   GET /api/empresas/unidade/:unidadeId
 * @access  Private
 */
export const getEmpresaPorUnidade = asyncHandler(async (req, res) => {
    const { unidadeId } = req.params;
    const empresa = await empresaService.listarPorUnidade(unidadeId);
    res.status(200).json({
        status: 'success',
        data: { empresa },
    });
});
