import { Request, Response, NextFunction } from 'express';
import PreferenciaUsuario from '../models/PreferenciaUsuario';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { IAuthRequest } from '../types/index.js';

class PreferenciaController {
  // GET /api/preferencias/minhas - Obter preferências do usuário logado
  async obterMinhas(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      let preferencia = await PreferenciaUsuario.findOne({ usuarioId: (req.user as any).id });

      if (!preferencia) {
        // Cria preferências padrão se não existir
        preferencia = await PreferenciaUsuario.create({
          usuarioId: (req.user as any).id
        });
      }

      return res.status(200).json({ data: preferencia });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/preferencias/minhas - Atualizar preferências do usuário logado
  async atualizarMinhas(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado', 401);
      }

      const preferenciasAntiga = await PreferenciaUsuario.findOne({ usuarioId: (req.user as any).id });

      const preferencia = await PreferenciaUsuario.findOneAndUpdate(
        { usuarioId: (req.user as any).id },
        req.body,
        { new: true, runValidators: true, upsert: true }
      );

      if (preferenciasAntiga) {
        const mudancas = compararDados(preferenciasAntiga, preferencia);

        await logAction(req, 'UPDATE', 'Preferencia', preferencia._id.toString(), mudancas);
      } else {
        await logAction(req, 'CREATE', 'Preferencia', preferencia._id.toString(), preferencia);
      }

      return res.status(200).json({ data: preferencia });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/preferencias/usuario/:usuarioId - Obter preferências de outro usuário (admin)
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuarioId } = req.params;

      const preferencia = await PreferenciaUsuario.findOne({ usuarioId });

      if (!preferencia) {
        throw new AppError('Preferências não encontradas', 404);
      }

      return res.status(200).json({ data: preferencia });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/preferencias/usuario/:usuarioId - Atualizar preferências de outro usuário (admin)
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuarioId } = req.params;

      const preferenciasAntiga = await PreferenciaUsuario.findOne({ usuarioId });

      const preferencia = await PreferenciaUsuario.findOneAndUpdate(
        { usuarioId },
        req.body,
        { new: true, runValidators: true, upsert: true }
      );

      if (preferenciasAntiga) {
        const mudancas = compararDados(preferenciasAntiga, preferencia);

        await logAction(req, 'UPDATE', 'Preferencia', preferencia._id.toString(), mudancas);
      } else {
        await logAction(req, 'CREATE', 'Preferencia', preferencia._id.toString(), preferencia);
      }

      return res.status(200).json({ data: preferencia });
    } catch (error) {
      next(error);
    }
  }
}

export default new PreferenciaController();
