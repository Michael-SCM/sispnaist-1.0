import { Request, Response, NextFunction } from 'express';
import PadraoEmail from '../models/PadraoEmail';
import { AppError } from '../middleware/errorHandler';

class EmailController {
  // GET /api/emails/padroes - Listar templates de email
  async listarPadroes(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, ativo, categoria } = req.query;

      const filtro: any = {};
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (categoria) filtro.categoria = categoria;

      const [padroes, total] = await Promise.all([
        PadraoEmail.find(filtro).sort({ nome: 1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
        PadraoEmail.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: padroes,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/emails/padroes/:id - Obter template
  async obterPadrao(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const padrao = await PadraoEmail.findById(id);

      if (!padrao) {
        throw new AppError('Template não encontrado', 404);
      }

      return res.status(200).json(padrao);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/emails/padroes - Criar template
  async criarPadrao(req: Request, res: Response, next: NextFunction) {
    try {
      const padrao = await PadraoEmail.create(req.body);

      return res.status(201).json(padrao);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/emails/padroes/:id - Atualizar template
  async atualizarPadrao(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const padrao = await PadraoEmail.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!padrao) {
        throw new AppError('Template não encontrado', 404);
      }

      return res.status(200).json(padrao);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/emails/padroes/:id - Deletar template
  async deletarPadrao(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const resultado = await PadraoEmail.updateOne({ _id: id }, { ativo: false });

      if (resultado.matchedCount === 0) {
        throw new AppError('Template não encontrado', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // POST /api/emails/enviar - Enviar email (placeholder - requer Nodemailer/SendGrid)
  async enviar(req: Request, res: Response, next: NextFunction) {
    // TODO: Implementar envio real de email com Nodemailer ou SendGrid
    return res.status(501).json({
      mensagem: 'Funcionalidade de envio de email ainda não implementada. Requer configuração de Nodemailer/SendGrid.'
    });
  }
}

export default new EmailController();
