import { Request, Response, NextFunction } from 'express';
import AuditLog from '../models/AuditLog.js';
import { IAuthRequest } from '../types/index.js';

/**
 * Middleware de auditoria automática
 * Registra todas as ações CREATE, UPDATE, DELETE
 * Captura automaticamente IP, User-Agent e identificação do usuário
 */
export const auditMiddleware = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Armazena o método HTTP original para detectar alterações
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function (data: any) {
    // Apenas registra se a operação foi bem-sucedida (status 200-299)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const method = req.method.toUpperCase();
      
      // Determina o tipo de ação baseado no método HTTP
      let acao: 'CREATE' | 'UPDATE' | 'DELETE' | undefined;
      let entidade: string | undefined;
      let entidadeId: string | undefined;
      let detalhes: Record<string, any> | undefined;

      // Extrai informações da rota
      const routeParts = req.path.split('/').filter(p => p);
      
      if (method === 'POST') {
        acao = 'CREATE';
        entidade = routeParts[1]?.charAt(0).toUpperCase() + routeParts[1]?.slice(1);
        
        try {
          const responseData = JSON.parse(data);
          if (responseData?.data?._id) {
            entidadeId = responseData.data._id;
          }
          detalhes = responseData?.data;
        } catch {
          // Se não conseguir fazer parse, ignora detalhes
        }
      } else if (method === 'PUT' || method === 'PATCH') {
        acao = 'UPDATE';
        entidade = routeParts[1]?.charAt(0).toUpperCase() + routeParts[1]?.slice(1);
        entidadeId = routeParts[2];
        detalhes = req.body;
      } else if (method === 'DELETE') {
        acao = 'DELETE';
        entidade = routeParts[1]?.charAt(0).toUpperCase() + routeParts[1]?.slice(1);
        entidadeId = routeParts[2];
      }

      // Se conseguiu identificar a ação, registra
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
 * Registra uma ação de auditoria
 */
async function registerAudit(
  req: IAuthRequest,
  acao: 'CREATE' | 'UPDATE' | 'DELETE',
  entidade: string,
  entidadeId: string,
  detalhes?: Record<string, any>
) {
  try {
    const usuarioId = req.user?.id || req.user?._id || 'system';
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
}

/**
 * Remove dados sensíveis antes de registrar
 */
function sanitizeDetails(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ['senha', 'password', 'token', 'secret', 'apiKey'];
  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  return sanitized;
}

export default auditMiddleware;
