import { Request, Response, NextFunction } from 'express';
import { sinanService } from '../services/SinanService.js';

export async function buscarNotificacoes(req: Request, res: Response, next: NextFunction) {
  try {
    const { cpfOuCns } = req.params;
    const dados = await sinanService.buscarPorCpfOuCns(cpfOuCns);

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

export async function notificar(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = req.body;
    const resultado = await sinanService.notificar(dados);

    return res.status(201).json({
      status: 'sucesso',
      data: resultado,
    });
  } catch (error: any) {
    if (error.statusCode === 504 || error.statusCode === 503) {
      return res.status(error.statusCode).json({
        status: 'erro',
        mensagem: error.message,
      });
    }

    if (error.statusCode && error.statusCode >= 400) {
      return res.status(error.statusCode).json({
        status: 'erro',
        mensagem: error.message,
      });
    }

    next(error);
  }
}
