import { Request } from 'express';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Se o usuário logado for 'trabalhador', verifica se o registro pertence a ele.
 * Caso contrário, lança AppError 403.
 */
export async function exigirProprioTrabalhador(
  req: Request,
  recordTrabalhadorId: string
): Promise<void> {
  if ((req as any).user?.perfil !== 'trabalhador') return;

  const trabalhador = await Trabalhador.findOne({ cpf: (req as any).user.cpf }).select('_id').lean();
  if (!trabalhador || recordTrabalhadorId !== trabalhador._id.toString()) {
    throw new AppError('Sem permissão para acessar este registro', 403);
  }
}
