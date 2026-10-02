import Trabalhador from '../models/Trabalhador.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';

/**
 * Informações de escopo do usuário autenticado.
 *
 * - admin: sem restrição (empresaScope/unidadeScope = null)
 * - gestor: empresaScope obrigatório, unidadeScope opcional
 * - trabalhador: apenas registros próprios
 */
export interface UserScope {
  perfil: string;
  empresaScope: string | null;
  unidadeScope: string | null;
  empresaDoc: any | null;
  unidadeDoc: any | null;
  trabalhadorIds: string[];
}

/**
 * Resolve o escopo do usuário a partir do token JWT.
 * Admin: sem filtro (vê tudo).
 * Gestor: filtrar por empresa (e opcionalmente unidade).
 * Trabalhador: filtrar apenas pelos IDs de trabalhador próprios.
 */
export async function buildUserScope(user: {
  id: string;
  cpf: string;
  perfil: string;
  empresa?: string;
  unidade?: string;
}): Promise<UserScope> {
  const scope: UserScope = {
    perfil: user.perfil,
    empresaScope: null,
    unidadeScope: null,
    empresaDoc: null,
    unidadeDoc: null,
    trabalhadorIds: [],
  };

  if (user.perfil === 'admin') {
    return scope;
  }

  if (user.perfil === 'gestor') {
    scope.empresaScope = user.empresa || null;
    scope.unidadeScope = user.unidade || null;

    if (scope.empresaScope) {
      scope.empresaDoc = await Empresa.findById(scope.empresaScope).lean();
    }
    if (scope.unidadeScope) {
      scope.unidadeDoc = await Unidade.findById(scope.unidadeScope).lean();
    }

    return scope;
  }

  // trabalhador / saude: resolver IDs próprios
  if (user.cpf) {
    const trabalhador = await Trabalhador.findOne({ cpf: user.cpf })
      .select('_id empresa unidade')
      .lean();
    if (trabalhador) {
      scope.trabalhadorIds.push(trabalhador._id.toString());
      if (!scope.empresaScope && (trabalhador as any).empresa) {
        scope.empresaScope = (trabalhador as any).empresa.toString();
      }
      if (!scope.unidadeScope && (trabalhador as any).unidade) {
        scope.unidadeScope = (trabalhador as any).unidade.toString();
      }
    }

    // Também verificar se existe User com mesmo CPF (compatibilidade legada)
    const User = (await import('../models/User.js')).default;
    const userDoc = await User.findOne({ cpf: user.cpf })
      .select('_id empresa unidade')
      .lean();
    if (userDoc && userDoc._id) {
      const uid = userDoc._id.toString();
      if (!scope.trabalhadorIds.includes(uid)) {
        scope.trabalhadorIds.push(uid);
      }
    }
  }

  // Perfil saude: pode receber empresa e unidade diretamente no usuário
  if (user.perfil === 'saude') {
    if (!scope.empresaScope && user.empresa) {
      scope.empresaScope = user.empresa;
    }
    if (!scope.unidadeScope && user.unidade) {
      scope.unidadeScope = user.unidade;
    }
  }

  if (scope.empresaScope && !scope.empresaDoc) {
    scope.empresaDoc = await Empresa.findById(scope.empresaScope).lean();
  }
  if (scope.unidadeScope && !scope.unidadeDoc) {
    scope.unidadeDoc = await Unidade.findById(scope.unidadeScope).lean();
  }

  return scope;
}

/**
 * Gera filtro MongoDB para model direto (Empresa, Unidade, User).
 * Admin: vê tudo.
 * Gestor: empresa do token.
 * Trabalhador: sem acesso (retorna filtro impossível).
 */
export function scopeFilterDirect(
  scope: UserScope,
  modelHasEmpresa: boolean = true,
  modelHasUnidade: boolean = false
): Record<string, any> {
  if (scope.perfil === 'admin') return {};

  if (scope.perfil === 'gestor') {
    // Fail-closed: gestor sem empresa válida não pode acessar dados
    if (!scope.empresaScope) {
      return { _id: null };
    }

    const filtro: Record<string, any> = {};
    if (modelHasEmpresa && scope.empresaScope) {
      filtro.empresa = scope.empresaScope;
    }
    if (modelHasUnidade && scope.unidadeScope) {
      filtro.unidade = scope.unidadeScope;
    }
    return filtro;
  }

  // trabalhador sem empresa/unidade nos modelos = sem acesso
  return { _id: null };
}

/**
 * Gera filtro MongoDB para modelos com referência a Trabalhador
 * (Acidente, Doenca, Vacinacao, MaterialBiologico, etc.).
 *
 * Admin: vê tudo.
 * Gestor: registros de trabalhadores da mesma empresa.
 * Trabalhador: apenas seus próprios registros.
 */
export async function scopeFilterByTrabalhador(
  scope: UserScope
): Promise<Record<string, any>> {
  if (scope.perfil === 'admin') return {};

  if (scope.perfil === 'trabalhador') {
    if (scope.trabalhadorIds.length === 0) {
      return { trabalhadorId: null };
    }
    if (scope.trabalhadorIds.length === 1) {
      return { trabalhadorId: scope.trabalhadorIds[0] };
    }
    return { trabalhadorId: { $in: scope.trabalhadorIds } };
  }

  // gestor / saude: buscar trabalhadores da empresa/unidade
  if (scope.perfil === 'gestor' || scope.perfil === 'saude') {
    if (scope.empresaScope) {
      const query: any = { empresa: scope.empresaScope };
      if (scope.unidadeScope) {
        query.unidade = scope.unidadeScope;
      }
      const trabalhadores = await Trabalhador.find(query)
        .select('_id')
        .lean();
      const ids = trabalhadores.map((t: any) => t._id.toString());
      if (ids.length === 0) {
        return { trabalhadorId: null };
      }
      if (ids.length === 1) {
        return { trabalhadorId: ids[0] };
      }
      return { trabalhadorId: { $in: ids } };
    }

    // Se saude sem empresaScope mas tem trabalhadorIds próprios
    if (scope.perfil === 'saude' && scope.trabalhadorIds.length > 0) {
      if (scope.trabalhadorIds.length === 1) {
        return { trabalhadorId: scope.trabalhadorIds[0] };
      }
      return { trabalhadorId: { $in: scope.trabalhadorIds } };
    }

    return { trabalhadorId: null };
  }

  return { trabalhadorId: null };
}

/**
 * Verifica se um registro de trabalhador pertence ao escopo do usuário.
 * Útil para validação pontual (findOne por ID).
 */
export async function verificarEscopoTrabalhador(
  scope: UserScope,
  trabalhadorId: string
): Promise<boolean> {
  if (scope.perfil === 'admin') return true;

  if (scope.perfil === 'trabalhador') {
    return scope.trabalhadorIds.includes(trabalhadorId);
  }

  // saude: se tem empresaScope, verifica empresa/unidade; senão verifica IDs próprios
  if (scope.perfil === 'saude') {
    if (scope.empresaScope) {
      const trabalhador = await Trabalhador.findById(trabalhadorId)
        .select('empresa unidade')
        .lean();
      if (!trabalhador) return false;
      const mesmaEmpresa = (trabalhador as any).empresa?.toString() === scope.empresaScope;
      if (!mesmaEmpresa) return false;
      if (scope.unidadeScope && (trabalhador as any).unidade) {
        return (trabalhador as any).unidade?.toString() === scope.unidadeScope;
      }
      return true;
    }
    return scope.trabalhadorIds.includes(trabalhadorId);
  }

  // gestor: verificar se o trabalhador pertence à empresa e unidade (se informada)
  if (scope.empresaScope) {
    const trabalhador = await Trabalhador.findById(trabalhadorId)
      .select('empresa unidade')
      .lean();
    if (!trabalhador) return false;
    const mesmaEmpresa = (trabalhador as any).empresa?.toString() === scope.empresaScope;
    if (!mesmaEmpresa) return false;
    if (scope.unidadeScope && (trabalhador as any).unidade) {
      return (trabalhador as any).unidade?.toString() === scope.unidadeScope;
    }
    return true;
  }

  return false;
}

/**
 * Verifica se um registro de empresa pertence ao escopo do usuário.
 */
export function verificarEscopoEmpresa(
  scope: UserScope,
  empresaId: string
): boolean {
  if (scope.perfil === 'admin') return true;
  if (scope.perfil === 'gestor') {
    return scope.empresaScope === empresaId;
  }
  return false;
}

/**
 * Verifica se um registro de unidade pertence ao escopo do usuário.
 */
export async function verificarEscopoUnidade(
  scope: UserScope,
  unidadeId: string
): Promise<boolean> {
  if (scope.perfil === 'admin') return true;
  if (scope.perfil === 'gestor') {
    if (scope.unidadeScope && scope.unidadeScope === unidadeId) return true;
    if (scope.empresaScope) {
      const unidade = await Unidade.findById(unidadeId).select('empresa').lean();
      if (!unidade) return false;
      return (unidade as any).empresa?.toString() === scope.empresaScope;
    }
  }
  return false;
}
