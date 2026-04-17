import { Request, Response, NextFunction } from 'express';
import ServidorFuncionario from '../models/ServidorFuncionario';
import { AppError } from '../middleware/errorHandler';

class ServidorFuncionarioController {
  // GET /api/servidores - Listar servidores
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, ativo, situacaoFuncional, lotacao } = req.query;

      const filtro: any = {};
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (situacaoFuncional) filtro.situacaoFuncional = situacaoFuncional;
      if (lotacao) filtro.lotacao = { $regex: new RegExp(String(lotacao), 'i') };

      const [servidores, total] = await Promise.all([
        ServidorFuncionario.find(filtro)
          .populate('trabalhadorId', 'nome cpf matricula')
          .sort({ matriculaFuncional: 1 })
          .skip((Number(page) - 1) * Number(limit))
          .limit(Number(limit))
          .lean(),
        ServidorFuncionario.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: servidores,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/servidores/:id - Obter servidor
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const servidor = await ServidorFuncionario.findById(id).populate('trabalhadorId');

      if (!servidor) {
        throw new AppError('Servidor não encontrado', 404);
      }

      return res.status(200).json(servidor);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/servidores - Criar servidor
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const servidor = await ServidorFuncionario.create(req.body);

      return res.status(201).json(servidor);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/servidores/:id - Atualizar servidor
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const servidor = await ServidorFuncionario.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!servidor) {
        throw new AppError('Servidor não encontrado', 404);
      }

      return res.status(200).json(servidor);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/servidores/:id - Deletar servidor
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const resultado = await ServidorFuncionario.updateOne({ _id: id }, { ativo: false });

      if (resultado.matchedCount === 0) {
        throw new AppError('Servidor não encontrado', 404);
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ServidorFuncionarioController();
