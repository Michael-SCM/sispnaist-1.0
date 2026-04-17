import { asyncHandler } from '../middleware/asyncHandler.js';
import acidenteService from '../services/AcidenteService.js';
export const criar = asyncHandler(async (req, res) => {
    const acidente = await acidenteService.criar(req.body);
    res.status(201).json({
        status: 'success',
        data: { acidente },
    });
});
export const obter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const acidente = await acidenteService.obter(id);
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
    };
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
    const { id } = req.params;
    const acidente = await acidenteService.atualizar(id, req.body);
    res.status(200).json({
        status: 'success',
        data: { acidente },
    });
});
export const deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await acidenteService.deletar(id);
    res.status(204).send();
});
export const obterPorTrabalhador = asyncHandler(async (req, res) => {
    const { trabalhadorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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
    const stats = await acidenteService.obterEstatisticas();
    res.status(200).json({
        status: 'success',
        data: { stats },
    });
});
//# sourceMappingURL=acidenteController.js.map