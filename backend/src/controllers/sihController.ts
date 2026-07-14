import { Request, Response, NextFunction } from 'express';
import { sihService } from '../services/SihService.js';

export async function buscarInternacoes(req: Request, res: Response, next: NextFunction) {
  try {
    const { cns } = req.params;
    const dados = await sihService.buscarPorCns(cns);

    return res.json({
      status: 'sucesso',
      data: dados,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || error.response?.status;

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return res.status(statusCode).json({
        status: 'erro',
        mensagem: error.message,
      });
    }

    if (statusCode && statusCode >= 500) {
      return res.status(statusCode).json({
        status: 'erro',
        mensagem: error.message,
      });
    }

    next(error);
  }
}
