import AlertaRegra from '../models/AlertaRegra.js';
import PadraoEmail from '../models/PadraoEmail.js';

/**
 * Seeds iniciais do sistema de alertas: regras padrão e templates de e-mail.
 * Idempotente: só cria se ainda não existirem.
 */
export const seedAlertasRegras = async (): Promise<void> => {
  try {
    const [regrasExistentes, padroesExistentes] = await Promise.all([
      AlertaRegra.countDocuments(),
      PadraoEmail.countDocuments({ categoria: 'alerta' }),
    ]);

    if (regrasExistentes === 0) {
      const regrasPadrao = [
        {
          nome: 'Pico de acidentes (nacional)',
          tipo: 'PICO_ACIDENTES',
          nivel: 'alto',
          condicao: { parametro: 'quantidadeAcidentes', operador: '>=', valor: 3 },
          janelaDias: 7,
          periodoAnteriorDias: 7,
          notificarEmail: true,
          descricao: 'Alerta quando 3 ou mais acidentes forem registrados em uma semana.',
        },
        {
          nome: 'Vacinas vencendo (30 dias)',
          tipo: 'VACINA_VENCENDO',
          nivel: 'medio',
          condicao: { parametro: 'diasAntesVencimento', operador: '<=', valor: 30 },
          janelaDias: 30,
          periodoAnteriorDias: 7,
          notificarEmail: true,
          descricao: 'Alerta para vacinas vencidas ou que vencem nos próximos 30 dias.',
        },
        {
          nome: 'Trabalhador em risco (2+ acidentes)',
          tipo: 'MONITORAMENTO_CRITICO',
          nivel: 'medio',
          condicao: { parametro: 'quantidadeAcidentes', operador: '>=', valor: 2 },
          janelaDias: 365,
          periodoAnteriorDias: 0,
          notificarEmail: true,
          descricao: 'Alerta quando um trabalhador registra 2 ou mais acidentes.',
        },
        {
          nome: 'Não conformidades (campos obrigatórios)',
          tipo: 'NAO_CONFORMIDADE',
          nivel: 'baixo',
          condicao: { parametro: 'quantidadeAcidentes', operador: '>=', valor: 1 },
          janelaDias: 7,
          periodoAnteriorDias: 7,
          notificarEmail: true,
          descricao: 'Alerta quando houver registros com campos obrigatórios em falta.',
        },
      ];
      await AlertaRegra.insertMany(regrasPadrao);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Seed] Regras de alerta padrão criadas.');
      }
    }

    if (padroesExistentes === 0) {
      const padroes = [
        {
          nome: 'Alerta de sistema',
          assunto: '[Alerta] {{titulo}}',
          conteudo:
            '<h2>{{titulo}}</h2><p style="white-space: pre-line;">{{descricao}}</p>' +
            '<p>Nível: {{nivel}} • Tipo: {{tipo}}</p>' +
            '<a href="{{link}}" style="background:#2563eb;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;">Ver alertas</a>',
          categoria: 'alerta',
          variaveis: ['titulo', 'descricao', 'nivel', 'tipo', 'link'],
          ativo: true,
        },
      ];
      await PadraoEmail.insertMany(padroes);
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Seed] Padrões de e-mail de alerta criados.');
      }
    }
  } catch (error) {
    console.error('[Seed] Erro ao criar seeds de alertas:', error);
  }
};

export default seedAlertasRegras;
