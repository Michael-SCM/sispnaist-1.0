import { Request, Response, NextFunction } from 'express';
import alertService from '../services/AlertaService.js';
import { IAuthRequest } from '../middleware/auth.js';

class AlertaController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as IAuthRequest).user!;
      const { page, limit, tipo, status, nivel } = req.query;

      const resultado = await alertService.listarAlertas({
        userId: user.id,
        perfil: user.perfil,
        empresaId: user.empresa,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        tipo: tipo as string | undefined,
        status: status as string | undefined,
        nivel: nivel as string | undefined,
      });

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async obterResumo(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as IAuthRequest).user!;
      const resumo = await alertService.obterResumo({
        perfil: user.perfil,
        empresaId: user.empresa,
      });
      return res.status(200).json(resumo);
    } catch (error) {
      next(error);
    }
  }

  async marcarLido(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as IAuthRequest).user!;
      const alerta = await alertService.atualizarStatus(req.params.id, 'lida', {
        perfil: user.perfil,
        empresaId: user.empresa,
      });
      return res.status(200).json(alerta);
    } catch (error) {
      next(error);
    }
  }

  async arquivar(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as IAuthRequest).user!;
      const alerta = await alertService.atualizarStatus(req.params.id, 'arquivada', {
        perfil: user.perfil,
        empresaId: user.empresa,
      });
      return res.status(200).json(alerta);
    } catch (error) {
      next(error);
    }
  }

  async executarAgora(req: Request, res: Response, next: NextFunction) {
    try {
      const resultado = await alertService.avaliarTodos();
      return res.status(200).json({ message: 'Avaliação de alertas concluída', ...resultado });
    } catch (error) {
      next(error);
    }
  }

  // ============================== REGRAS (admin) ==============================

  async listarRegras(req: Request, res: Response, next: NextFunction) {
    try {
      const regras = await alertService.listarRegras();
      return res.status(200).json({ data: regras });
    } catch (error) {
      next(error);
    }
  }

  async criarRegra(req: Request, res: Response, next: NextFunction) {
    try {
      const regra = await alertService.criarRegra(req.body);
      return res.status(201).json(regra);
    } catch (error) {
      next(error);
    }
  }

  async atualizarRegra(req: Request, res: Response, next: NextFunction) {
    try {
      const regra = await alertService.atualizarRegra(req.params.id, req.body);
      return res.status(200).json(regra);
    } catch (error) {
      next(error);
    }
  }

  async deletarRegra(req: Request, res: Response, next: NextFunction) {
    try {
      const regra = await alertService.deletarRegra(req.params.id);
      return res.status(200).json(regra);
    } catch (error) {
      next(error);
    }
  }
}

export default new AlertaController();
