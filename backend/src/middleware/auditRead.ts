import { Request, Response, NextFunction } from 'express';
import { logReadSensivel } from '../utils/auditLogger.js';

/**
 * Middleware que registra acesso (READ) a dados sensíveis de saúde.
 *
 * Uso:
 *   router.get('/:id', auditRead('Trabalhador'), controller.obter);
 *   router.get('/', auditReadList('TrabalhadorExameSaude'), controller.listar);
 *
 * Entidades sensíveis:
 *   Trabalhador, TrabalhadorExameSaude, TrabalhadorAfastamento,
 *   TrabalhadorInternacao, TrabalhadorOcorrenciaViolencia,
 *   Acidente, Vacinacao, Doenca, MaterialBiologico
 *
 * A gravação continua sem bloquear a requisição (fire-and-forget), MAS a falha
 * não é mais absorvida em silêncio: cada erro incrementa o contador de falhas
 * de auditoria (`obterEstatisticasAudit()`) e sai por console.error com o
 * contexto do evento. Defina AUDIT_READ_AWAIT=true para aguardar a gravação
 * antes de liberar a requisição (usado para exigir trilha completa).
 */

let falhasLeitura = 0;
let tentativasLeitura = 0;

export function obterEstatisticasAuditRead(): {
  tentativas: number;
  falhas: number;
} {
  return { tentativas: tentativasLeitura, falhas: falhasLeitura };
}

export function resetarEstatisticasAuditRead(): void {
  falhasLeitura = 0;
  tentativasLeitura = 0;
}

const AGUARDAR = () => process.env.AUDIT_READ_AWAIT === 'true';

function disparar(
  req: Request,
  entidade: string,
  entidadeId: string,
  detalhes: Record<string, any>
): Promise<void> {
  tentativasLeitura++;

  const registro = logReadSensivel(req, entidade, entidadeId, detalhes).then(() => undefined);

  registro.catch((err: any) => {
    falhasLeitura++;
    // Visibilidade: um buraco na trilha de auditoria precisa ser detectável.
    console.error('[AUDIT] FALHA ao gravar leitura sensível', {
      entidade,
      entidadeId,
      metodo: req.method,
      rota: (req.originalUrl || '').split('?')[0],
      motivo: err?.message,
      falhasAcumuladas: falhasLeitura,
    });
    if (process.env.AUDIT_STRICT === 'true') {
      console.error(
        '[AUDIT] AUDIT_STRICT ativo: a falha acima deve ser tratada como incidente de trilha de auditoria.'
      );
    }
  });

  return registro;
}

export const auditRead = (entidade: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const entidadeId =
      req.params.id || req.params.itemId || req.params.trabalhadorId || 'list';

    const pendente = disparar(req, entidade, String(entidadeId), {
      metodo: req.method,
      url: req.originalUrl,
      query:
        req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    });

    if (AGUARDAR()) {
      pendente.then(() => next()).catch(() => next());
      return;
    }

    pendente.catch(() => undefined);
    next();
  };
};

export const auditReadList = (entidade: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const pendente = disparar(req, entidade, 'list', {
      metodo: req.method,
      url: req.originalUrl,
      query:
        req.query && Object.keys(req.query).length > 0 ? req.query : undefined,
    });

    if (AGUARDAR()) {
      pendente.then(() => next()).catch(() => next());
      return;
    }

    pendente.catch(() => undefined);
    next();
  };
};
