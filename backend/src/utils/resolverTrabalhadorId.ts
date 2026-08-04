import mongoose from 'mongoose';
import User from '../models/User.js';
import Trabalhador from '../models/Trabalhador.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Resolve trabalhadorId de CPF para ObjectId string.
 * Se o valor já for um ObjectId válido, retorna como está.
 * Se for um CPF, busca o usuário ou trabalhador e retorna seu _id.
 */
export async function resolverTrabalhadorId(identifier: string): Promise<string> {
  if ((mongoose.Types.ObjectId as any).isValid(identifier)) {
    return identifier;
  }

  const [usuario, trabalhador] = await Promise.all([
    User.findOne({ cpf: identifier }).select('_id').lean(),
    Trabalhador.findOne({ cpf: identifier }).select('_id').lean()
  ]);

  if (usuario) return usuario._id.toString();
  if (trabalhador) return trabalhador._id.toString();

  throw new AppError(`Trabalhador com CPF ${identifier} não encontrado`, 404);
}
