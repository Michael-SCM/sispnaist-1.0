import { Request, Response, NextFunction } from 'express';
import TrabalhadorInformacaoService from '../services/TrabalhadorInformacaoService';
import Trabalhador from '../models/Trabalhador';
import { AppError } from '../middleware/errorHandler';

class TrabalhadorInformacaoController {
  // GET /api/trabalhadores/:id/informacoes - Listar informações de um trabalhador
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

      // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
      if ((req as any).user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
        if (!trabalhador || id !== trabalhador._id.toString()) {
          throw new AppError('Sem permissão para acessar as informações deste trabalhador', 403);
        }
      }

      const result = await TrabalhadorInformacaoService.listarPorTrabalhador(id, page, limit);

      return res.status(200).json({
        data: result.informacoes,
        total: result.total,
        page,
        limit,
        pages: result.pages,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/trabalhadores/:id/informacoes/:infoId - Obter informação específica
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;

      // Se o usuário logado for trabalhador, ele só pode acessar os seus próprios dados
      if ((req as any).user?.perfil === 'trabalhador') {
        const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf });
        if (!trabalhador || id !== trabalhador._id.toString()) {
          throw new AppError('Sem permissão para acessar as informações deste trabalhador', 403);
        }
      }

      const informacao = await TrabalhadorInformacaoService.obterPorId(infoId);

      if (!informacao || informacao.trabalhadorId !== id) {
        throw new AppError('Informação não encontrada', 404);
      }

      return res.status(200).json(informacao);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/trabalhadores/:id/informacoes - Criar nova informação
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para criar informações de trabalhadores', 403);
      }

      const dados = req.body;

      const informacao = await TrabalhadorInformacaoService.criar({
        ...dados,
        trabalhadorId: id,
      });

      return res.status(201).json(informacao);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/trabalhadores/:id/informacoes/:infoId - Atualizar informação
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;

      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para atualizar informações de trabalhadores', 403);
      }

      const dados = req.body;

      const informacao = await TrabalhadorInformacaoService.atualizar(infoId, dados);

      if (!informacao || informacao.trabalhadorId !== id) {
        throw new AppError('Informação não encontrada', 404);
      }

      return res.status(200).json(informacao);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/trabalhadores/:id/informacoes/:infoId - Deletar informação
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;

      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para deletar informações de trabalhadores', 403);
      }

      const existe = await TrabalhadorInformacaoService.obterPorId(infoId);
      if (!existe || existe.trabalhadorId !== id) {
        throw new AppError('Informação não encontrada', 404);
      }

      await TrabalhadorInformacaoService.deletar(infoId);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new TrabalhadorInformacaoController();
