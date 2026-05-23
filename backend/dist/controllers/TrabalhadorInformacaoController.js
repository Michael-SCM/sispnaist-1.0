import TrabalhadorInformacaoService from '../services/TrabalhadorInformacaoService';
import Trabalhador from '../models/Trabalhador';
import { AppError } from '../middleware/errorHandler';
class TrabalhadorInformacaoController {
    // GET /api/trabalhadores/:id/informacoes - Listar informações de um trabalhador
    async listar(req, res, next) {
        try {
            const { id } = req.params;
            // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
            if (req.user?.perfil === 'trabalhador') {
                const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
                if (!trabalhador || id !== trabalhador._id.toString()) {
                    throw new AppError('Sem permissão para acessar as informações deste trabalhador', 403);
                }
            }
            const informacoes = await TrabalhadorInformacaoService.listarPorTrabalhador(id);
            return res.status(200).json(informacoes);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/trabalhadores/:id/informacoes/:infoId - Obter informação específica
    async obter(req, res, next) {
        try {
            const { id, infoId } = req.params;
            // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
            if (req.user?.perfil === 'trabalhador') {
                const trabalhador = await Trabalhador.findOne({ cpf: req.user.cpf });
                if (!trabalhador || id !== trabalhador._id.toString()) {
                    throw new AppError('Sem permissão para acessar as informações deste trabalhador', 403);
                }
            }
            const informacao = await TrabalhadorInformacaoService.obterPorId(infoId);
            if (!informacao || informacao.trabalhadorId !== id) {
                throw new AppError('Informação não encontrada', 404);
            }
            return res.status(200).json(informacao);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/trabalhadores/:id/informacoes - Criar nova informação
    async criar(req, res, next) {
        try {
            const { id } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new AppError('Sem permissão para criar informações de trabalhadores', 403);
            }
            const dados = req.body;
            const informacao = await TrabalhadorInformacaoService.criar({
                ...dados,
                trabalhadorId: id,
            });
            return res.status(201).json(informacao);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/trabalhadores/:id/informacoes/:infoId - Atualizar informação
    async atualizar(req, res, next) {
        try {
            const { id, infoId } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new AppError('Sem permissão para atualizar informações de trabalhadores', 403);
            }
            const dados = req.body;
            const informacao = await TrabalhadorInformacaoService.atualizar(infoId, dados);
            if (!informacao || informacao.trabalhadorId !== id) {
                throw new AppError('Informação não encontrada', 404);
            }
            return res.status(200).json(informacao);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/trabalhadores/:id/informacoes/:infoId - Deletar informação
    async deletar(req, res, next) {
        try {
            const { id, infoId } = req.params;
            if (req.user?.perfil === 'trabalhador') {
                throw new AppError('Sem permissão para deletar informações de trabalhadores', 403);
            }
            const existe = await TrabalhadorInformacaoService.obterPorId(infoId);
            if (!existe || existe.trabalhadorId !== id) {
                throw new AppError('Informação não encontrada', 404);
            }
            await TrabalhadorInformacaoService.deletar(infoId);
            return res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
export default new TrabalhadorInformacaoController();
