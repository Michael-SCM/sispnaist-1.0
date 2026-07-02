import { Request, Response, NextFunction } from 'express';
import RegraValidacao from '../models/RegraValidacao';
import { AppError } from './errorHandler';

const ENTIDADES = ['trabalhador', 'acidente', 'doenca', 'vacinacao', 'empresa', 'unidade'] as const;

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

export interface ErroValidacao {
  campo: string;
  mensagem: string;
  regra: string;
}

export async function validateByLocality(
  entidade: typeof ENTIDADES[number],
  dados: Record<string, any>,
  uf?: string,
  municipio?: string
): Promise<ErroValidacao[]> {
  const agora = new Date();

  const regras = await RegraValidacao.find({
    entidade,
    ativo: true,
    dataInicioVigencia: { $lte: agora },
    $or: [
      { dataFimVigencia: { $exists: false } },
      { dataFimVigencia: null },
      { dataFimVigencia: { $gte: agora } }
    ]
  }).sort({ prioridade: -1 }).lean();

  const ufNorm = uf ? uf.toUpperCase() : undefined;

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

  const erros: ErroValidacao[] = [];

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

  return erros;
}

export function validateByLocalityMiddleware(entidade: typeof ENTIDADES[number], campoUf?: string, campoMunicipio?: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const dados = req.body;
      const uf = campoUf ? getValorCampo(dados, campoUf) : undefined;
      const municipio = campoMunicipio ? getValorCampo(dados, campoMunicipio) : undefined;

      const erros = await validateByLocality(entidade, dados, uf, municipio);

      if (erros.length > 0) {
        const mensagens = erros.map(e => e.mensagem);
        throw new AppError(mensagens.join('; '), 400);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
