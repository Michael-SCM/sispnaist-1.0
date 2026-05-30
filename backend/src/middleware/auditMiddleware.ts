import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog.js';
import { IAuthRequest } from '../types/index.js';

/**
 * Middleware de auditoria automática (FALLBACK)
 * ⚠️ IMPORTANTE: Controllers DEVEM usar logAction() para dados completos!
 * Este middleware é apenas para casos onde logAction não foi chamado
 * 
 * Não substitui o logAction! É complementar!
 */
export const auditMiddleware = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Marca se logAction foi chamado
  (req as any).auditLogged = false;

  // Armazena o método HTTP original
  const originalSend = res.send;

  res.send = function (data: any) {
    // Apenas registra se a operação foi bem-sucedida (status 200-299)
    // E se não foi registrada pelo controller via logAction
    if (res.statusCode >= 200 && res.statusCode < 300 && !(req as any).auditLogged) {
      const method = req.method.toUpperCase();
      
      let acao: 'CREATE' | 'UPDATE' | 'DELETE' | undefined;
      let entidade: string | undefined;
      let entidadeId: string | undefined;
      let detalhes: Record<string, any> | undefined;

      const routeParts = req.path.split('/').filter(p => p);
      
      if (method === 'POST') {
        acao = 'CREATE';
        entidade = routeParts[1]?.charAt(0).toUpperCase() + routeParts[1]?.slice(1);
        
        try {
          const responseData = JSON.parse(data);
          if (responseData?.data?._id) {
            entidadeId = responseData.data._id;
          }
          // Captura dados completos do response
          detalhes = normalizeDetails(responseData?.data);
        } catch {
          detalhes = { mensagem: 'Registro criado com sucesso' };
        }
      } else if (method === 'PUT' || method === 'PATCH') {
        acao = 'UPDATE';
        entidade = routeParts[1]?.charAt(0).toUpperCase() + routeParts[1]?.slice(1);
        entidadeId = routeParts[2];
        // Para UPDATE, registra o que foi enviado
        detalhes = { alteracoes: normalizeDetails(req.body) };
      } else if (method === 'DELETE') {
        acao = 'DELETE';
        entidade = routeParts[1]?.charAt(0).toUpperCase() + routeParts[1]?.slice(1);
        entidadeId = routeParts[2];
        // DELETE é tratado melhor no controller com dados antes
        detalhes = { aviso: 'Use logAction() no controller para registrar dados antes da exclusão' };
      }

      if (acao && entidade && entidadeId) {
        registerAudit(req, acao, entidade, entidadeId, detalhes).catch(error => {
          console.error('Erro ao registrar auditoria:', error);
        });
      }
    }

    res.send = originalSend;
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Normaliza detalhes para exibição legível
 */
function normalizeDetails(data: any): Record<string, any> | undefined {
  if (!data) return undefined;

  const normalized: Record<string, any> = {};

  // Remove campos técnicos
  const skipFields = ['__v', '_id', 'createdAt', 'updatedAt', 'password', 'senha', 'token'];
  
  for (const [key, value] of Object.entries(data)) {
    if (!skipFields.includes(key)) {
      normalized[key] = value;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

/**
 * Registra uma ação de auditoria (função helper do middleware)
 */
async function registerAudit(
  req: IAuthRequest,
  acao: 'CREATE' | 'UPDATE' | 'DELETE',
  entidade: string,
  entidadeId: string,
  detalhes?: Record<string, any>
) {
  try {
    const usuarioId = req.user?._id || 'system';
    const ip = (req.ip || req.connection?.remoteAddress || '0.0.0.0').replace('::ffff:', '');
    const userAgent = req.get('User-Agent') || 'Unknown';

    await AuditLog.create({
      usuarioId,
      acao,
      entidade,
      entidadeId,
      detalhes: sanitizeDetails(detalhes),
      ip,
      userAgent
    });

    console.log(`[AUDIT-FALLBACK] ${acao} - ${entidade}:${entidadeId} by ${usuarioId}`);
  } catch (error) {
    console.error('Erro ao salvar log de auditoria:', error);
  }
}

/**
 * Sanitiza dados sensíveis
 */
function sanitizeDetails(data: Record<string, any> | undefined): Record<string, any> | undefined {
  if (!data) return undefined;

  const sensitiveFields = ['senha', 'password', 'token', 'secret', 'apiKey', 'refreshToken'];
  const sanitized = JSON.parse(JSON.stringify(data));

  const removeSensitive = (obj: any) => {
    for (const field of sensitiveFields) {
      if (field in obj) {
        delete obj[field];
      }
    }
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        removeSensitive(obj[key]);
      }
    }
  };

  removeSensitive(sanitized);
  return sanitized;
}

export default auditMiddleware;
