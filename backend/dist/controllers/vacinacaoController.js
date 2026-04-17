import { asyncHandler } from '../middleware/asyncHandler.js';
import vacinacaoService from '../services/VacinacaoService.js';
export const criarVacinacao = asyncHandler(async (req, res) => {
    const vacinacao = await vacinacaoService.criar(req.body);
    res.status(201).json({
        status: 'success',
        data: { vacinacao },
    });
});
export const obterVacinacao = asyncHandler(async (req, res) => {
    const vacinacao = await vacinacaoService.obter(req.params.id);
    res.status(200).json({
        status: 'success',
        data: { vacinacao },
    });
});
export const listarVacinacoes = asyncHandler(async (req, res) => {
    const { page, limit, vacina, trabalhadorId } = req.query;
    const result = await vacinacaoService.listar({
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        vacina: vacina,
        trabalhadorId: trabalhadorId,
    });
    res.status(200).json({
        status: 'success',
        data: result,
    });
});
export const atualizarVacinacao = asyncHandler(async (req, res) => {
    const vacinacao = await vacinacaoService.atualizar(req.params.id, req.body);
    res.status(200).json({
        status: 'success',
        data: { vacinacao },
    });
});
export const deletarVacinacao = asyncHandler(async (req, res) => {
    await vacinacaoService.deletar(req.params.id);
    res.status(204).send();
});
export const obterVacinacoesPorTrabalhador = asyncHandler(async (req, res) => {
    const vacinacoes = await vacinacaoService.obterPorTrabalhador(req.params.trabalhadorId);
    res.status(200).json({
        status: 'success',
        data: { vacinacoes },
    });
});
export const obterEstatisticas = asyncHandler(async (req, res) => {
    const estatisticas = await vacinacaoService.obterEstatisticas();
    res.status(200).json({
        status: 'success',
        data: estatisticas,
    });
});
//# sourceMappingURL=vacinacaoController.js.map