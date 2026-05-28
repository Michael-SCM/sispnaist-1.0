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
    // Marca que a auditoria foi logada (para middleware não registrar novamente)
    (req as any).auditLogged = true;

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
  datosAntigos: Record<string, any>,
  datosNovos: Record<string, any>
): Record<string, any> => {
  const mudancas: Record<string, any> = {};
  const camposMudados: string[] = [];

  // Detecta campos que mudaram
  for (const campo in datosNovos) {
    if (JSON.stringify(datosAntigos[campo]) !== JSON.stringify(datosNovos[campo])) {
      mudancas[campo] = {
        antes: datosAntigos[campo],
        depois: datosNovos[campo]
      };
      camposMudados.push(campo);
    }
  }

  return {
    resumo: `${camposMudados.length} campo(s) alterado(s)`,
    camposMudados,
    mudancas
  };
};

/**
 * Remove dados sensíveis antes de registrar
 */
function sanitizeDetails(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['senha', 'password', 'token', 'secret', 'apiKey', 'refreshToken'];
  const sanitized = JSON.parse(JSON.stringify(data)); // deep copy

  const removeSensitive = (obj: any) => {
    for (const field of sensitiveFields) {
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
