import { Request, Response, NextFunction } from 'express';
import { cnesService } from '../services/CnesService.js';

export async function buscarNoCnes(req: Request, res: Response, next: NextFunction) {
  try {
    const { codigo } = req.params;
    const dados = await cnesService.buscarPorCodigo(codigo);

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
