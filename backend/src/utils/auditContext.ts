import Trabalhador from '../models/Trabalhador.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';

import { normalizeCPF } from './cpf.js';

const maskCPF = (masked: string) => masked.replace(/\d/g, '*');

export const getWorkerSnapshot = async (params: {
  trabalhadorId?: string;
  cpf?: string;
}): Promise<
  | {
      cpf?: string;
      nome?: string;
      empresaId?: string;
      empresaNome?: string;
      unidadeId?: string;
      unidadeNome?: string;
    }
  | undefined
> => {
  const { trabalhadorId, cpf } = params;

  if (!trabalhadorId && !cpf) return undefined;

  const query: any = {};
  if (trabalhadorId) query._id = trabalhadorId;
  if (cpf) query.cpf = cpf;

  const trabalhador = await Trabalhador.findOne(query)
    .populate('empresa', 'razaoSocial')
    .populate('unidade', 'nome')
    .lean();

  if (!trabalhador) return undefined;

  const cpfMasked = (() => {
    if (!trabalhador.cpf) return undefined;
    const { digits, masked } = normalizeCPF(trabalhador.cpf);
    if (masked) return maskCPF(masked);
    if (digits.length === 11) {
      // XXX.XXX.XXX-XX -> mask com base na máscara padrão
      const m = `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
      return maskCPF(m);
    }
    return undefined;
  })();

  return {
    cpf: cpfMasked,
    nome: trabalhador.nome,
    empresaId: trabalhador.empresa?._id?.toString?.() ?? undefined,
    empresaNome: (trabalhador.empresa as any)?.razaoSocial ?? undefined,
    unidadeId: trabalhador.unidade?._id?.toString?.() ?? undefined,
    unidadeNome: (trabalhador.unidade as any)?.nome ?? undefined,
  };
};

export const getEmpresaSnapshot = async (empresaId?: string) => {
  if (!empresaId) return undefined;
  const emp = await Empresa.findById(empresaId).lean();
  if (!emp) return undefined;
  return {
    empresaId: emp._id.toString(),
    razaoSocial: emp.razaoSocial,
    cnpj: emp.cnpj,
  };
};

export const getUnidadeSnapshot = async (unidadeId?: string) => {
  if (!unidadeId) return undefined;
  const uni = await Unidade.findById(unidadeId).lean();
  if (!uni) return undefined;
  return {
    unidadeId: uni._id.toString(),
    nome: uni.nome,
    empresaId: uni.empresa?._id?.toString?.() ?? uni.empresa?.toString?.() ?? undefined,
  };
};

