import Trabalhador from '../models/Trabalhador.js';
import User from '../models/User.js';

/**
 * Dado um CPF, retorna ambos os IDs possíveis:
 * - trabalhadorId: _id da coleção Trabalhador (usado em registros novos)
 * - userId: _id da coleção User (usado em registros antigos criados com bug)
 *
 * Isso permite que listagens encontrem registros independentemente de qual ID foi salvo.
 */
export async function obterIdsTrabalhadorPorCpf(cpf: string): Promise<{ trabalhadorId: string | null; userId: string | null }> {
  const [trabalhador, user] = await Promise.all([
    Trabalhador.findOne({ cpf }).select('_id').lean(),
    User.findOne({ cpf }).select('_id').lean(),
  ]);

  return {
    trabalhadorId: trabalhador ? trabalhador._id.toString() : null,
    userId: user ? user._id.toString() : null,
  };
}
