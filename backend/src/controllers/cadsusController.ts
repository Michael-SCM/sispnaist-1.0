import { Request, Response, NextFunction } from 'express';
import { cadsusService } from '../services/CadsusService.js';

export async function buscarNoCadsus(req: Request, res: Response, next: NextFunction) {
  try {
    const { cpfOuCns } = req.params;
    const dados = await cadsusService.buscarPorCpfOuCns(cpfOuCns);

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
