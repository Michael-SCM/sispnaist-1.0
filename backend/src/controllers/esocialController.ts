import { Request, Response, NextFunction } from 'express';
import { esocialService } from '../services/EsocialService.js';

export async function buscarNoEsocial(req: Request, res: Response, next: NextFunction) {
  try {
    const { cpf } = req.params;
    const dados = await esocialService.buscarPorCpf(cpf);

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
