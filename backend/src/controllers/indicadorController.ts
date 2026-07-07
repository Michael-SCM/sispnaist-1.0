import { Request, Response, NextFunction } from 'express';
import indicadorService from '../services/IndicadorService.js';
import { AppError } from '../middleware/errorHandler.js';
import { logAction, compararDados } from '../utils/auditLogger.js';

class IndicadorController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const indicadores = await indicadorService.listar(req.query as any);
      return res.status(200).json({ data: indicadores });
    } catch (error) {
      next(error);
    }
  }

  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const indicador = await indicadorService.obter(id);
      if (!indicador) throw new AppError('Indicador não encontrado', 404);
      return res.status(200).json(indicador);
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        uf: req.body.uf?.toUpperCase()
      };
      const indicador = await indicadorService.criar(data);
      await logAction(req, 'CREATE', 'Indicador', indicador._id.toString(), indicador);
      return res.status(201).json(indicador);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.uf) updateData.uf = updateData.uf.toUpperCase();

      const indicadorAntigo = await indicadorService.obter(id);
      if (!indicadorAntigo) throw new AppError('Indicador não encontrado', 404);

      const indicador = await indicadorService.atualizar(id, updateData);
      if (!indicador) throw new AppError('Indicador não encontrado', 404);

      const mudancas = compararDados(indicadorAntigo, indicador);
      await logAction(req, 'UPDATE', 'Indicador', id, mudancas);
      return res.status(200).json(indicador);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const indicador = await indicadorService.obter(id);
      if (!indicador) throw new AppError('Indicador não encontrado', 404);

      await indicadorService.deletar(id);
      await logAction(req, 'DELETE', 'Indicador', id, indicador);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async calcularIndicador(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { uf } = req.query;
      const resultado = await indicadorService.calcularIndicador(id, uf as string);
      if (!resultado.indicador) throw new AppError('Indicador não encontrado', 404);
      return res.status(200).json({
        indicador: resultado.indicador,
        valor: resultado.valor,
        alcancouMeta: resultado.indicador.meta != null
          ? resultado.valor >= resultado.indicador.meta
          : null
      });
    } catch (error) {
      next(error);
    }
  }

  async calcularTodos(req: Request, res: Response, next: NextFunction) {
    try {
      const { uf } = req.query;
      const resultados = await indicadorService.calcularTodos(uf as string);
      return res.status(200).json({
        data: resultados.map(r => ({
          ...r.indicador,
          valorCalculado: r.valor,
          alcancouMeta: r.indicador.meta != null
            ? r.valor >= r.indicador.meta
            : null
        }))
      });
    } catch (error) {
      next(error);
    }
  }

  async obterMetricas(req: Request, res: Response, next: NextFunction) {
    try {
      const metricas = indicadorService.obterMetricasDisponiveis();
      return res.status(200).json({ data: metricas });
    } catch (error) {
      next(error);
    }
  }
}

export default new IndicadorController();
