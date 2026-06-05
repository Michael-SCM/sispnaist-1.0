import AuditLog from '../models/AuditLog.js';
import { Request } from 'express';

/**
 * Registra uma ação no audit log com dados estruturados
 * ✅ USE ESTA FUNÇÃO nos controllers para máximo detalhe!
 * 
 * Exemplo de CREATE:
 *   await logAction(req, 'CREATE', 'Empresa', empresa._id, {
 *     razaoSocial: empresa.razaoSocial,
 *     cnpj: empresa.cnpj
 *   });
 * 
 * Exemplo de UPDATE com compção:
 *   const mudancas = compararDados(empresaAntiga, empresaNova);
 *   await logAction(req, 'UPDATE', 'Empresa', id, mudancas);
 * 
 * Exemplo de DELETE (capture antes de deletar!):
 *   const dados = await Empresa.findById(id);
 *   await logAction(req, 'DELETE', 'Empresa', id, { 
 *     razaoSocial: dados.razaoSocial,
 *     cnpj: dados.cnpj 
 *   });
 */
export const logAction = async (
  req: Request | any,
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
  entidade: string,
  entidadeId: string,
  detalhes?: Record<string, any>
) => {
  try {
    const usuarioId = req.user?.id || req.user?._id || req.body?.usuarioId || 'system';
    const ip = (req.ip || req.connection?.remoteAddress || '0.0.0.0').replace('::ffff:', '');
    const userAgent = req.get('User-Agent') || 'Unknown';

    await AuditLog.create({
      usuarioId,
      acao,
      entidade,
      entidadeId,
      detalhes: detalhes ? sanitizeDetails(detalhes) : undefined,
      ip,
      userAgent
    });

    console.log(`[AUDIT] ${acao} - ${entidade}:${entidadeId} by ${usuarioId}`);
  } catch (error) {
    console.error('Erro ao salvar log de auditoria:', error);
  }
};

/**
 * 🔥 Para UPDATE: Cria objeto com antes/depois automático
 * 
 * Retorna:
 * {
 *   resumo: "3 campo(s) alterado(s)",
 *   camposMudados: ["nome", "email", "status"],
 *   mudancas: {
 *     nome: { antes: "João", depois: "João Silva" },
 *     email: { antes: "joao@old.com", depois: "joao@new.com" },
 *     status: { antes: "ativo", depois: "inativo" }
 *   }
 * }
 */
export const compararDados = (
  datosAntigosRaw: Record<string, any>,
  datosNovosRaw: Record<string, any>
): Record<string, any> => {
  // Converte documentos Mongoose para objetos puros se necessário
  const datosAntigos = typeof datosAntigosRaw?.toObject === 'function' ? datosAntigosRaw.toObject() : JSON.parse(JSON.stringify(datosAntigosRaw || {}));
  const datosNovos = typeof datosNovosRaw?.toObject === 'function' ? datosNovosRaw.toObject() : JSON.parse(JSON.stringify(datosNovosRaw || {}));

  const ignoreFields = ['_id', '__v', 'createdAt', 'updatedAt'];

  const mudancas: Record<string, any> = {};
  const camposMudados: string[] = [];

  // Detecta campos que mudaram (existentes ou novos)
  for (const campo in datosNovos) {
    if (ignoreFields.includes(campo)) continue;

    if (JSON.stringify(datosAntigos[campo]) !== JSON.stringify(datosNovos[campo])) {
      mudancas[campo] = {
        antes: datosAntigos[campo] !== undefined ? datosAntigos[campo] : null,
        depois: datosNovos[campo]
      };
      camposMudados.push(campo);
    }
  }

  // Detecta campos que foram removidos
  for (const campo in datosAntigos) {
    if (ignoreFields.includes(campo)) continue;

    if (!(campo in datosNovos) && datosAntigos[campo] !== undefined && datosAntigos[campo] !== null) {
      mudancas[campo] = {
        antes: datosAntigos[campo],
        depois: null
      };
      if (!camposMudados.includes(campo)) {
        camposMudados.push(campo);
      }
    }
  }

  return {
    resumo: `${camposMudados.length} campo(s) alterado(s)`,
    camposMudados,
    mudancas
  };
};

/**
 * Remove dados sensíveis e campos internos do Mongoose antes de registrar
 */
function sanitizeDetails(dataRaw: Record<string, any>): Record<string, any> {
  if (!dataRaw) return {};
  
  const data = typeof dataRaw?.toObject === 'function' ? dataRaw.toObject() : dataRaw;
  const sensitiveFields = ['senha', 'password', 'token', 'secret', 'apiKey', 'refreshToken'];
  const ignoreFields = ['_id', '__v', 'createdAt', 'updatedAt'];

  const sanitized = JSON.parse(JSON.stringify(data)); // deep copy

  const removeSensitive = (obj: any) => {
    for (const field of sensitiveFields) {
      if (field in obj) {
        delete obj[field];
      }
    }
    for (const field of ignoreFields) {
      if (field in obj) {
        delete obj[field];
      }
    }
    // Recursivo para objetos aninhados
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        removeSensitive(obj[key]);
      }
    }
  };

  removeSensitive(sanitized);
  return sanitized;
}
