import doencaService from '../services/DoencaService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
export const criar = asyncHandler(async (req, res) => {
    const doencaData = {
        ...req.body,
        trabalhadorId: req.body.trabalhadorId || req.user?._id,
    };
    const doenca = await doencaService.criar(doencaData);
    res.status(201).json({ sucesso: true, dados: doenca });
});
export const obter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const doenca = await doencaService.obter(id);
    res.status(200).json({ sucesso: true, dados: doenca });
});
export const listar = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nomeDoenca: req.query.nomeDoenca,
        ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
        trabalhadorId: req.query.trabalhadorId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
    };
    // Remover filtros undefined
    Object.keys(filtros).forEach((key) => {
        if (filtros[key] === undefined) {
            delete filtros[key];
        }
    });
    const { doencas, total, pages } = await doencaService.listar(page, limit, filtros);
    res.status(200).json({
        sucesso: true,
        dados: doencas,
        paginacao: { page, limit, total, pages },
    });
});
export const atualizar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const doenca = await doencaService.atualizar(id, req.body);
    res.status(200).json({ sucesso: true, dados: doenca });
});
export const deletar = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await doencaService.deletar(id);
    res.status(200).json({ sucesso: true, mensagem: 'Doença deletada com sucesso' });
});
export const obterPorTrabalhador = asyncHandler(async (req, res) => {
    const { trabalhadorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { doencas, total, pages } = await doencaService.obterPorTrabalhador(trabalhadorId, page, limit);
    res.status(200).json({
        sucesso: true,
        dados: doencas,
        paginacao: { page, limit, total, pages },
    });
});
export const obterEstatisticas = asyncHandler(async (req, res) => {
    const stats = await doencaService.obterEstatisticas();
    res.status(200).json({ sucesso: true, dados: stats });
});
//# sourceMappingURL=doencaController.js.map