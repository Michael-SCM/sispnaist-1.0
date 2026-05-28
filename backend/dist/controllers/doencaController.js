import doencaService from '../services/DoencaService.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../middleware/errorHandler.js';
import Trabalhador from '../models/Trabalhador.js';
import { logAction } from '../utils/auditLogger.js';
export const criar = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para criar registros de doenças', 403);
    }
    const doencaData = {
        ...req.body,
        trabalhadorId: req.body.trabalhadorId,
    };
    const doenca = await doencaService.criar(doencaData);
    await logAction(req, 'CREATE', 'Doenca', doenca._id.toString(), {
        cid: doenca.cid
    });
    res.status(201).json({ sucesso: true, dados: doenca });
});
export const obter = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const doenca = await doencaService.obter(id);
    if (!doenca) {
        throw new AppError('Doença não encontrada', 404);
    }
    // Se o usuário logado for trabalhador, só pode visualizar se for dele
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
        const recordTrabalhadorId = (doenca.trabalhadorId && doenca.trabalhadorId._id)
            ? doenca.trabalhadorId._id.toString()
            : doenca.trabalhadorId.toString();
        if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
            throw new AppError('Sem permissão para acessar os dados desta doença', 403);
        }
    }
    res.status(200).json({ sucesso: true, dados: doenca });
});
export const listar = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filtros = {
        nomeDoenca: req.query.nomeDoenca,
        ativo: req.query.ativo ? req.query.ativo === 'true' : undefined,
        // Tratar trabalhadorId de filtro: pode vir CPF (mascarado ou apenas dígitos)
        // Não deixar passar por validação de ObjectId.
        trabalhadorId: req.query.trabalhadorId,
        dataInicio: req.query.dataInicio,
        dataFim: req.query.dataFim,
    };
    // Normaliza CPF de filtro (remove máscara) para evitar erros de validação
    if (typeof filtros.trabalhadorId === 'string' && filtros.trabalhadorId.trim()) {
        filtros.trabalhadorId = filtros.trabalhadorId.replace(/\D/g, '');
    }
    // Se o usuário logado for trabalhador, força o filtro por seu próprio ID de trabalhador
    if (req.user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
        filtros.trabalhadorId = trabalhador ? trabalhador._id.toString() : '000000000000000000000000';
    }
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
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para atualizar registros de doenças', 403);
    }
    const { id } = req.params;
    const doenca = await doencaService.atualizar(id, req.body);
    await logAction(req, 'UPDATE', 'Doenca', id, {
        cid: doenca.cid
    });
    res.status(200).json({ sucesso: true, dados: doenca });
});
export const deletar = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para deletar registros de doenças', 403);
    }
    const { id } = req.params;
    const doenca = await doencaService.obter(id);
    if (!doenca) {
        throw new AppError('Doença não encontrada', 404);
    }
    await doencaService.deletar(id);
    await logAction(req, 'DELETE', 'Doenca', id, {
        cpf: doenca.cpf ?? doenca.trabalhadorId?.cpf ?? 'N/A',
        nome: doenca.nome ?? 'N/A'
    });
    res.status(200).json({ sucesso: true, mensagem: 'Doença deletada com sucesso' });
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
    const { doencas, total, pages } = await doencaService.obterPorTrabalhador(trabalhadorId, page, limit);
    res.status(200).json({
        sucesso: true,
        dados: doencas,
        paginacao: { page, limit, total, pages },
    });
});
export const obterEstatisticas = asyncHandler(async (req, res) => {
    if (req.user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para acessar estatísticas gerais', 403);
    }
    const stats = await doencaService.obterEstatisticas();
    res.status(200).json({ sucesso: true, dados: stats });
});
