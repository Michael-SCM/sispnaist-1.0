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
    if (error.statusCode === 404) {
      return res.status(404).json({
        status: 'erro',
        mensagem: error.message,
      });
    }

    if (error.statusCode === 504 || error.statusCode === 503) {
      return res.status(error.statusCode).json({
        status: 'erro',
        mensagem: error.message,
      });
    }

    next(error);
  }
}
