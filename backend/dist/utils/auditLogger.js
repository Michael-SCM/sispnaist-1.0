import AuditLog from '../models/AuditLog.js';
export const logAction = async (req, acao, entidade, entidadeId, detalhes) => {
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
    }
    catch (error) {
        console.error('Erro ao salvar log de auditoria:', error);
    }
};
