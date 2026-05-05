import { Request, Response, NextFunction } from 'express';
import TrabalhadorInformacaoService from '../services/TrabalhadorInformacaoService';
import { AppError } from '../middleware/errorHandler';

class TrabalhadorInformacaoController {
  // GET /api/trabalhadores/:id/informacoes - Listar informações de um trabalhador
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const informacoes = await TrabalhadorInformacaoService.listarPorTrabalhador(id);

      return res.status(200).json(informacoes);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/trabalhadores/:id/informacoes/:infoId - Obter informação específica
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, infoId } = req.params;

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
