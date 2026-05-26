import AuditLog from '../models/AuditLog.js';
import { Request } from 'express';

export const logAction = async (
  req: Request | any,
  acao: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT',
  entidade: string,
  entidadeId: string,
  detalhes?: Record<string, any>
) => {
  try {
    const usuarioId = req.user?.id || req.body?.usuarioId || 'system';
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    await AuditLog.create({
      usuarioId,
      acao,
      entidade,
      entidadeId,
      detalhes,
      ip,
      userAgent
    });
  } catch (error) {
    console.error('Erro ao salvar log de auditoria:', error);
  }
};
