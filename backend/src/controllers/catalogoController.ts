import { Request, Response, NextFunction } from 'express';
import CatalogoService from '../services/CatalogoService';
import { AppError } from '../middleware/errorHandler';

class CatalogoController {
  /**
   * Controller genérico para TODAS as tabelas auxiliares/catalogos.
   * Equivalente ao getdados.php do PHP original, mas com CRUD completo.
   */

  // GET /api/catalogos/:entidade - Lista todos os itens de uma entidade
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade } = req.params;
      const { page = 1, limit = 100, ativo } = req.query;

      const resultado = await CatalogoService.listar(
        entidade,
        Number(page),
        Number(limit),
        ativo === 'true' ? true : ativo === 'false' ? false : undefined
      );

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/catalogos/:entidade/ativos - Lista apenas itens ativos (equivalente ao getdados.php)
  async listarAtivos(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade } = req.params;

      const resultado = await CatalogoService.listarAtivos(entidade);

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/catalogos/:entidade/:id - Obter item específico
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade, id } = req.params;

      const item = await CatalogoService.obter(entidade, id);

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/catalogos/:entidade - Criar novo item
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade } = req.params;
      const dados = req.body;

      const item = await CatalogoService.criar(entidade, dados);

      return res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/catalogos/:entidade/:id - Atualizar item
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade, id } = req.params;
      const dados = req.body;

      const item = await CatalogoService.atualizar(entidade, id, dados);

      return res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/catalogos/:entidade/:id - Deletar item (soft delete)
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade, id } = req.params;

      await CatalogoService.deletar(entidade, id);

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // GET /api/catalogos/listar-todos - Lista todas as entidades com contagem
  async listarEntidades(req: Request, res: Response, next: NextFunction) {
    try {
      const entidades = await CatalogoService.listarEntidades();

      return res.status(200).json(entidades);
    } catch (error) {
      next(error);
    }
  }
  // POST /api/catalogos/seed - Executa seed de catálogos essenciais
  async seed(req: Request, res: Response, next: NextFunction) {
    try {
      const { seedCatalogos } = await import('../utils/seedCatalogos');
      await seedCatalogos();
      return res.status(200).json({ message: 'Seed de catálogos executado com sucesso!' });
    } catch (error) {
      next(error);
    }
  }
}

export default new CatalogoController();
