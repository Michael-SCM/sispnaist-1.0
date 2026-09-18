import { Request, Response, NextFunction } from 'express';
import ServidorFuncionario from '../models/ServidorFuncionario';
import Trabalhador from '../models/Trabalhador';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';
import { escapeRegex } from '../utils/sanitize.js';
import { IAuthRequest } from '../middleware/auth.js';
import { buildUserScope, verificarEscopoTrabalhador } from '../utils/scope.js';

class ServidorFuncionarioController {
  // GET /api/servidores - Listar servidores
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 20 });
      const { ativo, situacaoFuncional, lotacao } = req.query;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const filtro: any = {};
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;
      if (situacaoFuncional) filtro.situacaoFuncional = situacaoFuncional;
      if (lotacao) {
        filtro.lotacao = { $regex: new RegExp(escapeRegex(String(lotacao)), 'i') };
      }

      // Gestor: filtrar apenas servidores de trabalhadores da empresa
      if (scope.perfil === 'gestor' && scope.empresaScope) {
        const trabalhadores = await Trabalhador.find({ empresa: scope.empresaScope }).select('_id').lean();
        const ids = trabalhadores.map((t: any) => t._id.toString());
        if (ids.length === 0) {
          filtro.trabalhadorId = null;
        } else {
          filtro.trabalhadorId = { $in: ids };
        }
      }

      // Trabalhador: apenas seus próprios vínculos
      if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
        if (scope.trabalhadorIds.length === 0) {
          filtro.trabalhadorId = null;
        } else if (scope.trabalhadorIds.length === 1) {
          filtro.trabalhadorId = scope.trabalhadorIds[0];
        } else {
          filtro.trabalhadorId = { $in: scope.trabalhadorIds };
        }
      }

      const [servidores, total] = await Promise.all([
        ServidorFuncionario.find(filtro)
          .populate('trabalhadorId', 'nome cpf matricula')
          .sort({ matriculaFuncional: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ServidorFuncionario.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: servidores,
        total,
        page,
        limit,
        totalPages: getPaginationResult(total, page, limit).pages
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/servidores/:id - Obter servidor
  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const servidor = await ServidorFuncionario.findById(id).populate('trabalhadorId');

      if (!servidor) {
        throw new AppError('Servidor não encontrado', 404);
      }

      // Verificar escopo
      const trabalhadorId = (servidor as any).trabalhadorId?._id?.toString() || (servidor as any).trabalhadorId?.toString();
      if (trabalhadorId) {
        if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
          if (!scope.trabalhadorIds.includes(trabalhadorId)) {
            throw new AppError('Sem permissão para acessar este registro', 403);
          }
        }
        if (scope.perfil === 'gestor') {
          const owns = await verificarEscopoTrabalhador(scope, trabalhadorId);
          if (!owns) {
            throw new AppError('Sem permissão para acessar este registro', 403);
          }
        }
      }

      return res.status(200).json(servidor);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/servidores - Criar servidor
  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para criar registros de servidores', 403);
      }

      const servidor = await ServidorFuncionario.create(req.body);

      await logAction(req, 'CREATE', 'ServidorFuncionario', servidor._id.toString(), servidor);

      return res.status(201).json(servidor);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/servidores/:id - Atualizar servidor
  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para atualizar registros de servidores', 403);
      }

      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);
      
      const servidorAntigo = await ServidorFuncionario.findById(id);
      if (!servidorAntigo) {
        throw new AppError('Servidor não encontrado', 404);
      }

      // Verificar escopo para gestores
      if (scope.perfil === 'gestor') {
        const trabalhadorId = (servidorAntigo as any).trabalhadorId?.toString();
        if (trabalhadorId) {
          const owns = await verificarEscopoTrabalhador(scope, trabalhadorId);
          if (!owns) {
            throw new AppError('Sem permissão para atualizar este registro', 403);
          }
        }
      }

      const servidor = await ServidorFuncionario.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!servidor) {
        throw new AppError('Servidor não encontrado', 404);
      }

      const mudancas = compararDados(servidorAntigo, servidor);

      await logAction(req, 'UPDATE', 'ServidorFuncionario', id, mudancas);

      return res.status(200).json(servidor);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/servidores/:id - Deletar servidor
  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      if ((req as any).user?.perfil === 'trabalhador') {
        throw new AppError('Sem permissão para deletar registros de servidores', 403);
      }

      const { id } = req.params;
      const scope = await buildUserScope((req as IAuthRequest).user!);

      const servidor = await ServidorFuncionario.findById(id);
      if (!servidor) {
        throw new AppError('Servidor não encontrado', 404);
      }

      // Verificar escopo para gestores
      if (scope.perfil === 'gestor') {
        const trabalhadorId = (servidor as any).trabalhadorId?.toString();
        if (trabalhadorId) {
          const owns = await verificarEscopoTrabalhador(scope, trabalhadorId);
          if (!owns) {
            throw new AppError('Sem permissão para deletar este registro', 403);
          }
        }
      }

      await logAction(req, 'DELETE', 'ServidorFuncionario', id, servidor);

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
