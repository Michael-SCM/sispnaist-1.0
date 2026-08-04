import { Request, Response, NextFunction } from 'express';
import { logReadSensivel } from '../utils/auditLogger.js';

/**
 * Middleware que registra acesso (READ) a dados sensíveis de saúde.
 *
 * Uso:
 *   router.get('/:id', auditRead('Trabalhador'), controller.obter);
 *   router.get('/', auditRead('TrabalhadorExameSaude'), controller.listar);
 *
 * Entidades sensíveis:
 *   Trabalhador, TrabalhadorExameSaude, TrabalhadorAfastamento,
 *   TrabalhadorInternacao, TrabalhadorOcorrenciaViolencia,
 *   Acidente, Vacinacao, Doenca, MaterialBiologico
 *
 * O middleware é fire-and-forget: não bloqueia a requisição,
 * apenas agenda o log de auditoria de forma assíncrona.
 */
export const auditRead = (entidade: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const entidadeId = req.params.id || req.params.itemId || req.params.trabalhadorId || 'list';

    // Log assíncrono — não bloqueia a requisição
    logReadSensivel(req, entidade, String(entidadeId), {
      metodo: req.method,
      url: req.originalUrl,
      query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    }).catch(() => {});

    next();
  };
};

/**
 * Middleware que registra acesso (READ) a dados sensíveis de saúde
 * para rotas que listam múltiplos registros.
 *
 * Uso:
 *   router.get('/', auditReadList('TrabalhadorExameSaude'), controller.listar);
 */
export const auditReadList = (entidade: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    logReadSensivel(req, entidade, 'list', {
      metodo: req.method,
      url: req.originalUrl,
      query: req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    }).catch(() => {});

    next();
  };
};
