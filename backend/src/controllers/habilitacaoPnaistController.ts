import { Request, Response, NextFunction } from 'express';
import habilitacaoPnaistService from '../services/HabilitacaoPnaistService.js';

export const listar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, uf, ativo } = req.query;
    const result = await habilitacaoPnaistService.listar(
      Number(page) || 1,
      Number(limit) || 50,
      { uf: uf as string, ativo: ativo !== undefined ? ativo === 'true' : undefined }
    );
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const habilitar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { municipio, uf } = req.body;
    const result = await habilitacaoPnaistService.habilitar(municipio, uf);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const desabilitar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { municipio, uf } = req.body;
    const result = await habilitacaoPnaistService.desabilitar(municipio, uf);
    res.json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};

export const listarHabilitados = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await habilitacaoPnaistService.listarHabilitados();
    res.json({ status: 'success', data: items });
  } catch (error) {
    next(error);
  }
};
