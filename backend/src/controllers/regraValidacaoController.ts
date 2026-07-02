import { Request, Response, NextFunction } from 'express';
import RegraValidacao, { IRegraValidacao } from '../models/RegraValidacao';
import { AppError } from '../middleware/errorHandler';
import { logAction, compararDados } from '../utils/auditLogger.js';
import { getPaginationParams, getPaginationResult } from '../utils/pagination.js';

const ENTIDADES = ['trabalhador', 'acidente', 'doenca', 'vacinacao', 'empresa', 'unidade'] as const;

const CAMPOS_POR_ENTIDADE: Record<string, string[]> = {
  trabalhador: ['cpf', 'nome', 'dataNascimento', 'sexo', 'raca', 'etnia', 'escolaridade',
    'estadoCivil', 'celular', 'email', 'nomeMae', 'cartaoSus', 'matricula',
    'tipoSanguineo', 'orgaoEmissor', 'nis', 'carteiraTrabalho'],
  acidente: ['tipoAcidente', 'dataAcidente', 'horario', 'tipoTrauma', 'agenteCausador',
    'parteCorpo', 'descricao', 'local', 'numeroCAT', 'emitirCAT', 'status',
    'lesoes', 'afastamento', 'diasAfastamento'],
  doenca: ['codigoDoenca', 'nomeDoenca', 'dataInicio', 'dataFim', 'relatoClinico',
    'profissionalSaude', 'cid', 'notificacao'],
  vacinacao: ['vacina', 'dataVacinacao', 'proximoDose', 'unidadeSaude', 'profissional',
    'lote', 'fabricante', 'dose'],
  empresa: ['razaoSocial', 'nomeFantasia', 'cnpj', 'inscricaoEstadual', 'email',
    'telefone', 'cnae', 'porte'],
  unidade: ['nome', 'gestor', 'email', 'telefone', 'tipo']
};

const TIPOS_VALIDACAO = ['obrigatorio', 'regex', 'min', 'max', 'enum', 'lengthMin', 'lengthMax', 'personalizado'] as const;

function isRegraVigente(regra: IRegraValidacao): boolean {
  const agora = new Date();
  if (!regra.ativo) return false;
  if (regra.dataInicioVigencia && new Date(regra.dataInicioVigencia) > agora) return false;
  if (regra.dataFimVigencia && new Date(regra.dataFimVigencia) < agora) return false;
  return true;
}

function getValorCampo(dados: any, campo: string): any {
  const partes = campo.split('.');
  let valor = dados;
  for (const parte of partes) {
    if (valor === null || valor === undefined) return undefined;
    valor = valor[parte];
  }
  return valor;
}

function aplicarValidacao(
  tipoValidacao: string,
  valorValidacao: string,
  valor: any,
  mensagemErro: string
): string | null {
  if (valor === null || valor === undefined || valor === '') {
    if (tipoValidacao === 'obrigatorio') return mensagemErro;
    return null;
  }

  const strValor = String(valor);

  switch (tipoValidacao) {
    case 'obrigatorio':
      return null;
    case 'regex':
      try {
        const regex = new RegExp(valorValidacao);
        if (!regex.test(strValor)) return mensagemErro;
      } catch {
        return `Erro interno: regex inválida (${valorValidacao})`;
      }
      return null;
    case 'min': {
      const num = parseFloat(strValor);
      const min = parseFloat(valorValidacao);
      if (isNaN(num)) return mensagemErro;
      if (num < min) return mensagemErro;
      return null;
    }
    case 'max': {
      const num = parseFloat(strValor);
      const max = parseFloat(valorValidacao);
      if (isNaN(num)) return mensagemErro;
      if (num > max) return mensagemErro;
      return null;
    }
    case 'enum': {
      const valores = valorValidacao.split(',').map(v => v.trim().toLowerCase());
      if (!valores.includes(strValor.toLowerCase())) return mensagemErro;
      return null;
    }
    case 'lengthMin': {
      const minLen = parseInt(valorValidacao, 10);
      if (strValor.length < minLen) return mensagemErro;
      return null;
    }
    case 'lengthMax': {
      const maxLen = parseInt(valorValidacao, 10);
      if (strValor.length > maxLen) return mensagemErro;
      return null;
    }
    case 'personalizado':
      return mensagemErro;
    default:
      return null;
  }
}

class RegraValidacaoController {
  async listar(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, skip } = getPaginationParams(req.query as any, { page: 1, limit: 50 });
      const { entidade, campo, uf, ativo } = req.query;

      const filtro: any = {};
      if (entidade) filtro.entidade = entidade;
      if (campo) filtro.campo = campo;
      if (uf) filtro.ufs = (uf as string).toUpperCase();
      if (ativo === 'true') filtro.ativo = true;
      else if (ativo === 'false') filtro.ativo = false;

      const [regras, total] = await Promise.all([
        RegraValidacao.find(filtro)
          .sort({ entidade: 1, campo: 1, prioridade: -1 })
          .skip(skip).limit(limit).lean(),
        RegraValidacao.countDocuments(filtro)
      ]);

      return res.status(200).json({
        data: regras,
        total,
        page,
        limit,
        totalPages: getPaginationResult(total, page, limit).pages
      });
    } catch (error) {
      next(error);
    }
  }

  async obter(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const regra = await RegraValidacao.findById(id);
      if (!regra) throw new AppError('Regra de validação não encontrada', 404);
      return res.status(200).json(regra);
    } catch (error) {
      next(error);
    }
  }

  async criar(req: Request, res: Response, next: NextFunction) {
    try {
      const data = {
        ...req.body,
        ufs: (req.body.ufs || []).map((u: string) => u.toUpperCase())
      };

      const regra = await RegraValidacao.create(data);
      await logAction(req, 'CREATE', 'RegraValidacao', regra._id.toString(), regra);
      return res.status(201).json(regra);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      if (updateData.ufs) {
        updateData.ufs = updateData.ufs.map((u: string) => u.toUpperCase());
      }

      const regraAntiga = await RegraValidacao.findById(id);
      if (!regraAntiga) throw new AppError('Regra de validação não encontrada', 404);

      const regra = await RegraValidacao.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      if (!regra) throw new AppError('Regra de validação não encontrada', 404);

      const mudancas = compararDados(regraAntiga, regra);
      await logAction(req, 'UPDATE', 'RegraValidacao', id, mudancas);
      return res.status(200).json(regra);
    } catch (error) {
      next(error);
    }
  }

  async deletar(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const regraAntiga = await RegraValidacao.findById(id);
      if (!regraAntiga) throw new AppError('Regra de validação não encontrada', 404);

      await RegraValidacao.updateOne({ _id: id }, { ativo: false });
      await logAction(req, 'DELETE', 'RegraValidacao', id, regraAntiga);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async listarEntidades(_req: Request, res: Response) {
    return res.status(200).json({
      data: ENTIDADES.map(e => ({
        valor: e,
        rotulo: e.charAt(0).toUpperCase() + e.slice(1)
      }))
    });
  }

  async listarCampos(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade } = req.params;
      if (!ENTIDADES.includes(entidade as any)) {
        throw new AppError('Entidade inválida', 400);
      }
      const campos = CAMPOS_POR_ENTIDADE[entidade] || [];
      return res.status(200).json({
        data: campos.map(c => ({ valor: c, rotulo: c }))
      });
    } catch (error) {
      next(error);
    }
  }

  async validar(req: Request, res: Response, next: NextFunction) {
    try {
      const { entidade, dados, uf, municipio } = req.body;

      if (!entidade || !dados) {
        throw new AppError('entidade e dados são obrigatórios', 400);
      }
      if (!ENTIDADES.includes(entidade)) {
        throw new AppError('Entidade inválida', 400);
      }

      const ufNorm = uf ? (uf as string).toUpperCase() : undefined;
      const agora = new Date();

      const filtroBase: any = {
        entidade,
        ativo: true,
        dataInicioVigencia: { $lte: agora }
      };

      const regras = await RegraValidacao.find({
        ...filtroBase,
        $or: [
          { dataFimVigencia: { $exists: false } },
          { dataFimVigencia: null },
          { dataFimVigencia: { $gte: agora } }
        ]
      }).sort({ prioridade: -1 }).lean();

      const regrasAplicaveis = regras.filter((r: any) => {
        if (r.tipoLocalidade === 'nacional') return true;
        if (r.tipoLocalidade === 'uf' && ufNorm) {
          return r.ufs.map((u: string) => u.toUpperCase()).includes(ufNorm);
        }
        if (r.tipoLocalidade === 'municipio' && municipio) {
          return r.municipios.some(
            (m: string) => m.toLowerCase() === municipio.toLowerCase()
          );
        }
        return false;
      });

      const erros: { campo: string; mensagem: string; regra: string }[] = [];

      for (const regra of regrasAplicaveis) {
        const valor = getValorCampo(dados, regra.campo);
        const erro = aplicarValidacao(
          regra.tipoValidacao,
          regra.valorValidacao,
          valor,
          regra.mensagemErro
        );
        if (erro) {
          erros.push({
            campo: regra.campo,
            mensagem: erro,
            regra: regra.nome
          });
        }
      }

      return res.status(200).json({
        valido: erros.length === 0,
        erros
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new RegraValidacaoController();
