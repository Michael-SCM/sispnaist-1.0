/**
 * AuthorizationService — Serviço centralizado de autorização por escopo (anti-IDOR).
 *
 * Todas as funções assert* consultam o banco e lançam AppError 404 ao invés de 403
 * para não revelar se um ID de outra empresa/trabalhador sequer existe no sistema.
 *
 * Regras gerais:
 *  - admin: acesso irrestrito
 *  - gestor: só acessa recursos vinculados à própria empresa
 *  - trabalhador/saude: só acessa seus próprios registros
 */

import mongoose from 'mongoose';
import { AppError } from '../middleware/errorHandler.js';
import { UserScope } from '../utils/scope.js';
import Trabalhador from '../models/Trabalhador.js';
import Empresa from '../models/Empresa.js';
import Unidade from '../models/Unidade.js';
import Acidente from '../models/Acidente.js';

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Retorna 404 para não vazar informação sobre existência do recurso.
 */
function notFound(entidade: string): never {
  throw new AppError(`${entidade} não encontrado(a) ou acesso negado`, 404);
}

// ---------------------------------------------------------------------------
// Trabalhador
// ---------------------------------------------------------------------------

/**
 * Verifica se o usuário autenticado pode **ler** dados de um trabalhador.
 *
 * - admin: sempre (confirma existência no banco)
 * - trabalhador/saude: apenas o próprio trabalhador (por ID e existência no banco)
 * - gestor: apenas trabalhadores da mesma empresa
 *
 * @throws AppError(404) se o acesso for negado ou o trabalhador não existir
 */
export async function assertCanReadWorker(
  scope: UserScope,
  trabalhadorId: string
): Promise<void> {
  if (!trabalhadorId || !mongoose.isValidObjectId(trabalhadorId)) {
    notFound('Trabalhador');
  }

  if (scope.perfil === 'admin') {
    const exists = await Trabalhador.exists({ _id: trabalhadorId });
    if (!exists) notFound('Trabalhador');
    return;
  }

  if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
    if (!scope.trabalhadorIds.includes(trabalhadorId)) {
      notFound('Trabalhador');
    }
    const exists = await Trabalhador.exists({ _id: trabalhadorId });
    if (!exists) notFound('Trabalhador');
    return;
  }

  if (scope.perfil === 'gestor') {
    if (!scope.empresaScope) notFound('Trabalhador');
    const t = await Trabalhador.findById(trabalhadorId).select('empresa').lean();
    if (!t || (t as any).empresa?.toString() !== scope.empresaScope) {
      notFound('Trabalhador');
    }
    return;
  }

  notFound('Trabalhador');
}

/**
 * Verifica se o usuário autenticado pode **gerenciar** (criar/editar/deletar)
 * dados de um trabalhador. Trabalhadores e perfil 'saude' não têm permissão.
 *
 * @throws AppError(403) para trabalhador/saude
 * @throws AppError(404) se gestor não tiver acesso
 */
export async function assertCanManageWorker(
  scope: UserScope,
  trabalhadorId: string
): Promise<void> {
  if (scope.perfil === 'admin') return;

  if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
    throw new AppError('Sem permissão para gerenciar este registro', 403);
  }

  if (scope.perfil === 'gestor') {
    if (!scope.empresaScope) notFound('Trabalhador');
    const t = await Trabalhador.findById(trabalhadorId).select('empresa').lean();
    if (!t || (t as any).empresa?.toString() !== scope.empresaScope) {
      notFound('Trabalhador');
    }
    return;
  }

  notFound('Trabalhador');
}

// ---------------------------------------------------------------------------
// Registros de saúde (Acidente, Doença, Vacinação, Material Biológico…)
// O campo `trabalhadorId` pode vir populado ou como ObjectId puro.
// ---------------------------------------------------------------------------

/**
 * Extrai o trabalhadorId de um documento que pode ter o campo populado ou não.
 */
function resolveWorkerIdFromRecord(record: any): string {
  const raw = record.trabalhadorId;
  if (!raw) return '';
  if (raw._id) return raw._id.toString();
  return raw.toString();
}

/**
 * Verifica se o usuário pode **ler** um registro de saúde do trabalhador
 * (Acidente, Doença, Vacinação, etc.).
 *
 * @param scope     - Escopo do usuário autenticado
 * @param record    - Documento Mongoose com campo `trabalhadorId`
 * @param entidade  - Nome da entidade para a mensagem de erro (ex: 'Acidente')
 *
 * @throws AppError(404) se o acesso for negado
 */
export async function assertCanReadHealthRecord(
  scope: UserScope,
  record: { trabalhadorId: any },
  entidade: string = 'Registro'
): Promise<void> {
  if (scope.perfil === 'admin') return;

  const trabalhadorId = resolveWorkerIdFromRecord(record);
  if (!trabalhadorId) notFound(entidade);

  await assertCanReadWorker(scope, trabalhadorId);
}

/**
 * Verifica se o usuário pode **gerenciar** (criar/editar/deletar) um registro
 * de saúde do trabalhador.
 *
 * @throws AppError(403) para trabalhador/saude
 * @throws AppError(404) se gestor não tiver acesso
 */
export async function assertCanManageHealthRecord(
  scope: UserScope,
  record: { trabalhadorId: any },
  entidade: string = 'Registro'
): Promise<void> {
  if (scope.perfil === 'admin') return;

  if (scope.perfil === 'trabalhador' || scope.perfil === 'saude') {
    throw new AppError('Sem permissão para gerenciar este registro', 403);
  }

  const trabalhadorId = resolveWorkerIdFromRecord(record);
  if (!trabalhadorId) notFound(entidade);

  // Reutiliza assertCanReadWorker — gestor sem acesso recebe 404
  await assertCanReadWorker(scope, trabalhadorId);
}

// ---------------------------------------------------------------------------
// Empresa
// ---------------------------------------------------------------------------

/**
 * Verifica se o usuário pode **ler** dados de uma empresa.
 *
 * - admin: sempre (confirma existência no banco)
 * - gestor: apenas a própria empresa (confirma existência no banco)
 * - trabalhador/saude: sem acesso direto a empresas
 *
 * @throws AppError(404) se o acesso for negado ou a empresa não existir
 */
export async function assertCanReadCompany(
  scope: UserScope,
  empresaId: string
): Promise<void> {
  if (!empresaId || !mongoose.isValidObjectId(empresaId)) {
    notFound('Empresa');
  }

  if (scope.perfil === 'admin') {
    const exists = await Empresa.exists({ _id: empresaId });
    if (!exists) notFound('Empresa');
    return;
  }

  if (scope.perfil === 'gestor') {
    if (scope.empresaScope !== empresaId) notFound('Empresa');
    const exists = await Empresa.exists({ _id: empresaId });
    if (!exists) notFound('Empresa');
    return;
  }

  notFound('Empresa');
}

/**
 * Verifica se o usuário pode **gerenciar** (criar/editar/deletar) uma empresa.
 * Somente admin tem essa permissão. Se empresaId for informado, valida existência no banco.
 *
 * @throws AppError(403) para qualquer perfil não-admin
 * @throws AppError(404) se a empresa não existir no banco
 */
export async function assertCanManageCompany(
  scope: UserScope,
  empresaId?: string
): Promise<void> {
  if (scope.perfil !== 'admin') {
    throw new AppError('Sem permissão para gerenciar empresas', 403);
  }

  if (empresaId) {
    if (!mongoose.isValidObjectId(empresaId)) {
      notFound('Empresa');
    }
    const exists = await Empresa.exists({ _id: empresaId });
    if (!exists) notFound('Empresa');
  }
}

// ---------------------------------------------------------------------------
// Unidade
// ---------------------------------------------------------------------------

/**
 * Verifica se o usuário pode **ler** dados de uma unidade.
 *
 * - admin: sempre (confirma existência no banco)
 * - gestor: apenas unidades da própria empresa (confirma no banco)
 *
 * @throws AppError(404) se o acesso for negado ou a unidade não existir
 */
export async function assertCanReadUnit(
  scope: UserScope,
  unidadeId: string
): Promise<void> {
  if (!unidadeId || !mongoose.isValidObjectId(unidadeId)) {
    notFound('Unidade');
  }

  if (scope.perfil === 'admin') {
    const exists = await Unidade.exists({ _id: unidadeId });
    if (!exists) notFound('Unidade');
    return;
  }

  if (scope.perfil === 'gestor') {
    if (!scope.empresaScope) notFound('Unidade');
    const u = await Unidade.findById(unidadeId).select('empresa').lean();
    if (!u || (u as any).empresa?.toString() !== scope.empresaScope) {
      notFound('Unidade');
    }
    return;
  }

  notFound('Unidade');
}

// ---------------------------------------------------------------------------
// Upload (ArquivoUpload)
// ---------------------------------------------------------------------------

/**
 * Verifica se o usuário pode **ler** um arquivo de upload.
 * A verificação é feita pela entidade associada (entidade + entidadeId).
 *
 * Suporte a entidades: 'acidente', 'trabalhador', 'doenca', 'vacinacao',
 * 'materialBiologico' e qualquer entidade que possua um campo trabalhadorId.
 *
 * Para entidades não reconhecidas, apenas admin tem acesso.
 *
 * @throws AppError(404) se o acesso for negado
 */
export async function assertCanReadUpload(
  scope: UserScope,
  upload: { entidade: string; entidadeId: string }
): Promise<void> {
  if (scope.perfil === 'admin') return;

  const { entidade, entidadeId } = upload;

  // Trabalhador direto
  if (entidade === 'trabalhador') {
    await assertCanReadWorker(scope, entidadeId);
    return;
  }

  // Entidades que referenciam trabalhador via trabalhadorId
  const healthEntities = ['acidente', 'doenca', 'vacinacao', 'materialBiologico'];
  if (healthEntities.includes(entidade)) {
    let trabalhadorId: string | null = null;

    if (entidade === 'acidente' || entidade === 'materialBiologico') {
      const ac = await Acidente.findById(entidadeId).select('trabalhadorId').lean();
      trabalhadorId = (ac as any)?.trabalhadorId?.toString() ?? null;
    } else {
      // Importação dinâmica para evitar dependência circular
      const model = await resolveHealthModel(entidade);
      if (model) {
        const doc = await model.findById(entidadeId).select('trabalhadorId').lean();
        trabalhadorId = (doc as any)?.trabalhadorId?.toString() ?? null;
      }
    }

    if (!trabalhadorId) notFound('Upload');
    await assertCanReadWorker(scope, trabalhadorId!);
    return;
  }

  // Empresa
  if (entidade === 'empresa') {
    await assertCanReadCompany(scope, entidadeId);
    return;
  }

  // Unidade
  if (entidade === 'unidade') {
    await assertCanReadUnit(scope, entidadeId);
    return;
  }

  // Entidade desconhecida: somente admin (já tratado acima)
  notFound('Upload');
}

/**
 * Resolve dinamicamente o model Mongoose para uma entidade de saúde.
 */
async function resolveHealthModel(entidade: string): Promise<any | null> {
  try {
    switch (entidade) {
      case 'doenca': {
        const { default: Doenca } = await import('../models/Doenca.js');
        return Doenca;
      }
      case 'vacinacao': {
        const { default: Vacinacao } = await import('../models/Vacinacao.js');
        return Vacinacao;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export default {
  assertCanReadWorker,
  assertCanManageWorker,
  assertCanReadHealthRecord,
  assertCanManageHealthRecord,
  assertCanReadCompany,
  assertCanManageCompany,
  assertCanReadUnit,
  assertCanReadUpload,
};

