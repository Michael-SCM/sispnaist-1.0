import { Request } from 'express';
import Trabalhador from '../models/Trabalhador.js';
import { sinanService } from '../services/SinanService.js';

interface SinanPayload {
  tipoNotificacao: string;
  dataOcorrencia: string;
  codigoAgravo: string;
  nomeAgravo: string;
}

/**
 * Notifica o SINAN para acidente ou doença.
 * Usado por acidenteController e doencaController.
 */
export async function notificarSinanParaTrabalhador(
  req: Request,
  trabalhadorId: string,
  payload: SinanPayload
): Promise<void> {
  try {
    const trabalhador = await Trabalhador.findById(trabalhadorId);
    if (!trabalhador) return;

    const cpf = trabalhador.cpf?.replace(/\D/g, '');
    const cns = trabalhador.cartaoSus?.replace(/\D/g, '');

    await sinanService.notificar({
      tipoNotificacao: payload.tipoNotificacao,
      cpf,
      cns,
      nome: trabalhador.nome,
      dataOcorrencia: payload.dataOcorrencia,
      codigoAgravo: payload.codigoAgravo,
      nomeAgravo: payload.nomeAgravo,
      cboOcupacao: trabalhador.trabalho?.ocupacao || '',
      cnaeEmpresa: '',
      ufNotificacao: trabalhador.endereco?.estado || '',
      municipioNotificacao: trabalhador.endereco?.cidade || '',
      unidadeSaude: '',
      situacaoMercadoTrabalho: trabalhador.vinculo?.tipo || '',
    });
  } catch (err: any) {
    console.error(`[SINAN] Erro ao notificar ${payload.tipoNotificacao}:`, err.message);
  }
}
