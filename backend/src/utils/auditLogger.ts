import AuditLog from '../models/AuditLog.js';
import { Request } from 'express';
import { getWorkerSnapshot } from './auditContext.js';

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

    // Cria um envelope padronizado para facilitar exibição no admin
    let detalhesEnriquecidos: Record<string, any> = {
      ...(detalhes || {}),
      acao,
      modulo: entidade,
      usuario: {
        id: usuarioId,
        perfil: req.user?.perfil,
        email: req.user?.email,
      },
    };

    // Enriquecimento automático com dados mascarados do trabalhador (quando identificável)
    try {
      const workerId = detalhesEnriquecidos?.trabalhadorId || detalhesEnriquecidos?.workerId || req.body?.trabalhadorId;
      const cpf = detalhesEnriquecidos?.cpfTrabalhador || detalhesEnriquecidos?.cpf || req.body?.cpf;

      const precisaTrabalhador =
        entidade === 'Acidente' ||
        entidade === 'Doenca' ||
        entidade === 'Vacinacao' ||
        entidade === 'MaterialBiologico' ||
        entidade === 'Trabalhador';

      if (precisaTrabalhador && !detalhesEnriquecidos?.trabalhador && (workerId || cpf)) {
        const worker = await getWorkerSnapshot({
          trabalhadorId: typeof workerId === 'string' ? workerId : undefined,
          cpf: typeof cpf === 'string' ? cpf : undefined,
        });

        if (worker) detalhesEnriquecidos.trabalhador = worker;
      }
    } catch (_) {
      // não interrompe auditoria
    }

    await AuditLog.create({
      usuarioId,
      acao,
      entidade,
      entidadeId,
      detalhes: detalhesEnriquecidos,
      ip,
      userAgent,
    });
  } catch (error) {
    console.error('Erro ao salvar log de auditoria:', error);
  }
};


